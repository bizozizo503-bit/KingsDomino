using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Ludo
{
    public class LudoGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "ludo";
            gameNameAr = "لودو الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
