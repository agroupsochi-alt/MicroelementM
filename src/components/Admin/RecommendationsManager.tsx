import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Recommendation, Micronutrient, Condition } from '../../types/database';
import { Plus, Edit2, Trash2, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

export const RecommendationsManager: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Recommendation | null>(null);
  const [filterCondition, setFilterCondition] = useState<Condition | 'all'>('all');

  const [formData, setFormData] = useState({
    micronutrient_id: '',
    condition: 'low' as Condition,
    title: '',
    content: '',
    priority: 3,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recommendationsRes, micronutrientsRes] = await Promise.all([
        supabase.from('recommendations').select('*').order('priority', { ascending: false }),
        supabase.from('micronutrients').select('*').order('name', { ascending: true }),
      ]);

      if (recommendationsRes.error) throw recommendationsRes.error;
      if (micronutrientsRes.error) throw micronutrientsRes.error;

      setRecommendations(recommendationsRes.data || []);
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
          .from('recommendations')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recommendations')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        micronutrient_id: '',
        condition: 'low',
        title: '',
        content: '',
        priority: 3,
        is_active: true,
      });
      setShowAddForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving recommendation:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleEdit = (item: Recommendation) => {
    setEditingItem(item);
    setFormData({
      micronutrient_id: item.micronutrient_id,
      condition: item.condition,
      title: item.title,
      content: item.content,
      priority: item.priority,
      is_active: item.is_active,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить рекомендацию?')) return;

    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling recommendation status:', error);
    }
  };

  const getConditionIcon = (condition: Condition) => {
    switch (condition) {
      case 'low':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getConditionBadge = (condition: Condition) => {
    const styles = {
      low: 'bg-orange-100 text-orange-700',
      high: 'bg-red-100 text-red-700',
      normal: 'bg-green-100 text-green-700',
    };
    const labels = {
      low: 'Низкий уровень',
      high: 'Высокий уровень',
      normal: 'Норма',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[condition]}`}>{labels[condition]}</span>;
  };

  const filteredRecommendations = filterCondition === 'all'
    ? recommendations
    : recommendations.filter(r => r.condition === filterCondition);

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Управление рекомендациями</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingItem(null);
            setFormData({
              micronutrient_id: '',
              condition: 'low',
              title: '',
              content: '',
              priority: 3,
              is_active: true,
            });
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Добавить рекомендацию
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilterCondition('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterCondition === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setFilterCondition('low')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterCondition === 'low'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Низкий
        </button>
        <button
          onClick={() => setFilterCondition('high')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterCondition === 'high'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Высокий
        </button>
        <button
          onClick={() => setFilterCondition('normal')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterCondition === 'normal'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Норма
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? 'Редактировать рекомендацию' : 'Новая рекомендация'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Микроэлемент
                </label>
                <select
                  value={formData.micronutrient_id}
                  onChange={(e) => setFormData({ ...formData, micronutrient_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Выберите микроэлемент</option>
                  {micronutrients.map((micro) => (
                    <option key={micro.id} value={micro.id}>
                      {micro.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Условие
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as Condition })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="low">Низкий уровень</option>
                  <option value="high">Высокий уровень</option>
                  <option value="normal">Норма</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Краткое название рекомендации"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержание рекомендации
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                placeholder="Подробное описание рекомендации по питанию..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                5 - наивысший приоритет, 1 - низший
              </p>
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
                Рекомендация активна
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
        {filteredRecommendations.map((rec) => {
          const micronutrient = micronutrients.find(m => m.id === rec.micronutrient_id);

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${
                !rec.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getConditionIcon(rec.condition)}
                      <h3 className="text-xl font-semibold text-gray-800">{rec.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {getConditionBadge(rec.condition)}
                      <span className="text-sm text-gray-600">
                        {micronutrient?.name || 'Микроэлемент не найден'}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        Приоритет: {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rec.content}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(rec.id, rec.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      rec.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {rec.is_active ? 'Активна' : 'Неактивна'}
                  </button>
                  <button
                    onClick={() => handleEdit(rec)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Рекомендации не найдены. Создайте первую рекомендацию.
          </div>
        )}
      </div>
    </div>
  );
};
