
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import CategoryPage from './pages/menu/CategoryPage';
import MenuItemPage from './pages/menu/MenuItemPage';
import DashboardPage from './pages/reports/DashboardPage';
import UserPage from './pages/users/UserPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ToppingPage from './pages/menu/ToppingPage';
import RecipePage from './pages/menu/RecipePage';
import ReportPage from './pages/reports/ReportPage';
import ShiftPage from './pages/users/ShiftPage';
import AttendancePage from './pages/users/AttendancePage';
import KitchenPage from './pages/barista/KitchenPage';
import OrdersPage from './pages/orders/OrdersPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu/categories" element={<CategoryPage />} />
            <Route path="/menu/items" element={<MenuItemPage />} />
            <Route path="/menu/toppings" element={<ToppingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/recipes" element={<RecipePage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/hr/shifts" element={<ShiftPage />} />       
            <Route path="/hr/attendance" element={<AttendancePage />} />
          </Route>
          <Route path="/barista/queue" element={<KitchenPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;