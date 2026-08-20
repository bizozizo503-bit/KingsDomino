import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👑 ملوك الدومينو</Text>

      <Text style={styles.subtitle}>
        لعبة الدومينو أونلاين
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/room")}
      >
        <Text style={styles.buttonText}>
          دخول اللعبة
        </Text>
      </TouchableOpacity>
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
    fontSize: 34,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 40,
  },

  button: {
    width: "85%",
    backgroundColor: "#2563eb",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});