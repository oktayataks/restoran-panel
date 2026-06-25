import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../../hooks/useCustomers';
import type { Customer } from '../../hooks/useCustomers';

const Customers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(getCustomers);

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleDelete = (id: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;
    deleteCustomer(id);
    setCustomers(getCustomers());
  };

  const handleNewOrderWithCustomer = (c: Customer) => {
    navigate('/new-order', {
      state: {
        customerName: c.name,
        customerPhone: c.phone,
        deliveryAddress: c.address,
      },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Müşteri Rehberi</h1>
        <span className="text-sm text-gray-400">{customers.length} müşteri</span>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="İsim veya telefon ara..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">👤</p>
          <p className="font-medium">
            {customers.length === 0
              ? 'Henüz müşteri yok'
              : 'Arama sonucu bulunamadı'}
          </p>
          <p className="text-sm mt-1">
            Sipariş oluşturdukça müşteriler otomatik kaydedilir.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👤</span>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {c.orderCount} sipariş
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  📞 {c.phone}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  📍 {c.address}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Son sipariş: {new Date(c.lastOrder).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleNewOrderWithCustomer(c)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
              >
                + Sipariş Oluştur
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold rounded-xl transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
