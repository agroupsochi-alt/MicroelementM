import { useState } from 'react';
import { UsersManager } from './UsersManager';
import { QuestionnaireManager } from './QuestionnaireManager';
import { HealthCalculationsManager } from './HealthCalculationsManager';
import { RecommendationsManager } from './RecommendationsManager';
import { Users, ClipboardList, Calculator, Award } from 'lucide-react';

type AdminTab = 'users' | 'questionnaire' | 'calculations' | 'recommendations';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabs = [
    { id: 'users' as AdminTab, label: 'Управление пользователями', icon: Users },
    { id: 'questionnaire' as AdminTab, label: 'Опросник', icon: ClipboardList },
    { id: 'calculations' as AdminTab, label: 'Расчеты здоровья', icon: Calculator },
    { id: 'recommendations' as AdminTab, label: 'Рекомендации', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель администратора</h1>
        <p className="text-gray-600">Управление системой отслеживания микроэлементов</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'questionnaire' && <QuestionnaireManager />}
        {activeTab === 'calculations' && <HealthCalculationsManager />}
        {activeTab === 'recommendations' && <RecommendationsManager />}
      </div>
    </div>
  );
};
