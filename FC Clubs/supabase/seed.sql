-- ============================================
-- Matchday Seed Data
-- Uses temp table to map short IDs to real UUIDs
-- ============================================

TRUNCATE users, clubs, club_members, club_stats, matches, match_lineups, match_events, player_achievements, season_awards, notifications, invites, join_requests, hall_of_fame, disputes, transfers CASCADE;

CREATE TEMP TABLE short_ids (tag text PRIMARY KEY, real_id uuid);

-- ============================================
-- USERS
-- ============================================
WITH ins AS (
  INSERT INTO users (discord_id, username, global_name, avatar, access_token, refresh_token, position, public_profile, created_at)
  SELECT * FROM (VALUES
    ('100001', 'alexm', 'Alex Martinez', 'a1b2c3d4e5f6', 'tok1', 'ref1', 'CB', true, '2025-01-15'::timestamptz),
    ('100002', 'carlos_r', 'Carlos Rivera', 'b2c3d4e5f6a7', 'tok2', 'ref2', 'ST', true, '2025-01-16'::timestamptz),
    ('100003', 'marcov', 'Marco Verratti', 'c3d4e5f6a7b8', 'tok3', 'ref3', 'CM', true, '2025-01-17'::timestamptz),
    ('100004', 'david_l', 'David Lopez', 'd4e5f6a7b8c9', 'tok4', 'ref4', 'GK', true, '2025-01-18'::timestamptz),
    ('100005', 'lucas_s', 'Lucas Silva', 'e5f6a7b8c9d1', 'tok5', 'ref5', 'LW', true, '2025-01-19'::timestamptz),
    ('100006', 'sofia_m', 'Sofia Mendes', 'f6a7b8c9d1e2', 'tok6', 'ref6', 'CAM', true, '2025-01-20'::timestamptz),
    ('100007', 'john_d', 'John Doe', 'a7b8c9d1e2f3', 'tok7', 'ref7', 'GK', true, '2025-01-21'::timestamptz),
    ('100008', 'emma_w', 'Emma Williams', 'b8c9d1e2f3a4', 'tok8', 'ref8', 'RB', true, '2025-01-22'::timestamptz),
    ('100009', 'liam_k', 'Liam Kelly', 'c9d1e2f3a4b5', 'tok9', 'ref9', 'CDM', true, '2025-01-23'::timestamptz),
    ('100010', 'olivia_t', 'Olivia Taylor', 'd1e2f3a4b5c6', 'tok10', 'ref10', 'ST', true, '2025-01-24'::timestamptz),
    ('100011', 'noah_p', 'Noah Perez', 'e2f3a4b5c6d7', 'tok11', 'ref11', 'LB', true, '2025-01-25'::timestamptz),
    ('100012', 'isabella_n', 'Isabella Nguyen', 'f3a4b5c6d7e8', 'tok12', 'ref12', 'RM', true, '2025-01-26'::timestamptz),
    ('100013', 'liam_b', 'Liam Brown', 'a4b5c6d7e8f9', 'tok13', 'ref13', 'CB', true, '2025-01-27'::timestamptz),
    ('100014', 'mia_j', 'Mia Johnson', 'b5c6d7e8f9a1', 'tok14', 'ref14', 'CM', true, '2025-01-28'::timestamptz),
    ('100015', 'ethan_g', 'Ethan Garcia', 'c6d7e8f9a1b2', 'tok15', 'ref15', 'LW', true, '2025-01-29'::timestamptz),
    ('100016', 'ava_r', 'Ava Robinson', 'd7e8f9a1b2c3', 'tok16', 'ref16', 'ST', true, '2025-02-01'::timestamptz),
    ('100017', 'jacob_w', 'Jacob Wilson', 'e8f9a1b2c3d4', 'tok17', 'ref17', 'CAM', true, '2025-02-02'::timestamptz),
    ('100018', 'charlotte_a', 'Charlotte Adams', 'f9a1b2c3d4e5', 'tok18', 'ref18', 'RB', true, '2025-02-03'::timestamptz),
    ('100019', 'mason_h', 'Mason Hill', 'a1b2c3d4e5f7', 'tok19', 'ref19', 'CDM', true, '2025-02-04'::timestamptz),
    ('100020', 'amelia_c', 'Amelia Clark', 'b2c3d4e5f6a8', 'tok20', 'ref20', 'LB', true, '2025-02-05'::timestamptz),
    ('100021', 'logan_m', 'Logan Mitchell', 'c3d4e5f6a7b9', 'tok21', 'ref21', 'ST', false, '2025-02-06'::timestamptz),
    ('100022', 'harper_d', 'Harper Davis', 'd4e5f6a7b8c1', 'tok22', 'ref22', 'GK', true, '2025-02-07'::timestamptz),
    ('100023', 'elijah_mo', 'Elijah Moore', 'e5f6a7b8c9d2', 'tok23', 'ref23', 'CM', true, '2025-02-08'::timestamptz),
    ('100024', 'ella_ro', 'Ella Roberts', 'f6a7b8c9d1e3', 'tok24', 'ref24', 'LW', true, '2025-02-09'::timestamptz),
    ('100025', 'james_t', 'James Turner', 'a7b8c9d1e2f4', 'tok25', 'ref25', 'CB', true, '2025-02-10'::timestamptz)
  ) AS u(d, un, gn, av, at, rt, pos, pp, ca)
  ORDER BY ca
  RETURNING id, username, created_at
)
INSERT INTO short_ids (tag, real_id)
SELECT 'u' || LPAD(row_number() OVER ()::text, 3, '0'), id
FROM ins;

