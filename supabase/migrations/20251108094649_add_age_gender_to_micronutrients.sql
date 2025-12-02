/*
  # Добавление полей возраст и пол для микроэлементов

  ## Обзор
  Эта миграция добавляет поддержку возрастных и гендерных норм для микроэлементов,
  позволяя настраивать разные диапазоны значений в зависимости от возраста и пола пользователя.

  ## 1. Изменения в таблице user_profiles
    - Добавляется поле `age` (integer, возраст пользователя)
    - Добавляется поле `gender` (text, пол: 'male', 'female', 'other')

  ## 2. Изменения в таблице micronutrients
    - Добавляется поле `age_min` (integer, минимальный возраст для применения нормы)
    - Добавляется поле `age_max` (integer, максимальный возраст для применения нормы)
    - Добавляется поле `gender` (text, пол для которого применяется норма: 'male', 'female', 'both')

  ## 3. Важные замечания
    - Для универсальных норм (для всех возрастов и полов) используйте:
      age_min = 0, age_max = 120, gender = 'both'
    - Теперь можно создавать несколько записей микроэлемента с разными нормами
      для разных возрастных групп и полов
    - Существующие микроэлементы получат значения по умолчанию (универсальные нормы)
*/

-- Добавление полей возраст и пол в профиль пользователя
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN age integer DEFAULT 30;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN gender text DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other'));
  END IF;
END $$;

-- Добавление полей возраст и пол в микроэлементы
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'micronutrients' AND column_name = 'age_min'
  ) THEN
    ALTER TABLE micronutrients ADD COLUMN age_min integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'micronutrients' AND column_name = 'age_max'
  ) THEN
    ALTER TABLE micronutrients ADD COLUMN age_max integer DEFAULT 120;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'micronutrients' AND column_name = 'gender'
  ) THEN
    ALTER TABLE micronutrients ADD COLUMN gender text DEFAULT 'both' CHECK (gender IN ('male', 'female', 'both'));
  END IF;
END $$;

-- Удаление ограничения уникальности по name, чтобы можно было создавать разные нормы для одного микроэлемента
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'micronutrients' AND constraint_name = 'micronutrients_name_key'
  ) THEN
    ALTER TABLE micronutrients DROP CONSTRAINT micronutrients_name_key;
  END IF;
END $$;

-- Создание индексов для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_micronutrients_age_range ON micronutrients(age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_micronutrients_gender ON micronutrients(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age ON user_profiles(age);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);