import { useState } from "react";
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
import { saveAuth, getStoredToken, getStoredUser } from "../lib/auth";

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      setMessage("");

      if (!username.trim() || !password) {
        setMessage("أدخل اسم المستخدم وكلمة المرور");
        return;
      }

      const url =
        mode === "login" ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;

      const payload =
        mode === "login"
          ? { username: username.trim(), password }
          : {
              username: username.trim(),
              password,
              email: email.trim() || undefined,
              display_name: username.trim(),
            };

      const res = await axios.post(url, payload);
      const { access_token, user } = res.data;

      await saveAuth(access_token, { id: user.id, username: user.username });

      const storedToken = await getStoredToken();
      const storedUser = await getStoredUser();
      if (storedToken && storedUser) {
        router.replace("/room");
      }
    } catch (error: any) {
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "خطأ في الاتصال بالسيرفر";
      setMessage(String(detail));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👑 ملوك الدومينو</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === "login" && styles.tabActive]}
          onPress={() => setMode("login")}
        >
          <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
            تسجيل الدخول
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === "register" && styles.tabActive]}
          onPress={() => setMode("register")}
        >
          <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
            حساب جديد
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="اسم المستخدم"
        placeholderTextColor="#6b7280"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loading}
      />

      {mode === "register" && (
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني (اختياري)"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "login" ? "دخول" : "إنشاء حساب"}
          </Text>
        )}
      </TouchableOpacity>

      {message !== "" && <Text style={styles.message}>{message}</Text>}
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#facc15",
    marginBottom: 30,
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    width: "90%",
    backgroundColor: "#1f2937",
    borderRadius: 12,
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    padding: 14,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#2563eb",
  },

  tabText: {
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: "bold",
  },

  tabTextActive: {
    color: "#ffffff",
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
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  disabled: {
    opacity: 0.5,
  },

  buttonText: {
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
});