-- ============================================
-- CLUBS
-- ============================================
WITH ins AS (
  INSERT INTO clubs (name, short_name, primary_color, visibility, max_members)
  SELECT * FROM (VALUES
    ('FC Barcelona', 'FCB', '#a50044', 'public', 20),
    ('Real Madrid', 'RMA', '#febe10', 'public', 20),
    ('Inter Milan', 'INT', '#010e80', 'private', 20),
    ('AC Milan', 'ACM', '#fb090b', 'public', 20),
    ('Liverpool FC', 'LIV', '#c8102e', 'public', 20),
    ('Bayern Munich', 'BAY', '#dc052d', 'public', 20),
    ('Paris Saint-Germain', 'PSG', '#004170', 'public', 20),
    ('Ajax Amsterdam', 'AJX', '#d31145', 'private', 20),
    ('Borussia Dortmund', 'BVB', '#fde100', 'public', 20),
    ('Chelsea FC', 'CHE', '#034694', 'public', 20)
  ) AS c(n, sn, pc, v, mm)
  RETURNING id, name
)
INSERT INTO short_ids (tag, real_id)
SELECT 'c' || LPAD(row_number() OVER ()::text, 3, '0'), id
FROM ins;

-- ============================================
-- CLUB MEMBERS
-- ============================================
INSERT INTO club_members (user_id, club_id, role, position)
SELECT su.real_id, sc.real_id, x.role, x.position
FROM (VALUES
  ('u001', 'c001', 'captain', 'CB'), ('u002', 'c001', 'player', 'ST'),
  ('u003', 'c001', 'player', 'CM'), ('u004', 'c001', 'player', 'GK'),
  ('u005', 'c001', 'player', 'LW'),
  ('u006', 'c002', 'captain', 'CAM'), ('u007', 'c002', 'player', 'GK'),
  ('u008', 'c002', 'player', 'RB'), ('u009', 'c002', 'player', 'CDM'),
  ('u010', 'c002', 'sub', 'ST'),
  ('u011', 'c003', 'captain', 'LB'), ('u012', 'c003', 'player', 'RM'),
  ('u013', 'c003', 'player', 'CB'), ('u014', 'c003', 'player', 'CM'),
  ('u015', 'c003', 'player', 'LW'),
  ('u016', 'c004', 'captain', 'ST'), ('u017', 'c004', 'player', 'CAM'),
  ('u018', 'c004', 'player', 'RB'), ('u019', 'c004', 'player', 'CDM'),
  ('u020', 'c004', 'sub', 'LB'),
  ('u021', 'c005', 'captain', 'ST'), ('u022', 'c005', 'player', 'GK'),
  ('u023', 'c005', 'player', 'CM'), ('u024', 'c005', 'player', 'LW'),
  ('u025', 'c005', 'player', 'CB')
) AS x(ut, ct, role, position)
JOIN short_ids su ON su.tag = x.ut
JOIN short_ids sc ON sc.tag = x.ct;

