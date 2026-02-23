const express = require("express");
const cookieSession = require("cookie-session");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

const USERNAME = process.env.APP_USER;
const PASSWORD = process.env.APP_PASS;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        name: "session",
        keys: [SESSION_SECRET],
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    })
);

function requireAuth(req, res, next) {
    if (req.session?.user) return next();
    return res.redirect("/login");
}

app.get("/home", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "private", "home.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "login.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USERNAME && password === PASSWORD) {
        req.session.user = { username };
        return res.redirect("/home");
    }

    return res.redirect("/login?err=1");
});

app.post("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/login");
});

app.get("/", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "private", "app.html"));
});

app.get("/network_data.json", requireAuth, (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(path.join(process.cwd(), "private", "network_data.json"));
});

module.exports = app;