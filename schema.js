var S = require("sequelize");
var orm = new S("node_brewr", "root", "root", {
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

