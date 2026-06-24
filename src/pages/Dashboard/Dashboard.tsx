import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: restaurants = [] } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const myRestaurant = restaurants.find((r: any) => r.userId === user.id);

  const { data: ordersData = [] } = useQuery({
    queryKey: ['restaurant-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    refetchInterval: 30000,
  });

  const orders = myRestaurant
    ? ordersData.filter((o: any) => o.restaurantId === myRestaurant.id)
    : [];

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o: any) =>
    new Date(o.createdAt).toDateString() === today
  );
  const activeOrders = orders.filter((o: any) =>
    o.status === 'assigned' || o.status === 'picked_up'
  );
  const pendingOrders = orders.filter((o: any) => o.status === 'pending');
  const deliveredToday = todayOrders.filter((o: any) => o.status === 'delivered');
  const cancelledToday = todayOrders.filter((o: any) => o.status === 'cancelled');

  const todayRevenue = deliveredToday.reduce(
    (sum: number, o: any) => sum + parseFloat(o.orderTotal || 0),
    0
  );

  const sourceMap: Record<string, number> = {
    yemeksepeti: 0,
    getir: 0,
    trendyol: 0,
    manuel: 0,
  };
  todayOrders.forEach((o: any) => {
    const notes = (o.notes || '').toLowerCase();
    if (notes.includes('yemeksepeti')) sourceMap.yemeksepeti++;
    else if (notes.includes('getir')) sourceMap.getir++;
    else if (notes.includes('trendyol')) sourceMap.trendyol++;
    else sourceMap.manuel++;
  });

  const hourlyData: number[] = Array(12).fill(0);
  const now = new Date();
  todayOrders.forEach((o: any) => {
    const orderHour = new Date(o.createdAt).getHours();
    const currentHour = now.getHours();
    const diff = currentHour - orderHour;
    if (diff >= 0 && diff < 12) {
      hourlyData[11 - diff]++;
    }
  });
  const maxHourly = Math.max(...hourlyData, 1);

  if (!myRestaurant) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">
            Restoran Kaydı Bulunamadı
          </h2>
          <p className="text-yellow-700">
            Hesabınız henüz bir restorana bağlanmamış.<br/>
            Lütfen sistem yöneticisi ile iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Restoran Bilgi Kartı */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🍽️</span>
              <div>
                <h1 className="text-2xl font-bold">{myRestaurant.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    myRestaurant.isActive
                      ? 'bg-green-400 text-green-900'
                      : 'bg-red-400 text-red-900'
                  }`}>
                    {myRestaurant.isActive ? '● Aktif' : '● Pasif'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-orange-100 text-sm mt-3 flex items-center gap-2">
              <span>📍</span> {myRestaurant.address}
            </p>
            <p className="text-orange-100 text-sm flex items-center gap-2">
              <span>📞</span> {myRestaurant.phone}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-orange-400">
          <p className="text-orange-100 text-xs">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Bugünkü Özet</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-orange-200 rounded-2xl p-4">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-2xl font-bold text-orange-600">{todayOrders.length}</p>
            <p className="text-xs text-gray-500">Sipariş</p>
          </div>
          <div className="bg-white border border-blue-200 rounded-2xl p-4">
            <div className="text-2xl mb-1">🛵</div>
            <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
            <p className="text-xs text-gray-500">Yolda</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-2xl p-4">
            <div className="text-2xl mb-1">⏳</div>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
            <p className="text-xs text-gray-500">Bekleyen</p>
          </div>
          <div className="bg-white border border-green-200 rounded-2xl p-4">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-2xl font-bold text-green-600">{deliveredToday.length}</p>
            <p className="text-xs text-gray-500">Teslim</p>
          </div>
          <div className="bg-white border border-red-200 rounded-2xl p-4">
            <div className="text-2xl mb-1">❌</div>
            <p className="text-2xl font-bold text-red-600">{cancelledToday.length}</p>
            <p className="text-xs text-gray-500">İptal</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-4">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xl font-bold">₺{todayRevenue.toFixed(0)}</p>
            <p className="text-xs text-purple-100">Ciro</p>
          </div>
        </div>
      </div>

      {/* Sipariş Kaynakları */}
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Sipariş Kaynakları (Bugün)
        </h2>
        <div className="space-y-3">
          <SourceBar label="Yemeksepeti" icon="🍔" count={sourceMap.yemeksepeti} total={todayOrders.length} color="bg-red-500"/>
          <SourceBar label="Getir" icon="🛵" count={sourceMap.getir} total={todayOrders.length} color="bg-purple-500"/>
          <SourceBar label="Trendyol" icon="🍕" count={sourceMap.trendyol} total={todayOrders.length} color="bg-orange-500"/>
          <SourceBar label="Manuel" icon="✍️" count={sourceMap.manuel} total={todayOrders.length} color="bg-blue-500"/>
        </div>
      </div>

      {/* Saatlik Grafik */}
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Son 12 Saat
        </h2>
        <div className="flex items-end gap-1 h-32">
          {hourlyData.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg transition-all"
                style={{ height: `${(count / maxHourly) * 100}%`, minHeight: count > 0 ? '8px' : '2px' }}
                title={`${count} sipariş`}
              />
              <span className="text-xs text-gray-400">
                {count > 0 ? count : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Yeni Sipariş Butonu */}
      <button
        onClick={() => navigate('/new-order')}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
      >
        <span className="text-2xl">+</span>
        <span>Yeni Sipariş Oluştur</span>
      </button>

      {/* Aktif Siparişler */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🛵</span> Yoldaki Siparişler
          </h2>
          <div className="space-y-2">
            {activeOrders.map((order: any) => (
              <div key={order.id} className="bg-white border-l-4 border-blue-500 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                  {order.courier?.user?.fullName && (
                    <p className="text-xs text-gray-400 mt-1">
                      Kurye: {order.courier.user.fullName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    ₺{parseFloat(order.orderTotal || 0).toFixed(0)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'assigned'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {order.status === 'assigned' ? '📦 Atandı' : '🛵 Yolda'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bekleyen Siparişler */}
      {pendingOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>⏳</span> Kurye Bekleyenler
          </h2>
          <div className="space-y-2">
            {pendingOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <p className="font-bold text-gray-800">
                  ₺{parseFloat(order.orderTotal || 0).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SourceBar = ({ label, icon, count, total, color }: {
  label: string;
  icon: string;
  count: number;
  total: number;
  color: string;
}) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {icon} {label}
        </span>
        <span className="text-sm font-bold text-gray-800">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
