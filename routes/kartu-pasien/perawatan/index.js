const express = require("express");
const axios = require("axios");
const moment = require("moment");
const sqlkp = require("../../../config/sqlkartupasien");
const router = express.Router();
const conf = require("../../../config/main");
const fire = require("../../../config/firebase");

// Listen Apakah ada Brodcast Dari Server
fire
  .database()
  .ref("/kartu-pasien/tblPerawatan")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblPerawatan : ", data);
    axios
      .get(`${conf.appURL}/kartu-pasien/perawatan`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

fire
  .database()
  .ref("/kartu-pasien/tblPerawatan")
  .on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("tblPerawatan : ", data);
    axios
      .patch(`${conf.appURL}/kartu-pasien/perawatan`)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

// pengecekan apakah ada Data Baru
setInterval(function () {
  axios
    .post(`${conf.appURL}/kartu-pasien/perawatan`)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}, 3000);

setInterval(function () {
  axios
    .put(`${conf.appURL}/kartu-pasien/perawatan`)
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
    const checkData = await sqlkp.query(
      `SELECT TOP 100 *FROM tblPerawatan JOIN flagPerawatan ON tblPerawatan.NoAuto = flagPerawatan.flagNoAuto WHERE flagPerawatan.flagPush = 0;`
    );

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
           ${items.Nama == null ? null : `'${items.Nama.replace(/'/g, "''")}'`},
           ${
             items.Alamat == null
               ? null
               : `'${items.Alamat.replace(/'/g, "''")}'`
           },
           ${items.TelpRumah == null ? null : `'${items.TelpRumah}'`},
           ${items.HP == null ? null : `'${items.HP}'`},
           ${
             items.Anamnesa == null
               ? null
               : `'${items.Anamnesa.replace(/'/g, "''")}'`
           },
           ${items.Pagi == null ? null : `'${items.Pagi.replace("'", "''")}'`},
           ${items.Sore == null ? null : `'${items.Sore.replace("'", "''")}'`},
           ${
             items.Malam == null ? null : `'${items.Malam.replace("'", "''")}'`
           },
           ${
             items.Terapy == null
               ? null
               : `'${items.Terapy.replace(/'/g, "''")}'`
           },
           ${
             items.NamaDokterKonsul == null
               ? null
               : `'${items.NamaDokterKonsul.replace(/'/g, "''")}'`
           },
           ${
             items.NamaDokter == null
               ? null
               : `'${items.NamaDokter.replace(/'/g, "''")}'`
           },
           ${
             items.NamaBA == null
               ? null
               : `'${items.NamaBA.replace(/'/g, "''")}'`
           },
           ${
             items.Status == null
               ? null
               : `'${items.Status.replace(/'/g, "''")}'`
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
           ${
             items.Keterangan == null
               ? null
               : `'${items.Keterangan.replace(/'/g, "''")}'`
           }, 
           ${
             items.UserEntry == null
               ? null
               : `'${items.UserEntry.replace(/'/g, "''")}'`
           },
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
           ${
             items.CallKet == null
               ? null
               : `'${items.CallKet.replace(/'/g, "''")}'`
           },
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
        `${conf.baseURL}/kartu-pasien/perawatan/push/${conf.kodeCabang}`,
        { data: dataFinal }
      );

      await sqlkp.execute(`
      SELECT Top 0 * INTO "#tmpPerawatan" FROM "tblPerawatan";
      INSERT INTO "#tmpPerawatan"
      ("NoAuto"
      ,"NKP"
      ,"NoUrutTreatment"
      ,"TglTreatment"
      ,"Nama"
      ,"Alamat"
      ,"TelpRumah"
      ,"HP"
      ,"Anamnesa"
      ,"Pagi"
      ,"Sore"
      ,"Malam"
      ,"Terapy"
      ,"NamaDokterKonsul"
      ,"NamaDokter"
      ,"NamaBA"
      ,"Status"
      ,"TglActivitas"
      ,"JamActivitas"
      ,"Keterangan"
      ,"UserEntry"
      ,"LoginComp"
      ,"CompName"
      ,"PasienLama"
      ,"Exported"
      ,"CallPasien"
      ,"CallDate"
      ,"CallTime"
      ,"CallKet"
      ,"CallPasienResep"
      ,"IDJenisPerawatan"
      ,"TglAuto")  VALUES ${dataFinal};
      MERGE flagPerawatan AS Target
      USING (SELECT * FROM #tmpPerawatan) AS Source
          ON (Target.flagNoAuto = Source.NoAuto)
          WHEN MATCHED THEN
               UPDATE SET Target.flagPush = 1;`);

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
        message: "Belum ada data untuk Push",
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
      `${conf.baseURL}/kartu-pasien/perawatan/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(`
            SELECT Top 0 * INTO "#tmpPerawatan" FROM "tblPerawatan";
            INSERT INTO "#tmpPerawatan"
            ("NoAuto"
            ,"NKP"
            ,"NoUrutTreatment"
            ,"TglTreatment"
            ,"Nama"
            ,"Alamat"
            ,"TelpRumah"
            ,"HP"
            ,"Anamnesa"
            ,"Pagi"
            ,"Sore"
            ,"Malam"
            ,"Terapy"
            ,"NamaDokterKonsul"
            ,"NamaDokter"
            ,"NamaBA"
            ,"Status"
            ,"TglActivitas"
            ,"JamActivitas"
            ,"Keterangan"
            ,"UserEntry"
            ,"LoginComp"
            ,"CompName"
            ,"PasienLama"
            ,"Exported"
            ,"CallPasien"
            ,"CallDate"
            ,"CallTime"
            ,"CallKet"
            ,"CallPasienResep"
            ,"IDJenisPerawatan"
            ,"TglAuto") VALUES ${pullData.data.data};
            MERGE tblPerawatan AS Target
            USING (SELECT * FROM #tmpPerawatan) AS Source
                ON (Target.NoAuto = Source.NoAuto)
                WHEN MATCHED THEN
                  UPDATE SET
                  Target.NKP = Source.NKP,
                  Target.NoUrutTreatment = Source.NoUrutTreatment,
                  Target.TglTreatment = Source.TglTreatment,
                  Target.Nama = Source.Nama,
                  Target.Alamat = Source.Alamat,
                  Target.TelpRumah = Source.TelpRumah,
                  Target.HP = Source.HP,
                  Target.Anamnesa = Source.Anamnesa,
                  Target.Pagi = Source.Pagi,
                  Target.Sore = Source.Sore,
                  Target.Malam = Source.Malam,
                  Target.Terapy = Source.Terapy,
                  Target.NamaDokterKonsul = Source.NamaDokterKonsul,
                  Target.NamaDokter = Source.NamaDokter,
                  Target.NamaBA = Source.NamaBa,
                  Target.Status = Source.Status,
                  Target.TglActivitas = Source.TglActivitas,
                  Target.JamActivitas = Source.JamActivitas,
                  Target.Keterangan = Source.Keterangan,
                  Target.UserEntry = Source.UserEntry,
                  Target.LoginComp = Source.Logincomp,
                  Target.CompName = Source.CompName,
                  Target.PasienLama = Source.PasienLama,
                  Target.Exported = Source.Exported,
                  Target.CallPasien = Source.CallPAsien,
                  Target.CallDate = Source.CallDate,
                  Target.CallTime = Source.CallTime,
                  Target.CallKet = Source.CallKet,
                  Target.CallPasienResep = Source.CallPasienResep,
                  Target.IDJenisPerawatan = Source.IDJenisPerawatan,
                  Target.TglAuto = Source.TglAuto
              WHEN NOT MATCHED BY TARGET THEN
                   INSERT
                   ("NoAuto"
                   ,"NKP"
                   ,"NoUrutTreatment"
                   ,"TglTreatment"
                   ,"Nama"
                   ,"Alamat"
                   ,"TelpRumah"
                   ,"HP"
                   ,"Anamnesa"
                   ,"Pagi"
                   ,"Sore"
                   ,"Malam"
                   ,"Terapy"
                   ,"NamaDokterKonsul"
                   ,"NamaDokter"
                   ,"NamaBA"
                   ,"Status"
                   ,"TglActivitas"
                   ,"JamActivitas"
                   ,"Keterangan"
                   ,"UserEntry"
                   ,"LoginComp"
                   ,"CompName"
                   ,"PasienLama"
                   ,"Exported"
                   ,"CallPasien"
                   ,"CallDate"
                   ,"CallTime"
                   ,"CallKet"
                   ,"CallPasienResep"
                   ,"IDJenisPerawatan"
                   ,"TglAuto")
                    VALUES  (Source.NoAuto
                      ,Source.NKP
                      ,Source.NoUrutTreatment
                      ,Source.TglTreatment
                      ,Source.Nama
                      ,Source.Alamat
                      ,Source.TelpRumah
                      ,Source.HP
                      ,Source.Anamnesa
                      ,Source.Pagi
                      ,Source.Sore
                      ,Source.Malam
                      ,Source.Terapy
                      ,Source.NamaDokterKonsul
                      ,Source.NamaDokter
                      ,Source.NamaBA
                      ,Source.Status
                      ,Source.TglActivitas
                      ,Source.JamActivitas
                      ,Source.Keterangan
                      ,Source.UserEntry
                      ,Source.LoginComp
                      ,Source.CompName
                      ,Source.PasienLama
                      ,Source.Exported
                      ,Source.CallPasien
                      ,Source.CallDate
                      ,Source.CallTime
                      ,Source.CallKet
                      ,Source.CallPasienResep
                      ,Source.IDJenisPerawatan
                      ,Source.TglAuto);
          `);

      // Menandai agar tidak di push kembali
      await sqlkp.execute(`
          SELECT Top 0 * INTO "#tmpPerawatan" FROM "tblPerawatan";
          INSERT INTO "#tmpPerawatan"
          ("NoAuto"
          ,"NKP"
          ,"NoUrutTreatment"
          ,"TglTreatment"
          ,"Nama"
          ,"Alamat"
          ,"TelpRumah"
          ,"HP"
          ,"Anamnesa"
          ,"Pagi"
          ,"Sore"
          ,"Malam"
          ,"Terapy"
          ,"NamaDokterKonsul"
          ,"NamaDokter"
          ,"NamaBA"
          ,"Status"
          ,"TglActivitas"
          ,"JamActivitas"
          ,"Keterangan"
          ,"UserEntry"
          ,"LoginComp"
          ,"CompName"
          ,"PasienLama"
          ,"Exported"
          ,"CallPasien"
          ,"CallDate"
          ,"CallTime"
          ,"CallKet"
          ,"CallPasienResep"
          ,"IDJenisPerawatan"
          ,"TglAuto")  VALUES ${pullData.data.data};
          MERGE flagPerawatan AS Target
          USING (SELECT * FROM #tmpPerawatan) AS Source
              ON (Target.flagNoAuto = Source.NoAuto)
              WHEN MATCHED THEN
                   UPDATE SET Target.flagPush = 1;`);

      // Memberikan flag di row server kalau sudah di pull data tsb

      const pullFlag = await axios.post(
        `${conf.baseURL}/kartu-pasien/perawatan/pull/${conf.kodeCabang}`,
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
    SELECT TOP 1 flagNoAuto FROM flagPerawatan WHERE flagDelete = 1;`);

    if (checkData[0]) {
      let key = checkData[0].flagNoAuto;
      const pushData = await axios.put(
        `${conf.baseURL}/kartu-pasien/perawatan/push/${conf.kodeCabang}`,
        { data: key }
      );

      const deleteFlag = await sqlkp.execute(
        `DELETE FROM flagPerawatan WHERE flagNoAuto = '${key}'`
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
      `${conf.baseURL}/kartu-pasien/perawatan/pull/${conf.kodeCabang}`
    );

    if (pullData.data.data) {
      // Merge Data yanag sudah di pull
      await sqlkp.execute(
        `DELETE FROM tblPerawatan WHERE NoAuto = '${pullData.data.data}';
         DELETE FROM flagPerawatan WHERE flagNoAuto = '${pullData.data.data}';`
      );

      const pullFlag = await axios.put(
        `${conf.baseURL}/kartu-pasien/perawatan/pull/${conf.kodeCabang}`,
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
