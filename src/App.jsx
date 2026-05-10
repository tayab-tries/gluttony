import { Toaster } from './components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from './lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { CartProvider } from './lib/CartContext';
import { AuthDemoProvider, useAuthDemo } from './lib/AuthDemoContext';

// Pages
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import RestaurantMenu from './pages/RestaurantMenu';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import DriverPanel from './pages/DriverPanel';
import OwnerPanel from './pages/OwnerPanel';
import AdminPanel from './pages/AdminPanel';

function AppRouter() {
  const { currentUser } = useAuthDemo();

  return (
    <Routes>
      {/* Public */}
      <Route path="/signin" element={
        currentUser ? <Navigate to={getDefaultRoute(currentUser.role)} replace /> : <SignIn />
      } />

      {/* Customer routes */}
      <Route path="/" element={<RequireRole allowed={['customer']}><Home /></RequireRole>} />
      <Route path="/restaurant/:id" element={<RequireRole allowed={['customer']}><RestaurantMenu /></RequireRole>} />
      <Route path="/cart" element={<RequireRole allowed={['customer']}><Cart /></RequireRole>} />
      <Route path="/track/:id" element={<RequireRole allowed={['customer']}><OrderTracking /></RequireRole>} />
      <Route path="/orders" element={<RequireRole allowed={['customer']}><Orders /></RequireRole>} />
      <Route path="/profile" element={<RequireRole allowed={['customer', 'driver', 'owner', 'admin']}><Profile /></RequireRole>} />

      {/* Role panels */}
      <Route path="/driver" element={<RequireRole allowed={['driver', 'admin']}><DriverPanel /></RequireRole>} />
      <Route path="/owner" element={<RequireRole allowed={['owner', 'admin']}><OwnerPanel /></RequireRole>} />
      <Route path="/admin" element={<RequireRole allowed={['admin']}><AdminPanel /></RequireRole>} />

      {/* Fallback */}
      <Route path="*" element={currentUser ? <Navigate to={getDefaultRoute(currentUser.role)} replace /> : <Navigate to="/signin" replace />} />
    </Routes>
  );
}

function RequireRole({ allowed, children }) {
  const { currentUser } = useAuthDemo();
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (!allowed.includes(currentUser.role)) return <Navigate to={getDefaultRoute(currentUser.role)} replace />;
  return children;
}

function getDefaultRoute(role) {
  const map = { customer: '/', driver: '/driver', owner: '/owner', admin: '/admin' };
  return map[role] || '/signin';
}

function App() {
  return (
    <AuthDemoProvider>
      <CartProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <div style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
              <AppRouter />
            </div>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthDemoProvider>
  );
}

export default App;