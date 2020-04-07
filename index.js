const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./db.js");
const csurf = require("csurf");
let { addSignature } = require("./db.js");
let { getSignatures } = require("./db.js");
let { getSignature } = require("./db.js");
let { addUser } = require("./db.js");
let { getUser } = require("./db.js");
let { checkIfSig } = require("./db.js");
let { insertData } = require("./db.js");
let { getSignersByCity } = require("./db.js");
let { getUserData } = require("./db.js");
let { updateUserData } = require("./db.js");
let { updateUserDataPwd } = require("./db.js");
let { updateProfileData } = require("./db.js");
let { deleteSig } = require("./db.js");
const { hash, compare } = require("./bc.js");
const { middleware } = require("./middleware.js");
let { requireLoggedOutUser } = require("./middleware.js");
let { requireNoSignature } = require("./middleware.js");
let { requireSignature } = require("./middleware.js");
let { requireLoggedInUser } = require("./middleware.js");
let secrets;
process.env.NODE_ENV === "production"
  ? (secrets = process.env)
  : (secrets = {
      secret: `I'm always angry.`,
      maxAge: 1000 * 60 * 60 * 24 * 14
    });

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

app.use(
  express.urlencoded({
    extendend: false
  })
);

app.use(cookieSession(secrets));
app.use(csurf());
app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get("/", (req, res) => {
  const { userId } = req.session;

  if (userId) {
    getUserData(userId)
      .then(results => {
        res.render("home", { userLoggedIn: true, user: results.rows[0] });
      })
      .catch(err => res.render("home", { user: null }));
  } else {
    res.render("home", { user: null });
  }
});

app.get("/register", requireLoggedOutUser, (req, res) => {
  res.render("register");
});

app.post("/register", requireLoggedOutUser, (req, res) => {
  let first = req.body.first;
  let last = req.body.last;
  let email = req.body.email;
  let password = req.body.password;

  hash(password).then(hash => {
    addUser(first, last, email, hash)
      .then(results => {
        req.session.userId = results.rows[0].id;
        res.redirect("/profile");
      })
      .catch(err => console.log("Error in POST /register: ", err));
  });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
  res.render("login");
});

app.post("/login", requireLoggedOutUser, (req, res) => {
  let email = req.body.email;

  getUser(email).then(results => {
    const { userId } = req.session;
    let userInput = req.body.password;
    if (!results.rows[0]) {
      res.render("login", {
        layout: "main",
        error: true
      });
    }
    let storedPassword = results.rows[0].password;

    compare(userInput, storedPassword)
      .then(matchValue => {
        console.log("matchValue of compare:", matchValue);

        if (matchValue === true) {
          req.session.userId = results.rows[0].id;

          checkIfSig(userId).then(results => {
            console.log("results in POST/ login", results);
            if (req.session.sigId) {
              res.redirect("/thanks");
            } else {
              console.log("there is no signature yet");
              res.redirect("/petition");
            }
          });
        } else {
          res.render("login", {
            layout: "main",
            error: true
          });
        }
      })
      .catch(err => console.log("Error in POST /login: ", err));
  });
});
app.get("/petition", requireNoSignature, (req, res) => {
  console.log("req.session sig in get petition", req.session.sigId);

  res.render("petition", {
    layout: "main",
    userLoggedIn: true
  });
});

app.post("/petition", requireNoSignature, (req, res) => {
  const { userId } = req.session;
  let sig = req.body.sig;

  if (sig == "") {
    res.render("petition", {
      layout: "main",
      error: true,
      userLoggedIn: true
    });
  } else {
    addSignature(sig, userId)
      .then(results => {
        req.session.sigId = results.rows[0].id;

        res.redirect("/thanks");
      })
      .catch(err => console.log("Error in POST /petition: ", err));
  }
});

