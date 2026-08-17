using UnityEditor;
using UnityEngine;
using TMPro;

public static class ArabicFontSetup
{
    [MenuItem("Tools/KingsDominos/Create Arabic Font Asset")]
    public static void CreateArabicFontAsset()
    {
        const string fontPath = "Assets/KingsDominos/Fonts/ArabicArial.ttf";
        const string resourcesFolder = "Assets/Resources";
        const string assetPath = "Assets/Resources/ArabicArial SDF.asset";

        // التأكد من وجود الخط الأصلي
        Font sourceFont = AssetDatabase.LoadAssetAtPath<Font>(fontPath);

        if (sourceFont == null)
        {
            Debug.LogError(
                "KingsDominos: ArabicArial.ttf not found at " + fontPath
            );
            return;
        }

        // إنشاء Resources إذا لم يكن موجوداً
        if (!AssetDatabase.IsValidFolder(resourcesFolder))
        {
            AssetDatabase.CreateFolder("Assets", "Resources");
        }

        // حذف Font Asset القديم
        if (AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(assetPath) != null)
        {
            AssetDatabase.DeleteAsset(assetPath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        // إنشاء Font Asset
        TMP_FontAsset fontAsset = TMP_FontAsset.CreateFontAsset(
            sourceFont,
            90,
            9,
            UnityEngine.TextCore.LowLevel.GlyphRenderMode.SDFAA,
            2048,
            2048
        );

        if (fontAsset == null)
        {
            Debug.LogError(
                "KingsDominos: Failed to create Arabic TMP Font Asset."
            );
            return;
        }

        fontAsset.name = "ArabicArial SDF";

        // إنشاء الملف
        AssetDatabase.CreateAsset(fontAsset, assetPath);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        Debug.Log(
            "KingsDominos: ArabicArial SDF created successfully: " +
            assetPath
        );
    }
}