import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const Settings = () => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    yemeksepetiApiKey: '',
    yemeksepetiEnabled: false,
    getirApiKey: '',
    getirEnabled: false,
    trendyolApiKey: '',
    trendyolEnabled: false,
  });

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await api.get('/restaurants');
      const restaurants = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myRestaurant = restaurants.find(
        (r: any) => r.userId === user.id
      );

      if (myRestaurant) {
        setRestaurant(myRestaurant);
        setForm({
          yemeksepetiApiKey: myRestaurant.yemeksepetiApiKey || '',
          yemeksepetiEnabled: myRestaurant.yemeksepetiEnabled || false,
          getirApiKey: myRestaurant.getirApiKey || '',
          getirEnabled: myRestaurant.getirEnabled || false,
          trendyolApiKey: myRestaurant.trendyolApiKey || '',
          trendyolEnabled: myRestaurant.trendyolEnabled || false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setLoading(true);
    setSaved(false);
    try {
      await api.patch(`/restaurants/${restaurant.id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Kaydedilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const webhookBase = 'https://kurye-sistemi.onrender.com/api/v1/webhooks';

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ayarlar</h1>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Yemeksepeti */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍔</span>
              <div>
                <h3 className="font-bold text-gray-800">Yemeksepeti</h3>
                <p className="text-sm text-gray-400">
                  Otomatik sipariş entegrasyonu
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.yemeksepetiEnabled}
                onChange={e => setForm(p => ({
                  ...p, yemeksepetiEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none
                rounded-full peer peer-checked:bg-orange-500
                after:content-[''] after:absolute after:top-0.5 after:left-0.5
                after:bg-white after:rounded-full after:h-5 after:w-5
                after:transition-all peer-checked:after:translate-x-5"/>
            </label>
          </div>

          {form.yemeksepetiEnabled && (
            <>
              <input
                type="text"
                placeholder="API Key"
                value={form.yemeksepetiApiKey}
                onChange={e => setForm(p => ({
                  ...p, yemeksepetiApiKey: e.target.value
                }))}
                className="w-full border border-gray-200 rounded-xl
                  px-4 py-3 focus:outline-none focus:ring-2
                  focus:ring-orange-400 mb-3"
              />
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Webhook URL:</p>
                <code className="break-all text-orange-600">
                  {webhookBase}/yemeksepeti/{restaurant?.id || '...'}
                </code>
                <p className="mt-2 text-gray-500">
                  Yemeksepeti panelinde bu URL'i webhook olarak ayarlayın.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Getir */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <div>
                <h3 className="font-bold text-gray-800">Getir</h3>
                <p className="text-sm text-gray-400">
                  Otomatik sipariş entegrasyonu
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.getirEnabled}
                onChange={e => setForm(p => ({
                  ...p, getirEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer
                peer-checked:bg-orange-500 after:content-['']
                after:absolute after:top-0.5 after:left-0.5 after:bg-white
                after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:after:translate-x-5"/>
            </label>
          </div>

          {form.getirEnabled && (
            <>
              <input
                type="text"
                placeholder="API Key"
                value={form.getirApiKey}
                onChange={e => setForm(p => ({
                  ...p, getirApiKey: e.target.value
                }))}
                className="w-full border border-gray-200 rounded-xl
                  px-4 py-3 focus:outline-none focus:ring-2
                  focus:ring-orange-400 mb-3"
              />
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Webhook URL:</p>
                <code className="break-all text-orange-600">
                  {webhookBase}/getir/{restaurant?.id || '...'}
                </code>
              </div>
            </>
          )}
        </div>

        {/* Trendyol */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍕</span>
              <div>
                <h3 className="font-bold text-gray-800">Trendyol Yemek</h3>
                <p className="text-sm text-gray-400">
                  Otomatik sipariş entegrasyonu
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.trendyolEnabled}
                onChange={e => setForm(p => ({
                  ...p, trendyolEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer
                peer-checked:bg-orange-500 after:content-['']
                after:absolute after:top-0.5 after:left-0.5 after:bg-white
                after:rounded-full after:h-5 after:w-5 after:transition-all
                peer-checked:after:translate-x-5"/>
            </label>
          </div>

          {form.trendyolEnabled && (
            <>
              <input
                type="text"
                placeholder="API Key"
                value={form.trendyolApiKey}
                onChange={e => setForm(p => ({
                  ...p, trendyolApiKey: e.target.value
                }))}
                className="w-full border border-gray-200 rounded-xl
                  px-4 py-3 focus:outline-none focus:ring-2
                  focus:ring-orange-400 mb-3"
              />
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Webhook URL:</p>
                <code className="break-all text-orange-600">
                  {webhookBase}/trendyol/{restaurant?.id || '...'}
                </code>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600
            text-white font-semibold py-4 rounded-2xl
            transition-colors disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
        </button>

        {saved && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl
            text-center font-medium">
            ✅ Ayarlar başarıyla kaydedildi!
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
