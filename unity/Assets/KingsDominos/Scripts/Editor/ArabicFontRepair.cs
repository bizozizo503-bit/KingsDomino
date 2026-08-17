using UnityEditor;
using UnityEngine;
using TMPro;
using UnityEngine.TextCore.LowLevel;
using System.IO;

namespace KingsDominos.Editor
{
    public static class ArabicFontRepair
    {
        private const string FontPath =
            "Assets/KingsDominos/Fonts/ArabicArial.ttf";

        private const string CharactersPath =
            "Assets/KingsDominos/Fonts/ArabicCharacters.txt";

        private const string OutputFolder =
            "Assets/Resources/KingsDominosFonts";

        private const string FontAssetPath =
            OutputFolder + "/ArabicArial SDF.asset";

        [MenuItem("Tools/KingsDominos/REPAIR ARABIC FONT")]
        public static void Repair()
        {
            Debug.Log("KingsDominos: Starting Arabic font repair...");

            if (!Directory.Exists(OutputFolder))
                Directory.CreateDirectory(OutputFolder);

            AssetDatabase.Refresh();

            AssetDatabase.DeleteAsset(FontAssetPath);
            AssetDatabase.Refresh();

            Font sourceFont =
                AssetDatabase.LoadAssetAtPath<Font>(FontPath);

            if (sourceFont == null)
            {
                Debug.LogError(
                    "KingsDominos: Source font not found: " + FontPath
                );
                return;
            }

            TMP_FontAsset fontAsset =
                TMP_FontAsset.CreateFontAsset(
                    sourceFont,
                    90,
                    9,
                    GlyphRenderMode.SDFAA,
                    2048,
                    2048
                );

            if (fontAsset == null)
            {
                Debug.LogError(
                    "KingsDominos: Failed to create TMP Font Asset."
                );
                return;
            }

            fontAsset.name = "ArabicArial SDF";

            AssetDatabase.CreateAsset(
                fontAsset,
                FontAssetPath
            );

            AssetDatabase.SaveAssets();

            if (File.Exists(CharactersPath))
            {
                string text =
                    File.ReadAllText(CharactersPath);

                uint[] chars = new uint[text.Length];

                for (int i = 0; i < text.Length; i++)
                    chars[i] = text[i];

                uint[] missing;

                bool success =
                    fontAsset.TryAddCharacters(
                        chars,
                        out missing
                    );

                Debug.Log(
                    "KingsDominos: Arabic characters added. " +
                    "Success=" + success +
                    " Missing=" +
                    (missing == null ? 0 : missing.Length)
                );
            }

            EditorUtility.SetDirty(fontAsset);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log(
                "KingsDominos: ArabicArial SDF REPAIRED successfully."
            );
        }
    }
}
