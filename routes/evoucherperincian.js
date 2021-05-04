var express = require('express');
const axios = require('axios');
const conn = require('../app');
var router = express.Router();

/* GET users listing. */
// router.get('/', async function(req, res, next) {
//     try {
//         const response = await axios.get('http://localhost:3000/users');
//         res.send(response.data);
//       } catch (error) {
//         console.error(error);
//       }
// });

router.get('/', async function(req, res, next) {
    try {
        const lastsync = await axios.get('http://localhost:3003/users');
        const querydata = await conn.query('SELECT TOP 10  *FROM tEVoucherPerincian');
        res.send(querydata[0].time);
      } catch (error) {
        console.error(error);
      }
});

module.exports = router;
