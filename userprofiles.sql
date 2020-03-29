CREATE TABLE user_profiles
(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR,
    url VARCHAR,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

--users.first users.last from signatures join on users 

--href="/signers/{{city}}"

--where lower
--(city) =  lower($1);
