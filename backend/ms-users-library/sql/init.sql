CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    auth_id VARCHAR(255) NOT NULL,
    tvmaze_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (auth_id, tvmaze_id)
);

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    auth_id VARCHAR(255) NOT NULL,
    tvmaze_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (auth_id, tvmaze_id),
    CHECK (tvmaze_id > 0)
);