CREATE TYPE season_status AS ENUM ('draft', 'active', 'complete');
CREATE TYPE auction_status AS ENUM ('lobby', 'ready', 'nominating', 'bidding', 'round_break', 'complete');
CREATE TYPE role AS ENUM ('carry', 'mid', 'off', 'pos4', 'pos5');
CREATE TYPE auction_event_type AS ENUM ('state_changed', 'bid_placed', 'nomination_started', 'player_sold', 'timer_reset', 'redrawn');

CREATE TABLE leagues (
  id serial PRIMARY KEY,
  name varchar(128) NOT NULL DEFAULT 'D2AD',
  season varchar(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seasons (
  id serial PRIMARY KEY,
  league_id integer NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  status season_status NOT NULL DEFAULT 'draft',
  purse_starting integer NOT NULL DEFAULT 558,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id serial PRIMARY KEY,
  steam_id varchar(32),
  username varchar(64) NOT NULL,
  mmr integer NOT NULL,
  willing_to_draft integer NOT NULL DEFAULT 0,
  team_organizer integer NOT NULL DEFAULT 0,
  bio text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX players_steam_id_idx ON players(steam_id);

CREATE TABLE positions (
  id serial PRIMARY KEY,
  player_id integer NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role role NOT NULL,
  stars integer NOT NULL
);

CREATE TABLE captains (
  id serial PRIMARY KEY,
  season_id integer NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  player_id integer NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  purse_starting integer NOT NULL DEFAULT 558,
  mmr integer NOT NULL
);

CREATE TABLE auctions (
  id serial PRIMARY KEY,
  season_id integer NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  status auction_status NOT NULL DEFAULT 'lobby',
  current_nominator_id integer REFERENCES captains(id),
  current_player_id integer REFERENCES players(id),
  top_bid integer,
  top_bidder_id integer REFERENCES captains(id),
  ends_at timestamptz
);

CREATE TABLE bids (
  id serial PRIMARY KEY,
  auction_id integer NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  captain_id integer NOT NULL REFERENCES captains(id) ON DELETE CASCADE,
  player_id integer NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rosters (
  id serial PRIMARY KEY,
  captain_id integer NOT NULL REFERENCES captains(id) ON DELETE CASCADE,
  slot integer NOT NULL,
  player_id integer NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  won_for integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  auction_id integer NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  type auction_event_type NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ts timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id text PRIMARY KEY,
  name text,
  email text UNIQUE,
  email_verified timestamptz,
  image text
);

CREATE TABLE accounts (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE sessions (
  session_token text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

CREATE TABLE verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
