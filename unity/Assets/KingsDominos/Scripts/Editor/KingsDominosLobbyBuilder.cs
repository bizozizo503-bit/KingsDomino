using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace KingsDominos.Editor
{
    public static class KingsDominosLobbyBuilder
    {
        [MenuItem("Tools/KingsDominos/Create Demo Lobby")]
        public static void Build()
        {
            string path =
                "Assets/KingsDominos/Scenes/SC_Lobby.unity";

            var scene =
                EditorSceneManager.NewScene(
                    NewSceneSetup.EmptyScene,
                    NewSceneMode.Single
                );

            GameObject root =
                new GameObject("KingsDominosLobby");

            root.AddComponent<global::KingsDominos.LobbyUIManager>();

            GameObject canvasObject =
                new GameObject(
                    "KingsDominosCanvas",
                    typeof(RectTransform),
                    typeof(Canvas),
                    typeof(CanvasScaler),
                    typeof(GraphicRaycaster)
                );

            canvasObject.transform.SetParent(
                root.transform,
                false
            );

            Canvas canvas =
                canvasObject.GetComponent<Canvas>();

            canvas.renderMode =
                RenderMode.ScreenSpaceOverlay;


            CanvasScaler scaler =
                canvasObject.GetComponent<CanvasScaler>();

            scaler.uiScaleMode =
                CanvasScaler.ScaleMode.ScaleWithScreenSize;

            scaler.referenceResolution =
                new Vector2(1080, 1920);


            CreateBackground(canvasObject.transform);


            CreateText(
                canvasObject.transform,
                "ملوك الدومينو",
                80,
                new Color(1f,0.72f,0.12f,1f),
                new Vector2(0,500)
            );


            CreateText(
                canvasObject.transform,
                "قاعة الملوك",
                55,
                Color.white,
                new Vector2(0,350)
            );


            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                new GameObject(
                    "EventSystem",
                    typeof(EventSystem),
                    typeof(StandaloneInputModule)
                );
            }


            EditorSceneManager.SaveScene(
                scene,
                path
            );

            AssetDatabase.Refresh();

            Debug.Log(
                "KingsDominos: Lobby created successfully"
            );
        }


        private static void CreateBackground(
            Transform parent)
        {
            GameObject go =
                new GameObject(
                    "Background",
                    typeof(RectTransform),
                    typeof(Image)
                );

            go.transform.SetParent(
                parent,
                false
            );


            RectTransform rect =
                go.GetComponent<RectTransform>();

            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;


            go.GetComponent<Image>().color =
                new Color(
                    0.035f,
                    0.015f,
                    0.08f,
                    1f
                );
        }


        private static void CreateText(
            Transform parent,
            string value,
            float size,
            Color color,
            Vector2 position)
        {
            GameObject go =
                new GameObject(
                    "Text",
                    typeof(RectTransform),
                    typeof(TextMeshProUGUI)
                );


            go.transform.SetParent(
                parent,
                false
            );


            RectTransform rect =
                go.GetComponent<RectTransform>();

            rect.anchorMin =
                new Vector2(0.5f,0.5f);

            rect.anchorMax =
                new Vector2(0.5f,0.5f);

            rect.anchoredPosition =
                position;

            rect.sizeDelta =
                new Vector2(800,120);


            TextMeshProUGUI text =
                go.GetComponent<TextMeshProUGUI>();

            text.text = value;
            text.fontSize = size;
            text.color = color;
            text.alignment =
                TextAlignmentOptions.Center;

            text.fontStyle =
                FontStyles.Bold;
        }
    }
}
