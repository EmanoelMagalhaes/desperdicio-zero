import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from './components/common/LoadingScreen';
import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';
import PublicLayout from './components/layout/PublicLayout';
import GuestRoute from './components/routing/GuestRoute';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { useAppStore } from './hooks/useAppStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientManager from './pages/admin/ClientManager';
import ClientView from './pages/admin/ClientView';
import DashboardPage from './pages/client/DashboardPage';
import InventoryPage from './pages/client/InventoryPage';
import RecipesPage from './pages/client/RecipesPage';
import ShoppingPage from './pages/client/ShoppingPage';
import TipsPage from './pages/client/TipsPage';
import DemoKitchen from './pages/public/DemoKitchen';
import DemoRecipes from './pages/public/DemoRecipes';
import DemoShopping from './pages/public/DemoShopping';
import DemoTips from './pages/public/DemoTips';
import LandingPage from './pages/public/LandingPage';
import PendingApprovalPage from './pages/public/PendingApprovalPage';

export default function App() {
  const { ready } = useAppStore();

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/demo/kitchen" element={<DemoKitchen />} />
        <Route path="/demo/recipes" element={<DemoRecipes />} />
        <Route path="/demo/shopping" element={<DemoShopping />} />
        <Route path="/demo/tips" element={<DemoTips />} />

        <Route path="/demo/cozinha" element={<Navigate to="/demo/kitchen" replace />} />
        <Route path="/demo/receitas" element={<Navigate to="/demo/recipes" replace />} />
        <Route path="/demo/compras" element={<Navigate to="/demo/shopping" replace />} />
        <Route path="/demo/dicas" element={<Navigate to="/demo/tips" replace />} />

        <Route path="/register/pending" element={<PendingApprovalPage />} />
        <Route path="/cadastro-pendente" element={<PendingApprovalPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowRoles={['client']} />}>
        <Route element={<ClientLayout />}>
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/inventory" element={<InventoryPage />} />
          <Route path="/app/shopping" element={<ShoppingPage />} />
          <Route path="/app/recipes" element={<RecipesPage />} />
          <Route path="/app/tips" element={<TipsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<ClientManager />} />
          <Route path="/admin/cliente" element={<ClientView />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
