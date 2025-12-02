import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calculator } from 'lucide-react';

interface BMICategory {
  id: string;
  name: string;
  description: string;
  bmi_min: number;
  bmi_max: number | null;
  protein_min: number;
  protein_max: number;
  fat_min: number;
  fat_max: number;
  carb_min: number;
  carb_max: number;
}

export const HealthCalculationsManager = () => {
  const [categories, setCategories] = useState<BMICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bmi_categories')
        .select('*')
        .order('bmi_min');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
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
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Health Calculations Management</h2>
          <p className="text-gray-600 text-sm">BMI Categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{cat.name}</h3>
              <p className="text-sm text-gray-600">{cat.description}</p>
              <p className="text-sm text-teal-600 font-medium mt-1">
                BMI: {cat.bmi_min} - {cat.bmi_max || 'infinity'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Protein</div>
                <div className="text-lg font-bold text-blue-900">
                  {cat.protein_min}% - {cat.protein_max}%
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Fat</div>
                <div className="text-lg font-bold text-yellow-900">
                  {cat.fat_min}% - {cat.fat_max}%
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Carbs</div>
                <div className="text-lg font-bold text-green-900">
                  {cat.carb_min}% - {cat.carb_max}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
