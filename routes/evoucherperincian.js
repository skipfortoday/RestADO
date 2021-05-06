const express = require("express");
const axios = require("axios");
const moment = require("moment");
const conn = require("../app");
const router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    const lastsync = await axios.get("http://localhost:3003/evoucherperincian");
    TglTerakhirSync = lastsync.data.data.date;
    WaktuTerakhirSync = lastsync.data.data.time;
    let TglSekarang = moment.parseZone(moment()).format("YYYY-MM-DD");
    let WaktuSekarang = moment.parseZone(moment()).format("HH:mm:ss");
    const querydata = await conn.query(`SELECT RecordNum,
                                        CONVERT(date, Tanggal) as Tgldate,
                                        CONVERT(time, Tanggal) as Tgltime,
                                        NoBukti,Keterangan,AmountD,AmountK,
                                        SaldoAwal,SaldoAkhir,IndexNum,UserID,
                                        CONVERT(date, TglInput) as TglInputdate,
                                        CONVERT(time, TglInput) as TglInputtime,
                                        Ubah,Hapus,Pelanggan,Lokasi,EVoucher,
                                        Koreksi,time,date
                                        FROM tEVoucherPerincian
                                        WHERE date BETWEEN '${TglTerakhirSync}' AND '${TglSekarang}' 
                                        AND time BETWEEN '${WaktuTerakhirSync}' AND '${WaktuSekarang}'
                                      `);
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
        '"'+ items.Koreksi +'"'+'),';
  });
  dataTcard = dataTcard.substring(0,dataTcard.trim().length-1);
    await axios.post("http://localhost:3003/evoucherperincian", {data : dataTcard})
      .then(function (response) {
        res.send(response.data);
      })
      .catch(function (error) {
        res.send(error);
      });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
