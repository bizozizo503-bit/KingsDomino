using System;
using UnityEngine;
using KingsDominos;
using KingsDominos.UI;

namespace KingsDominos.Games
{
    public sealed class GameLoader : Singleton<GameLoader>
    {
        public enum LoaderState { Lobby, Loading, Playing, Returning }
        public LoaderState State { get; private set; } = LoaderState.Lobby;
        public GameBase CurrentGame { get; private set; }
        public string CurrentGameId { get; private set; }

        public bool LoadGame(string gameId)
        {
            if (State != LoaderState.Lobby) return false;
            var definition = GameRegistry.Instance?.Get(gameId);
            if (definition == null || !definition.IsPlayable) return false;
            var type = GameRegistry.Instance.GetGameType(gameId);
            if (type == null || !typeof(GameBase).IsAssignableFrom(type)) return false;

            State = LoaderState.Loading;
            var lobby = FindFirstObjectByType<LobbyManager>();
            if (lobby != null) lobby.gameObject.SetActive(false);

            var root = new GameObject($"Game_{gameId}");
            root.transform.SetParent(transform, false);
            CurrentGame = (GameBase)root.AddComponent(type);
            CurrentGameId = gameId;
            CurrentGame.onExitRequested += ReturnToLobby;
            CurrentGame.onGameCompleted += HandleGameCompleted;
            State = LoaderState.Playing;
            return true;
        }

        private void HandleGameCompleted(GameResult result) { }

        public void ReturnToLobby()
        {
            if (State == LoaderState.Lobby || State == LoaderState.Returning) return;
            State = LoaderState.Returning;
            if (CurrentGame != null)
            {
                CurrentGame.onExitRequested -= ReturnToLobby;
                CurrentGame.onGameCompleted -= HandleGameCompleted;
                CurrentGame.Cleanup();
                Destroy(CurrentGame.gameObject);
            }
            CurrentGame = null;
            CurrentGameId = null;
            var lobby = FindFirstObjectByType<LobbyManager>();
            if (lobby != null)
            {
                lobby.gameObject.SetActive(true);
                lobby.ShowMainMenu();
            }
            State = LoaderState.Lobby;
        }

        public void ForceUnload() => ReturnToLobby();
    }
}
