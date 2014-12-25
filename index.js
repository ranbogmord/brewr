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
	Brew = schema.Brew,
	sstatic = require('serve-static');

app.set("port", process.env.PORT || 3000);
app.set("brew_status", "idle");


app.use(sstatic("assets"));
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
		status: app.get("brew_status")
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

app.get("/add-user", app.ensureAuthed, function (req, res) {
	res.sendFile(__dirname + "/views/add.html");
});

app.post("/add-user", app.ensureAuthed, function (req, res) {
	if (!req.body.username || !req.body.password) {
		return res.send("Missing required parameters");
	}

	User.create({
		username: req.body.username,
		password: ph.generate(req.body.password)
	})
	.then(function (user) {
		res.send("User: " + user.username + " created.");
	});
});

app.post("/brew", app.ensureAuthed, function (req, res) {
	if (app.get("brew_status") == "brewing") {
		return res.json({
			message: "Already brewing"
		});
	}

	var sigPin = gpio.export(4, {
		interval: 400,
		ready: function () {
			var time = 120000;
			app.set("brew_status", "brewing");
			sigPin.set();

			setTimeout(function () {
				sigPin.reset();
				sigPin.unexport();
				app.set("brew_status", "idle");
			}, time);

			res.json({
				message: "Started brewing, your coffee will be available soon"
			});
		}
	})
});

app.get("/logout", app.ensureAuthed, function (req, res) {
	req.logout();
	res.redirect("/");
});

app.listen(app.get("port"), function () {
	console.log("Server listening on port: " + app.get("port"))
});
