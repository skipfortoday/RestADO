const ADODB = require("node-adodb");
const sqlkp = ADODB.open(
  "Provider=SQLOLEDB.1;Integrated Security=SSPI;Persist Security Info=False;Initial Catalog=KartuPasien-PB1;Data Source=192.168.0.1;"
);
module.exports = sqlkp;
