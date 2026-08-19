using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Bingo
{
    public class BingoGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "bingo";
            gameNameAr = "البينجو الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
