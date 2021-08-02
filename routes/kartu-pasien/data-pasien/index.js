const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();
const conf = require("../../../config/main");
const fire = require("../../../config/firebase");

fire
  .database()
  .ref("/kartu-pasien/tblDataPasien")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblDataPasien : ", data);
    axios
      .get(`${conf.appURL}/kartu-pasien/data-pasien`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

fire
  .database()
  .ref("/kartu-pasien/tblDataPasien")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblDataPasien : ", data);
    axios
      .patch(`${conf.appURL}/kartu-pasien/data-pasien`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

setInterval(function () {
  axios
    .post(`${conf.appURL}/kartu-pasien/data-pasien`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

setInterval(function () {
  axios
    .put(`${conf.appURL}/kartu-pasien/data-pasien`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

router.post("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 100 *FROM tblDataPasien JOIN flagDataPasien ON tblDataPasien.NKP = flagDataPasien.flagNKP WHERE flagDataPasien.flagPush = 0;
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
          ${items.Nama == null ? null : `'${items.Nama.replace("'", "''")}'`},
          ${
            items.Alamat == null ? null : `'${items.Alamat.replace("'", "''")}'`
          },
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
          ${
            items.Keterangan == null
              ? null
              : `'${items.Keterangan.replace("'", "''")}'`
          },
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
          ${
            items.LokasiFoto == null
              ? null
              : `'${items.LokasiFoto.replace("'", "''")}'`
          },
          ${items.NoKTP == null ? null : `'${items.NoKTP}'`},
          ${
            items.NamaKTP == null
              ? null
              : `'${items.NamaKTP.replace("'", "''")}'`
          },
          ${
            items.TempatLahir == null
              ? null
              : `'${items.TempatLahir.replace("'", "''")}'`
          },
          ${
            items.AlamatKTP == null
              ? null
              : `'${items.AlamatKTP.replace("'", "''")}'`
          },
          ${items.TelpKTP == null ? null : `'${items.TelpKTP}'`},
          ${items.Kota == null ? null : `'${items.Kota.replace("'", "''")}'`},
          ${
            items.KotaKTP == null
              ? null
              : `'${items.KotaKTP.replace("'", "''")}'`
          },
          ${
            items.KotaSMS == null
              ? null
              : `'${items.KotaSMS.replace("'", "''")}'`
          },
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
        `${conf.baseURL}/kartu-pasien/data-pasien/push/${conf.kodeCabang}`,
        { data: dataFinal }
      );

      // //Mendapatkan Waktu Data Terakhir Update
      // const getTimeAnchor = await axios.get(
      //   "http://localhost:3000/api/kartu-pasien/data-pasien/waktu"
      // );

      // //Update Waktu Acuan ke DB Client
      // const updateTime = await sqlkp.execute(`UPDATE "timeAnchor" set
      //       "time" = '${getTimeAnchor.data.data}'
      //       WHERE tablekey='tblDataPasien';`);

      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpDataPasien" FROM "tblDataPasien";
      INSERT INTO "#tmpDataPasien"
         ("NKP"
          ,"NoAuto"
          ,"TglAwalDaftar"
          ,"Nama"
          ,"Alamat"
          ,"TelpRumah"
          ,"HP"
          ,"Fax"
          ,"TglLahir"
          ,"NoDist"
          ,"NoSponsor"
          ,"Status"
          ,"Keterangan"
          ,"TglActivitas"
          ,"JamActivitas"
          ,"UserEntry"
          ,"LoginComp"
          ,"CompName"
          ,"PasienLama"
          ,"Sponsor"
          ,"Exported"
          ,"LastCallDateUltah"
          ,"tempCallPasien"
          ,"tempCallDate"
          ,"tempCallTime"
          ,"tempCallKet"
          ,"tempNoAutoHistoryCallPasienUltah"
          ,"IDSponsor"
          ,"LokasiFoto"
          ,"NoKTP"
          ,"NamaKTP"
          ,"TempatLahir"
          ,"AlamatKTP"
          ,"TelpKTP"
          ,"Kota"
          ,"KotaKTP"
          ,"KotaSMS"
          ,"StatusLtPack"
          ,"NoDistLtPack"
          ,"IDSponsorLtPack"
          ,"PinBB"
          ,"StatusDiskonPasien"
          ,"TglAuto") VALUES ${dataFinal};
      MERGE flagDataPasien AS Target
      USING (SELECT * FROM #tmpDataPasien) AS Source
      ON (Target.flagNKP = Source.NKP)
      WHEN MATCHED THEN
          UPDATE SET Target.flagPush = 1;                  
            `);

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Sinkron Data",
        data: dataFinal,
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

// Pull DataDariServer
router.get("/", async function (req, res, next) {
  try {
    // Mengambil Data (Pull Data)
    const pullData = await axios.get(
      `${conf.baseURL}/kartu-pasien/data-pasien/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpDataPasien" FROM "tblDataPasien";
      INSERT INTO "#tmpDataPasien"
         ("NKP"
          ,"NoAuto"
          ,"TglAwalDaftar"
          ,"Nama"
          ,"Alamat"
          ,"TelpRumah"
          ,"HP"
          ,"Fax"
          ,"TglLahir"
          ,"NoDist"
          ,"NoSponsor"
          ,"Status"
          ,"Keterangan"
          ,"TglActivitas"
          ,"JamActivitas"
          ,"UserEntry"
          ,"LoginComp"
          ,"CompName"
          ,"PasienLama"
          ,"Sponsor"
          ,"Exported"
          ,"LastCallDateUltah"
          ,"tempCallPasien"
          ,"tempCallDate"
          ,"tempCallTime"
          ,"tempCallKet"
          ,"tempNoAutoHistoryCallPasienUltah"
          ,"IDSponsor"
          ,"LokasiFoto"
          ,"NoKTP"
          ,"NamaKTP"
          ,"TempatLahir"
          ,"AlamatKTP"
          ,"TelpKTP"
          ,"Kota"
          ,"KotaKTP"
          ,"KotaSMS"
          ,"StatusLtPack"
          ,"NoDistLtPack"
          ,"IDSponsorLtPack"
          ,"PinBB"
          ,"StatusDiskonPasien"
          ,"TglAuto") VALUES ${pullData.data.data};
      MERGE tblDataPasien AS Target
      USING (SELECT * FROM #tmpDataPasien) AS Source
      ON (Target.NKP = Source.NKP)
      WHEN MATCHED THEN
          UPDATE SET Target.NKP = Source.NKP,
                     Target.NoAuto = Source.NoAuto,
                     Target.TglAwalDaftar = Source.TglAwalDaftar,
                     Target.Nama = Source.Nama,
                     Target.Alamat = Source.Alamat,
                     Target.TelpRumah = Source.TelpRumah,
                     Target.HP = Source.HP,
                     Target.Fax = Source.Fax,
                     Target.TglLahir = Source.TglLahir,
                     Target.NoDist = Source.NoDist,
                     Target.NoSponsor = Source.NoSponsor,
                     Target.Status = Source.Status,
                     Target.Keterangan = Source.Keterangan,
                     Target.TglActivitas = Source.TglActivitas,
                     Target.JamActivitas = Source.JamActivitas,
                     Target.UserEntry = Source.UserEntry,
                     Target.LoginComp = Source.LoginComp,
                     Target.CompName = Source.CompName,
                     Target.PasienLama = Source.PasienLama,
                     Target.Sponsor = Source.Sponsor,
                     Target.Exported = Source.Exported,
                     Target.LastCallDateUltah = Source.LastCallDateUltah,
                     Target.tempCallPasien = Source.tempCallPasien,
                     Target.tempCallDate = Source.tempCallDate,
                     Target.tempCallTime = Source.tempCallTime,
                     Target.tempCallKet = Source.tempCallKet,
                     Target.tempNoAutoHistoryCallPasienUltah = Source.tempNoAutoHistoryCallPasienUltah,
                     Target.IDSponsor = Source.IDSponsor,
                     Target.LokasiFoto = Source.LokasiFoto,
                     Target.NoKTP = Source.NoKTP,
                     Target.NamaKTP = Source.NamaKTP,
                     Target.TempatLahir = Source.TempatLahir,
                     Target.AlamatKTP = Source.AlamatKTP,
                     Target.TelpKTP = Source.TelpKTP,
                     Target.Kota = Source.Kota,
                     Target.KotaKTP = Source.KotaKTP,
                     Target.KotaSMS = Source.KotaSMS,
                     Target.StatusLtPack = Source.StatusLtPack,
                     Target.NoDistLtPack = Source.NoDistLtPack,
                     Target.IDSponsorLtPack = Source.IDSponsorLtPack,
                     Target.PinBB = Source.PinBB,
                     Target.StatusDiskonPasien = Source.StatusDiskonPasien,
                     Target.TglAuto = Source.TglAuto
      WHEN NOT MATCHED BY TARGET THEN
    INSERT (NKP
    ,NoAuto
    ,TglAwalDaftar
    ,Nama
    ,Alamat
    ,TelpRumah
    ,HP
    ,Fax
    ,TglLahir
    ,NoDist
    ,NoSponsor
    ,Status
    ,Keterangan
    ,TglActivitas
    ,JamActivitas
    ,UserEntry
    ,LoginComp
    ,CompName
    ,PasienLama
    ,Sponsor
    ,Exported
    ,LastCallDateUltah
    ,tempCallPasien
    ,tempCallDate
    ,tempCallTime
    ,tempCallKet
    ,tempNoAutoHistoryCallPasienUltah
    ,IDSponsor
    ,LokasiFoto
    ,NoKTP
    ,NamaKTP
    ,TempatLahir
    ,AlamatKTP
    ,TelpKTP
    ,Kota
    ,KotaKTP
    ,KotaSMS
    ,StatusLtPack
    ,NoDistLtPack
    ,IDSponsorLtPack
    ,PinBB
    ,StatusDiskonPasien
    ,TglAuto)
          VALUES (Source.NKP
            ,Source.NoAuto
            ,Source.TglAwalDaftar
            ,Source.Nama
            ,Source.Alamat
            ,Source.TelpRumah
            ,Source.HP
            ,Source.Fax
            ,Source.TglLahir
            ,Source.NoDist
            ,Source.NoSponsor
            ,Source.Status
            ,Source.Keterangan
            ,Source.TglActivitas
            ,Source.JamActivitas
            ,Source.UserEntry
            ,Source.LoginComp
            ,Source.CompName
            ,Source.PasienLama
            ,Source.Sponsor
            ,Source.Exported
            ,Source.LastCallDateUltah
            ,Source.tempCallPasien
            ,Source.tempCallDate
            ,Source.tempCallTime
            ,Source.tempCallKet
            ,Source.tempNoAutoHistoryCallPasienUltah
            ,Source.IDSponsor
            ,Source.LokasiFoto
            ,Source.NoKTP
            ,Source.NamaKTP
            ,Source.TempatLahir
            ,Source.AlamatKTP
            ,Source.TelpKTP
            ,Source.Kota
            ,Source.KotaKTP
            ,Source.KotaSMS
            ,Source.StatusLtPack
            ,Source.NoDistLtPack
            ,Source.IDSponsorLtPack
            ,Source.PinBB
            ,Source.StatusDiskonPasien
            ,Source.TglAuto);
          `);

      // Menandai agar tidak di push kembali
      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpDataPasien" FROM "tblDataPasien";
      INSERT INTO "#tmpDataPasien"
         ("NKP"
          ,"NoAuto"
          ,"TglAwalDaftar"
          ,"Nama"
          ,"Alamat"
          ,"TelpRumah"
          ,"HP"
          ,"Fax"
          ,"TglLahir"
          ,"NoDist"
          ,"NoSponsor"
          ,"Status"
          ,"Keterangan"
          ,"TglActivitas"
          ,"JamActivitas"
          ,"UserEntry"
          ,"LoginComp"
          ,"CompName"
          ,"PasienLama"
          ,"Sponsor"
          ,"Exported"
          ,"LastCallDateUltah"
          ,"tempCallPasien"
          ,"tempCallDate"
          ,"tempCallTime"
          ,"tempCallKet"
          ,"tempNoAutoHistoryCallPasienUltah"
          ,"IDSponsor"
          ,"LokasiFoto"
          ,"NoKTP"
          ,"NamaKTP"
          ,"TempatLahir"
          ,"AlamatKTP"
          ,"TelpKTP"
          ,"Kota"
          ,"KotaKTP"
          ,"KotaSMS"
          ,"StatusLtPack"
          ,"NoDistLtPack"
          ,"IDSponsorLtPack"
          ,"PinBB"
          ,"StatusDiskonPasien"
          ,"TglAuto") VALUES ${pullData.data.data};
      MERGE flagDataPasien AS Target
      USING (SELECT * FROM #tmpDataPasien) AS Source
      ON (Target.flagNKP = Source.NKP)
      WHEN MATCHED THEN
          UPDATE SET Target.flagPush = 1;                  
            `);

      // Memberikan flag di row server kalau sudah di pull data tsb

      const pullFlag = await axios.post(
        `${conf.baseURL}/kartu-pasien/data-pasien/pull/${conf.kodeCabang}`,
        { data: pullData.data.data }
      );

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Pull Data",
        data: pullData.data.data,
      });
    } else {
      res.status(204).json({
        success: true,
        status: 204,
        message: "Belum ada data",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

// Push Data Ke Server
router.put("/", async function (req, res, next) {
  try {
    // Mengecek Apakah Ada Data Terbaru
    const checkData = await sqlkp.query(`
    SELECT TOP 1 flagNKP FROM flagDataPasien WHERE flagDelete = 1;`);

    if (checkData[0]) {
      let key = checkData[0].flagNKP;
      const pushData = await axios.put(
        `${conf.baseURL}/kartu-pasien/data-pasien/push/${conf.kodeCabang}`,
        { data: key }
      );

      const deleteFlag = await sqlkp.execute(
        `DELETE FROM flagDataPasien WHERE flagNKP = '${key}'`
      );

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Push Data",
        data: key,
      });
    } else {
      res.status(204).json({
        success: false,
        status: 204,
        message: "Belum ada data untuk di Push",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});

// Pull Data Dari Server
router.patch("/", async function (req, res, next) {
  try {
    // Mengambil Data (Pull Data)
    const pullData = await axios.patch(
      `${conf.baseURL}/kartu-pasien/data-pasien/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(
        `DELETE FROM tblDataPasien WHERE NKP = '${pullData.data.data}';
         DELETE FROM flagDataPasien WHERE flagNKP = '${pullData.data.data}';`
      );

      const pullFlag = await axios.put(
        `${conf.baseURL}/kartu-pasien/data-pasien/pull/${conf.kodeCabang}`,
        { data: pullData.data.data }
      );

      res.json({
        success: true,
        status: 200,
        message: "Berhasil Pull Data",
        data: pullData.data.data,
      });
    } else {
      res.status(204).json({
        success: true,
        status: 200,
        message: "Belum ada data",
        data: false,
      });
    }
  } catch (error) {
    res.json(error);
    console.error(error);
  }
});
module.exports = router;
