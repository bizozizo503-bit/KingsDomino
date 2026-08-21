using System;
using UnityEngine;

namespace KingsDominos.Games
{
    public abstract class GameBase : MonoBehaviour
    {
        public enum LifecycleState { Created, Initialized, Playing, Completed, Exiting, Cleaned }

        [Header("Game Info")]
        public string gameId;
        public string gameNameAr;
        public LifecycleState State { get; private set; } = LifecycleState.Created;

        public event Action onExitRequested;
        public event Action<GameResult> onGameCompleted;

        protected virtual void Awake() { State = LifecycleState.Initialized; }

        public virtual void StartGame() { State = LifecycleState.Playing; }

        public virtual void HandleMove(string playerId, string moveType, object data) { }

        public virtual bool IsGameOver() => State == LifecycleState.Completed;

        protected void NotifyGameCompleted(GameResult result)
        {
            if (State == LifecycleState.Completed) return;
            State = LifecycleState.Completed;
            onGameCompleted?.Invoke(result);
        }

        public void RequestExit()
        {
            if (State == LifecycleState.Cleaned) return;
            State = LifecycleState.Exiting;
            onExitRequested?.Invoke();
        }

        public virtual void Cleanup() { State = LifecycleState.Cleaned; }
    }
}
