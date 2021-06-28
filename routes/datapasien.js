const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/datapasien")
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }, 3000);

router.get("/", async function (req, res, next) {
  try {
    const lastsync = await axios.get(
      "http://localhost:3000/api/kartu-pasien/data-pasien/waktu/"
    );

    WaktuTerakhirSync = lastsync.data.data;
    console.log(WaktuTerakhirSync);
    let q = `
    SELECT TOP 1 
    NKP,
    NoAuto,
    TglAwalDaftar,
    Nama,
    Alamat,
    TelpRumah,
    HP,
    Fax,
    TglLahir,
    NoDist,
    NoSponsor,
    Status,
    Keterangan,
    TglActivitas,
    JamActivitas,
    UserEntry,
    LoginComp,
    CompName,
    PasienLama,
    Sponsor,
    Exported,
    LastCallDateUltah,
    tempCallPasien,
    tempCallDate,
    tempCallTime,
    tempCallKet,
    tempNoAutoHistoryCallPasienUltah,
    IDSponsor,
    LokasiFoto,
    NoKTP,
    NamaKTP,
    TempatLahir,
    AlamatKTP,
    TelpKTP,
    Kota,
    KotaKTP,
    KotaSMS,
    StatusLtPack,
    NoDistLtPack,
    IDSponsorLtPack,
    PinBB,
    StatusDiskonPasien,
    CONVERT(date, TglAuto) as dateTglAuto,
    CONVERT(time, TglAuto) as timeTglAuto
    FROM tblDataPasien
    WHERE TglAuto > '${WaktuTerakhirSync}.59' 
  `;
    const querydata = await sqlkp.query(q);
    if (querydata[0]) {
      let dataTcard = "";
      querydata.forEach((items) => {
        dataTcard +=
          "(" +
          '"' +
          items.NKP +
          '", ' +
          '"' +
          items.NoAuto +
          '", ' +
          '"' +
          items.TglAwalDaftar +
          '", ' +
          '"' +
          items.Nama +
          '", ' +
          '"' +
          items.Alamat +
          '", ' +
          '"' +
          items.TelpRumah +
          '", ' +
          '"' +
          items.HP +
          '", ' +
          '"' +
          items.Fax +
          '", ' +
          '"' +
          items.TglLahir +
          '", ' +
          '"' +
          items.NoDist +
          '", ' +
          '"' +
          items.NoSponsor +
          '", ' +
          '"' +
          items.Status +
          '", ' +
          '"' +
          items.Keterangan +
          '", ' +
          '"' +
          items.TglActivitas +
          '", ' +
          '"' +
          items.JamActivitas +
          '", ' +
          '"' +
          items.UserEntry +
          '", ' +
          '"' +
          items.LoginComp +
          '", ' +
          '"' +
          items.CompName +
          '", ' +
          '"' +
          items.PasienLama +
          '", ' +
          '"' +
          items.Sponsor +
          '", ' +
          '"' +
          items.Exported +
          '", ' +
          '"' +
          items.LastCallDateUltah +
          '", ' +
          '"' +
          items.tempCallPasien +
          '", ' +
          '"' +
          items.tempCallDate +
          '", ' +
          '"' +
          items.tempCallTime +
          '", ' +
          '"' +
          items.tempCallKet +
          '", ' +
          '"' +
          items.tempNoAutoHistoryCallPasienUltah +
          '", ' +
          '"' +
          items.IDSponsor +
          '", ' +
          '"' +
          items.LokasiFoto +
          '", ' +
          '"' +
          items.NoKTP +
          '", ' +
          '"' +
          items.NamaKTP +
          '", ' +
          '"' +
          items.TempatLahir +
          '", ' +
          '"' +
          items.AlamatKTP +
          '", ' +
          '"' +
          items.TelpKTP +
          '", ' +
          '"' +
          items.Kota +
          '", ' +
          '"' +
          items.KotaKTP +
          '", ' +
          '"' +
          items.KotaSMS +
          '", ' +
          '"' +
          items.StatusLtPack +
          '", ' +
          '"' +
          items.IDSponsorLtPack +
          '", ' +
          '"' +
          items.PinBB +
          '", ' +
          '"' +
          items.StatusDiskonPasien +
          '", ' +
          '"' +
          items.dateTglAuto +
          " " +
          items.timeTglAuto +
          '"' +
          "),";
      });
      dataTcard = dataTcard.substring(0, dataTcard.trim().length - 1);
      console.log(dataTcard);
      await axios
        .post("http://localhost:3000/api/kartu-pasien/data-pasien/data/", {
          data: dataTcard,
        })
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
    let querydata = await sqlkp.query(
      `SELECT RecordNum,Flag,Lokasi,
      CONVERT(varchar, CreateAt,120) as Time
      from tevoucherperincian
      ORDER BY CreateAt DESC`
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

// router.post("/data", async function (req, res, next) {
//   try {
//     let querydata = await sqltcard.query(
//       `INSERT INTO tevoucherperincian (
//         RecordNum,Tanggal,NoBukti,Keterangan,AmountD,AmountK,
//         SaldoAwal,SaldoAkhir,IndexNum,UserID,TglInput,Ubah,
//         Hapus,Pelanggan,Lokasi,Evoucher,Flag,Koreksi,CreateAt
//         ) VALUES ("1", "2010-03-06 14:55:49.0000000", "SB02/SPNV100306/0001", "HaiCoba", "300000", "0", "0", "300000", "1", "WIDI", "2010-03-06 15:00:10.0000000", "0", "0", "SB02/T-0059", "SB02", "0cOVdg5yAwpVIY1DpG8vXD", "SB02/1", "null", "2021-05-17 16:11:49.9700000")
//         ON DUPLICATE KEY UPDATE
//         RecordNum=VALUES(RecordNum),
//         Tanggal=VALUES(Tanggal),
//         NoBukti=VALUES(NoBukti),
//         Keterangan=VALUES(Keterangan),
//         AmountD=VALUES(AmountD),
//         AmountK=VALUES(AmountK),
//         SaldoAwal=VALUES(SaldoAwal),
//         SaldoAkhir=VALUES(SaldoAkhir),
//         IndexNum=VALUES(IndexNum),
//         UserID=VALUES(UserID),
//         TglInput=VALUES(TglInput),
//         Ubah=VALUES(Ubah),
//         Hapus=VALUES(Hapus),
//         Pelanggan=VALUES(Pelanggan),
//         Lokasi=VALUES(Lokasi),
//         Evoucher=VALUES(Evoucher),
//         Koreksi=VALUES(Koreksi),
//         CreateAt=VALUES(CreateAt)
//         ;`
//     );
//     res.json({
//       success: true,
//       status: 200,
//       message: "Berhasil Mendapatkan Data",
//       data: querydata,
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       status: 500,
//       message: error,
//       data: false,
//     });
//   }
// });

module.exports = router;
