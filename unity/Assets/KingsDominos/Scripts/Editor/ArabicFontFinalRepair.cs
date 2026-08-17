using UnityEditor;
using UnityEngine;
using TMPro;
using UnityEngine.TextCore.LowLevel;
using System.IO;

namespace KingsDominos.Editor
{
    public static class ArabicFontFinalRepair
    {
        private const string FontPath =
            "Assets/KingsDominos/Fonts/ArabicArial.ttf";

        private const string CharactersPath =
            "Assets/KingsDominos/Fonts/ArabicCharacters.txt";

        private const string Folder =
            "Assets/Resources/KingsDominosFonts";

        private const string FontAssetPath =
            Folder + "/ArabicArial SDF.asset";

        [MenuItem("Tools/KingsDominos/FINAL ARABIC FONT REPAIR")]
        public static void Repair()
        {
            Debug.Log("KingsDominos: FINAL Arabic Font Repair STARTED.");

            AssetDatabase.DeleteAsset(FontAssetPath);
            AssetDatabase.Refresh();

            Font sourceFont =
                AssetDatabase.LoadAssetAtPath<Font>(FontPath);

            if (sourceFont == null)
            {
                Debug.LogError(
                    "KingsDominos: ArabicArial.ttf not found: " +
                    FontPath
                );
                return;
            }

            if (!AssetDatabase.IsValidFolder("Assets/Resources"))
                AssetDatabase.CreateFolder("Assets", "Resources");

            if (!AssetDatabase.IsValidFolder(Folder))
                AssetDatabase.CreateFolder(
                    "Assets/Resources",
                    "KingsDominosFonts"
                );

            AssetDatabase.Refresh();

            TMP_FontAsset fontAsset =
                TMP_FontAsset.CreateFontAsset(
                    sourceFont,
                    90,
                    9,
                    GlyphRenderMode.SDFAA,
                    2048,
                    2048,
                    AtlasPopulationMode.Dynamic,
                    true
                );

            if (fontAsset == null)
            {
                Debug.LogError(
                    "KingsDominos: Could not create TMP Font Asset."
                );
                return;
            }

            fontAsset.name = "ArabicArial SDF";

            Texture2D[] atlases = fontAsset.atlasTextures;

            if (atlases == null || atlases.Length == 0)
            {
                Debug.LogError(
                    "KingsDominos: Font Asset has NO atlas texture."
                );

                Object.DestroyImmediate(fontAsset);
                return;
            }

            Debug.Log(
                "KingsDominos: Atlas count = " +
                atlases.Length
            );

            AssetDatabase.CreateAsset(
                fontAsset,
                FontAssetPath
            );

            foreach (Texture2D atlas in atlases)
            {
                if (atlas != null)
                {
                    atlas.name = "ArabicArial SDF Atlas";
                    AssetDatabase.AddObjectToAsset(
                        atlas,
                        fontAsset
                    );
                }
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            TMP_FontAsset savedFont =
                AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(
                    FontAssetPath
                );

            if (savedFont == null)
            {
                Debug.LogError(
                    "KingsDominos: Saved Font Asset could not be loaded."
                );
                return;
            }

            savedFont.atlasPopulationMode =
                AtlasPopulationMode.Dynamic;

            if (File.Exists(CharactersPath))
            {
                string text =
                    File.ReadAllText(CharactersPath);

                text = text.Trim();

                if (!string.IsNullOrEmpty(text))
                {
                    uint[] characters =
                        new uint[text.Length];

                    for (int i = 0; i < text.Length; i++)
                        characters[i] = text[i];

                    uint[] missing;

                    bool success =
                        savedFont.TryAddCharacters(
                            characters,
                            out missing,
                            true
                        );

                    Debug.Log(
                        "KingsDominos: Arabic characters processed. " +
                        "Success=" + success +
                        " Missing=" +
                        (missing == null
                            ? 0
                            : missing.Length)
                    );
                }
            }

            EditorUtility.SetDirty(savedFont);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            TMP_FontAsset verify =
                AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(
                    FontAssetPath
                );

            if (verify != null &&
                verify.atlasTextures != null &&
                verify.atlasTextures.Length > 0 &&
                verify.atlasTextures[0] != null)
            {
                Debug.Log(
                    "KingsDominos: FINAL ARABIC FONT REPAIR SUCCESS."
                );

                Debug.Log(
                    "KingsDominos: Atlas is now saved correctly."
                );
            }
            else
            {
                Debug.LogError(
                    "KingsDominos: FINAL REPAIR FAILED - Atlas still missing."
                );
            }
        }
    }
}