-- ============================================
-- CLUB STATS
-- ============================================
INSERT INTO club_stats (club_id, season, played, wins, draws, losses, goals_for, goals_against)
SELECT sc.real_id, x.season, x.played, x.wins, x.draws, x.losses, x.gf, x.ga
FROM (VALUES
  ('c001', 'Spring 2025', 10, 8, 1, 1, 28, 10),
  ('c002', 'Spring 2025', 10, 7, 2, 1, 24, 12),
  ('c003', 'Spring 2025', 10, 6, 2, 2, 20, 14),
  ('c004', 'Spring 2025', 10, 5, 3, 2, 18, 13),
  ('c005', 'Spring 2025', 10, 4, 3, 3, 16, 15),
  ('c006', 'Spring 2025', 10, 4, 2, 4, 19, 18),
  ('c007', 'Spring 2025', 10, 3, 3, 4, 14, 17),
  ('c008', 'Spring 2025', 10, 2, 2, 6, 11, 22),
  ('c009', 'Spring 2025', 10, 1, 2, 7, 9, 25),
  ('c010', 'Spring 2025', 10, 0, 2, 8, 8, 31)
) AS x(ct, season, played, wins, draws, losses, gf, ga)
JOIN short_ids sc ON sc.tag = x.ct;

-- ============================================
-- MATCHES
-- ============================================
WITH ins AS (
  INSERT INTO matches (home_club_id, away_club_id, home_score, away_score, match_date, status, formation_home, formation_away)
  SELECT sc1.real_id, sc2.real_id, x.hs, x.aws, x.md::timestamptz, x.st, x.fh, x.fa
  FROM (VALUES
    ('c001', 'c002', 3, 1, '2025-03-01 20:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c003', 'c004', 2, 2, '2025-03-02 18:00:00', 'completed', '3-5-2', '4-3-3'),
    ('c005', 'c006', 1, 0, '2025-03-03 20:00:00', 'completed', '4-3-3', '4-2-3-1'),
    ('c007', 'c008', 3, 1, '2025-03-04 18:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c009', 'c010', 2, 1, '2025-03-05 20:00:00', 'completed', '4-4-2', '4-3-3'),
    ('c001', 'c003', 4, 1, '2025-03-08 18:00:00', 'completed', '4-3-3', '3-5-2'),
    ('c002', 'c005', 2, 0, '2025-03-09 20:00:00', 'completed', '4-4-2', '4-3-3'),
    ('c004', 'c006', 1, 1, '2025-03-10 18:00:00', 'completed', '4-3-3', '4-2-3-1'),
    ('c008', 'c009', 3, 0, '2025-03-11 20:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c010', 'c007', 2, 3, '2025-03-12 18:00:00', 'completed', '4-3-3', '4-3-3'),
    ('c001', 'c004', 2, 0, '2025-03-15 20:00:00', 'completed', '4-3-3', '4-3-3'),
    ('c002', 'c003', 1, 1, '2025-03-16 18:00:00', 'completed', '4-4-2', '3-5-2'),
    ('c005', 'c008', 3, 1, '2025-03-17 20:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c006', 'c010', 4, 0, '2025-03-18 18:00:00', 'completed', '4-2-3-1', '4-3-3'),
    ('c007', 'c009', 0, 0, '2025-03-19 20:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c001', 'c006', 3, 2, '2025-03-22 18:00:00', 'completed', '4-3-3', '4-2-3-1'),
    ('c002', 'c008', 5, 0, '2025-03-23 20:00:00', 'completed', '4-4-2', '4-3-3'),
    ('c003', 'c010', 3, 0, '2025-03-24 18:00:00', 'completed', '3-5-2', '4-3-3'),
    ('c004', 'c009', 2, 0, '2025-03-25 20:00:00', 'completed', '4-3-3', '4-4-2'),
    ('c005', 'c007', 1, 1, '2025-03-26 18:00:00', 'completed', '4-3-3', '4-3-3'),
    ('c001', 'c002', NULL, NULL, '2025-06-25 20:00:00', 'scheduled', NULL, NULL),
    ('c003', 'c005', NULL, NULL, '2025-06-26 18:00:00', 'scheduled', NULL, NULL),
    ('c004', 'c007', NULL, NULL, '2025-06-27 20:00:00', 'scheduled', NULL, NULL),
    ('c006', 'c008', NULL, NULL, '2025-06-28 18:00:00', 'scheduled', NULL, NULL),
    ('c009', 'c010', NULL, NULL, '2025-06-29 20:00:00', 'scheduled', NULL, NULL)
  ) AS x(hc, ac, hs, aws, md, st, fh, fa)
  JOIN short_ids sc1 ON sc1.tag = x.hc
  JOIN short_ids sc2 ON sc2.tag = x.ac
  ORDER BY md
  RETURNING id, match_date, home_club_id
)
INSERT INTO short_ids (tag, real_id)
SELECT 'm' || LPAD(row_number() OVER (ORDER BY match_date)::text, 3, '0'), id
FROM ins;

