CREATE TABLE account_study_data (
  account_id TEXT PRIMARY KEY,
  courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT account_study_data_courses_array CHECK (jsonb_typeof(courses) = 'array')
);
