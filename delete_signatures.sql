DELETE FROM signatures;



INSERT INTO actors
    (first, lasr, email)
VALUES
    ("brad", "pitt", "bradp@aol.com")
ON CONFLICT
(actors.email) DO
UPDATE actors SET first = "brad", last = "pitt"

user_id


button inside
of form method post request
action= "/signature/delete"



INSERT INTO actors
    (first, lasr, email)
VALUES
    ("brad", "pitt", "bradp@aol.com")
ON CONFLICT
(actors.email) DO
UPDATE actors SET first = "brad", last = "pitt"


