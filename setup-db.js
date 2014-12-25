var schemas = require("./schema");
var orm = schemas.orm;
orm.sync().complete(function () {
	console.log("Migrated db");
});
