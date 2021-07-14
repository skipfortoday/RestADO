const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../sqlkartupasien");
const router = express.Router();

// setInterval(function () {
//   axios
//     .get("http://localhost:4000/kartu-pasien/data-pasien")
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }, 3000);

router.get("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblDataPasien
    WHERE TglAuto > (SELECT CONVERT(varchar, "time", 120)+'.999' 
    FROM timeAnchor Where tablekey='tblDataPasien')
            `);
    if (checkData[0]) {
      let dataArray = "";
      checkData.forEach((items) => {
        dataArray += `(
          '${items.NKP}',
          ${items.NoAuto == null ? null : `'${items.NoAuto}'`},
          ${
            items.TglAwalDaftar == null
              ? null
              : `'${moment(items.TglAwalDaftar).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${items.Nama == null ? null : `'${items.Nama}'`},
          ${items.Alamat == null ? null : `'${items.Alamat}'`},
          ${items.TelpRumah == null ? null : `'${items.TelpRumah}'`},
          ${items.HP == null ? null : `'${items.HP}'`},
          ${items.Fax == null ? null : `'${items.Fax}'`},
          ${
            items.TglLahir == null
              ? null
              : `'${moment(items.TglLahir).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${items.NoDist == null ? null : `'${items.NoDist}'`}, 
          ${items.NoSponsor == null ? null : `'${items.NoSponsor}'`},
          ${items.Status == null ? null : `'${items.Status}'`},
          ${items.Keterangan == null ? null : `'${items.Keterangan}'`},
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
          ${items.Sponsor == null ? null : `'${items.Sponsor}'`},
          ${items.Exported == null ? null : `'${items.Exported}'`},
          ${
            items.LastCalldateUltah == null
              ? null
              : `'${moment(items.LastCalldateUltah).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}'`
          },
          ${items.tempCallPasien == null ? null : `'${items.tempCallPasien}'`},
          ${
            items.tempCallDate == null
              ? null
              : `'${moment(items.tempCallDate).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${
            items.tempCallTime == null
              ? null
              : `'${moment(items.tempCallTime).format("YYYY-MM-DD HH:mm:ss")}'`
          },
          ${items.tempCallKet == null ? null : `'${items.tempCallKet}'`},
          ${
            items.tempNoAutoHistoryCallPasienUltah == null
              ? null
              : `'${items.tempNoAutoHistoryCallPasienUltah}'`
          },
          ${items.IDSponsor == null ? null : `'${items.IDSponsor}'`},
          ${items.LokasiFoto == null ? null : `'${items.LokasiFoto}'`},
          ${items.NoKTP == null ? null : `'${items.NoKTP}'`},
          ${items.NamaKTP == null ? null : `'${items.NamaKTP}'`},
          ${items.TempatLahir == null ? null : `'${items.TempatLahir}'`},
          ${items.AlamatKTP == null ? null : `'${items.AlamatKTP}'`},
          ${items.TelpKTP == null ? null : `'${items.TelpKTP}'`},
          ${items.Kota == null ? null : `'${items.Kota}'`},
          ${items.KotaKTP == null ? null : `'${items.KotaKTP}'`},
          ${items.KotaSMS == null ? null : `'${items.KotaSMS}'`},
          ${items.StatusLtPack == null ? null : `'${items.StatusLtPack}'`},
          ${items.NoDistLtPack == null ? null : `'${items.NoDistLtPack}'`},
          ${
            items.IDSponsorLtPack == null ? null : `'${items.IDSponsorLtPack}'`
          },
          ${items.PinBB == null ? null : `'${items.PinBB}'`},
          ${
            items.StatusDiskonPasien == null
              ? null
              : `'${items.StatusDiskonPasien}'`
          },       
          '${moment(moment(items.TglAuto)).format("YYYY-MM-DD HH:mm:ss")}'),`;
      });

      // Data Dipotong , Belakang
      let dataCut = dataArray.substring(0, dataArray.trim().length - 1);

      // Menghilangkan Spaci & Whitespace Agar Dikirim Lebih Ringkas
      let dataFinal = dataCut.replace(/\s+/g, " ").trim();

      //Push Data Ke API untuk di simpan dan di MERGE
      const pushData = await axios.post(
        "http://localhost:3000/api/kartu-pasien/data-pasien/data/",
        { data: dataFinal }
      );

      //Mendapatkan Waktu Data Terakhir Update
      const getTimeAnchor = await axios.get(
        "http://localhost:3000/api/kartu-pasien/data-pasien/waktu"
      );

      //Update Waktu Acuan ke DB Client
      const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
            "time" = '${getTimeAnchor.data.data}'
            WHERE tablekey='tblDataPasien';`);

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
