import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../services/api';

// Leaflet varsayılan ikon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const courierIcon = L.divIcon({
  html: '<div style="font-size:28px;line-height:1">🛵</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const restaurantIcon = L.divIcon({
  html: '<div style="font-size:28px;line-height:1">🍽️</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const AutoCenter = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

const statusMap: Record<string, string> = {
  assigned: '📦 Atandı',
  picked_up: '🛵 Yolda',
};

const Map = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: restaurants = [] } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const myRestaurant = restaurants.find((r: any) => r.userId === user.id);

  const { data: ordersData = [], dataUpdatedAt } = useQuery({
    queryKey: ['restaurant-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    refetchInterval: 15000,
  });

  const activeOrders = myRestaurant
    ? ordersData.filter(
        (o: any) =>
          o.restaurantId === myRestaurant.id &&
          (o.status === 'assigned' || o.status === 'picked_up') &&
          o.courier?.latitude &&
          o.courier?.longitude
      )
    : [];

  const defaultCenter: [number, number] = [41.015, 28.979];
  const restaurantCoords: [number, number] | null =
    myRestaurant?.latitude && myRestaurant?.longitude
      ? [myRestaurant.latitude, myRestaurant.longitude]
      : null;

  const mapCenter: [number, number] =
    restaurantCoords ||
    (activeOrders[0]?.courier?.latitude
      ? [activeOrders[0].courier.latitude, activeOrders[0].courier.longitude]
      : defaultCenter);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Başlık */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Canlı Kurye Takibi</h1>
          <p className="text-xs text-gray-400">
            Her 15 saniyede güncellenir · Son: {new Date(dataUpdatedAt).toLocaleTimeString('tr-TR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${activeOrders.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm font-semibold text-gray-700">
            {activeOrders.length} kurye aktif
          </span>
        </div>
      </div>

      {/* Harita */}
      <div className="flex-1">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <AutoCenter coords={restaurantCoords} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Restoran konumu */}
          {restaurantCoords && (
            <Marker position={restaurantCoords} icon={restaurantIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{myRestaurant?.name}</p>
                  <p className="text-gray-500">Restoran konumu</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Aktif kuryeler */}
          {activeOrders.map((order: any) => (
            <Marker
              key={order.id}
              position={[order.courier.latitude, order.courier.longitude]}
              icon={courierIcon}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold">
                    {order.courier?.user?.fullName || 'Kurye'}
                  </p>
                  <p className="text-gray-500">
                    Sipariş #{order.orderNumber}
                  </p>
                  <p className="text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-400 mt-1">{order.deliveryAddress}</p>
                  <p className="font-semibold text-orange-600 mt-1">
                    {statusMap[order.status] || order.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Aktif siparişler listesi */}
      {activeOrders.length > 0 && (
        <div className="bg-white border-t p-4 space-y-2 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Yoldaki Siparişler
          </p>
          {activeOrders.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛵</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    #{order.orderNumber} · {order.customerName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.courier?.user?.fullName || 'Kurye bilgisi yok'}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                order.status === 'assigned'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {statusMap[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeOrders.length === 0 && (
        <div className="bg-white border-t p-6 text-center text-gray-400">
          <p className="text-2xl mb-2">🛵</p>
          <p className="text-sm">Şu an yolda kurye yok</p>
          <p className="text-xs mt-1">Kurye konumu paylaştığında haritada görünecek</p>
        </div>
      )}
    </div>
  );
};

export default Map;
