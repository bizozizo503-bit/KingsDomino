import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type Domino = {
  id: number;
  left: number;
  right: number;
};

const INITIAL_DOMINOES: Domino[] = [
  { id: 1, left: 6, right: 6 },
  { id: 2, left: 6, right: 5 },
  { id: 3, left: 5, right: 4 },
  { id: 4, left: 4, right: 3 },
  { id: 5, left: 3, right: 2 },
  { id: 6, left: 2, right: 1 },
  { id: 7, left: 1, right: 0 },
];

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

export default function Game() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    roomCode?: string;
    playerName?: string;
  }>();

  const roomCode = String(params.roomCode || "------");
  const playerName = String(params.playerName || "Player");

  const [hand, setHand] = useState<Domino[]>(INITIAL_DOMINOES);
  const [board, setBoard] = useState<Domino[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("دورك الآن");

  const selectedDomino = useMemo(
    () => hand.find((item) => item.id === selectedId),
    [hand, selectedId]
  );

  function playDomino(domino: Domino) {
    setBoard((current) => [...current, domino]);
    setHand((current) => current.filter((item) => item.id !== domino.id));
    setSelectedId(null);
    setMessage("تم لعب القطعة • الدور التالي");
  }

  function drawDomino() {
    const newId = Date.now();

    const newDomino: Domino = {
      id: newId,
      left: Math.floor(Math.random() * 7),
      right: Math.floor(Math.random() * 7),
    };

    setHand((current) => [...current, newDomino]);
    setMessage("سحبت قطعة جديدة");
  }

  function passTurn() {
    setSelectedId(null);
    setMessage("تم تمرير الدور");
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>ملوك الدومينو</Text>
          <Text style={styles.roomText}>الغرفة: {roomCode}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>النقاط</Text>
          <Text style={styles.score}>0</Text>
        </View>
      </View>

      {/* Players */}
      <View style={styles.playersRow}>
        <View style={styles.player}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👑</Text>
          </View>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.playerStatus}>أنت</Text>
        </View>

        <View style={styles.player}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <Text style={styles.playerName}>لاعب 2</Text>
          <Text style={styles.playerStatus}>متصل</Text>
        </View>

        <View style={styles.player}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <Text style={styles.playerName}>لاعب 3</Text>
          <Text style={styles.playerStatus}>متصل</Text>
        </View>

        <View style={styles.player}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <Text style={styles.playerName}>لاعب 4</Text>
          <Text style={styles.playerStatus}>متصل</Text>
        </View>
      </View>

      {/* Table */}
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
              <Text style={styles.emptyText}>ابدأ اللعب بوضع أول قطعة</Text>
            </View>
          ) : (
            board.map((domino) => (
              <DominoTile key={domino.id} domino={domino} />
            ))
          )}
        </ScrollView>

        <View style={styles.turnBox}>
          <View style={styles.turnDot} />
          <Text style={styles.turnText}>{message}</Text>
        </View>
      </View>

      {/* Hand */}
      <View style={styles.handSection}>
        <Text style={styles.handTitle}>
          قطعك ({hand.length})
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hand}
        >
          {hand.map((domino) => (
            <DominoTile
              key={domino.id}
              domino={domino}
              selected={selectedId === domino.id}
              onPress={() => setSelectedId(domino.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.playButton,
            !selectedDomino && styles.disabledButton,
          ]}
          disabled={!selectedDomino}
          onPress={() => {
            if (selectedDomino) {
              playDomino(selectedDomino);
            }
          }}
        >
          <Text style={styles.actionText}>🀄 لعب القطعة</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawButton} onPress={drawDomino}>
          <Text style={styles.actionText}>سحب</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.passButton} onPress={passTurn}>
          <Text style={styles.actionText}>تمرير</Text>
        </TouchableOpacity>
      </View>
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
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#172235",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#ffffff",
    fontSize: 36,
    lineHeight: 40,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
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

  scoreBox: {
    backgroundColor: "#172235",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },

  scoreLabel: {
    color: "#94a3b8",
    fontSize: 10,
  },

  score: {
    color: "#facc15",
    fontSize: 20,
    fontWeight: "bold",
  },

  playersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  player: {
    alignItems: "center",
    width: "24%",
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
    color: "#22c55e",
    fontSize: 10,
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
    backgroundColor: "#22c55e",
    marginRight: 7,
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
    gap: 8,
  },

  playButton: {
    flex: 1.5,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  drawButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  passButton: {
    flex: 1,
    backgroundColor: "#475569",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.35,
  },

  actionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});