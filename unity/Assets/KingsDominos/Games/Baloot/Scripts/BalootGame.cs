using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Baloot
{
    public class BalootGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "baloot";
            gameNameAr = "البلوت الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
