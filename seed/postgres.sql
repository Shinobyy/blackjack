-- Création des tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR UNIQUE NOT NULL,
  username VARCHAR NOT NULL,
  max_profit INTEGER DEFAULT 15000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bots (
  id VARCHAR PRIMARY KEY,
  username VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tournaments (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertion des données d'exemple

INSERT INTO users (id, session_id, username, max_profit, created_at, updated_at) VALUES
    (gen_random_uuid()::text, 'session-player-001', 'PlayerOne', 15000, NOW(), NOW()),
    (gen_random_uuid()::text, 'session-player-002', 'LuckyPlayer', 20000, NOW(), NOW()),
    (gen_random_uuid()::text, 'session-player-003', 'ProPlayer', 25000, NOW(), NOW());

INSERT INTO bots (id, username, created_at, updated_at) VALUES
    (gen_random_uuid()::text, 'BotAlice', NOW(), NOW()),
    (gen_random_uuid()::text, 'BotBob', NOW(), NOW());

INSERT INTO tournaments (id, user_id, active, created_at, updated_at) VALUES
    (gen_random_uuid()::text, (SELECT id FROM users WHERE username = 'PlayerOne' LIMIT 1), TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, (SELECT id FROM users WHERE username = 'LuckyPlayer' LIMIT 1), FALSE, NOW(), NOW());