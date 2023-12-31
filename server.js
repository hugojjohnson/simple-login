if (process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // Loads all variables from env and saves them in process.env
}

const express = require("express");
const app = new express();

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const initializePassport = require("./passport-config");
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id),
);

const users = [];

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false // do you want to save an empty value by default?
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name});
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs");
});


app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs", {name: "Hugo"});
});

app.get("/error", checkNotAuthenticated, (req, res) => {
    res.render("error.ejs", {name: "Hugo"});
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push( {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
    console.log(users);
    // res.render("register.ejs", {name: "Hugo"});
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

function checkAuthenticated (req, res, next) { // Middleware function that blocks the rest of the requests if you're not signed in.
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/login");
}

function checkNotAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return next();
}

app.listen(3000);