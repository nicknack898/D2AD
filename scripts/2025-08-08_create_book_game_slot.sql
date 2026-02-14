-- Atomic booking function to eliminate race conditions.
-- Requires:
--   - Unique constraint on players.email
--   - Unique constraint on bookings(game_id, player_id)
--   - games.max_players INT NOT NULL
-- Usage via Supabase RPC: select book_game_slot(_game_id, _name, _email, _phone);

create or replace function public.book_game_slot(
  _game_id uuid,
  _name text,
  _email text,
  _phone text
) returns text
language plpgsql
as $$
declare
  v_player_id uuid;
  v_capacity int;
  v_booked int;
begin
  -- lock game row for update to serialize capacity checks
  select max_players into v_capacity from public.games where id = _game_id for update;
  if v_capacity is null then
    return 'Game not found';
  end if;

  select count(*) into v_booked from public.bookings where game_id = _game_id for update;

  if v_booked >= v_capacity then
    return 'This game is full';
  end if;

  -- upsert player by email
  insert into public.players(name, email, phone, is_member)
  values (_name, _email, _phone, true)
  on conflict (email) do update
    set name = excluded.name,
        phone = excluded.phone
  returning id into v_player_id;

  -- prevent duplicate booking
  insert into public.bookings(game_id, player_id, payment_status, attendance)
  values (_game_id, v_player_id, 'pending', false)
  on conflict (game_id, player_id) do nothing;

  -- optionally set game status to full
  select count(*) into v_booked from public.bookings where game_id = _game_id;
  if v_booked >= v_capacity then
    update public.games set status = 'full' where id = _game_id;
  end if;

  return 'ok';
end;
$$;

-- Recommended constraints:
-- alter table public.players add constraint unique_email unique (email);
-- alter table public.bookings add constraint unique_game_player unique (game_id, player_id);
