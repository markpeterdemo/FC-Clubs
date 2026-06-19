-- Player achievements/badges
CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_key)
);

-- Season awards
CREATE TABLE season_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  award_key TEXT NOT NULL,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season, award_key)
);

-- Hall of fame
CREATE TABLE hall_of_fame (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  position INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rival clubs
ALTER TABLE users ADD COLUMN IF NOT EXISTS rival_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Transfers
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  to_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Transfer windows (admin sets active periods)
CREATE TABLE transfer_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_player_achievements_user ON player_achievements(user_id);
CREATE INDEX idx_season_awards_season ON season_awards(season);
CREATE INDEX idx_disputes_match ON disputes(match_id);
CREATE INDEX idx_transfers_player ON transfers(player_id);
