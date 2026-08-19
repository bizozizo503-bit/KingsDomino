using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Uno
{
    public class UnoGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "uno";
            gameNameAr = "يونو الملكي";
        }

        public override void StartGame() { }
        public override void HandleMove(string playerId, string action, object data) { }
        public override bool IsGameOver() => false;
        public override void Cleanup() { }
    }
}
