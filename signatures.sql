
DROP TABLE IF EXISTS signatures;

-- this is what signatures should look like for pt 3 and on..
-- don't run this file until you're at part 3!
CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    sig TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    -- here we are adding the foreign key (user_id)
    -- foreign key lets us identify which user from the users table signed the petition
    -- and which signature is theirs (acts as an identifier btw the 2 tables!)