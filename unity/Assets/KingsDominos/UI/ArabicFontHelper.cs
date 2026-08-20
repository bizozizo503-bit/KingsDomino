using UnityEngine;
using TMPro;

namespace KingsDominos.UI
{
    public static class ArabicFontHelper
    {
        private static TMP_FontAsset _cachedFont;
        private static Material _cachedMaterial;
        private static bool _loaded;

        private const string FONT_RESOURCE_PATH = "KingsDominosFonts/ArabicArial SDF";

        public static TMP_FontAsset Font
        {
            get
            {
                if (!_loaded) Load();
                return _cachedFont;
            }
        }

        public static Material FontMaterial
        {
            get
            {
                if (!_loaded) Load();
                return _cachedMaterial;
            }
        }

        public static bool IsAvailable => Font != null;

        private static void Load()
        {
            _loaded = true;
            _cachedFont = Resources.Load<TMP_FontAsset>(FONT_RESOURCE_PATH);
            if (_cachedFont != null)
            {
                _cachedMaterial = _cachedFont.material;
            }
            else
            {
                Debug.LogWarning($"[ArabicFont] Font not found at Resources/{FONT_RESOURCE_PATH}");
            }
        }

        private const float ARABIC_CHARACTER_SPACING = -5f;

        public static void ApplyToText(TMP_Text tmp)
        {
            if (tmp == null) return;

            if (IsAvailable)
            {
                tmp.font = _cachedFont;
                if (_cachedFont.material != null)
                    tmp.fontSharedMaterial = _cachedFont.material;
            }

            tmp.isRightToLeftText = true;
            tmp.characterSpacing = ARABIC_CHARACTER_SPACING;
            tmp.textWrappingMode = TextWrappingModes.NoWrap;
            tmp.overflowMode = TextOverflowModes.Ellipsis;
            tmp.parseCtrlCharacters = true;
            tmp.horizontalAlignment = HorizontalAlignmentOptions.Right;
            tmp.verticalAlignment = VerticalAlignmentOptions.Middle;
        }

        public static string ShapeArabic(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return ArabicTextShaper.Shape(input);
        }

        public static TextMeshProUGUI CreateArabicText(Transform parent, string name, string text, float fontSize, Color color, bool isTitle = false)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
            obj.transform.SetParent(parent, false);

            var tmp = obj.GetComponent<TextMeshProUGUI>();
            tmp.fontSize = fontSize;
            tmp.color = color;
            tmp.fontStyle = FontStyles.Bold;
            tmp.richText = true;

            ApplyToText(tmp);

            tmp.horizontalAlignment = isTitle
                ? HorizontalAlignmentOptions.Center
                : HorizontalAlignmentOptions.Right;

            SetText(tmp, text);

            return tmp;
        }

        public static void SetText(TMP_Text tmp, string text)
        {
            if (tmp == null) return;
            tmp.text = ShapeArabic(text);
        }
    }
}
