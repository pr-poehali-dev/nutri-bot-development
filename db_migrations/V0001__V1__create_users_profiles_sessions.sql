CREATE TABLE IF NOT EXISTS t_p91567892_nutri_bot_developmen.users (
    id BIGINT PRIMARY KEY,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p91567892_nutri_bot_developmen.profiles (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p91567892_nutri_bot_developmen.users(id),
    gender TEXT NOT NULL DEFAULT 'male',
    age INTEGER NOT NULL DEFAULT 25,
    height_cm INTEGER NOT NULL DEFAULT 170,
    weight_kg NUMERIC(5,1) NOT NULL DEFAULT 70,
    activity_factor NUMERIC(4,3) NOT NULL DEFAULT 1.375,
    goal TEXT NOT NULL DEFAULT 'keep',
    calories_goal INTEGER NOT NULL DEFAULT 2000,
    protein_goal INTEGER NOT NULL DEFAULT 150,
    fat_goal INTEGER NOT NULL DEFAULT 65,
    carbs_goal INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS t_p91567892_nutri_bot_developmen.sessions (
    token TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p91567892_nutri_bot_developmen.users(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
