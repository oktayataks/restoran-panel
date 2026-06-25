import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { getCustomers, saveCustomer } from '../../hooks/useCustomers';
import type { Customer } from '../../hooks/useCustomers';

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as Partial<{
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
  }> | null;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: prefill?.customerName || '',
    customerPhone: prefill?.customerPhone || '',
    deliveryAddress: prefill?.deliveryAddress || '',
    orderTotal: '',
    deliveryFee: '',
    paymentMethod: 'cash',
    notes: '',
    source: 'manual',
  });

  const [phoneSuggestions, setPhoneSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (form.customerPhone.length >= 3) {
      const all = getCustomers();
      const matches = all.filter(c => c.phone.includes(form.customerPhone));
      setPhoneSuggestions(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [form.customerPhone]);

  const selectCustomer = (c: Customer) => {
    setForm(p => ({
      ...p,
      customerName: c.name,
      customerPhone: c.phone,
      deliveryAddress: c.address,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const restaurantRes = await api.get('/restaurants');
      const restaurants = Array.isArray(restaurantRes.data)
        ? restaurantRes.data
        : restaurantRes.data?.data || [];

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myRestaurant = restaurants.find((r: any) => r.userId === user.id);

      if (!myRestaurant) {
        alert('Restoran bilgisi bulunamadı! Admin ile iletişime geçin.');
        return;
      }

      await api.post('/orders', {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        orderTotal: parseFloat(form.orderTotal),
        deliveryFee: parseFloat(form.deliveryFee || '0'),
        notes: form.notes ? `[${form.source}] ${form.notes}` : `[${form.source}]`,
        restaurantId: myRestaurant.id,
      });

      saveCustomer({
        name: form.customerName,
        phone: form.customerPhone,
        address: form.deliveryAddress,
      });

      navigate('/orders');
    } catch (err: any) {
      console.error('Hata:', err.response?.data || err);
      alert('Sipariş oluşturulamadı: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Sipariş Oluştur</h1>
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Kaynak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sipariş Kaynağı
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['manual', 'yemeksepeti', 'getir', 'trendyol'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, source: s }))}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    form.source === s
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'manual' ? 'Manuel' :
                   s === 'yemeksepeti' ? 'Yemeksepeti' :
                   s === 'getir' ? 'Getir' : 'Trendyol'}
                </button>
              ))}
            </div>
          </div>

          {/* Telefon (autocomplete) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri Telefon *
            </label>
            <input
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="05XX XXX XX XX"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {phoneSuggestions.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b last:border-0"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone} · {c.orderCount} sipariş</p>
                    <p className="text-xs text-gray-400 truncate">{c.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı *</label>
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Ad Soyad"
            />
          </div>

          {/* Adres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi *</label>
            <textarea
              name="deliveryAddress"
              value={form.deliveryAddress}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Mahalle, Cadde, No, Daire..."
            />
          </div>

          {/* Tutar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Tutarı (₺) *</label>
              <input
                type="number"
                name="orderTotal"
                value={form.orderTotal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Ücreti (₺)</label>
              <input
                type="number"
                name="deliveryFee"
                value={form.deliveryFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Ödeme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="cash">Nakit</option>
              <option value="card">Kredi Kartı</option>
              <option value="online">Online Ödeme</option>
            </select>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Özel istekler, kapı kodu vb."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : '✅ Sipariş Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
