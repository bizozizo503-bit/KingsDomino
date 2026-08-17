const { io } = require("socket.io-client");

const token1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NTA3ZmRlYS1jODViLTRkZjEtOGJmMi01NTM5YTNjNTM2NjkiLCJ1c2VybmFtZSI6InRlc3QxMjM0NSIsImlhdCI6MTc4Njk5NjY3MCwiZXhwIjoxNzg2OTk3NTcwfQ.QsszTXFWEGLSQB-5lKyHZfQFK6wpSKTFtioBmCcw9zw";
const token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjMGM5OTNjMi1lZDlhLTQ1N2UtYjlhZC01NGRiMDgzNzE5NGUiLCJ1c2VybmFtZSI6IndzX3Rlc3RfcDIiLCJpYXQiOjE3ODY5OTY2OTgsImV4cCI6MTc4Njk5NzU5OH0.MGnPWaET5vayKY-PpJUYRiUid5RwMRQGyUf7vWeL-AI";

const http = require("http");

function post(path, token, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);

    const req = http.request({
      hostname: "localhost",
      port: 3000,
      path,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    }, res => {
      let chunks = "";
      res.on("data", c => chunks += c);
      res.on("end", () => {
        try {
          resolve(JSON.parse(chunks));
        } catch {
          reject(new Error(chunks));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("========================================");
  console.log(" KingsDomino WebSocket Smoke Test");
  console.log("========================================");

  // إنشاء غرفة جديدة بالـ REST
  const room = await post("/api/rooms", token1, { players: 2 });

  console.log("[REST] Room created:", room.code);

  const roomCode = room.code;

  const p1 = io("http://localhost:3000", {
    transports: ["websocket"],
    auth: { token: token1 }
  });

  const p2 = io("http://localhost:3000", {
    transports: ["websocket"],
    auth: { token: token2 }
  });

  let p1Started = null;
  let p2Started = null;
  let p1Played = false;
  let p2Played = false;
  let chatReceived1 = false;
  let chatReceived2 = false;
  let badTurnRejected = false;

  p1.on("connect", () => {
    console.log("[P1] CONNECTED", p1.id);

    p1.emit("joinRoom", {
      roomCode,
      name: "WS Player 1"
    });
  });

  p2.on("connect", () => {
    console.log("[P2] CONNECTED", p2.id);

    p2.emit("joinRoom", {
      roomCode,
      name: "WS Player 2"
    });
  });

  p1.on("roomUpdated", room => {
    console.log(
      "[P1] roomUpdated:",
      room.players.length + "/" + room.maxPlayers,
      "status=" + room.status
    );

    if (room.players.length === 2 && room.status === "waiting") {
      console.log("[P1] Starting game...");
      p1.emit("startGame", { roomCode });
    }
  });

  p2.on("roomUpdated", room => {
    console.log(
      "[P2] roomUpdated:",
      room.players.length + "/" + room.maxPlayers,
      "status=" + room.status
    );
  });

  p1.on("gameStarted", data => {
    p1Started = data;

    console.log("[P1] gameStarted");
    console.log(
      "[P1] hand:",
      data.hand.length,
      "currentPlayer:",
      data.currentPlayer
    );

    tryPlay();
  });

  p2.on("gameStarted", data => {
    p2Started = data;

    console.log("[P2] gameStarted");
    console.log(
      "[P2] hand:",
      data.hand.length,
      "currentPlayer:",
      data.currentPlayer
    );

    tryPlay();
  });

  // أخطاء WebSocket
  p1.on("gameError", data => {
    console.log("[P1] gameError:", data.message);

    if (data.message === "ليس دورك الآن") {
      badTurnRejected = true;
      console.log("[PASS] NOT_YOUR_TURN rejected correctly");
    }
  });

  p2.on("gameError", data => {
    console.log("[P2] gameError:", data.message);

    if (data.message === "ليس دورك الآن") {
      badTurnRejected = true;
      console.log("[PASS] NOT_YOUR_TURN rejected correctly");
    }
  });

  // استقبال اللعب
  p1.on("dominoPlayed", data => {
    console.log(
      "[P1] dominoPlayed:",
      "board=" + data.board.length,
      "currentPlayer=" + data.currentPlayer,
      "myHandCount=" + data.myHandCount
    );

    p1Played = true;

    if (data.currentPlayer) {
      setTimeout(() => trySecondPlay(data), 300);
    }
  });

  p2.on("dominoPlayed", data => {
    console.log(
      "[P2] dominoPlayed:",
      "board=" + data.board.length,
      "currentPlayer=" + data.currentPlayer,
      "myHandCount=" + data.myHandCount
    );

    p2Played = true;

    if (data.currentPlayer) {
      setTimeout(() => finishTest(), 500);
    }
  });

  // Chat
  p1.on("chat", data => {
    console.log("[P1] chat:", data.name + ":", data.message);
    chatReceived1 = true;
  });

  p2.on("chat", data => {
    console.log("[P2] chat:", data.name + ":", data.message);
    chatReceived2 = true;
  });

  function tryPlay() {
    if (!p1Started || !p2Started) return;

    const current = p1Started.currentPlayer;

    console.log("[GAME] Current player:", current);

    // اللاعب غير صاحب الدور يحاول اللعب أولاً
    if (current === p1Started.players[0]) {
      console.log("[TEST] P2 attempts out-of-turn play");
      p2.emit("playDomino", {
        roomCode,
        tileIndex: 0
      });
    } else {
      console.log("[TEST] P1 attempts out-of-turn play");
      p1.emit("playDomino", {
        roomCode,
        tileIndex: 0
      });
    }

    // بعد اختبار رفض الدور، اللاعب الصحيح سيلعب
    setTimeout(() => {
      if (current === p1Started.players[0]) {
        console.log("[TEST] P1 plays tileIndex 0");
        p1.emit("playDomino", {
          roomCode,
          tileIndex: 0
        });
      } else {
        console.log("[TEST] P2 plays tileIndex 0");
        p2.emit("playDomino", {
          roomCode,
          tileIndex: 0
        });
      }
    }, 700);
  }

  function trySecondPlay(data) {
    // نرسل chat بعد أول حركة
    p1.emit("chat", {
      roomCode,
      message: "اختبار WebSocket ناجح"
    });

    // الطرف الذي أصبح دوره يلعب أول قطعة من يده
    if (data.currentPlayer === p2Started?.players?.[1]) {
      console.log("[TEST] P2 plays after P1");
      p2.emit("playDomino", {
        roomCode,
        tileIndex: 0
      });
    } else if (data.currentPlayer === p2Started?.players?.[0]) {
      console.log("[TEST] P2 plays after P1");
      p2.emit("playDomino", {
        roomCode,
        tileIndex: 0
      });
    }
  }

  async function finishTest() {
    await wait(1000);

    console.log("");
    console.log("========================================");
    console.log(" WebSocket TEST RESULTS");
    console.log("========================================");

    console.log(
      "[RESULT]",
      "P1 connected:",
      p1.connected ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "P2 connected:",
      p2.connected ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "P1 gameStarted:",
      p1Started ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "P2 gameStarted:",
      p2Started ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "Out-of-turn rejection:",
      badTurnRejected ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "P1 dominoPlayed:",
      p1Played ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "Chat P1:",
      chatReceived1 ? "PASS" : "FAIL"
    );

    console.log(
      "[RESULT]",
      "Chat P2:",
      chatReceived2 ? "PASS" : "FAIL"
    );

    console.log("========================================");

    p1.disconnect();
    p2.disconnect();

    process.exit(
      badTurnRejected &&
      p1Started &&
      p2Started &&
      p1Played &&
      chatReceived1 &&
      chatReceived2
        ? 0
        : 1
    );
  }

  setTimeout(() => {
    console.log("[TIMEOUT] WebSocket test timed out");
    p1.disconnect();
    p2.disconnect();
    process.exit(1);
  }, 15000);
}

main().catch(err => {
  console.error("[FATAL]", err);
  process.exit(1);
});
