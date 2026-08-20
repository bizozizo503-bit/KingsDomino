import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const API = "http://192.168.1.2:3000";

type RoomData = {
  id: string;
  code: string;
  host: string;
  players: string[];
  started: boolean;
  maxPlayers: number;
  createdAt: string;
};

export default function Room() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<RoomData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openGame(roomData: RoomData, playerName: string) {
    router.push({
      pathname: "/game",
      params: {
        roomCode: String(roomData.code),
        playerName: String(playerName || "Player"),
      },
    });
  }

  async function createRoom() {
    try {
      setLoading(true);
      setMessage("جاري إنشاء الغرفة...");

      const playerName = name.trim() || "Zizo";

      const res = await axios.post(`${API}/rooms`, {
        name: playerName,
        players: 4,
      });

      const serverRoom = res.data;

      // لاعبين وهميين للاختبار
      const testRoom: RoomData = {
        ...serverRoom,
        players: [
          playerName,
          "Ahmed",
          "Mohamed",
          "Soso",
        ],
        started: false,
        maxPlayers: 4,
      };

      setRoom(testRoom);
      setCode(testRoom.code);
      setName(playerName);

      setMessage("تم إنشاء الغرفة ✅ يوجد 4 لاعبين للاختبار");
    } catch (error: any) {
      console.log(
        "CREATE ERROR",
        error?.response?.data || error
      );

      setMessage("خطأ في إنشاء الغرفة أو الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    try {
      setLoading(true);
      setMessage("جاري الدخول...");

      const playerName = name.trim() || "Player";
      const roomCode = code.trim().toLowerCase();

      if (!roomCode) {
        setMessage("اكتب كود الغرفة أولًا");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${API}/rooms/join`, {
        code: roomCode,
        playerName,
      });

      if (res.data.success) {
        setRoom(res.data.room);
        setMessage("تم الدخول للغرفة ✅");
      } else {
        setMessage(
          res.data.message || "تعذر الدخول للغرفة"
        );
      }
    } catch (error: any) {
      console.log(
        "JOIN ERROR",
        error?.response?.data || error
      );

      setMessage(
        error?.response?.data?.message ||
          "خطأ في الدخول أو الاتصال بالسيرفر"
      );
    } finally {
      setLoading(false);
    }
  }

  function startGame() {
    if (!room) {
      setMessage("أنشئ أو ادخل غرفة أولًا");
      return;
    }

    const playerName = name.trim() || "Player";

    if (room.players.length < 2) {
      setMessage("يجب وجود لاعبين على الأقل");
      return;
    }

    // نعتبر الغرفة بدأت محليًا للاختبار
    const startedRoom: RoomData = {
      ...room,
      started: true,
    };

    setRoom(startedRoom);
    setMessage("بدأت اللعبة 🎉");

    // فتح شاشة اللعبة مباشرة
    setTimeout(() => {
      openGame(startedRoom, playerName);
    }, 300);
  }

  function enterGame() {
    if (!room) {
      setMessage("لا توجد غرفة");
      return;
    }

    const playerName = name.trim() || "Player";

    openGame(room, playerName);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        👑 ملوك الدومينو
      </Text>

      <TextInput
        style={styles.input}
        placeholder="اسم اللاعب"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabled,
        ]}
        onPress={createRoom}
        disabled={loading}
      >
        <Text style={styles.text}>
          إنشاء غرفة
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="كود الغرفة"
        placeholderTextColor="#6b7280"
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabled,
        ]}
        onPress={joinRoom}
        disabled={loading}
      >
        <Text style={styles.text}>
          دخول غرفة
        </Text>
      </TouchableOpacity>

      {room && (
        <View style={styles.roomBox}>
          <Text style={styles.info}>
            الكود: {room.code}
          </Text>

          <Text style={styles.info}>
            المضيف: {room.host}
          </Text>

          <Text style={styles.info}>
            اللاعبين:
          </Text>

          {room.players?.map((player, index) => (
            <Text
              key={index}
              style={styles.player}
            >
              {index + 1}. {player}
              {index === 0 ? " 👑" : ""}
            </Text>
          ))}

          <Text style={styles.info}>
            العدد: {room.players?.length || 0}/
            {room.maxPlayers}
          </Text>

          <Text style={styles.status}>
            {room.started
              ? "اللعبة بدأت 🎮"
              : "الغرفة جاهزة للبدء ⏳"}
          </Text>
        </View>
      )}

      {room && !room.started && (
        <TouchableOpacity
          style={[
            styles.startButton,
            loading && styles.disabled,
          ]}
          onPress={startGame}
          disabled={loading}
        >
          <Text style={styles.text}>
            🎮 بدء لعبة الدومينو
          </Text>
        </TouchableOpacity>
      )}

      {room?.started && (
        <TouchableOpacity
          style={styles.gameButton}
          onPress={enterGame}
          disabled={loading}
        >
          <Text style={styles.text}>
            🎲 دخول اللعبة
          </Text>
        </TouchableOpacity>
      )}

      {message !== "" && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    color: "#facc15",
    fontWeight: "bold",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#ffffff",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: "#111827",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2563eb",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  startButton: {
    backgroundColor: "#059669",
    width: "90%",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  gameButton: {
    backgroundColor: "#7c3aed",
    width: "90%",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  message: {
    color: "#ffffff",
    fontSize: 17,
    margin: 15,
    textAlign: "center",
  },

  roomBox: {
    width: "90%",
    backgroundColor: "#1f2937",
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
  },

  info: {
    color: "#facc15",
    fontSize: 17,
    marginVertical: 4,
  },

  player: {
    color: "#ffffff",
    fontSize: 16,
    marginVertical: 3,
  },

  status: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
});