-- =====================================
-- ENSURE CHATROOM TOKEN IS UNIQUE
-- =====================================

ALTER TABLE "Chatroom"
ADD CONSTRAINT chatroom_token_unique UNIQUE (token);

-- =====================================
-- LINK MESSAGES TO CHATROOM (CASCADE)
-- =====================================

ALTER TABLE "Messages"
ADD CONSTRAINT messages_room_fk
FOREIGN KEY ("RoomId")
REFERENCES "Chatroom"(token)
ON DELETE CASCADE;

-- =====================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================

ALTER TABLE "Chatroom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Messages" ENABLE ROW LEVEL SECURITY;

-- =====================================
-- CHATROOM POLICIES
-- =====================================

-- Read chatrooms
CREATE POLICY "read chatroom"
ON "Chatroom"
FOR SELECT
TO authenticated
USING (true);

-- Create chatroom
CREATE POLICY "create chatroom"
ON "Chatroom"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Block updates
CREATE POLICY "no chatroom updates"
ON "Chatroom"
FOR UPDATE
TO authenticated
USING (false);

-- Allow delete by authenticated users
CREATE POLICY "delete chatroom"
ON "Chatroom"
FOR DELETE
TO authenticated
USING (true);

-- =====================================
-- MESSAGES POLICIES
-- =====================================

-- Read messages
CREATE POLICY "read messages"
ON "Messages"
FOR SELECT
TO authenticated
USING (true);

-- Send messages (only self)
CREATE POLICY "send messages"
ON "Messages"
FOR INSERT
TO authenticated
WITH CHECK (
  "SenderId" = auth.uid()
);

-- Block updates
CREATE POLICY "no message updates"
ON "Messages"
FOR UPDATE
TO authenticated
USING (false);

-- Block deletes (messages deleted only via room deletion)
CREATE POLICY "no message deletes"
ON "Messages"
FOR DELETE
TO authenticated
USING (false);

-- =====================================
-- JOIN CHATROOM RPC (ATOMIC)
-- =====================================

CREATE OR REPLACE FUNCTION join_chatroom(room_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated integer;
BEGIN
  UPDATE "Chatroom"
  SET
    "activeUser" = 2,
    locked = true
  WHERE
    token = room_token
    AND "activeUser" = 1
    AND locked = false
  RETURNING 1 INTO updated;

  RETURN updated IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION join_chatroom(uuid) TO authenticated;
