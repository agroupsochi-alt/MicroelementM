import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dictionary, CustomField } from '../../types/database';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';

export const DictionariesManager: React.FC = () => {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDict, setEditingDict] = useState<Dictionary | null>(null);
  const [selectedDict, setSelectedDict] = useState<Dictionary | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadDictionaries();
  }, []);

  const loadDictionaries = async () => {
    try {
      const { data, error } = await supabase
        .from('dictionaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDictionaries(data || []);
    } catch (error) {
      console.error('Error loading dictionaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDict) {
        const { error } = await supabase
          .from('dictionaries')
          .update(formData)
          .eq('id', editingDict.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dictionaries')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({ name: '', description: '' });
      setShowAddForm(false);
      setEditingDict(null);
      loadDictionaries();
    } catch (error) {
      console.error('Error saving dictionary:', error);
    }
  };

  const handleEdit = (dict: Dictionary) => {
    setEditingDict(dict);
    setFormData({
      name: dict.name,
      description: dict.description,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить справочник?')) return;

    try {
      const { error } = await supabase
        .from('dictionaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadDictionaries();
    } catch (error) {
      console.error('Error deleting dictionary:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Управление справочниками</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingDict(null);
            setFormData({ name: '', description: '' });
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Добавить справочник
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingDict ? 'Редактировать справочник' : 'Новый справочник'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
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
                {editingDict ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingDict(null);
                  setFormData({ name: '', description: '' });
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
        {dictionaries.map((dict) => (
          <div
            key={dict.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{dict.name}</h3>
                <p className="text-gray-600">{dict.description || 'Нет описания'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDict(dict)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Настроить поля"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEdit(dict)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                  title="Редактировать"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(dict.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Удалить"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {dictionaries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Справочники не найдены. Создайте первый справочник.
          </div>
        )}
      </div>

      {selectedDict && (
        <CustomFieldsManager
          dictionary={selectedDict}
          onClose={() => setSelectedDict(null)}
        />
      )}
    </div>
  );
};

interface CustomFieldsManagerProps {
  dictionary: Dictionary;
  onClose: () => void;
}

const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({ dictionary, onClose }) => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const [formData, setFormData] = useState({
    field_name: '',
    field_type: 'text' as CustomField['field_type'],
    options: [] as string[],
    is_required: false,
    order_index: 0,
  });

  useEffect(() => {
    loadFields();
  }, [dictionary.id]);

  const loadFields = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('dictionary_id', dictionary.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fieldData = {
        ...formData,
        dictionary_id: dictionary.id,
      };

      if (editingField) {
        const { error } = await supabase
          .from('custom_fields')
          .update(fieldData)
          .eq('id', editingField.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_fields')
          .insert([fieldData]);

        if (error) throw error;
      }

      setFormData({
        field_name: '',
        field_type: 'text',
        options: [],
        is_required: false,
        order_index: 0,
      });
      setShowAddForm(false);
      setEditingField(null);
      loadFields();
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить поле?')) return;

    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadFields();
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">
            Настройка полей: {dictionary.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingField(null);
              setFormData({
                field_name: '',
                field_type: 'text',
                options: [],
                is_required: false,
                order_index: fields.length,
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Добавить поле
          </button>

          {showAddForm && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-blue-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название поля
                  </label>
                  <input
                    type="text"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип поля
                  </label>
                  <select
                    value={formData.field_type}
                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Текст</option>
                    <option value="number">Число</option>
                    <option value="date">Дата</option>
                    <option value="boolean">Да/Нет</option>
                    <option value="select">Список</option>
                  </select>
                </div>

                {formData.field_type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Варианты (через запятую)
                    </label>
                    <input
                      type="text"
                      value={formData.options.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      placeholder="Вариант 1, Вариант 2, Вариант 3"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_required" className="text-sm text-gray-700">
                    Обязательное поле
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Порядок отображения
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingField ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingField(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="bg-white border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{field.field_name}</h4>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>Тип: {field.field_type}</span>
                    {field.is_required && <span className="text-red-600">Обязательное</span>}
                    <span>Порядок: {field.order_index}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingField(field);
                      setFormData({
                        field_name: field.field_name,
                        field_type: field.field_type,
                        options: field.options,
                        is_required: field.is_required,
                        order_index: field.order_index,
                      });
                      setShowAddForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Поля не добавлены. Создайте первое поле.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
