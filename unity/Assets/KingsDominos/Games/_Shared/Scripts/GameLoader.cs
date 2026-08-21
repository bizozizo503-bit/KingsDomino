using UnityEngine;
using KingsDominos;
using KingsDominos.Games.Domino;

namespace KingsDominos.Games
{
    public sealed class GameLoader : MonoBehaviour
    {
        public static GameLoader Instance { get; private set; }

        private GameBase _activeGame;
        private GameObject _activeRoot;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public bool Load(string gameId)
        {
            var definition = GameRegistry.Get(gameId);
            if (definition == null)
            {
                Debug.LogError($"[GameLoader] Unknown game: {gameId}");
                return false;
            }

            if (!definition.Implemented)
            {
                Debug.LogWarning($"[GameLoader] Game registered but not implemented yet: {gameId}");
                return false;
            }

            UnloadActiveGame();
            _activeRoot = new GameObject($"Game_{definition.Id}");
            _activeRoot.transform.SetParent(transform, false);

            if (gameId == "domino")
                _activeGame = _activeRoot.AddComponent<DominoGame>();
            else
                _activeGame = null;

            if (_activeGame == null)
            {
                Debug.LogError($"[GameLoader] No loader registered for: {gameId}");
                Destroy(_activeRoot);
                _activeRoot = null;
                return false;
            }

            _activeGame.gameId = definition.Id;
            _activeGame.gameNameAr = definition.NameAr;
            _activeGame.StartGame();
            return true;
        }

        public void UnloadActiveGame()
        {
            if (_activeGame != null)
            {
                _activeGame.Cleanup();
                _activeGame = null;
            }

            if (_activeRoot != null)
            {
                Destroy(_activeRoot);
                _activeRoot = null;
            }
        }

        public void ReturnToLobby()
        {
            UnloadActiveGame();
            var lobby = FindFirstObjectByType<LobbyManager>();
            if (lobby != null)
                lobby.ShowMainMenu();
            else
                Debug.LogWarning("[GameLoader] LobbyManager not found while returning to lobby");
        }
    }
}
