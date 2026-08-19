using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Backgammon
{
    public class BackgammonGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "backgammon";
            gameNameAr = "الطاولة الملكية";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
