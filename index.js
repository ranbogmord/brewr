var express = require('express'),
	app = express(),
	pp = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bp = require('body-parser'),
	session = require('express-session'),
	ph = require('password-hash'),
	gpio = require('gpio'),
	schema = require('./schema'),
	User = schema.User,
	Brew = schema.Brew;

app.set("port", process.env.PORT || 3000);


app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use(session({
	secret: "top secret session",
	resave: false,
	saveUninitialized: true
}));
app.use(pp.initialize());
app.use(pp.session());

pp.use(new LocalStrategy(function (username, password, done) {
	User.find({where: {username: username}}).then(function (user) {
		if (!user) return done(null, false);

		if (!ph.verify(password, user.password)) return done(null, false); 

		return done(null, user);
	});
}));

pp.serializeUser(function (user, done) {
	done(null, user.id);
});
pp.deserializeUser(function (id, done) {
	User.find(id).then(function (user) {
		done(null, user);
	});
});

app.ensureAuthed = function (req, res, next) {
	if (req.isAuthenticated()) return next();
	return res.redirect("/");
};

app.get("/status", function (req, res) {
	res.json({
		status: "idle"
	});
});

app.get("/", function (req, res) {
	if (req.isAuthenticated()) {
		return res.redirect("/brew");
	}
	res.sendFile(__dirname + "/views/login.html");
});

app.post("/auth", pp.authenticate("local", {successRedirect: "/brew", faliureRedirect: "/"}));

app.get("/brew", app.ensureAuthed, function (req, res) {
	res.sendFile(__dirname + "/views/brew.html");
});

app.post("/brew", app.ensureAuthed, function (req, res) {
	res.json({
		status: "brewing",
	});
});

app.listen(app.get("port"), function () {
	console.log("Server listening on port: " + app.get("port"))
});
