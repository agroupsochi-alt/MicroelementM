import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { AdminPanel } from './components/Admin/AdminPanel';
import { UserDashboard } from './components/User/UserDashboard';
import { LogOut, User, Shield, Activity } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800">
                Система отслеживания микроэлементов
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Контролируйте показатели здоровья и получайте персональные рекомендации по питанию
            </p>
          </div>

          <div className="flex justify-center">
            {showRegister ? (
              <RegisterForm onToggleForm={() => setShowRegister(false)} />
            ) : (
              <LoginForm onToggleForm={() => setShowRegister(true)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Отслеживание микроэлементов
                </h1>
                <p className="text-xs text-gray-600">
                  {profile.role === 'admin' ? 'Панель администратора' : 'Личный кабинет'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                {profile.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-teal-600" />
                ) : (
                  <User className="w-5 h-5 text-teal-600" />
                )}
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">{profile.full_name}</div>
                  <div className="text-gray-600 text-xs">
                    {profile.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </div>
                </div>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Выход</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.role === 'admin' ? <AdminPanel /> : <UserDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
