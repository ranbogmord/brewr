var S = require("sequelize");
var db = require('./config');
var orm = new S(db.name, db.user, db.pass, {
	dialect: "mysql"
});

var Brew = orm.define("brew", {
	time: S.STRING
});

var User = orm.define("user", {
	username: S.STRING,
	password: S.STRING
});

module.exports = {
	User: User,
	Brew: Brew,
	orm: orm
};

