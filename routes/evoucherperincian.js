var express = require('express');
const axios = require('axios');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
    try {
        const response = await axios.get('http://localhost:3000/users');
        res.send(response.data);
      } catch (error) {
        console.error(error);
      }
});

module.exports = router;
