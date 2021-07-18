const ADODB = require("node-adodb");
const conf = require("./main");
const sqlkp = ADODB.open(
  `Provider=SQLOLEDB.1;Integrated Security=SSPI;Persist Security Info=False;Initial Catalog=${conf.dbKartuPasien};Data Source=${conf.ipDatabase};`
);
module.exports = sqlkp;
