using UnityEngine;

namespace KingsDominos.Games
{
    public abstract class GameBase : MonoBehaviour
    {
        [Header("Game Info")]
        public string gameId;
        public string gameNameAr;


        protected virtual void Awake()
        {
            
        }


        public virtual void StartGame()
        {
            Debug.Log($"{gameNameAr} Started");
        }


        public virtual void HandleMove(
            string playerId,
            string moveType,
            object data)
        {
            Debug.Log($"Move: {moveType}");
        }


        public virtual bool IsGameOver()
        {
            return false;
        }


        public virtual void Cleanup()
        {
            Debug.Log($"{gameNameAr} Cleanup");
        }
    }
}