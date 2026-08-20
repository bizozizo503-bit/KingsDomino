using UnityEngine;
using TMPro;
using UnityEngine.UI;

namespace KingsDominos
{
    public static class UILayoutHelper
    {
        public static readonly Color DarkPurple = new Color(0.035f, 0.015f, 0.08f, 1f);
        public static readonly Color Gold = new Color(1f, 0.72f, 0.12f, 1f);
        public static readonly Color DarkGold = new Color(0.8f, 0.55f, 0.08f, 1f);
        public static readonly Color PanelBg = new Color(0.08f, 0.04f, 0.15f, 1f);
        public static readonly Color ButtonBg = new Color(0.18f, 0.08f, 0.38f, 1f);
        public static readonly Color Green = new Color(0.1f, 0.7f, 0.3f, 1f);
        public static readonly Color Gray = new Color(0.3f, 0.3f, 0.3f, 1f);
        public static readonly Color TextWhite = Color.white;
        public static readonly Color TextGray = new Color(0.7f, 0.7f, 0.7f, 1f);

        public static readonly Vector2 ReferenceResolution = new Vector2(1920, 1080);

        public static Canvas CreateCanvas(string name, Transform parent)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            obj.transform.SetParent(parent, false);

            var canvas = obj.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = obj.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = ReferenceResolution;
            scaler.matchWidthOrHeight = 0.5f;

            return canvas;
        }

        public static GameObject CreatePanel(Transform parent, string name, Color color)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(Image));
            obj.transform.SetParent(parent, false);
            obj.GetComponent<Image>().color = color;

            var rect = obj.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            return obj;
        }

        public static Button CreateButton(Transform parent, string name, string label, Color bgColor, float width = 300f, float height = 70f)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            obj.transform.SetParent(parent, false);

            var rect = obj.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(width, height);

            obj.GetComponent<Image>().color = bgColor;

            var labelObj = new GameObject("Label", typeof(RectTransform), typeof(TextMeshProUGUI));
            labelObj.transform.SetParent(obj.transform, false);
            var txt = labelObj.GetComponent<TextMeshProUGUI>();
            txt.text = UI.ArabicTextShaper.Shape(label);
            txt.fontSize = 28;
            txt.color = Color.white;
            txt.alignment = TextAlignmentOptions.Center;
            txt.fontStyle = FontStyles.Bold;
            txt.characterSpacing = -5f;
            txt.textWrappingMode = TextWrappingModes.NoWrap;
            txt.overflowMode = TextOverflowModes.Ellipsis;
            txt.isRightToLeftText = true;

            var labelRect = labelObj.GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;

            return obj.GetComponent<Button>();
        }

        public static TMP_Text CreateText(Transform parent, string name, string value, float size, Color color, TextAlignmentOptions alignment = TextAlignmentOptions.Center)
        {
            var obj = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
            obj.transform.SetParent(parent, false);

            var txt = obj.GetComponent<TextMeshProUGUI>();
            txt.text = UI.ArabicTextShaper.Shape(value);
            txt.fontSize = size;
            txt.color = color;
            txt.alignment = alignment;
            txt.fontStyle = FontStyles.Bold;
            txt.characterSpacing = -5f;
            txt.textWrappingMode = TextWrappingModes.NoWrap;
            txt.overflowMode = TextOverflowModes.Ellipsis;
            txt.isRightToLeftText = true;

            return txt;
        }

        public static void SetFullscreen(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        public static void SetAnchored(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
        }
    }
}
