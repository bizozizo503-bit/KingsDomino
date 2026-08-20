import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_URL } from "../lib/api";
import { getStoredToken, getStoredUser } from "../lib/auth";
import { connectSocket, getSocket, disconnectSocket } from "../lib/socket";
import { setInitialGameState } from "../lib/game-store";

interface RoomData {
  code: string;
  host: string;
  players: string[];
  playerNames: Record<string, string>;
  maxPlayers: number;
  status: string;
  started: boolean;
}

export default function RoomScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<RoomData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function ensureAuth() {
    const token = await getStoredToken();
    const user = await getStoredUser();
    if (!token || !user) {
      router.replace("/auth");
      return null;
    }
    return { token, user };
  }

  function connectAndJoin(roomCode: string, playerName: string) {
    const socket = getSocket();
    if (!socket) {
      setMessage("تعذر الاتصال بالسيرفر");
      return;
    }

    socket.emit("joinRoom", { roomCode, name: playerName });

    socket.on("roomUpdated", (data: RoomData) => {
      setRoom(data);
    });

    socket.on("gameStarted", (data) => {
      setInitialGameState({
        roomCode: data.roomCode,
        hand: data.hand,
        currentPlayer: data.currentPlayer,
        board: data.board,
        players: data.players,
        playerNames: data.playerNames,
      });
      router.replace({
        pathname: "/game",
        params: { roomCode, playerName },
      });
    });

    socket.on("gameError", (data) => {
      setMessage(data?.message || "خطأ في الغرفة");
    });
  }

  async function createRoom() {
    try {
      const auth = await ensureAuth();
      if (!auth) return;

      setLoading(true);
      setMessage("جاري إنشاء الغرفة...");

      const playerName = name.trim() || auth.user.username;

      const res = await axios.post(
        `${API_URL}/api/rooms`,
        { players: 2, name: playerName },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      const serverRoom: RoomData = res.data;
      setCode(serverRoom.code);
      setName(playerName);

      connectAndJoin(serverRoom.code, playerName);
      setMessage("تم إنشاء الغرفة، انتظر اللاعب الثاني...");
    } catch (error: any) {
      console.log("CREATE ERROR", error?.response?.data || error);
      setMessage("خطأ في إنشاء الغرفة أو الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    try {
      const auth = await ensureAuth();
      if (!auth) return;

      const roomCode = code.trim().toLowerCase();
      if (!roomCode) {
        setMessage("اكتب كود الغرفة أولًا");
        return;
      }

      setLoading(true);
      setMessage("جاري الدخول...");

      const playerName = name.trim() || auth.user.username;

      await axios.post(
        `${API_URL}/api/rooms/${roomCode}/join`,
        { name: playerName },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      connectAndJoin(roomCode, playerName);
      setMessage("تم الدخول للغرفة، انتظر بدء اللعبة...");
    } catch (error: any) {
      console.log("JOIN ERROR", error?.response?.data || error);
      setMessage(
        error?.response?.data?.message || "خطأ في الدخول أو الاتصال بالسيرفر",
      );
    } finally {
      setLoading(false);
    }
  }

  function startGame() {
    const socket = getSocket();
    if (!socket || !room) {
      setMessage("الاتصال غير متاح");
      return;
    }
    socket.emit("startGame", { roomCode: room.code });
  }

  function leaveRoom() {
    const socket = getSocket();
    if (socket && room) {
      socket.emit("leaveRoom", { roomCode: room.code });
    }
    disconnectSocket();
    router.replace("/auth");
  }

  useEffect(() => {
    const socket = getSocket();
    if (socket) socket.removeAllListeners();
    return () => {
      const s = getSocket();
      if (s) s.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const auth = await ensureAuth();
      if (!auth || cancelled) return;

      const token = auth.token;
      const socket = connectSocket(token);
      socket.on("connect", () => {
        setMessage("متصل بالسيرفر ✅");
      });
      socket.on("disconnect", () => {
        setMessage("تم قطع الاتصال بالسيرفر");
      });
      socket.on("connect_error", () => {
        setMessage("فشل الاتصال بالسيرفر");
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const players = room?.players || [];
  const isHost = room?.host && true;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👑 ملوك الدومينو</Text>

      <TextInput
        style={styles.input}
        placeholder="اسم اللاعب"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={createRoom}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>إنشاء غرفة (2 لاعبين)</Text>}
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
        style={[styles.button, loading && styles.disabled]}
        onPress={joinRoom}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>دخول غرفة</Text>}
      </TouchableOpacity>

      {room && (
        <View style={styles.roomBox}>
          <Text style={styles.info}>الكود: {room.code}</Text>
          <Text style={styles.info}>اللاعبون: {players.length}/{room.maxPlayers}</Text>
          {players.map((playerId) => (
            <Text key={playerId} style={styles.player}>
              • {room.playerNames?.[playerId] || playerId.slice(0, 8)}
              {playerId === room.host ? " 👑" : ""}
            </Text>
          ))}
        </View>
      )}

      {room && !room.started && (
        <TouchableOpacity
          style={[styles.startButton, loading && styles.disabled]}
          onPress={startGame}
          disabled={loading}
        >
          <Text style={styles.text}>🎮 بدء اللعبة</Text>
        </TouchableOpacity>
      )}

      {room && (
        <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
          <Text style={styles.text}>مغادرة الغرفة</Text>
        </TouchableOpacity>
      )}

      {message !== "" && <Text style={styles.message}>{message}</Text>}

      {isHost ? null : null}
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
    marginTop: 10,
  },

  leaveButton: {
    backgroundColor: "#7c3aed",
    width: "90%",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
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
    fontSize: 16,
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
});