import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../services/api';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const courierIcon = L.divIcon({
  html: '<div style="background:#f97316;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🛵</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customerIcon = L.divIcon({
  html: '<div style="background:#10b981;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🏠</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const restaurantIcon = L.divIcon({
  html: '<div style="background:#ef4444;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:18px;">🍽️</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Tracking = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: restaurants = [] } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const myRestaurant = restaurants.find((r: any) => r.userId === user.id);

  const { data: orders = [] } = useQuery({
    queryKey: ['active-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    refetchInterval: 10000,
  });

  const activeOrders = myRestaurant
    ? orders.filter(
        (o: any) =>
          o.restaurantId === myRestaurant.id &&
          (o.status === 'assigned' || o.status === 'picked_up')
      )
    : [];

  const selectedOrder = selectedOrderId
    ? activeOrders.find((o: any) => o.id === selectedOrderId)
    : activeOrders[0];

  const courier = selectedOrder?.courier;
  const courierLat = courier?.latitude ? parseFloat(courier.latitude) : null;
  const courierLng = courier?.longitude ? parseFloat(courier.longitude) : null;
  const deliveryLat = selectedOrder?.deliveryLatitude
    ? parseFloat(selectedOrder.deliveryLatitude) : null;
  const deliveryLng = selectedOrder?.deliveryLongitude
    ? parseFloat(selectedOrder.deliveryLongitude) : null;
  const restaurantLat = myRestaurant?.latitude
    ? parseFloat(myRestaurant.latitude) : null;
  const restaurantLng = myRestaurant?.longitude
    ? parseFloat(myRestaurant.longitude) : null;

  const distance =
    courierLat && courierLng && deliveryLat && deliveryLng
      ? calculateDistance(courierLat, courierLng, deliveryLat, deliveryLng)
      : null;

  const eta = distance ? Math.ceil((distance / 30) * 60) : null;

  const mapCenter: [number, number] =
    courierLat && courierLng
      ? [courierLat, courierLng]
      : restaurantLat && restaurantLng
      ? [restaurantLat, restaurantLng]
      : [41.0082, 28.9784];

  if (!myRestaurant) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-semibold">Restoran kaydı bulunamadı</p>
        </div>
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Canlı Takip</h1>
        <div className="bg-gray-50 border rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🛵</p>
          <p className="text-gray-600 font-medium">Şu an aktif sipariş yok</p>
          <p className="text-sm text-gray-400 mt-2">
            Kurye atanan siparişler burada görünür
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
        Canlı Takip
      </h1>

      {/* Sipariş seçici */}
      {activeOrders.length > 1 && (
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
          {activeOrders.map((o: any) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium text-sm transition-colors ${
                (selectedOrderId ?? activeOrders[0].id) === o.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              #{o.orderNumber}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bilgi paneli */}
        <div className="md:col-span-1 space-y-4">
          {selectedOrder && (
            <>
              {/* Sipariş durumu */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-5">
                <p className="text-orange-100 text-sm">Sipariş</p>
                <p className="text-3xl font-bold">#{selectedOrder.orderNumber}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  selectedOrder.status === 'assigned'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedOrder.status === 'assigned' ? '📦 Atandı' : '🛵 Yolda'}
                </span>
              </div>

              {/* Kurye bilgisi */}
              {courier && (
                <div className="bg-white border rounded-2xl p-5">
                  <p className="text-sm text-gray-500 mb-2">🛵 Kurye</p>
                  <p className="font-bold text-lg">
                    {courier.user?.fullName || 'Kurye'}
                  </p>
                  {courier.user?.phone && (
                    <a
                      href={`tel:${courier.user.phone}`}
                      className="text-orange-500 text-sm font-medium flex items-center gap-1 mt-1"
                    >
                      📞 {courier.user.phone}
                    </a>
                  )}
                </div>
              )}

              {/* Mesafe & ETA */}
              {distance !== null && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-xs text-blue-600">Mesafe</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {distance.toFixed(1)}
                    </p>
                    <p className="text-xs text-blue-500">km</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    <p className="text-xs text-green-600">Tahmini</p>
                    <p className="text-2xl font-bold text-green-700">{eta}</p>
                    <p className="text-xs text-green-500">dakika</p>
                  </div>
                </div>
              )}

              {/* Müşteri bilgisi */}
              <div className="bg-white border rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-2">🏠 Müşteri</p>
                <p className="font-semibold">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.deliveryAddress}
                </p>
                {selectedOrder.customerPhone && (
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="text-orange-500 text-sm font-medium flex items-center gap-1 mt-2"
                  >
                    📞 {selectedOrder.customerPhone}
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Harita */}
        <div className="md:col-span-2 h-[400px] md:h-[600px] rounded-2xl overflow-hidden border shadow-sm">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {courierLat && courierLng && (
              <Marker position={[courierLat, courierLng]} icon={courierIcon}>
                <Popup>
                  <strong>🛵 Kurye</strong><br />
                  {courier?.user?.fullName}
                </Popup>
              </Marker>
            )}

            {deliveryLat && deliveryLng && (
              <Marker position={[deliveryLat, deliveryLng]} icon={customerIcon}>
                <Popup>
                  <strong>🏠 Müşteri</strong><br />
                  {selectedOrder?.customerName}
                </Popup>
              </Marker>
            )}

            {restaurantLat && restaurantLng && (
              <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
                <Popup>
                  <strong>🍽️ {myRestaurant.name}</strong>
                </Popup>
              </Marker>
            )}

            {courierLat && courierLng && deliveryLat && deliveryLng && (
              <Polyline
                positions={[
                  [courierLat, courierLng],
                  [deliveryLat, deliveryLng],
                ]}
                color="#f97316"
                weight={3}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
