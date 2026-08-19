using UnityEngine;

namespace KingsDominos.Core
{
    [CreateAssetMenu(fileName = "GameConfig", menuName = "KingsDominos/Game Config")]
    public class GameConfig : ScriptableObject
    {
        [Header("Server")]
        public string apiBaseUrl = "http://localhost:3000/api";
        public string wsUrl = "ws://localhost:3000";

        [Header("Game")]
        public string gameVersion = "1.0.0";
        public int startingGold = 12500;
        public int dailyRewardBase = 100;

        [Header("UI")]
        public float panelTransitionDuration = 0.3f;
        public int maxChatMessageLength = 500;

        [Header("Localization")]
        public string defaultLanguage = "ar";

        private static GameConfig _instance;

        public static GameConfig Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = Resources.Load<GameConfig>("GameConfig");
                }
                return _instance;
            }
        }
    }
}
