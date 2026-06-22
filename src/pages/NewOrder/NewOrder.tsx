import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderTotal: '',
    deliveryFee: '',
    paymentMethod: 'cash',
    notes: '',
    source: 'manual',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form,
        orderTotal: parseFloat(form.orderTotal),
        deliveryFee: parseFloat(form.deliveryFee || '0'),
        status: 'pending',
      });
      navigate('/orders');
    } catch {
      alert('Sipariş oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Sipariş Oluştur</h1>
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Adı *</label>
            <input name="customerName" value={form.customerName} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Ad Soyad"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Telefon *</label>
            <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="05XX XXX XX XX"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi *</label>
            <textarea name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} required rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Mahalle, Cadde, No, Daire..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Tutarı (₺) *</label>
              <input type="number" name="orderTotal" value={form.orderTotal} onChange={handleChange} required min="0" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Ücreti (₺)</label>
              <input type="number" name="deliveryFee" value={form.deliveryFee} onChange={handleChange} min="0" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="0.00"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="cash">Nakit</option>
              <option value="card">Kredi Kartı</option>
              <option value="online">Online Ödeme</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Özel istekler, kapı kodu vb."/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/orders')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
              İptal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : '✅ Sipariş Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
