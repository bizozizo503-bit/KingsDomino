using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using TMPro;

namespace KingsDominos.Editor
{
    public static class KingsDominosArabicLinker
    {
        private const string ScenePath =
            "Assets/KingsDominos/Scenes/SC_Lobby.unity";

        private const string FontPath =
            "Assets/Resources/KingsDominosFonts/ArabicArial SDF.asset";

        [MenuItem("Tools/KingsDominos/LINK FRESH ARABIC FONT")]
        public static void Link()
        {
            TMP_FontAsset font =
                AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(FontPath);

            if (font == null)
            {
                Debug.LogError(
                    "KingsDominos: Fresh Arabic font not found: " +
                    FontPath
                );
                return;
            }

            var scene =
                EditorSceneManager.OpenScene(
                    ScenePath,
                    OpenSceneMode.Single
                );

            TextMeshProUGUI[] texts =
                Object.FindObjectsByType<TextMeshProUGUI>(
                    FindObjectsInactive.Include,
                    FindObjectsSortMode.None
                );

            int count = 0;

            foreach (TextMeshProUGUI text in texts)
            {
                Undo.RecordObject(text, "Link Fresh Arabic Font");
                text.font = font;
                EditorUtility.SetDirty(text);
                count++;
            }

            EditorSceneManager.SaveScene(scene);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log(
                "KingsDominos: FRESH Arabic font linked to " +
                count +
                " TMP UI elements."
            );
        }
    }
}
