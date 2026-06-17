import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Receipt,
  AlertTriangle,
  LogOut,
  Package,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppStore();

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: '数据概览', path: '/admin' },
    { icon: <UserCheck className="w-5 h-5" />, label: '跑手审核', path: '/admin/runners' },
    { icon: <Users className="w-5 h-5" />, label: '用户管理', path: '/admin/users' },
    { icon: <Receipt className="w-5 h-5" />, label: '交易流水', path: '/admin/transactions' },
    { icon: <AlertTriangle className="w-5 h-5" />, label: '争议处理', path: '/admin/disputes' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">校园跑腿</h1>
              <p className="text-xs text-gray-500">管理后台</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={currentUser?.avatar}
              alt=""
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {currentUser?.username}
              </p>
              <p className="text-xs text-gray-500">管理员</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center h-16 px-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>返回前台</span>
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
