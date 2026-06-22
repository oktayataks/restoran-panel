import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['restaurant-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o: any) =>
    new Date(o.createdAt).toDateString() === today
  );
  const activeOrders = orders.filter((o: any) =>
    o.status === 'assigned' || o.status === 'picked_up'
  );
  const deliveredToday = todayOrders.filter((o: any) =>
    o.status === 'delivered'
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Merhaba! 👋</h1>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('tr-TR', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-2xl p-4">
          <p className="text-sm text-orange-600">Bugün</p>
          <p className="text-3xl font-bold text-orange-700">{todayOrders.length}</p>
          <p className="text-xs text-orange-500">sipariş</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-600">Aktif</p>
          <p className="text-3xl font-bold text-blue-700">{activeOrders.length}</p>
          <p className="text-xs text-blue-500">kurye yolda</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-600">Teslim</p>
          <p className="text-3xl font-bold text-green-700">{deliveredToday.length}</p>
          <p className="text-xs text-green-500">bugün</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/new-order')}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white 
          font-semibold py-4 rounded-2xl transition-colors flex items-center 
          justify-center gap-2 text-lg"
      >
        <span>+</span>
        <span>Yeni Sipariş Oluştur</span>
      </button>
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Aktif Siparişler</h2>
        <div className="space-y-3">
          {activeOrders.slice(0, 5).map((order: any) => (
            <div key={order.id} className="bg-white rounded-xl border p-4 flex justify-between">
              <div>
                <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.customerName}</p>
              </div>
              <span className="text-orange-500 text-sm font-medium">
                {order.status === 'assigned' ? '📦 Atandı' : '🛵 Yolda'}
              </span>
            </div>
          ))}
          {activeOrders.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Aktif sipariş yok</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
