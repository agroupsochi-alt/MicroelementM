import { useAuth } from '../../contexts/AuthContext';
import { Calculator } from 'lucide-react';

export const HealthCalculations = () => {
  const { profile } = useAuth();

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    const heightM = Number(profile.height) / 100;
    return (Number(profile.weight) / (heightM * heightM)).toFixed(1);
  };

  const calculateBMR = () => {
    if (!profile?.height || !profile?.weight || !profile?.age || !profile?.gender) return null;
    const weight = Number(profile.weight);
    const height = Number(profile.height);
    const age = Number(profile.age);

    if (profile.gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr || !profile?.pal) return null;
    return Math.round(bmr * Number(profile.pal));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { name: 'Недостаточный вес', color: 'text-blue-600' };
    if (bmi < 25) return { name: 'Норма', color: 'text-green-600' };
    if (bmi < 30) return { name: 'Избыточный вес', color: 'text-orange-600' };
    return { name: 'Ожирение', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const bmiCategory = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold">Расчеты здоровья</h2>
      </div>

      {!profile?.height || !profile?.weight ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800">
            Пожалуйста, укажите ваш рост и вес в Личных данных для расчетов.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-blue-600 mb-2">ИМТ</h3>
            <div className="text-3xl font-bold text-blue-900">{bmi || ''}</div>
            {bmiCategory && (
              <p className={`text-sm mt-2 font-medium ${bmiCategory.color}`}>
                {bmiCategory.name}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-green-600 mb-2">БМР</h3>
            <div className="text-3xl font-bold text-green-900">{bmr || ''}</div>
            <p className="text-sm mt-2 text-green-700">ккал/день</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-purple-600 mb-2">Суточная норма</h3>
            <div className="text-3xl font-bold text-purple-900">{tdee || ''}</div>
            <p className="text-sm mt-2 text-purple-700">ккал/день</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <p><strong>ИМТ:</strong> Индекс массы тела - соотношение веса и роста</p>
        <p><strong>БМР:</strong> Базальный метаболизм - калории в покое</p>
        <p><strong>Суточная норма:</strong> Общий расход энергии - необходимые калории</p>
      </div>
    </div>
  );
};
