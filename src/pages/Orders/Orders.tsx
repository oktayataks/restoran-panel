import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

const statusMap: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Bekliyor',      color: 'bg-yellow-100 text-yellow-700' },
  assigned:  { label: 'Atandı',        color: 'bg-blue-100 text-blue-700' },
  picked_up: { label: 'Yolda',         color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal',         color: 'bg-red-100 text-red-700' },
};

interface EditForm {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderTotal: string;
  deliveryFee: string;
  notes: string;
}

const EditModal = ({
  order,
  onClose,
}: {
  order: any;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    deliveryAddress: order.deliveryAddress || '',
    orderTotal: String(order.orderTotal || ''),
    deliveryFee: String(order.deliveryFee || ''),
    notes: order.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/orders/${order.id}`, {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        orderTotal: parseFloat(form.orderTotal),
        deliveryFee: parseFloat(form.deliveryFee || '0'),
        notes: form.notes,
      });
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
      onClose();
    } catch (err: any) {
      alert('Güncellenemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Sipariş Düzenle</h2>
            <p className="text-sm text-gray-400">#{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı</label>
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi</label>
            <textarea
              name="deliveryAddress"
              value={form.deliveryAddress}
              onChange={handleChange}
              rows={3}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
              <input
                type="number"
                name="orderTotal"
                value={form.orderTotal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat (₺)</label>
              <input
                type="number"
                name="deliveryFee"
                value={form.deliveryFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Orders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const myRestaurant = restaurants.find((r: any) => r.userId === user.id);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['restaurant-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.orders || [];
    },
    refetchInterval: 30000,
  });

  const orders = myRestaurant
    ? (ordersData ?? []).filter((o: any) => o.restaurantId === myRestaurant.id)
    : [];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <>
      {editingOrder && (
        <EditModal order={editingOrder} onClose={() => setEditingOrder(null)} />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Siparişlerim</h1>
          <span className="text-sm text-gray-400">{orders.length} sipariş</span>
        </div>

        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-800">
                    ₺{parseFloat(order.orderTotal || 0).toFixed(2)}
                  </p>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ✏️ Düzenle
                    </button>
                  )}
                </div>
              </div>
              {(order.status === 'assigned' || order.status === 'picked_up') && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-orange-600 text-sm font-medium">
                  <span>🛵</span>
                  <span>
                    {order.status === 'assigned' ? 'Kurye yola çıkmak üzere' : 'Kurye yolda'}
                  </span>
                  {order.courier?.user?.fullName && (
                    <span className="text-gray-400 font-normal">
                      · {order.courier.user.fullName}
                    </span>
                  )}
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
    </>
  );
};

export default Orders;
