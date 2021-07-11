const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

setInterval(function () {
  axios
    .get("http://localhost:4000/kartu-pasien/data-pasien")
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.get("/", async function (req, res, next) {
  try {
    let q = `SELECT TOP 100 *FROM tblDataPasien
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblDataPasien')`;

    const querydata = await sqlkp.query(q);
    console.log(querydata);
    if (querydata[0]) {
      let dataArray = "";
      querydata.forEach((items) => {
        dataArray += `(
          '${items.NKP}',
          '${items.NoAuto}',
          '${moment(items.TglAwalDaftar).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.Nama}',
          '${items.Alamat}',
          '${items.TelpRumah}',
          '${items.HP}',
          '${items.Fax}',
          '${moment(items.TglLahir).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.NoDist}',
          '${items.NoSponsor}',
          '${items.Status}',
          '${items.Keterangan}',
          '${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.UserEntry}',
          '${items.LoginComp}',
          '${items.CompName}',
          '${items.PasienLama}',
          '${items.Sponsor}',
          '${items.Exported}',
          '${moment(items.LastCalldateUltah).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.tempCallPasien}',
          '${moment(items.tempCallDate).format("YYYY-MM-DD HH:mm:ss")}',
          '${moment(items.tempCallTime).format("YYYY-MM-DD HH:mm:ss")}',
          '${items.tempCallKet}',
          '${items.tempNoAutoHistoryCallPasienUltah}',
          '${items.IDSponsor}',
          '${items.LokasiFoto}',
          '${items.NoKTP}',
          '${items.NamaKTP}',
          '${items.TempatLahir}',
          '${items.AlamatKTP}',
          '${items.TelpKTP}',
          '${items.Kota}',
          '${items.KotaKTP}',
          '${items.KotaSMS}',
          '${items.StatusLtPack}',
          '${items.NoDistLtPack}',
          '${items.IDSponsorLtPack}',
          '${items.PinBB}',       
          '${items.StatusDiskonPasien}',
          '${moment(moment(items.TglAuto)).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      await axios
        .post("http://localhost:3000/api/kartu-pasien/data-pasien/data/", {
          data: dataFinal,
        })
        .then(async function (response) {
          try {
            const lastsync = await axios.get(
              "http://localhost:3000/api/kartu-pasien/data-pasien/waktu"
            );
            WaktuTerakhirSync = lastsync.data.data;
            let querydata = await sqlkp.execute(
              `UPDATE "timeAnchor" set
              "time" = '${WaktuTerakhirSync}' 
                WHERE tablekey='tblDataPasien';`
            );
            res.json({ status: querydata, data: dataFinal });
          } catch (error) {
            res.send(error);
          }
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
    res.send(error);
    console.error(error);
  }
});

module.exports = router;
