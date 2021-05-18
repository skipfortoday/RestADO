const ADODB = require("node-adodb");
const sqltcard = ADODB.open(
  "Provider=SQLOLEDB.1;Integrated Security=SSPI;Persist Security Info=False;Initial Catalog=TCardOnline_SB02_Test;Data Source=192.168.0.1;"
);
module.exports = sqltcard;
