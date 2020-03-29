const spicedPg = require('spiced-pg');

const db = spicedPg(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/signatures')



exports.addSignature = function (sig, user_id) //change!user_id or userId?
{

    return db.query(`INSERT INTO signatures (sig, user_id)
     VALUES ($1, $2)
     returning id`,
        [sig, user_id]
    );
}

exports.getSignatures = function ()
{
    return db.query(`SELECT first, last, age, city, url FROM users
    LEFT JOIN user_profiles ON user_id = users.id`)
}


exports.getSignature = function (user_id) // get signature of the user - session 
{

    return db.query(`SELECT *
    FROM users
    LEFT JOIN signatures
    ON user_id = users.id
    WHERE users.id = $1`, [user_id]);

}



exports.addUser = function (first, last, email, password)
{
    console.log("first: ", first);
    console.log("last: ", last);
    console.log("mail", email)
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first, last, email, password]
    );
};


exports.getUser = function (email)
{
    return db.query(`SELECT id, password FROM users WHERE email = $1 `, [email]);
}





exports.checkIfSig = function (userId) // user_id from signatures and id from users
{
    console.log("user_id in checkIfsig", userId)
    return db.query(
        `SELECT sig
        FROM users
        LEFT JOIN signatures
        ON user_id = users.id
        WHERE users.id = $1`,
        [userId]
    );

}


exports.insertData = function (age, city, url, userId)
{
    return db.query(`INSERT INTO user_profiles (age, city, url, user_id)
     VALUES ($1, $2, $3, $4)
     returning id`,
        [age, city, url, userId]
    );
}

exports.getSignersByCity = function (city)
{
    return db.query(`SELECT first, last, age, url FROM users
    LEFT JOIN user_profiles ON user_id = users.id
    WHERE city = $1`,
        [city] //argument of method
    );

}

exports.getUserData = function (userId)
{
    return db.query(`SELECT first, last, email, password, age, city, url FROM users
LEFT JOIN user_profiles ON user_id = users.id WHERE user_id = $1`,
        [userId]
    );

}


exports.updateUserData = function (id, first, last, email)
{
    console.log("id in updateUserData", id);
    console.log("first", first);
    console.log("last", last);
    console.log("mail", email);

    return db.query(`UPDATE users SET first = $2, last = $3, email=$4  WHERE id = $1`,
        [id, first, last, email]
    );
}


exports.updateUserDataPwd = function (id, first, last, email, password)
{
    console.log("id in updateUserData2", id);
    console.log("first", first);
    console.log("last", last);
    console.log("email", email);
    console.log("password", password);
    return db.query(`UPDATE users SET first = $2, last = $3, email=$4, password=$5 WHERE id = $1`,
        [id, first, last, email, password]
    );
}


exports.updateProfileData = function (age, city, url, userId)
{
    console.log("age", age)
    return db.query(`INSERT INTO user_profiles (age, city, url, user_id) VALUES($1, $2, $3, $4) ON CONFLICT (user_id) DO
UPDATE SET age = $1, city = $2, url = $3
`,
        [age || null, city || null, url || null, userId]

    );
}


exports.deleteSig = function (id)
{
    return db.query(`DELETE FROM signatures WHERE id = $1`, [id]);
};




///SELECT that gets first, last, email from users table and age, city, url from user_profiles. 
///Join on the user_id in user_profiles equaling the id in users.


