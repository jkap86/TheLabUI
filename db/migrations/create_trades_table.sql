CREATE TABLE IF NOT EXISTS trades (
    transaction_id VARCHAR(255) PRIMARY KEY,
    status_updated TIMESTAMP,
    adds JSONB,
    drops JSONB,
    draft_picks JSONB,
    price_check VARCHAR [],
    rosters JSONB,
    managers VARCHAR [],
    players VARCHAR [],
    league_id VARCHAR(255),
    FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trades_status_updated ON trades (status_updated DESC);

CREATE INDEX IF NOT EXISTS idx_trades_managers_gin ON trades USING gin (managers);

CREATE INDEX IF NOT EXISTS idx_trades_managers_adds_gin ON trades USING gin (managers, adds);

CREATE INDEX IF NOT EXISTS idx_trades_managers_draft_picks_gin ON trades USING gin (managers, draft_picks);

CREATE INDEX IF NOT EXISTS idx_trades_adds_gin ON trades USING gin (adds);

CREATE INDEX IF NOT EXISTS idx_trades_draft_picks_gin ON trades USING gin (draft_picks);