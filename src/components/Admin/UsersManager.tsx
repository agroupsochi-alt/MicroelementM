import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Shield, UserCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'admin' | 'user';
  age: number | null;
  gender: string | null;
  created_at: string;
}

export const UsersManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, age, gender, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Роль изменена');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-teal-500 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Управление пользователями</h2>
          <p className="text-gray-600 text-sm">Всего: {users.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-left py-3 px-4">Пользователь</th>
                <th className="text-left py-3 px-4">Роль</th>
                <th className="text-left py-3 px-4">Возраст</th>
                <th className="text-left py-3 px-4">Пол</th>
                <th className="text-left py-3 px-4">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-purple-600" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>{user.full_name || 'Без имени'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">{user.age || '—'}</td>
                  <td className="py-4 px-4">
                    {user.gender === 'male' ? 'М' : user.gender === 'female' ? 'Ж' : '—'}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
