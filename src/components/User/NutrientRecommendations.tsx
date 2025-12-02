import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, AlertCircle } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  content: string;
  condition: 'low' | 'high' | 'normal';
  priority: number;
  micronutrient_name?: string;
}

export const NutrientRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          micronutrients (name)
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted = (data || []).map(r => ({
        ...r,
        micronutrient_name: r.micronutrients?.name
      }));

      setRecommendations(formatted);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'border-red-300 bg-red-50';
    if (priority >= 4) return 'border-orange-300 bg-orange-50';
    if (priority >= 3) return 'border-yellow-300 bg-yellow-50';
    return 'border-blue-300 bg-blue-50';
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'low': return 'Низкий уровень';
      case 'high': return 'Высокий уровень';
      default: return 'Норма';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'low': return 'text-red-700';
      case 'high': return 'text-orange-700';
      default: return 'text-green-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-8 h-8 text-teal-600" />
        <div>
          <h2 className="text-2xl font-bold">Рекомендации по микроэлементам</h2>
          <p className="text-gray-600 text-sm">Персональные советы для вашего здоровья</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-blue-800 font-medium mb-2">
                Рекомендации пока недоступны
              </p>
              <p className="text-blue-700 text-sm">
                Пройдите опрос на дефицит микроэлементов или введите результаты лабораторных анализов,
                чтобы получить персональные рекомендации.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-6 rounded-xl border-2 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{rec.title}</h3>
                  {rec.micronutrient_name && (
                    <p className="text-sm text-gray-600">Микроэлемент: {rec.micronutrient_name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium ${getConditionColor(rec.condition)}`}>
                    {getConditionLabel(rec.condition)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white rounded-full">
                    Приоритет: {rec.priority}/5
                  </span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{rec.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
        <h4 className="font-semibold text-teal-800 mb-2">💡 Важно помнить:</h4>
        <ul className="text-sm text-teal-700 space-y-1">
          <li>• Перед приемом добавок проконсультируйтесь с врачом</li>
          <li>• Следуйте рекомендованным дозировкам</li>
          <li>• Сбалансированное питание - основа здоровья</li>
          <li>• Регулярно проверяйте уровень микроэлементов</li>
        </ul>
      </div>
    </div>
  );
};
