import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { saveCustomer } from '../../hooks/useCustomers';

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as Partial<{
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
  }> | null;

  const [loading, setLoading] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
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

  // Telefon değişince API'den müşteri ara (500ms debounce)
  useEffect(() => {
    if (form.customerPhone.length < 4) {
      setFoundCustomer(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/customers/phone/${encodeURIComponent(form.customerPhone)}`
        );
        setFoundCustomer(res.data || null);
      } catch {
        setFoundCustomer(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.customerPhone]);

  const fillFromCustomer = (customer: any) => {
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      deliveryAddress: customer.address,
      notes: customer.notes || prev.notes,
    }));
    setFoundCustomer(null);
  };

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=tr&limit=1`,
        { headers: { 'User-Agent': 'TabyApp/1.0' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    return null;
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

      const coords = await geocodeAddress(form.deliveryAddress);

      await api.post('/orders', {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        orderTotal: parseFloat(form.orderTotal),
        deliveryFee: parseFloat(form.deliveryFee || '0'),
        notes: form.notes ? `[${form.source}] ${form.notes}` : `[${form.source}]`,
        restaurantId: myRestaurant.id,
        source: form.source,
        ...(coords && {
          deliveryLatitude: coords.lat,
          deliveryLongitude: coords.lng,
        }),
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

          {/* Telefon + müşteri arama */}
          <div>
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
            {foundCustomer && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      ✅ Eski müşteri bulundu
                    </p>
                    <p className="text-sm text-green-700">
                      {foundCustomer.name}
                      {foundCustomer.orderCount > 0 && (
                        <span className="text-green-500 ml-1">
                          · {foundCustomer.orderCount} sipariş
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillFromCustomer(foundCustomer)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Otomatik Doldur
                  </button>
                </div>
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
              {loading ? 'Koordinat alınıyor...' : '✅ Sipariş Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
