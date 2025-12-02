import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  nutrient_mapping: string[];
}

interface Answer {
  question_id: string;
  answer: 'yes' | 'sometimes' | 'no';
  weight: number;
}

export const NutrientSurvey = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [questionsRes, resultsRes] = await Promise.all([
        supabase.from('nutrient_survey_questions').select('*').eq('is_active', true).order('order_index'),
        user ? supabase.from('user_survey_results').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(10) : { data: [] }
      ]);

      if (questionsRes.error) throw questionsRes.error;
      setQuestions(questionsRes.data || []);
      setResults(resultsRes.data || []);
      setShowResults(resultsRes.data && resultsRes.data.length > 0);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: 'yes' | 'sometimes' | 'no') => {
    const weight = answer === 'yes' ? 4 : answer === 'sometimes' ? 2 : 0;
    const question = questions[currentQuestion];

    setAnswers({
      ...answers,
      [question.id]: {
        question_id: question.id,
        answer,
        weight
      }
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitSurvey = async () => {
    if (!user) return;

    try {
      alert('Опрос завершен! Результаты сохранены.');
      setShowResults(true);
      loadData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const startNewSurvey = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'light': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Высокий дефицит';
      case 'moderate': return 'Умеренный дефицит';
      case 'light': return 'Легкий дефицит';
      default: return 'Норма';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    );
  }

  if (showResults && results.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-8 h-8 text-teal-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Результаты опроса на дефицит</h2>
            <p className="text-gray-600 text-sm">Ваши последние результаты анализа</p>
          </div>
          <button
            onClick={startNewSurvey}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Пройти снова
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${getLevelColor(result.level)}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{result.nutrient_code.toUpperCase()}</h4>
                <span className="text-sm font-medium">{Math.round(result.percent)}%</span>
              </div>
              <p className="text-sm mb-3">{getLevelLabel(result.level)}</p>
              <div className="bg-white/50 rounded-full h-3">
                <div
                  className="h-full bg-current rounded-full transition-all"
                  style={{ width: `${result.percent}%` }}
                />
              </div>
              <p className="text-xs mt-2">Набрано: {result.score} из {result.max_score} баллов</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold">Опрос на дефицит микроэлементов</h2>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800">Вопросы опроса пока не загружены</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-8 h-8 text-teal-600" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Опрос на дефицит микроэлементов</h2>
          <p className="text-gray-600 text-sm">Вопрос {currentQuestion + 1} из {questions.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-600 h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-xl mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
            {question.question_number}
          </div>
          <div className="flex-1">
            <p className="text-xl font-medium text-gray-800">{question.question_text}</p>
            {question.nutrient_mapping && question.nutrient_mapping.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {question.nutrient_mapping.map((nutrient, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white text-teal-700 text-xs rounded-full">
                    {nutrient}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleAnswer('yes')}
          className={`p-6 rounded-xl border-2 transition-all ${
            answers[question.id]?.answer === 'yes'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-red-300 bg-white'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">😟</div>
            <div className="font-semibold text-lg">Да</div>
            <div className="text-sm text-gray-600 mt-1">4 балла</div>
          </div>
        </button>

        <button
          onClick={() => handleAnswer('sometimes')}
          className={`p-6 rounded-xl border-2 transition-all ${
            answers[question.id]?.answer === 'sometimes'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300 bg-white'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">😐</div>
            <div className="font-semibold text-lg">Иногда</div>
            <div className="text-sm text-gray-600 mt-1">2 балла</div>
          </div>
        </button>

        <button
          onClick={() => handleAnswer('no')}
          className={`p-6 rounded-xl border-2 transition-all ${
            answers[question.id]?.answer === 'no'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300 bg-white'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="font-semibold text-lg">Нет</div>
            <div className="text-sm text-gray-600 mt-1">0 баллов</div>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
        >
          Назад
        </button>

        {isComplete && (
          <button
            onClick={submitSurvey}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700"
          >
            <CheckCircle className="w-5 h-5" />
            Завершить опрос
          </button>
        )}

        {currentQuestion < questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Следующий
          </button>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Отвечено: {Object.keys(answers).length} из {questions.length}</p>
      </div>
    </div>
  );
};
