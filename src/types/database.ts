export type UserRole = 'user' | 'admin';

export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export type Condition = 'low' | 'high' | 'normal';

export type Gender = 'male' | 'female' | 'other';

export type MicronutrientGender = 'male' | 'female' | 'both';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  age: number;
  gender: Gender;
  created_at: string;
  updated_at: string;
}

export interface Dictionary {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string | null;
}

export interface CustomField {
  id: string;
  dictionary_id: string;
  field_name: string;
  field_type: FieldType;
  options: string[];
  is_required: boolean;
  order_index: number;
  created_at: string;
}

export interface Micronutrient {
  id: string;
  name: string;
  unit: string;
  normal_min: number;
  normal_max: number;
  age_min: number;
  age_max: number;
  gender: MicronutrientGender;
  description: string;
  custom_data: Record<string, any>;
  created_at: string;
}

export interface CalculationFormula {
  id: string;
  name: string;
  description: string;
  formula: string;
  input_micronutrients: string[];
  output_micronutrient_id: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface UserMeasurement {
  id: string;
  user_id: string;
  micronutrient_id: string;
  value: number;
  measured_at: string;
  notes: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  micronutrient_id: string;
  condition: Condition;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}
