-- 006_atomic_bid_rpc.sql
-- Atomic RPC functions for bid placement and lot closing.
-- Prevents race conditions by using row-level locks inside transactions.

-- ============================================================
-- 1. place_bid_atomic
--    Validates lot is active, wallet has funds, bid exceeds top bid,
--    then inserts the bid -- all within a single transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION place_bid_atomic(
  p_lot_id   uuid,
  p_seat_id  uuid,
  p_amount   numeric
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_lot       record;
  v_wallet    record;
  v_top_bid   numeric;
  v_bid_id    uuid;
BEGIN
  -- Lock the lot row to prevent concurrent state changes
  SELECT * INTO v_lot
    FROM lots
   WHERE id = p_lot_id
     FOR UPDATE;

  IF v_lot IS NULL OR v_lot.status != 'active' THEN
    RAISE EXCEPTION 'LOT_NOT_ACTIVE';
  END IF;

  -- Lock the wallet row to prevent concurrent balance changes
  SELECT * INTO v_wallet
    FROM wallets
   WHERE seat_id = p_seat_id
     FOR UPDATE;

  IF v_wallet IS NULL OR v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
  END IF;

  -- Get current top bid for this lot (no lock needed, just reading)
  SELECT COALESCE(MAX(amount), 0) INTO v_top_bid
    FROM bids
   WHERE lot_id = p_lot_id;

  -- Bid must exceed current top bid
  IF p_amount <= v_top_bid THEN
    RAISE EXCEPTION 'BID_TOO_LOW';
  END IF;

  -- Insert the bid
  INSERT INTO bids (lot_id, seat_id, amount)
    VALUES (p_lot_id, p_seat_id, p_amount)
    RETURNING id INTO v_bid_id;

  RETURN jsonb_build_object(
    'id',         v_bid_id,
    'lot_id',     p_lot_id,
    'seat_id',    p_seat_id,
    'amount',     p_amount,
    'created_at', now()
  );
END;
$$;


-- ============================================================
-- 2. close_lot_atomic
--    Finds the top bid, marks the lot sold/unsold, deducts
--    from the winner's wallet -- all within a single transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION close_lot_atomic(
  p_lot_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_lot            record;
  v_top_bid        record;
  v_winning_seat   uuid;
  v_winning_price  numeric;
  v_status         text;
  v_now            timestamptz := now();
BEGIN
  -- Lock the lot row
  SELECT * INTO v_lot
    FROM lots
   WHERE id = p_lot_id
     FOR UPDATE;

  IF v_lot IS NULL THEN
    RAISE EXCEPTION 'LOT_NOT_FOUND';
  END IF;

  IF v_lot.status != 'active' THEN
    RAISE EXCEPTION 'LOT_NOT_ACTIVE';
  END IF;

  -- Find top bid
  SELECT seat_id, amount INTO v_top_bid
    FROM bids
   WHERE lot_id = p_lot_id
   ORDER BY amount DESC
   LIMIT 1;

  IF v_top_bid IS NOT NULL THEN
    v_winning_seat  := v_top_bid.seat_id;
    v_winning_price := v_top_bid.amount;
    v_status        := 'sold';

    -- Lock and deduct from the winner's wallet
    UPDATE wallets
       SET balance    = balance - v_winning_price,
           updated_at = v_now
     WHERE seat_id = v_winning_seat
       AND balance >= v_winning_price;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;
  ELSE
    v_winning_seat  := NULL;
    v_winning_price := NULL;
    v_status        := 'unsold';
  END IF;

  -- Update the lot
  UPDATE lots
     SET status          = v_status,
         winning_seat_id = v_winning_seat,
         winning_price   = v_winning_price,
         closed_at       = v_now
   WHERE id = p_lot_id;

  RETURN jsonb_build_object(
    'winning_seat_id', v_winning_seat,
    'winning_price',   v_winning_price,
    'status',          v_status
  );
END;
$$;
