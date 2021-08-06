const app = require("express")();
const next = require("next");
const cors = require("cors");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandle = nextApp.getRequestHandler();
const moment = require("moment");
const jamIndo = require("moment/locale/id");
process.env.NTBA_FIX_319 = 1;

app.use(cors());

const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = "1826120694:AAH8K6MZExoGhvIRB-5MdSDf6L5MKKCM44s";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `test`);
  bot.sendMessage("-532926021", `ini dari ID`);
});

nextApp.prepare().then(() => {
  const server = require("http").Server(app);
  const io = require("socket.io")(server);
  let listIP = [];
  let listClient = [];

  io.on("connect", (socket) => {
    var address = socket.handshake.headers;
    const ip =
      socket.handshake.headers["x-forwarded-for"] ||
      socket.conn.remoteAddress.split(":")[3];

    if (ip && listIP.find((element) => element == ip) == undefined) {
      listIP.push(ip);
    }

    let clientName = socket.handshake.headers.clientname;

    if (
      clientName &&
      listClient.find((element) => element == clientName) == undefined
    ) {
      listClient.push(clientName);
    }

    if (clientName == "SERVER-JK2") {
      bot.sendMessage(
        "@lvnotify",
        ` 
          🔥Conn🔥 ${moment().locale("id", jamIndo).format("LLL")}
          =========================
          Server => ${ip} 
          Jakarta SIMPRUG 
          Telah Connect ✅
          =========================
          Daftar Connect :
          🎟️ => ${listIP}
          =========================
          `
      );
    } else if (ip == "SERVER-JK1") {
      bot.sendMessage(
        "@lvnotify",
        `
        🔥Conn🔥 ${moment().locale("id", jamIndo).format("LLL")}
        =========================
        Server => ${ip} 
        Jakarta PIK
        Telah Connect ✅
        =========================
        Daftar Connect :
        🎟️ => ${listIP}
        =========================
        `
      );
    }

    io.emit("some event", {
      connect: "true",
      list: listClient,
    });

    console.log(listClient);
    socket.on("disconnect", async function () {
      if (ip) {
        for (var i = 0; i < listIP.length; i++) {
          if (listIP[i] === ip) {
            listIP.splice(listIP.indexOf(ip), 1);
          }
        }
      }

      if (clientName == "SERVER-JK2") {
        bot.sendMessage(
          "@lvnotify",
          `
          ❄️DC❄️ ${moment().locale("id", jamIndo).format("LLL")}
          ============================
          Server => ${ip} 
          Jakarta SIMPRUG 
          Telah Disconnect ❌
          ============================
          Daftar Connect :
          🎟️ => ${listIP}
          ============================
          `
        );
      } else if (clientName == "SERVER-JK1") {
        bot.sendMessage(
          "@lvnotify",
          `❄️DC❄️ ${moment().locale("id", jamIndo).format("LLL")}
          ============================
          Server => ${ip} 
          Jakarta PIK 
          Telah Disconnect ❌
          ============================
          Daftar Connect :
          🎟️ => ${listIP}
          ============================`
        );
      }

      io.emit("some event", {
        connect: "true",
        list: listClient,
      });
    });
  });

  app.get("*", (req, res) => {
    return nextHandle(req, res);
  });

  app.post("*", (req, res) => {
    return nextHandle(req, res);
  });

  app.put("*", (req, res) => {
    return nextHandle(req, res);
  });

  app.patch("*", (req, res) => {
    return nextHandle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
