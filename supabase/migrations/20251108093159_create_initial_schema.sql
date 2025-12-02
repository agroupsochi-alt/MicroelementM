/*
  # Создание начальной схемы для системы отслеживания микроэлементов

  ## Обзор
  Эта миграция создает базовую структуру для системы отслеживания показателей микроэлементов
  с настраиваемыми полями, формулами расчета и рекомендациями по питанию.

  ## 1. Таблицы пользователей и ролей
    
  ### `user_profiles`
  - `id` (uuid, первичный ключ, связан с auth.users)
  - `role` (text, роль пользователя: 'user' или 'admin')
  - `full_name` (text, полное имя)
  - `created_at` (timestamptz, дата создания)
  - `updated_at` (timestamptz, дата обновления)

  ## 2. Справочники и настраиваемые поля
    
  ### `dictionaries`
  - `id` (uuid, первичный ключ)
  - `name` (text, название справочника)
  - `description` (text, описание)
  - `created_at` (timestamptz)
  - `created_by` (uuid, ссылка на пользователя)

  ### `custom_fields`
  - `id` (uuid, первичный ключ)
  - `dictionary_id` (uuid, ссылка на справочник)
  - `field_name` (text, название поля)
  - `field_type` (text, тип: 'text', 'number', 'date', 'boolean', 'select')
  - `options` (jsonb, опции для select полей)
  - `is_required` (boolean, обязательное ли поле)
  - `order_index` (integer, порядок отображения)
  - `created_at` (timestamptz)

  ## 3. Микроэлементы
    
  ### `micronutrients`
  - `id` (uuid, первичный ключ)
  - `name` (text, название микроэлемента)
  - `unit` (text, единица измерения)
  - `normal_min` (numeric, минимальное нормальное значение)
  - `normal_max` (numeric, максимальное нормальное значение)
  - `description` (text, описание)
  - `custom_data` (jsonb, пользовательские данные)
  - `created_at` (timestamptz)

  ## 4. Формулы расчета
    
  ### `calculation_formulas`
  - `id` (uuid, первичный ключ)
  - `name` (text, название формулы)
  - `description` (text, описание)
  - `formula` (text, формула расчета)
  - `input_micronutrients` (jsonb, массив ID микроэлементов для расчета)
  - `output_micronutrient_id` (uuid, результирующий микроэлемент)
  - `is_active` (boolean, активна ли формула)
  - `created_at` (timestamptz)
  - `created_by` (uuid)

  ## 5. Показатели пользователей
    
  ### `user_measurements`
  - `id` (uuid, первичный ключ)
  - `user_id` (uuid, ссылка на пользователя)
  - `micronutrient_id` (uuid, ссылка на микроэлемент)
  - `value` (numeric, значение показателя)
  - `measured_at` (timestamptz, дата измерения)
  - `notes` (text, заметки)
  - `created_at` (timestamptz)

  ## 6. Рекомендации
    
  ### `recommendations`
  - `id` (uuid, первичный ключ)
  - `micronutrient_id` (uuid, ссылка на микроэлемент)
  - `condition` (text, условие: 'low', 'high', 'normal')
  - `title` (text, заголовок рекомендации)
  - `content` (text, содержание рекомендации)
  - `priority` (integer, приоритет 1-5)
  - `is_active` (boolean, активна ли рекомендация)
  - `created_at` (timestamptz)
  - `created_by` (uuid)

  ## 7. Безопасность (RLS)
  - Все таблицы имеют включенный RLS
  - Политики разделены по ролям (admin/user)
  - Пользователи видят только свои данные
  - Администраторы имеют полный доступ к управлению справочниками

  ## 8. Важные замечания
  - Используются UUID для всех первичных ключей
  - Все даты хранятся с временными зонами (timestamptz)
  - JSONB используется для гибких пользовательских данных
  - Внешние ключи обеспечивают целостность данных
*/

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Создание таблицы справочников
CREATE TABLE IF NOT EXISTS dictionaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE dictionaries ENABLE ROW LEVEL SECURITY;

-- Создание таблицы пользовательских полей
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dictionary_id uuid NOT NULL REFERENCES dictionaries(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Создание таблицы микроэлементов
CREATE TABLE IF NOT EXISTS micronutrients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  unit text NOT NULL,
  normal_min numeric NOT NULL,
  normal_max numeric NOT NULL,
  description text DEFAULT '',
  custom_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE micronutrients ENABLE ROW LEVEL SECURITY;

-- Создание таблицы формул расчета
CREATE TABLE IF NOT EXISTS calculation_formulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  formula text NOT NULL,
  input_micronutrients jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_micronutrient_id uuid REFERENCES micronutrients(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE calculation_formulas ENABLE ROW LEVEL SECURITY;

-- Создание таблицы измерений пользователей
CREATE TABLE IF NOT EXISTS user_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  micronutrient_id uuid NOT NULL REFERENCES micronutrients(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  measured_at timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;

-- Создание таблицы рекомендаций
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  micronutrient_id uuid NOT NULL REFERENCES micronutrients(id) ON DELETE CASCADE,
  condition text NOT NULL CHECK (condition IN ('low', 'high', 'normal')),
  title text NOT NULL,
  content text NOT NULL,
  priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Функция для проверки роли администратора
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Политики для user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Политики для dictionaries
CREATE POLICY "Authenticated users can view dictionaries"
  ON dictionaries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert dictionaries"
  ON dictionaries FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update dictionaries"
  ON dictionaries FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete dictionaries"
  ON dictionaries FOR DELETE
  TO authenticated
  USING (is_admin());

-- Политики для custom_fields
CREATE POLICY "Authenticated users can view custom fields"
  ON custom_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert custom fields"
  ON custom_fields FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update custom fields"
  ON custom_fields FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete custom fields"
  ON custom_fields FOR DELETE
  TO authenticated
  USING (is_admin());

-- Политики для micronutrients
CREATE POLICY "Authenticated users can view micronutrients"
  ON micronutrients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert micronutrients"
  ON micronutrients FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update micronutrients"
  ON micronutrients FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete micronutrients"
  ON micronutrients FOR DELETE
  TO authenticated
  USING (is_admin());

-- Политики для calculation_formulas
CREATE POLICY "Authenticated users can view formulas"
  ON calculation_formulas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert formulas"
  ON calculation_formulas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update formulas"
  ON calculation_formulas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete formulas"
  ON calculation_formulas FOR DELETE
  TO authenticated
  USING (is_admin());

-- Политики для user_measurements
CREATE POLICY "Users can view own measurements"
  ON user_measurements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own measurements"
  ON user_measurements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON user_measurements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON user_measurements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Политики для recommendations
CREATE POLICY "Authenticated users can view recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (is_admin());

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_custom_fields_dictionary ON custom_fields(dictionary_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_user ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_micronutrient ON user_measurements(micronutrient_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_micronutrient ON recommendations(micronutrient_id);