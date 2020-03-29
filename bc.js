const bcrypt = require("bcryptjs")
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = password => genSalt().then(salt => (hash(password, salt)))







//genSalt().then(salt =>
//{
    // console.log("salt created by bcrypt", salt) //generate salt to add more PW security 
//    return hash("safePassword", salt)
//}).then(hashedPw =>
//{
    // console.log("hashedpw plus salt output ", hashedPw);// return properly hashed PW
//    return compare("safePassword", hashedPw)
//}).then(matchValueCompare =>
//{

//    console.log("password provided is: ", matchValueCompare)
//})


