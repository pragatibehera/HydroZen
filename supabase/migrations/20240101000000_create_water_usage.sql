-- Create water_usage table
CREATE TABLE IF NOT EXISTS water_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_usage FLOAT NOT NULL DEFAULT 0,
  weekly_usage FLOAT NOT NULL DEFAULT 0,
  monthly_usage FLOAT NOT NULL DEFAULT 0,
  yearly_average FLOAT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE water_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own water usage"
  ON water_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own water usage"
  ON water_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water usage"
  ON water_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id); 