import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";

export default function JoinRoom() {

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function joinRoom() {

    try {

      const res = await axios.post(
        "http://192.168.1.2:3000/rooms/join",
        {
          code: code,
          playerName: name || "Player",
        }
      );


      if (res.data.success) {
        setRoom(res.data.room);
        setMessage("تم الدخول للغرفة ✅");
      } else {
        setMessage(res.data.message);
      }


    } catch (error) {

      console.log(error);
      setMessage("حدث خطأ في الاتصال");

    }

  }


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        👑 دخول غرفة
      </Text>


      <TextInput
        style={styles.input}
        placeholder="اسمك"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />


      <TextInput
        style={styles.input}
        placeholder="كود الغرفة"
        placeholderTextColor="#999"
        value={code}
        onChangeText={setCode}
      />


      <TouchableOpacity
        style={styles.button}
        onPress={joinRoom}
      >

        <Text style={styles.buttonText}>
          دخول
        </Text>

      </TouchableOpacity>


      <Text style={styles.result}>
        {message}
      </Text>


      {room && (
        <View>

          <Text style={styles.result}>
            المضيف: {room.host}
          </Text>

          <Text style={styles.result}>
            اللاعبين: {room.players.join(", ")}
          </Text>

        </View>
      )}


    </View>

  );

}



const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#111827",
alignItems:"center",
justifyContent:"center",
padding:20
},

title:{
fontSize:32,
fontWeight:"bold",
color:"#facc15",
marginBottom:30
},

input:{
width:"90%",
backgroundColor:"#fff",
padding:15,
borderRadius:10,
marginBottom:15
},

button:{
width:"90%",
backgroundColor:"#2563eb",
padding:18,
borderRadius:15,
alignItems:"center"
},

buttonText:{
color:"#fff",
fontSize:20,
fontWeight:"bold"
},

result:{
color:"#fff",
fontSize:18,
marginTop:20,
textAlign:"center"
}

});