-- ============================================
-- MATCH EVENTS
-- ============================================
INSERT INTO match_events (match_id, club_id, player_id, type, minute)
SELECT sm.real_id, sc.real_id, su.real_id, x.etype, x.min
FROM (VALUES
  ('m001', 'c001', 'u002', 'goal', 12), ('m001', 'c001', 'u005', 'goal', 34),
  ('m001', 'c002', 'u010', 'goal', 55), ('m001', 'c001', 'u002', 'goal', 78),
  ('m002', 'c003', 'u015', 'goal', 22), ('m002', 'c004', 'u016', 'goal', 30),
  ('m002', 'c003', 'u011', 'goal', 67), ('m002', 'c004', 'u017', 'goal', 89),
  ('m003', 'c005', 'u023', 'goal', 44),
  ('m004', 'c007', 'u010', 'goal', 15), ('m004', 'c007', 'u018', 'goal', 42),
  ('m004', 'c008', 'u013', 'goal', 60), ('m004', 'c007', 'u010', 'goal', 81),
  ('m005', 'c009', 'u019', 'goal', 10), ('m005', 'c010', 'u020', 'goal', 33),
  ('m005', 'c009', 'u019', 'goal', 77),
  ('m006', 'c001', 'u002', 'goal', 8), ('m006', 'c001', 'u002', 'goal', 25),
  ('m006', 'c001', 'u005', 'goal', 45), ('m006', 'c003', 'u015', 'goal', 50),
  ('m006', 'c001', 'u003', 'goal', 73),
  ('m007', 'c002', 'u006', 'goal', 18), ('m007', 'c002', 'u010', 'goal', 65),
  ('m008', 'c004', 'u016', 'goal', 40), ('m008', 'c006', 'u005', 'goal', 82),
  ('m009', 'c008', 'u013', 'goal', 5), ('m009', 'c008', 'u014', 'goal', 30),
  ('m009', 'c008', 'u013', 'goal', 55),
  ('m010', 'c010', 'u020', 'goal', 15), ('m010', 'c010', 'u020', 'goal', 28),
  ('m010', 'c007', 'u025', 'goal', 45), ('m010', 'c007', 'u010', 'goal', 60),
  ('m010', 'c007', 'u025', 'goal', 88),
  ('m011', 'c001', 'u002', 'goal', 35), ('m011', 'c001', 'u003', 'goal', 70),
  ('m012', 'c002', 'u010', 'goal', 20), ('m012', 'c003', 'u015', 'goal', 75),
  ('m013', 'c005', 'u023', 'goal', 10), ('m013', 'c005', 'u021', 'goal', 30),
  ('m013', 'c008', 'u013', 'goal', 55), ('m013', 'c005', 'u021', 'goal', 80),
  ('m014', 'c006', 'u005', 'goal', 15), ('m014', 'c006', 'u003', 'goal', 30),
  ('m014', 'c006', 'u005', 'goal', 60), ('m014', 'c006', 'u006', 'goal', 85),
  ('m016', 'c001', 'u002', 'goal', 15), ('m016', 'c001', 'u002', 'goal', 30),
  ('m016', 'c006', 'u005', 'goal', 45), ('m016', 'c001', 'u005', 'goal', 60),
  ('m016', 'c006', 'u003', 'goal', 80),
  ('m017', 'c002', 'u006', 'goal', 10), ('m017', 'c002', 'u010', 'goal', 25),
  ('m017', 'c002', 'u006', 'goal', 40), ('m017', 'c002', 'u007', 'goal', 65),
  ('m017', 'c002', 'u010', 'goal', 85),
  ('m018', 'c003', 'u015', 'goal', 20), ('m018', 'c003', 'u011', 'goal', 55),
  ('m018', 'c003', 'u015', 'goal', 75),
  ('m019', 'c004', 'u016', 'goal', 30), ('m019', 'c004', 'u017', 'goal', 70),
  ('m020', 'c005', 'u021', 'goal', 40), ('m020', 'c007', 'u025', 'goal', 85)
) AS x(mt, ct, ut, etype, min)
JOIN short_ids sm ON sm.tag = x.mt
JOIN short_ids sc ON sc.tag = x.ct
JOIN short_ids su ON su.tag = x.ut;

