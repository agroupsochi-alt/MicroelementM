import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Save } from 'lucide-react';

export const UserDataForm = () => {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    phone: '',
    birth_date: '',
    gender: 'other',
    height: '',
    weight: '',
    activity_level: 'moderate',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        patronymic: profile.patronymic || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || 'other',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        activity_level: profile.activity_level || 'moderate',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const palValues: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        high: 1.725,
        extreme: 1.9,
      };

      const updates = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        pal: palValues[formData.activity_level] || 1.55,
        full_name: `${formData.last_name} ${formData.first_name} ${formData.patronymic}`.trim(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, ...updates } as any);
      }

      alert('Профиль успешно обновлен!');
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold">Личные данные</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Фамилия</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Имя</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Отчество</label>
            <input
              type="text"
              value={formData.patronymic}
              onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Дата рождения</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Пол</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Рост (см)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Вес (кг)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Уровень активности</label>
          <select
            value={formData.activity_level}
            onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="sedentary">Минимальная (нет упражнений)</option>
            <option value="light">Легкая (1-3 раза/неделя)</option>
            <option value="moderate">Умеренная (3-5 раз/неделя)</option>
            <option value="high">Высокая (6-7 раз/неделя)</option>
            <option value="extreme">Экстремальная (очень интенсивно ежедневно)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>

      {profile && (
        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <h3 className="font-semibold text-teal-800 mb-2">Текущий профиль:</h3>
          <div className="text-sm text-teal-700 space-y-1">
            <p>Имя: {profile.full_name || 'Не указано'}</p>
            <p>Возраст: {profile.age || 'Не указано'}</p>
            <p>Рост: {profile.height || 'Не указано'} см</p>
            <p>Вес: {profile.weight || 'Не указано'} кг</p>
          </div>
        </div>
      )}
    </div>
  );
};
