import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface Micronutrient {
  id: string;
  name: string;
  unit: string;
  normal_min: number;
  normal_max: number;
}

interface Measurement {
  id: string;
  micronutrient_id: string;
  value: number;
  measured_at: string;
  notes: string;
  micronutrient_name?: string;
  unit?: string;
}

export const AnalysisEntry = () => {
  const { user } = useAuth();
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    micronutrient_id: '',
    value: '',
    measured_at: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [microRes, measureRes] = await Promise.all([
        supabase.from('micronutrients').select('*').order('name'),
        user ? supabase.from('user_measurements').select('*').eq('user_id', user.id).order('measured_at', { ascending: false }) : { data: [] }
      ]);

      if (microRes.error) throw microRes.error;
      setMicronutrients(microRes.data || []);

      if (measureRes.data) {
        const enriched = measureRes.data.map(m => {
          const micro = microRes.data?.find(mi => mi.id === m.micronutrient_id);
          return {
            ...m,
            micronutrient_name: micro?.name,
            unit: micro?.unit
          };
        });
        setMeasurements(enriched);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('user_measurements').insert({
        user_id: user.id,
        micronutrient_id: formData.micronutrient_id,
        value: parseFloat(formData.value),
        measured_at: formData.measured_at,
        notes: formData.notes,
      });

      if (error) throw error;

      alert('Анализ добавлен!');
      setFormData({
        micronutrient_id: '',
        value: '',
        measured_at: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот результат?')) return;

    try {
      const { error } = await supabase.from('user_measurements').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err: any) {
      alert('Ошибка: ' + err.message);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold">Ввод лабораторных анализов</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Микроэлемент</label>
              <select
                value={formData.micronutrient_id}
                onChange={(e) => setFormData({ ...formData, micronutrient_id: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Выберите...</option>
                {micronutrients.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Значение</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Дата анализа</label>
              <input
                type="date"
                value={formData.measured_at}
                onChange={(e) => setFormData({ ...formData, measured_at: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Заметки</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Необязательно"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {measurements.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            Пока нет добавленных анализов. Нажмите "Добавить" чтобы внести данные.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-left py-3 px-4">Микроэлемент</th>
                <th className="text-left py-3 px-4">Значение</th>
                <th className="text-left py-3 px-4">Дата</th>
                <th className="text-left py-3 px-4">Заметки</th>
                <th className="text-right py-3 px-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{m.micronutrient_name}</td>
                  <td className="py-3 px-4">
                    {m.value} {m.unit}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(m.measured_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{m.notes || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
