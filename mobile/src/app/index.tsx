import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getStoredToken } from "../lib/auth";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getStoredToken().then((token) => {
      if (token) {
        router.replace("/room");
      } else {
        router.replace("/auth");
      }
      setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
});