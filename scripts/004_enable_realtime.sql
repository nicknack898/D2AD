-- Enable Supabase Realtime on draft tables
-- Required for live spectator/captain updates via postgres_changes

ALTER PUBLICATION supabase_realtime ADD TABLE draft_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE lots;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE captain_seats;
