import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Publish from './pages/Publish';
import OrderDetail from './pages/OrderDetail';
import RunnerCenter from './pages/RunnerCenter';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRunners from './pages/admin/Runners';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';
import AdminDisputes from './pages/admin/Disputes';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/runner" element={<RunnerCenter />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders" element={<Profile />} />
        <Route path="/profile/reviews" element={<Profile />} />
        <Route path="/profile/wallet" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/runners" element={<AdminRunners />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
