import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, parseInt(age), gender, role);
      setSuccess(true);
      setTimeout(() => {
        onToggleForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Регистрация успешна!</h3>
          <p className="text-gray-600">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Регистрация</h2>
      <p className="text-center text-gray-600 mb-6">Создайте свой аккаунт</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Полное имя
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="Иван Иванов"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Возраст
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="1"
              max="120"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пол
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Роль
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Уже есть аккаунт?{' '}
          <button
            onClick={onToggleForm}
            className="text-teal-600 font-semibold hover:text-teal-700 transition"
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};
