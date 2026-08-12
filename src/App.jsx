import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.get("/games")
      .then((res) => setGames(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20, color: "white", background: "#1e1e1e", minHeight: "100vh" }}>
      <h1>👑 KingsDomino</h1>
      <h2>الألعاب</h2>

      {games.map((game) => (
        <div key={game.id}>
          {game.name} - اللاعبين: {game.players} - {game.status}
        </div>
      ))}
    </div>
  );
}
