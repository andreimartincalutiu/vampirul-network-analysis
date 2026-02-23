require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

const USERNAME = process.env.APP_USER;
const PASSWORD = process.env.APP_PASS;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
        },
    })
);

function requireAuth(req, res, next) {
    if (req.session?.user) return next();
    return res.redirect("/login");
}

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USERNAME && password === PASSWORD) {
        req.session.user = { username };
        return res.redirect("/");
    }
    return res.redirect("/login?err=1");
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

app.use("/", requireAuth);

app.use(express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".json")) res.setHeader("Cache-Control", "no-store");
    }
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "app.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on http://localhost:${PORT}`));