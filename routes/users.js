const { response } = require('express');
var express = require('express');
var router = express.Router();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const conn = require('../app');

async function descrypt(evoucher) {
  return await new Promise((resolve,reject) => {
    exec('"Project1.exe" '+ evoucher, (err, stdout, stderr) => {  
      if (err) {  
         reject(err)
      }  
      
      resolve(stdout)
    });
  })
}

async function savedatalokal () {
  
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
    try {
      const users = await conn.query('SELECT TOP 1000 * FROM tEVoucherPerincian');

      let tampung = '';

      await Promise.all (users.map( async (items,index) => {
        await descrypt(items.EVoucher).then((response) => {
          tampung += response;
        })
      }))
      res.send(tampung)
      console.log(tampung)
      
  
      

    //  descrypt(users[0].EVoucher).then((response) => {
    //    res.send(response)
    //  })

      // console.log(users)
      
      
    } catch (error) {
      console.error(error);
    }
});

module.exports = router;
