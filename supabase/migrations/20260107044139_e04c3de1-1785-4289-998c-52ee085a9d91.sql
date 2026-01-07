-- Update get_chat_contacts to ensure proper ID mapping
-- The function already returns profile_id, which is used correctly

-- Let's verify the function is correct
-- No changes needed to the function as it already returns profile_id

-- However, we need to ensure TraineeChatBox uses the correct field for message matching
-- The contacts should use profile_id for employees since that's what admin sends to

-- No database changes needed - the fix is in the frontend code