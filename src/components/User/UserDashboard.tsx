import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserDataForm } from './UserDataForm';
import { NutrientSurvey } from './NutrientSurvey';
import { AnalysisEntry } from './AnalysisEntry';
import { HealthCalculations } from './HealthCalculations';
import { NutrientRecommendations } from './NutrientRecommendations';
import { User, ClipboardList, FileText, Calculator, Award } from 'lucide-react';

type Section = 'profile' | 'survey' | 'analysis' | 'calculations' | 'recommendations';

export const UserDashboard = () => {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('profile');

  const sections = [
    { id: 'profile' as Section, label: 'Личные данные', icon: User },
    { id: 'survey' as Section, label: 'Опрос на дефицит', icon: ClipboardList },
    { id: 'analysis' as Section, label: 'Ввод анализов', icon: FileText },
    { id: 'calculations' as Section, label: 'Расчеты здоровья', icon: Calculator },
    { id: 'recommendations' as Section, label: 'Рекомендации', icon: Award },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <UserDataForm />;
      case 'survey':
        return <NutrientSurvey />;
      case 'analysis':
        return <AnalysisEntry />;
      case 'calculations':
        return <HealthCalculations />;
      case 'recommendations':
        return <NutrientRecommendations />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
        <p className="text-teal-50 text-lg">
          Здравствуйте, {profile?.first_name || profile?.full_name || 'пользователь'}!
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Разделы</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                }`}
              >
                <div className={`p-3 rounded-lg ${isActive ? 'bg-teal-500' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="text-sm font-semibold">{section.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};
