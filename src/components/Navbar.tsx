import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, User, Home, Plus, Settings, Shield, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAppStore();

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogin = () => {
    login('user-1');
  };

  const handleAdminLogin = () => {
    login('user-4');
    navigate('/admin');
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              校园跑腿
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home className="w-4 h-4" />} label="首页" />
            <NavLink to="/runner" icon={<Package className="w-4 h-4" />} label="跑手中心" />
            <NavLink to="/profile" icon={<User className="w-4 h-4" />} label="个人中心" />
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
                </button>
                <Link
                  to="/publish"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">发布任务</span>
                </Link>
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-9 h-9 rounded-full border-2 border-primary-200"
                  />
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-primary-500 transition-colors"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-full transition-colors"
                >
                  登录
                </button>
                <button
                  onClick={handleAdminLogin}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">管理员</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex justify-around py-2">
          <MobileNavLink to="/" icon={<Home className="w-5 h-5" />} label="首页" />
          <MobileNavLink to="/runner" icon={<Package className="w-5 h-5" />} label="接单" />
          <Link
            to="/publish"
            className="flex flex-col items-center justify-center -mt-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-500">发布</span>
          </Link>
          <MobileNavLink to="/profile" icon={<User className="w-5 h-5" />} label="我的" />
          <MobileNavLink to="/admin" icon={<Settings className="w-5 h-5" />} label="管理" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-medium transition-all ${
        isActive
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center py-1 px-3 ${
        isActive ? 'text-primary-500' : 'text-gray-500'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}
