import { View, Text, StyleSheet } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        👑 ملوك الدومينو
      </Text>

      <Text style={styles.sub}>
        قريباً سيتم إضافة الألعاب والميزات
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#111827",
    justifyContent:"center",
    alignItems:"center"
  },

  text:{
    color:"#facc15",
    fontSize:30,
    fontWeight:"bold"
  },

  sub:{
    color:"#fff",
    fontSize:18,
    marginTop:20
  }
});