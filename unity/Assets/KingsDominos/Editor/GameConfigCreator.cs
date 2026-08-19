#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using KingsDominos.Core;

namespace KingsDominos.Editor
{
    public static class GameConfigCreator
    {
        [MenuItem("KingsDominos/Create GameConfig Asset", priority = 20)]
        public static void CreateGameConfig()
        {
            var config = ScriptableObject.CreateInstance<GameConfig>();

            config.apiBaseUrl = "http://localhost:3000/api";
            config.wsUrl = "ws://localhost:3000";
            config.gameVersion = "1.0.0";
            config.startingGold = 12500;
            config.dailyRewardBase = 100;
            config.panelTransitionDuration = 0.3f;
            config.maxChatMessageLength = 500;
            config.defaultLanguage = "ar";

            System.IO.Directory.CreateDirectory("Assets/KingsDominos/Resources");
            AssetDatabase.CreateAsset(config, "Assets/KingsDominos/Resources/GameConfig.asset");
            AssetDatabase.SaveAssets();
            Debug.Log("[KingsDominos] GameConfig asset created at Assets/KingsDominos/Resources/GameConfig.asset");
        }
    }
}
#endif
