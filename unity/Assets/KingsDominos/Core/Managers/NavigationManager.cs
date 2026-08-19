using UnityEngine;
using UnityEngine.SceneManagement;
using System;

namespace KingsDominos.Managers
{
    public class NavigationManager : Singleton<NavigationManager>
    {
        public event Action<string> OnSceneLoaded;
        public event Action<string> OnSceneUnloaded;

        private string _currentScene;
        private bool _isLoading;

        public string CurrentScene => _currentScene;

        public void LoadScene(string sceneName, Action onLoaded = null)
        {
            if (_isLoading) return;
            if (string.IsNullOrEmpty(sceneName)) return;

            _isLoading = true;
            _currentScene = sceneName;

            StartCoroutine(LoadSceneRoutine(sceneName, onLoaded));
        }

        private System.Collections.IEnumerator LoadSceneRoutine(string sceneName, Action onLoaded)
        {
            var asyncLoad = SceneManager.LoadSceneAsync(sceneName);
            if (asyncLoad == null)
            {
                _isLoading = false;
                yield break;
            }

            while (!asyncLoad.isDone)
            {
                yield return null;
            }

            _isLoading = false;
            OnSceneLoaded?.Invoke(sceneName);
            onLoaded?.Invoke();
        }

        public void ReloadCurrentScene()
        {
            if (!string.IsNullOrEmpty(_currentScene))
                LoadScene(_currentScene);
            else
                LoadScene(SceneManager.GetActiveScene().name);
        }

        public void GoToLobby()
        {
            LoadScene("SC_Lobby");
        }

        public void QuitGame()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }
}
