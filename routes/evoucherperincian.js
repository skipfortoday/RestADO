const express = require("express");
const axios = require("axios");
const moment = require("moment");
const conn = require("../app");
const router = express.Router();

setInterval(function(){ axios.get('http://localhost:3000/evoucherperincian')
.then(function (response) {
  console.log(response.data);
})
.catch(function (error) {
  console.log('err');
}); }, 3000);

router.get("/", async function (req, res, next) {
  try {
    const lastsync = await axios.get("http://localhost:3003/evoucherperincian");
    WaktuTerakhirSync = lastsync.data.data;
    let q = (`
    SELECT TOP 100 RecordNum,
    CONVERT(date, Tanggal) as Tgldate,
    CONVERT(time, Tanggal) as Tgltime,
    NoBukti,Keterangan,AmountD,AmountK,
    SaldoAwal,SaldoAkhir,IndexNum,UserID,
    CONVERT(date, TglInput) as TglInputdate,
    CONVERT(time, TglInput) as TglInputtime,
    Ubah,Hapus,Pelanggan,Lokasi,EVoucher,Koreksi,
    CONVERT(date, CreateAt) as CreateAtdate,
    CONVERT(time, CreateAt) as CreateAttime
    FROM tEVoucherPerincian
    WHERE CONVERT(datetime, CreateAt) > '${WaktuTerakhirSync}.59' 
  `);
  const querydata = await conn.query (q);
  if (querydata[0]){
    let dataTcard = '';
  querydata.forEach(items => {
    dataTcard += 
    '('+
        '"'+ items.RecordNum +'", '+
        '"'+ items.Tgldate + ' ' + items.Tgltime +'", '+
        '"'+ items.NoBukti +'", '+
        '"'+ items.Keterangan +'", '+
        '"'+ items.AmountD +'", '+
        '"'+ items.AmountK +'", '+
        '"'+ items.SaldoAwal +'", '+
        '"'+ items.SaldoAkhir +'", '+
        '"'+ items.IndexNum +'", '+
        '"'+ items.UserID +'", '+
        '"'+ items.TglInputdate + ' ' + items.TglInputtime +'", '+
        '"'+ items.Ubah * 1 +'", '+
        '"'+ items.Hapus * 1 +'", '+
        '"'+ items.Pelanggan +'", '+
        '"'+ items.Lokasi +'", '+
        '"'+ items.EVoucher +'", '+
        '"'+ items.Lokasi + '/' + items.RecordNum +'", '+
        '"'+ items.Koreksi +'", '+
        '"'+ items.CreateAtdate + ' ' + items.CreateAttime +'"'+'),';
  });
  dataTcard = dataTcard.substring(0,dataTcard.trim().length-1);
    await axios.post("http://localhost:3003/evoucherperincian", {data : dataTcard})
      .then(function (response) {
        res.send(response.data);
      })
      .catch(function (error) {
        res.send(error);
      });
  } else {
    res.json({
      success: false,
      status: 204,
      message: "Belum ada data untuk sinkron",
      data: false,
    });
  }
  } catch (error) {
    console.error(error);
  }
});

router.get("/data", async function (req, res, next) {
  try {
    let querydata = await conn.query(
      `SELECT RecordNum,Flag,Lokasi,
      CONVERT(varchar, CreateAt,120) as Time
      from tevoucherperincian
      ORDER BY CreateAt DESC`,
    );
        res.json({
        success: true,
        status: 200,
        message: "Berhasil Mendapatkan Data",
        data: querydata,
      });
  } catch (error) {
     res.json({
            success: false,
            status: 500,
            message: error,
            data: false,
    });
  }
});

module.exports = router;
