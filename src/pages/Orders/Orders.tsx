import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

const statusMap: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Bekliyor',      color: 'bg-yellow-100 text-yellow-700' },
  assigned:  { label: 'Atandı',        color: 'bg-blue-100 text-blue-700' },
  picked_up: { label: 'Yolda',         color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal',         color: 'bg-red-100 text-red-700' },
};

const Orders = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['restaurant-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"/>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Siparişlerim</h1>
        <span className="text-sm text-gray-400">{orders.length} sipariş</span>
      </div>
      <div className="space-y-3">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    statusMap[order.status]?.color || 'bg-gray-100 text-gray-600'
                  }`}>
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
                <p className="text-gray-700 font-medium">{order.customerName}</p>
                <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                <p className="text-gray-500 text-sm mt-1">{order.deliveryAddress}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  ₺{parseFloat(order.orderTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>
            {(order.status === 'assigned' || order.status === 'picked_up') && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-orange-600 text-sm font-medium">
                <span>🛵</span>
                <span>{order.status === 'assigned' ? 'Kurye yola çıkmak üzere' : 'Kurye yolda'}</span>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">📦</p>
            <p>Henüz sipariş yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
