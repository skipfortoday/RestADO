const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

setInterval(function () {
  axios
    .get("http://localhost:4000/kartu-pasien/perawatan")
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.get("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`SELECT TOP 100 *FROM tblPerawatan
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblPerawatan')`);

    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
          '${items.NoAuto}',
           ${items.NKP == null ? null : `'${items.NKP}'`},
           ${
             items.NoUrutTreatment == null ? null : `'${items.NoUrutTreatment}'`
           },
           ${
             items.TglTreatment == null
               ? null
               : `'${moment(items.TglTreatment).format("YYYY-MM-DD HH:mm:ss")}'`
           },
           ${items.Nama == null ? null : `'${items.Nama}'`},
           ${items.Alamat == null ? null : `'${items.Alamat}'`},
           ${items.TelpRumah == null ? null : `'${items.TelpRumah}'`},
           ${items.HP == null ? null : `'${items.HP}'`},
           ${items.Anamnesa == null ? null : `'${items.Anamnesa}'`},
           ${items.Pagi == null ? null : `'${items.Pagi}'`},
           ${items.Sore == null ? null : `'${items.Sore}'`},
           ${items.Malam == null ? null : `'${items.Malam}'`},
           ${items.Terapy == null ? null : `'${items.Terapy}'`},
           ${
             items.NamaDokterKonsul == null
               ? null
               : `'${items.NamaDokterKonsul}'`
           },
           ${items.NamaDokter == null ? null : `'${items.NamaDokter}'`},
           ${items.NamaBA == null ? null : `'${items.NamaBA}'`},
           ${items.Status == null ? null : `'${items.Status}'`},
           ${
             items.TglActivitas == null
               ? null
               : `'${moment(items.TglActivitas).format("YYYY-MM-DD HH:mm:ss")}'`
           },
           ${
             items.JamActivitas == null
               ? null
               : `'${moment(items.JamActivitas).format("YYYY-MM-DD HH:mm:ss")}'`
           },
           ${items.Keterangan == null ? null : `'${items.Keterangan}'`}, 
           ${items.UserEntry == null ? null : `'${items.UserEntry}'`},
           ${
             items.LoginComp == null
               ? null
               : `'${items.LoginComp.replace("\x00", "")}'`
           },
           ${
             items.CompName == null
               ? null
               : `'${items.CompName.replace("\x00", "")}'`
           },
           ${items.PasienLama == null ? null : `'${items.PasienLama}'`},
           ${items.Exported == null ? null : `'${items.Exported}'`},
           ${items.CallPasien == null ? null : `'${items.CallPasien}'`},
           ${
             items.CallDate == null
               ? null
               : `'${moment(items.CallDate).format("YYYY-MM-DD HH:mm:ss")}'`
           },
           ${
             items.CallTime == null
               ? null
               : `'${moment(items.CallTime).format("YYYY-MM-DD HH:mm:ss")}'`
           },
           ${items.CallKet == null ? null : `'${items.CallKet}'`},
           ${
             items.CallPasienResep == null ? null : `'${items.CallPasienResep}'`
           },
           ${
             items.IDJenisPerawatan == null
               ? null
               : `'${items.IDJenisPerawatan}'`
           },
          '${moment(items.TglAuto).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      //Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/perawatan/data/",
        { data: dataFinal }
      );

      //Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/perawatan/waktu"
      );

      //Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblPerawatan';`);

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Sinkron Data",
        waktu: getTimeAnchor.data.data,
      });
    } else {
      res.status(204).json({
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
