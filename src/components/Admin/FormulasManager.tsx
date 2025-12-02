import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CalculationFormula, Micronutrient } from '../../types/database';
import { Plus, Edit2, Trash2, Calculator } from 'lucide-react';

export const FormulasManager: React.FC = () => {
  const [formulas, setFormulas] = useState<CalculationFormula[]>([]);
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CalculationFormula | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    input_micronutrients: [] as string[],
    output_micronutrient_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formulasRes, micronutrientsRes] = await Promise.all([
        supabase.from('calculation_formulas').select('*').order('created_at', { ascending: false }),
        supabase.from('micronutrients').select('*').order('name', { ascending: true }),
      ]);

      if (formulasRes.error) throw formulasRes.error;
      if (micronutrientsRes.error) throw micronutrientsRes.error;

      setFormulas(formulasRes.data || []);
      setMicronutrients(micronutrientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('calculation_formulas')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calculation_formulas')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        description: '',
        formula: '',
        input_micronutrients: [],
        output_micronutrient_id: '',
        is_active: true,
      });
      setShowAddForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving formula:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleEdit = (item: CalculationFormula) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      formula: item.formula,
      input_micronutrients: item.input_micronutrients,
      output_micronutrient_id: item.output_micronutrient_id || '',
      is_active: item.is_active,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить формулу?')) return;

    try {
      const { error } = await supabase
        .from('calculation_formulas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting formula:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('calculation_formulas')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling formula status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Управление формулами расчета</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingItem(null);
            setFormData({
              name: '',
              description: '',
              formula: '',
              input_micronutrients: [],
              output_micronutrient_id: '',
              is_active: true,
            });
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Добавить формулу
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? 'Редактировать формулу' : 'Новая формула'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название формулы
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Расчет индекса"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Формула расчета
              </label>
              <textarea
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                placeholder="(A + B) / C * 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Используйте переменные A, B, C для входных микроэлементов
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Входные микроэлементы
              </label>
              <div className="space-y-2">
                {micronutrients.map((micro) => (
                  <label key={micro.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.input_micronutrients.includes(micro.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            input_micronutrients: [...formData.input_micronutrients, micro.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            input_micronutrients: formData.input_micronutrients.filter(id => id !== micro.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm">{micro.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Результирующий микроэлемент (необязательно)
              </label>
              <select
                value={formData.output_micronutrient_id}
                onChange={(e) => setFormData({ ...formData, output_micronutrient_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Не выбрано</option>
                {micronutrients.map((micro) => (
                  <option key={micro.id} value={micro.id}>
                    {micro.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Формула активна
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
              >
                {editingItem ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {formulas.map((formula) => {
          const inputMicroNames = formula.input_micronutrients
            .map(id => micronutrients.find(m => m.id === id)?.name)
            .filter(Boolean);
          const outputMicroName = micronutrients.find(m => m.id === formula.output_micronutrient_id)?.name;

          return (
            <div
              key={formula.id}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${
                !formula.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{formula.name}</h3>
                    {formula.description && (
                      <p className="text-gray-600 text-sm mt-1">{formula.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(formula.id, formula.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      formula.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {formula.is_active ? 'Активна' : 'Неактивна'}
                  </button>
                  <button
                    onClick={() => handleEdit(formula)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(formula.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Формула:</span>
                  <pre className="mt-1 text-sm font-mono bg-white p-2 rounded border">
                    {formula.formula}
                  </pre>
                </div>
                {inputMicroNames.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Входные данные:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {inputMicroNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {outputMicroName && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Результат:</span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {outputMicroName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {formulas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Формулы не найдены. Создайте первую формулу расчета.
          </div>
        )}
      </div>
    </div>
  );
};
