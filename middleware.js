exports.requireLoggedOutUser = function (req, res, next)
{
    if (req.session.userId) {
        res.redirect("/petition")
    } else {
        next();
    }
}

exports.requireNoSignature = function (req, res, next)
{
    if (req.session.sigId) {
        res.redirect("/thanks")
    } else {
        next();
    }
}

exports.requireSignature = function (req, res, next)
{
    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {
        next();
    }
}

exports.requireLoggedInUser = function (req, res, next)
{
    if (req.session.userId) {
        next();
    } else {
        res.redirect("/register")
    }
}