import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Orders from './pages/Orders/Orders';
import NewOrder from './pages/NewOrder/NewOrder';
import Settings from './pages/Settings/Settings';
import Customers from './pages/Customers/Customers';
import Map from './pages/Map/Map';
import Tracking from './pages/Tracking/Tracking';

const queryClient = new QueryClient();
const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Ana Sayfa' },
  { path: '/new-order', icon: '➕', label: 'Sipariş' },
  { path: '/orders',    icon: '📋', label: 'Siparişler' },
  { path: '/tracking',  icon: '🗺️', label: 'Takip' },
  { path: '/customers', icon: '👥', label: 'Müşteriler' },
  { path: '/settings',  icon: '⚙️', label: 'Ayarlar' },
];

const NavLink = ({ item }: { item: typeof navItems[0] }) => {
  const { pathname } = useLocation();
  const active = pathname === item.path;
  return (
    <Link
      to={item.path}
      className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors text-xs ${
        active ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'
      }`}
    >
      <span className="text-lg leading-tight">{item.icon}</span>
      <span className={`font-medium ${active ? 'text-orange-500' : ''}`}>{item.label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="font-bold text-gray-800">Restoran Paneli</p>
            <p className="text-xs text-gray-400">TABY Kurye Sistemi</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Çıkış
        </button>
      </header>
      <main className="max-w-2xl mx-auto pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 safe-area-pb">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(item => (
            <NavLink key={item.path} item={item} />
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
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/new-order"  element={<PrivateRoute><Layout><NewOrder /></Layout></PrivateRoute>} />
          <Route path="/orders"     element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
          <Route path="/map"        element={<PrivateRoute><Layout><Map /></Layout></PrivateRoute>} />
          <Route path="/tracking"   element={<PrivateRoute><Layout><Tracking /></Layout></PrivateRoute>} />
          <Route path="/customers"  element={<PrivateRoute><Layout><Customers /></Layout></PrivateRoute>} />
          <Route path="/settings"   element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
