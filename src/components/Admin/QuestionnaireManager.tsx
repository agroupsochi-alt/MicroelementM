import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ClipboardList } from 'lucide-react';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  nutrient_mapping: string[];
  is_active: boolean;
}

export const QuestionnaireManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrient_survey_questions')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('nutrient_survey_questions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadQuestions();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

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
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Questionnaire Management</h2>
          <p className="text-gray-600 text-sm">Total: {questions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg border-2 ${
                q.is_active ? 'border-teal-200 bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {q.question_number}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">{q.question_text}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.nutrient_mapping.map((n, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(q.id, q.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    q.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {q.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
