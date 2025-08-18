CREATE TABLE IF NOT EXISTS matchups (
    week INTEGER,
    matchup_id INTEGER,
    roster_id INTEGER,
    user_id VARCHAR(255),
    username VARCHAR(255),
    avatar VARCHAR(255),
    players VARCHAR [],
    starters VARCHAR [],
    league_id VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (week, roster_id, league_id),
    FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE
);