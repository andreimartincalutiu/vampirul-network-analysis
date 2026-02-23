require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Use environment variables in production
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
            // secure: true, // enable when behind HTTPS
        },
    })
);

function requireAuth(req, res, next) {
    if (req.session?.user) return next();
    return res.redirect("/login");
}

// Public: login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Public: handle login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === USERNAME && password === PASSWORD) {
        req.session.user = { username };
        return res.redirect("/");
    }
    return res.redirect("/login?err=1");
});

// Public: logout
app.post("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

// Everything below is protected
app.use("/", requireAuth);

// Serve protected static files (app.html, network_data.json, etc.)
app.use(express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
        // avoid caching json while developing
        if (filePath.endsWith(".json")) res.setHeader("Cache-Control", "no-store");
    }
}));

// Default route -> app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "app.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on http://localhost:${PORT}`));