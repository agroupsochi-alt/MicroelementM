import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Micronutrient } from '../../types/database';
import { Plus, Edit2, Trash2, FlaskConical } from 'lucide-react';

export const MicronutrientsManager: React.FC = () => {
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Micronutrient | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    normal_min: '',
    normal_max: '',
    age_min: '0',
    age_max: '120',
    gender: 'both' as 'male' | 'female' | 'both',
    description: '',
  });

  useEffect(() => {
    loadMicronutrients();
  }, []);

  const loadMicronutrients = async () => {
    try {
      const { data, error } = await supabase
        .from('micronutrients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMicronutrients(data || []);
    } catch (error) {
      console.error('Error loading micronutrients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        unit: formData.unit,
        normal_min: parseFloat(formData.normal_min),
        normal_max: parseFloat(formData.normal_max),
        age_min: parseInt(formData.age_min),
        age_max: parseInt(formData.age_max),
        gender: formData.gender,
        description: formData.description,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('micronutrients')
          .update(data)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('micronutrients')
          .insert([data]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        unit: '',
        normal_min: '',
        normal_max: '',
        description: '',
      });
      setShowAddForm(false);
      setEditingItem(null);
      loadMicronutrients();
    } catch (error) {
      console.error('Error saving micronutrient:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleEdit = (item: Micronutrient) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      normal_min: item.normal_min.toString(),
      normal_max: item.normal_max.toString(),
      age_min: item.age_min.toString(),
      age_max: item.age_max.toString(),
      gender: item.gender,
      description: item.description,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить микроэлемент?')) return;

    try {
      const { error } = await supabase
        .from('micronutrients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadMicronutrients();
    } catch (error) {
      console.error('Error deleting micronutrient:', error);
    }
  };

  const getStatus = (value: number, min: number, max: number) => {
    if (value < min) return { text: 'Низкий', color: 'text-orange-600 bg-orange-50' };
    if (value > max) return { text: 'Высокий', color: 'text-red-600 bg-red-50' };
    return { text: 'Норма', color: 'text-green-600 bg-green-50' };
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Управление микроэлементами</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingItem(null);
            setFormData({
              name: '',
              unit: '',
              normal_min: '',
              normal_max: '',
              age_min: '0',
              age_max: '120',
              gender: 'both',
              description: '',
            });
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Добавить микроэлемент
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? 'Редактировать микроэлемент' : 'Новый микроэлемент'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                  placeholder="Витамин D"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Единица измерения
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                  placeholder="нг/мл"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимальная норма
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.normal_min}
                  onChange={(e) => setFormData({ ...formData, normal_min: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Максимальная норма
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.normal_max}
                  onChange={(e) => setFormData({ ...formData, normal_max: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возраст от
                </label>
                <input
                  type="number"
                  value={formData.age_min}
                  onChange={(e) => setFormData({ ...formData, age_min: e.target.value })}
                  required
                  min="0"
                  max="120"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Возраст до
                </label>
                <input
                  type="number"
                  value={formData.age_max}
                  onChange={(e) => setFormData({ ...formData, age_max: e.target.value })}
                  required
                  min="0"
                  max="120"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пол
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'both' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="both">Все</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
              />
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
                  setFormData({
                    name: '',
                    unit: '',
                    normal_min: '',
                    normal_max: '',
                    age_min: '0',
                    age_max: '120',
                    gender: 'both',
                    description: '',
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {micronutrients.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FlaskConical className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                  title="Редактировать"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-t">
                <span className="text-gray-600">Норма:</span>
                <span className="font-semibold text-gray-800">
                  {item.normal_min} - {item.normal_max} {item.unit}
                </span>
              </div>
              {item.description && (
                <p className="text-gray-600 text-xs mt-2">{item.description}</p>
              )}
            </div>
          </div>
        ))}

        {micronutrients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Микроэлементы не найдены. Создайте первый микроэлемент.
          </div>
        )}
      </div>
    </div>
  );
};
