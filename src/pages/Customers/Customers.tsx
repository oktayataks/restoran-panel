import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

const Customers = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const res = await api.get('/customers', {
        params: search ? { search } : {},
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const handleSave = async (form: any) => {
    try {
      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer.id}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowModal(false);
      setEditingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err: any) {
      alert('Hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Müşteriyi silmek istediğine emin misin?')) return;
    await api.delete(`/customers/${id}`);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Müşterilerim
        </h1>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
        >
          + Yeni Müşteri
        </button>
      </div>

      {/* Arama */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 İsim veya telefon ile ara..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* İstatistik */}
      <div className="bg-orange-50 rounded-2xl p-4 mb-4">
        <p className="text-sm text-orange-600">Toplam Müşteri</p>
        <p className="text-3xl font-bold text-orange-700">{customers.length}</p>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-gray-50 border rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-gray-600 font-medium">Henüz müşteri yok</p>
          <p className="text-sm text-gray-400 mt-2">
            Yeni sipariş oluşturduğunda müşteriler otomatik kaydedilir
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c: any) => (
            <div key={c.id} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    {c.orderCount > 0 && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                        {c.orderCount} sipariş
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">📞 {c.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {c.address}</p>
                  {c.notes && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      💬 {c.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingCustomer(c);
                      setShowModal(true);
                    }}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
};

const CustomerModal = ({
  customer,
  onSave,
  onClose,
}: {
  customer: any;
  onSave: (form: any) => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Ad Soyad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Teslimat adresi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Kapı kodu, kat, özel notlar..."
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.phone || !form.address}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
