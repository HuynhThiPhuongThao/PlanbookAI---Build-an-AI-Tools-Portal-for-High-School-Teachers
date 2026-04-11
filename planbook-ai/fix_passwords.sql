UPDATE db_auth.users SET password_hash='$2a$10$BzGYuj2C.L3eSs7RXA9fJ..vYrntVoHXxgDjRXwdCghwUJDn2qxWS' WHERE email IN ('staff@gmail.com','staff1@gmail.com','manager@gmail.com','manager1@gmail.com','manager2@gmail.com','teacher1@gmail.com');
SELECT email, LEFT(password_hash,15) as hash_preview FROM db_auth.users;