app.get("/thanks", requireSignature, (req, res) => {
  let id = req.session.userId;

  getSignature(id)
    .then(results => {
      console.log("results in /thanks: ", results.rows[0]);
      let signatureData = results.rows[0];

      res.render("thanks", {
        layout: "main",
        signatureData: signatureData,
        userLoggedIn: true
      });
    })
    .catch(err => console.log("Error in GET /thanks: ", err));
});

app.post("/thanks", requireSignature, (req, res) => {
  console.log("req.session.sig", req.session.sigId);
  res.redirect("/signers");
});

app.get("/signers", requireSignature, (req, res) => {
  getSignatures().then(results => {
    console.log(results);
    let signers = results.rows;
    console.log(signers);
    res.render("signers", {
      layout: "main",
      signers,
      userLoggedIn: true
    });
  });
});

app.get("/profile", requireLoggedInUser, (req, res) => {
  console.log("profile post" + req.session.userId);

  res.render("profile", {
    layout: "main",
    userLoggedIn: true
  });
});

app.post("/profile", requireLoggedInUser, (req, res) => {
  let age = req.body.age;
  let city = req.body.city;
  let url = req.body.url;

  console.log("age", age);
  console.log("city", city);
  console.log("url", url);
  if (url != "" && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  } else if (url === "") {
    url = null;
  }

  insertData(age, city, url, req.session.userId).then(results => {
    res.redirect("/petition");
    console.log("/profile POST route addProfile results: ", results);
  });
});

app.get("/signers/:city", requireSignature, (req, res) => {
  let city = req.params.city;

  getSignersByCity(city)
    .then(results => {
      let signers = results.rows;

      res.render("signers", {
        layout: "main",
        signers,
        city,
        userLoggedIn: true
      });
    })
    .catch(err => console.log("Error in GET /signers:city ", err));
});

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
  const { userId } = req.session;
  getUserData(userId).then(results => {
    if (!results.rows[0]) {
      res.redirect("/register");
    } else {
      let first = results.rows[0].first;
      let last = results.rows[0].last;
      let email = results.rows[0].email;
      let password = results.rows[0].password;
      let age = results.rows[0].age;
      let city = results.rows[0].city;
      let url = results.rows[0].url;

      res.render("editprofile", {
        layout: "main",
        first,
        last,
        email,
        password,
        age,
        city,
        url,
        userLoggedIn: true
      });
    }
  });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
  const { userId } = req.session;
  let first = req.body.first;
  let last = req.body.last;
  let email = req.body.email;
  let age = req.body.age;
  let city = req.body.city;
  let url = req.body.url;
  let password = req.body.password;

  if (!req.body.password) {
    updateUserData(userId, first, last, email)
      .then(results => {
        updateProfileData(age, city, url, userId)
          .then(results => {
            console.log("updateProfileData run");
            if (req.session.sigId) {
              res.redirect("/thanks");
            } else {
              res.redirect("/petition");
            }
          })
          .catch(err => console.log("Error in /profile/edit: ", err));
      })
      .catch(err => console.log("Error in /profile/edit: ", err));
  } else {
    hash(password).then(hash => {
      updateUserDataPwd(userId, first, last, email, hash)
        .then(results => {
          updateProfileData(age, city, url, userId)
            .then(results => {
              res.redirect("/thanks");
            })
            .catch(err => console.log("Error in /profile/edit: ", err));
        })
        .catch(err => console.log("Error in /profile/edit: ", err));
    });
  }
});

app.post("/signature/delete", (req, res) => {
  deleteSig(req.session.sigId)
    .then(results => {
      req.session.sigId = null;
      res.redirect("/petition");
    })
    .catch(err => console.log("Error in /signature/delete: ", err));
});

app.get("/logout", (req, res) => {
  req.session.userId = null;
  req.session.sigId = null;
  res.redirect("/login");
});

app.get("/home", (req, res) => {
  res.render("home", {
    layout: "main"
  });
});

app.listen(process.env.PORT || 8080, () => console.log("server on listening"));
