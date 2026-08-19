using UnityEngine;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games.Domino
{
    public class DominoGame : GameBase
    {
        protected override void Awake()
        {
            base.Awake();
            gameId = "domino";
            gameNameAr = "الدومينو الملكي";
        }

        public override void StartGame()
        {
            Debug.Log("[Domino] Game started");
        }

        public override void HandleMove(string playerId, string action, object data)
        {
            Debug.Log($"[Domino] Move: {playerId} - {action}");
        }

        public override bool IsGameOver() => false;

        public override void Cleanup()
        {
            Debug.Log("[Domino] Cleanup");
        }
    }
}
