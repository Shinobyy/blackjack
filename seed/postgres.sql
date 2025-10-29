-- Création des tables

CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR UNIQUE,
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
  user_id VARCHAR REFERENCES users(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertion des données d'exemple

INSERT INTO users (id, session_id, username, max_profit, created_at, updated_at) VALUES
    ('4564257-uuid-1', 'session-player-001', 'PlayerOne', 15000, NOW(), NOW()),
    ('1234567-uuid-player', 'session-player-002', 'LuckyPlayer', 20000, NOW(), NOW()),
    ('user-550e8400-001', 'session-player-003', 'ProPlayer', 25000, NOW(), NOW());

INSERT INTO bots (id, username, created_at, updated_at) VALUES
    ('bot-001', 'BotAlice', NOW(), NOW()),
    ('bot-002', 'BotBob', NOW(), NOW());

INSERT INTO tournaments (id, user_id, active, created_at, updated_at) VALUES
    ('tournament-001', '4564257-uuid-1', TRUE, NOW(), NOW()),
    ('tournament-002', '1234567-uuid-player', FALSE, NOW(), NOW());