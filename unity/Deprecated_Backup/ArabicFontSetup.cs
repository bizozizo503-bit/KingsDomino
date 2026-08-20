using System.IO;
using UnityEditor;
using UnityEngine;
using TMPro;
using UnityEngine.TextCore.LowLevel;

public static class ArabicFontSetup
{
    private const string FontPath =
        "Assets/KingsDominos/Fonts/ArabicArial.ttf";

    private const string CharactersPath =
        "Assets/KingsDominos/Fonts/ArabicCharacters.txt";

    private const string OutputFolder =
        "Assets/Resources/KingsDominosFonts";

    private const string AssetPath =
        OutputFolder + "/ArabicArial SDF.asset";

    [MenuItem("Tools/KingsDominos/Create Arabic Font Asset")]
    public static void CreateArabicFontAsset()
    {
        Debug.Log("KINGS DOMINO: Starting Arabic Font Asset creation.");

        Font sourceFont = AssetDatabase.LoadAssetAtPath<Font>(FontPath);

        if (sourceFont == null)
        {
            Debug.LogError("KINGS DOMINO: Font not found: " + FontPath);
            return;
        }

        EnsureFolders();

        if (AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(AssetPath) != null)
        {
            AssetDatabase.DeleteAsset(AssetPath);
            AssetDatabase.Refresh();
        }

        TMP_FontAsset fontAsset = TMP_FontAsset.CreateFontAsset(
            sourceFont,
            90,
            9,
            GlyphRenderMode.SDFAA,
            2048,
            2048
        );

        if (fontAsset == null)
        {
            Debug.LogError("KINGS DOMINO: CreateFontAsset failed.");
            return;
        }

        fontAsset.name = "ArabicArial SDF";

        AssetDatabase.CreateAsset(fontAsset, AssetPath);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        Debug.Log(
            "KINGS DOMINO: ArabicArial SDF CREATED: " +
            AssetPath
        );
    }

    private static void EnsureFolders()
    {
        if (!AssetDatabase.IsValidFolder("Assets/Resources"))
        {
            AssetDatabase.CreateFolder("Assets", "Resources");
        }

        if (!AssetDatabase.IsValidFolder(OutputFolder))
        {
            AssetDatabase.CreateFolder(
                "Assets/Resources",
                "KingsDominosFonts"
            );
        }

        AssetDatabase.Refresh();
    }
}
