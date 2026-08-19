using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Chess
{
    public class ChessGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "chess";
            gameNameAr = "الشطرنج الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