-- ============================================
-- ACHIEVEMENTS
-- ============================================
INSERT INTO player_achievements (user_id, badge_key, match_id)
SELECT su.real_id, x.badge, sm.real_id
FROM (VALUES
  ('u002', 'first_goal', 'm001'), ('u002', 'brace', 'm001'),
  ('u002', 'hat_trick', 'm006'), ('u010', 'first_goal', 'm001'),
  ('u010', 'brace', 'm017'), ('u015', 'first_goal', 'm002'),
  ('u016', 'first_goal', 'm002'), ('u005', 'first_goal', 'm001'),
  ('u021', 'first_goal', 'm013'), ('u023', 'first_goal', 'm003'),
  ('u013', 'first_goal', 'm004'), ('u013', 'brace', 'm009'),
  ('u020', 'first_goal', 'm005'), ('u020', 'brace', 'm010'),
  ('u003', 'first_goal', 'm006'), ('u006', 'first_goal', 'm007'),
  ('u019', 'first_goal', 'm005'), ('u019', 'brace', 'm005'),
  ('u025', 'first_goal', 'm010'), ('u025', 'brace', 'm010'),
  ('u001', 'first_appearance', 'm001'), ('u002', 'first_appearance', 'm001'),
  ('u004', 'first_appearance', 'm001'), ('u007', 'first_appearance', 'm001'),
  ('u011', 'first_appearance', 'm001')
) AS x(ut, badge, mt)
JOIN short_ids su ON su.tag = x.ut
LEFT JOIN short_ids sm ON sm.tag = x.mt;

-- ============================================
-- SEASON AWARDS
-- ============================================
INSERT INTO season_awards (season, award_key, player_id, value)
SELECT 'Spring 2025', x.award, su.real_id, x.val
FROM (VALUES ('golden_boot', 'u002', 8), ('golden_glove', 'u004', 5), ('iron_man', 'u001', 10))
AS x(award, ut, val)
JOIN short_ids su ON su.tag = x.ut;

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, reference_id, message, created_at)
SELECT su.real_id, x.ntype, x.ref, x.msg, x.ts::timestamptz
FROM (VALUES
  ('u002', 'achievement', 'm006', '🎩 Hat Trick Hero — Alex scored 3 against Inter Milan!', '2025-03-08 20:30:00'),
  ('u002', 'achievement', 'm001', '⚡ First Goal — Alex scored their first career goal!', '2025-03-01 22:00:00'),
  ('u002', 'award', 'Spring 2025', '🏆 You won the Golden Boot award for Spring 2025!', '2025-06-01 12:00:00'),
  ('u004', 'award', 'Spring 2025', '🏆 You won the Golden Glove award for Spring 2025!', '2025-06-01 12:00:00'),
  ('u001', 'award', 'Spring 2025', '🏆 You won the Iron Man award for Spring 2025!', '2025-06-01 12:00:00')
) AS x(ut, ntype, ref, msg, ts)
JOIN short_ids su ON su.tag = x.ut;

DROP TABLE short_ids;
