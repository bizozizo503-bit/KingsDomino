import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { getStoredUser } from "../lib/auth";
import { getSocket } from "../lib/socket";
import {
  Domino,
  getInitialGameState,
  setInitialGameState,
} from "../lib/game-store";

function DominoTile({
  domino,
  selected,
  onPress,
}: {
  domino: Domino;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.domino, selected && styles.selectedDomino]}
    >
      <View style={styles.half}>
        <Text style={styles.pips}>{domino.left}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.half}>
        <Text style={styles.pips}>{domino.right}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface GameOverData {
  winner: string | null;
  blocked: boolean;
  finishReason: string;
  scores: Record<string, number> | null;
  players: string[];
}

export default function GameScreen() {
  const router = useRouter();
  const initial = getInitialGameState();

  const [myId, setMyId] = useState("");
  useEffect(() => {
    getStoredUser().then((user) => {
      if (user) setMyId(user.id);
    });
  }, []);

  const [hand, setHand] = useState<Domino[]>(initial?.hand ?? []);
  const [board, setBoard] = useState<Domino[]>(initial?.board ?? []);
  const [currentPlayer, setCurrentPlayer] = useState(
    initial?.currentPlayer ?? "",
  );
  const [players, setPlayers] = useState<string[]>(initial?.players ?? []);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>(
    initial?.playerNames ?? {},
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("في انتظار اللعبة...");
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);

  const roomCode = initial?.roomCode ?? "";

  const isMyTurn = currentPlayer !== "" && myId !== "" && currentPlayer === myId;

  function playSelected() {
    const socket = getSocket();
    if (!socket || selectedIndex === null || !isMyTurn) return;
    socket.emit("playDomino", { roomCode, tileIndex: selectedIndex });
  }

  useEffect(() => {
    if (!initial) {
      router.replace("/room");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      router.replace("/room");
      return;
    }

    const onDominoPlayed = (data: any) => {
      setBoard(data.board || []);
      setCurrentPlayer(data.currentPlayer || "");

      if (data.tile) {
        setHand((prev) => {
          const removedIndex = selectedIndex;
          if (removedIndex !== null && prev.length > removedIndex) {
            return prev.filter((_, i) => i !== removedIndex);
          }
          return prev.length > data.myHandCount
            ? prev.slice(0, data.myHandCount)
            : prev;
        });
      }
      setSelectedIndex(null);

      if (data.winner || data.blocked) {
        setGameOver({
          winner: data.winner,
          blocked: data.blocked,
          finishReason:
            data.finishReason || (data.blocked ? "blocked" : "normal"),
          scores: data.scores,
          players,
        });
      } else if (data.currentPlayer === myId) {
        setMessage("دورك الآن");
      } else {
        setMessage("دور الخصم...");
      }
    };

    const onGameOver = (data: any) => {
      setGameOver({
        winner: data.winner,
        blocked: data.blocked,
        finishReason: data.finishReason,
        scores: data.scores,
        players: data.players || players,
      });
    };

    const onGameError = (data: any) => {
      setMessage(data?.message || "خطأ في اللعبة");
    };

    socket.on("dominoPlayed", onDominoPlayed);
    socket.on("gameOver", onGameOver);
    socket.on("gameError", onGameError);

    return () => {
      socket.off("dominoPlayed", onDominoPlayed);
      socket.off("gameOver", onGameOver);
      socket.off("gameError", onGameError);
    };
  }, [initial, router, players, myId]);

  const myScore =
    gameOver?.scores && myId ? gameOver.scores[myId] ?? null : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ملوك الدومينو</Text>
        <Text style={styles.roomText}>الغرفة: {roomCode}</Text>
      </View>

      <View style={styles.playersRow}>
        {players.map((playerId) => (
          <View key={playerId} style={styles.player}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {playerId === myId ? "👑" : "🀄"}
              </Text>
            </View>
            <Text style={styles.playerName}>
              {playerNames[playerId] || playerId.slice(0, 8)}
            </Text>
            <Text
              style={[
                styles.playerStatus,
                currentPlayer === playerId && styles.playerStatusActive,
              ]}
            >
              {currentPlayer === playerId ? "يلعب الآن" : "في انتظار"}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.table}>
        <Text style={styles.tableTitle}>طاولة اللعب</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.board}
          showsHorizontalScrollIndicator={false}
        >
          {board.length === 0 ? (
            <View style={styles.emptyBoard}>
              <Text style={styles.emptyIcon}>🀄</Text>
              <Text style={styles.emptyText}>اللعبة تبدأ بوضع أول قطعة</Text>
            </View>
          ) : (
            board.map((domino, index) => (
              <DominoTile key={index} domino={domino} />
            ))
          )}
        </ScrollView>
        <View style={styles.turnBox}>
          <View style={[styles.turnDot, isMyTurn && styles.turnDotActive]} />
          <Text style={styles.turnText}>{message}</Text>
        </View>
      </View>

      <View style={styles.handSection}>
        <Text style={styles.handTitle}>قطعك ({hand.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hand}
        >
          {hand.map((domino, index) => (
            <DominoTile
              key={index}
              domino={domino}
              selected={selectedIndex === index}
              onPress={() => setSelectedIndex(index)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.playButton,
            (!isMyTurn || selectedIndex === null) && styles.disabledButton,
          ]}
          disabled={!isMyTurn || selectedIndex === null}
          onPress={playSelected}
        >
          <Text style={styles.actionText}>
            {isMyTurn ? "🀄 لعب القطعة" : "انتظر دورك"}
          </Text>
        </TouchableOpacity>
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            <Text style={styles.overlayTitle}>
              {gameOver.finishReason === "blocked"
                ? "اللعبة انتهت (توقف)"
                : "🎉 انتهت اللعبة"}
            </Text>
            {gameOver.winner ? (
              <Text style={styles.overlayText}>
                الفائز:{" "}
                {playerNames[gameOver.winner] || gameOver.winner.slice(0, 8)}
              </Text>
            ) : (
              <Text style={styles.overlayText}>لا يوجد فائز (تعادل)</Text>
            )}
            {myScore !== null && (
              <Text style={styles.overlayScore}>
                نقاطك المتبقية: {myScore}
              </Text>
            )}
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => {
                setInitialGameState(null);
                router.replace("/room");
              }}
            >
              <Text style={styles.overlayButtonText}>العودة للغرف</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111f",
    paddingTop: 45,
  },

  header: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#facc15",
    fontSize: 22,
    fontWeight: "bold",
  },

  roomText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
  },

  playersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  player: {
    alignItems: "center",
    width: "30%",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#172235",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },

  avatarText: {
    fontSize: 22,
  },

  playerName: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },

  playerStatus: {
    color: "#64748b",
    fontSize: 10,
  },

  playerStatusActive: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  table: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 5,
    backgroundColor: "#14532d",
    borderRadius: 22,
    borderWidth: 4,
    borderColor: "#92400e",
    overflow: "hidden",
  },

  tableTitle: {
    color: "#fde68a",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
    paddingTop: 10,
  },

  board: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },

  emptyBoard: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  emptyText: {
    color: "#bbf7d0",
    fontSize: 15,
  },

  turnBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#052e16",
  },

  turnDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#64748b",
    marginRight: 7,
  },

  turnDotActive: {
    backgroundColor: "#22c55e",
  },

  turnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  handSection: {
    paddingTop: 10,
  },

  handTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    paddingHorizontal: 15,
    marginBottom: 7,
  },

  hand: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },

  domino: {
    width: 54,
    height: 82,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDomino: {
    borderColor: "#facc15",
    borderWidth: 4,
    transform: [{ translateY: -7 }],
  },

  half: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    width: "75%",
    height: 2,
    backgroundColor: "#334155",
  },

  pips: {
    color: "#111827",
    fontSize: 21,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 15,
    paddingTop: 5,
  },

  playButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.35,
  },

  actionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  overlayBox: {
    backgroundColor: "#1f2937",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },

  overlayTitle: {
    color: "#facc15",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  overlayText: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 6,
  },

  overlayScore: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 12,
  },

  overlayButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },

  overlayButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});