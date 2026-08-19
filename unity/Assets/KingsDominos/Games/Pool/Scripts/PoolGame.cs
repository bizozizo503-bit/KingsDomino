using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Pool
{
    public class PoolGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "pool";
            gameNameAr = "البلياردو الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
