-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  global_name TEXT,
  banner TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  position TEXT,
  public_profile BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  max_members INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Club members
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player' CHECK (role IN ('captain', 'manager', 'player', 'sub')),
  position TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Club stats per season
CREATE TABLE club_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  season TEXT DEFAULT 'Spring 2025',
  played INT DEFAULT 0,
  wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  losses INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  UNIQUE(club_id, season)
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  away_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  home_score INT,
  away_score INT,
  match_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
  formation_home TEXT,
  formation_away TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Match lineups (who played)
CREATE TABLE match_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position TEXT,
  is_substitute BOOLEAN DEFAULT false,
  substitution_minute INT,
  UNIQUE(match_id, player_id)
);

-- Match events (goals, assists, cards, subs)
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('goal', 'assist', 'substitution_on', 'substitution_off', 'yellow_card', 'red_card')),
  minute INT NOT NULL,
  related_player_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Invites (captain/manager inviting players)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Join requests (player requesting to join private club)
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  position TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reference_id TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_club_members_user ON club_members(user_id);
CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_stats_club ON club_stats(club_id);
CREATE INDEX idx_matches_home ON matches(home_club_id);
CREATE INDEX idx_matches_away ON matches(away_club_id);
CREATE INDEX idx_match_lineups_match ON match_lineups(match_id);
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_invites_recipient ON invites(recipient_id);
CREATE INDEX idx_join_requests_club ON join_requests(club_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
