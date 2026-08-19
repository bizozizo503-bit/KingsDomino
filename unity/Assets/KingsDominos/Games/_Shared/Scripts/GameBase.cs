using UnityEngine;

namespace KingsDominos.Games.Shared
{
    public abstract class GameBase : MonoBehaviour
    {
        [Header("Game Info")]
        [SerializeField] protected string gameId;
        [SerializeField] protected string gameNameAr;

        public string GameId => gameId;
        public string GameNameAr => gameNameAr;

        protected string _sessionId;
        protected string _localPlayerId;

        public virtual void Initialize(string sessionId, string localPlayerId)
        {
            _sessionId = sessionId;
            _localPlayerId = localPlayerId;
        }

        public abstract void StartGame();
        public abstract void HandleMove(string playerId, string action, object data);
        public abstract bool IsGameOver();
        public abstract void Cleanup();
    }
}
