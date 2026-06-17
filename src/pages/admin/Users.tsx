import { useState } from 'react';
import { Users, Search, Ban, Check, Shield } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils';

export default function AdminUsers() {
  const { users, banUser, unbanUser, runnerProfiles } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'runner' | 'admin'>('all');

  const filteredUsers = users
    .filter((u) => {
      if (roleFilter === 'all') return true;
      return u.role === roleFilter;
    })
    .filter((u) => {
      if (!searchQuery) return true;
      return (
        u.username.includes(searchQuery) ||
        u.studentId.includes(searchQuery) ||
        u.phone.includes(searchQuery)
      );
    });

  const handleToggleBan = (userId: string, isBanned: boolean) => {
    if (isBanned) {
      unbanUser(userId);
    } else {
      if (confirm('确定要禁用该用户吗？')) {
        banUser(userId);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      student: '学生',
      runner: '跑手',
      admin: '管理员',
    };
    return map[role] || role;
  };

  const getRoleColor = (role: string) => {
    const map: Record<string, string> = {
      student: 'bg-blue-100 text-blue-800',
      runner: 'bg-secondary-100 text-secondary-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return map[role] || 'bg-gray-100 text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-500 mt-1">管理平台所有用户</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1">
              {(['all', 'student', 'runner', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    roleFilter === role
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {role === 'all' ? '全部' : getRoleLabel(role)}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名/学号/手机号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:bg-white focus:outline-none transition-colors w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手机号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  余额
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const runnerProfile = runnerProfiles.find((p) => p.userId === user.id);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.studentId}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        ¥{user.balance.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            user.isBanned
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.isBanned ? (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              已禁用
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              正常
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(user.id, user.isBanned)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isBanned
                                ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                            }`}
                            title={user.isBanned ? '解封' : '禁用'}
                          >
                            {user.isBanned ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    暂无用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
