import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Orders from './pages/Orders/Orders';
import NewOrder from './pages/NewOrder/NewOrder';
import Settings from './pages/Settings/Settings';

const queryClient = new QueryClient();
const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="font-bold text-gray-800">Restoran Paneli</p>
            <p className="text-xs text-gray-400">TABY Kurye Sistemi</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Çıkış
        </button>
      </header>
      <main className="max-w-2xl mx-auto pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto flex">
          {[
            { path: '/dashboard', icon: '🏠', label: 'Ana Sayfa' },
            { path: '/new-order', icon: '➕', label: 'Sipariş' },
            { path: '/orders', icon: '📋', label: 'Siparişler' },
            { path: '/settings', icon: '⚙️', label: 'Ayarlar' },
          ].map(item => (
            <Link key={item.path} to={item.path}
              className="flex-1 py-3 flex flex-col items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>}/>
          <Route path="/new-order" element={<PrivateRoute><Layout><NewOrder /></Layout></PrivateRoute>}/>
          <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>}/>
          <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>}/>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
