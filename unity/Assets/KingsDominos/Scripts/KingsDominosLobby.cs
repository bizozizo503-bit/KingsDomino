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
        public static void Build()
        {
            string scenePath =
                "Assets/KingsDominos/Scenes/SC_Lobby.unity";

            var scene =
                EditorSceneManager.NewScene(
                    NewSceneSetup.EmptyScene,
                    NewSceneMode.Single
                );

            GameObject root =
                new GameObject("KingsDominos");

            root.AddComponent<global::KingsDominos.LobbyUIManager>();

            GameObject canvasObject =
                new GameObject(
                    "Canvas",
                    typeof(RectTransform),
                    typeof(Canvas),
                    typeof(CanvasScaler),
                    typeof(GraphicRaycaster)
                );

            canvasObject.transform.SetParent(root.transform);

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
                "???? ????????",
                90,
                new Color(1f, 0.75f, 0.1f),
                new Vector2(0, 500)
            );


            CreateText(
                canvasObject.transform,
                "???? ??????",
                60,
                Color.white,
                new Vector2(0, 350)
            );


            CreateText(
                canvasObject.transform,
                "??????? : 1000",
                45,
                Color.yellow,
                new Vector2(0, 220)
            );


            CreateButton(
                canvasObject.transform,
                "???? ????",
                new Vector2(0, 50)
            );


            CreateButton(
                canvasObject.transform,
                "????? ????",
                new Vector2(0, -120)
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
                scenePath
            );

            AssetDatabase.Refresh();

            Debug.Log(
                "KingsDominos Demo Lobby Created"
            );
        }


        static void CreateBackground(Transform parent)
        {
            GameObject bg =
                new GameObject(
                    "Background",
                    typeof(RectTransform),
                    typeof(Image)
                );

            bg.transform.SetParent(
                parent,
                false
            );

            RectTransform r =
                bg.GetComponent<RectTransform>();

            r.anchorMin = Vector2.zero;
            r.anchorMax = Vector2.one;
            r.offsetMin = Vector2.zero;
            r.offsetMax = Vector2.zero;

            bg.GetComponent<Image>().color =
                new Color(0.03f, 0.01f, 0.08f);
        }


        static void CreateText(
            Transform parent,
            string textValue,
            float size,
            Color color,
            Vector2 pos)
        {
            GameObject obj =
                new GameObject(
                    "Text",
                    typeof(RectTransform),
                    typeof(TextMeshProUGUI)
                );

            obj.transform.SetParent(
                parent,
                false
            );

            RectTransform r =
                obj.GetComponent<RectTransform>();

            r.anchorMin =
                new Vector2(.5f, .5f);

            r.anchorMax =
                new Vector2(.5f, .5f);

            r.anchoredPosition = pos;
            r.sizeDelta =
                new Vector2(800, 120);


            TMP_Text t =
                obj.GetComponent<TMP_Text>();

            t.text = textValue;
            t.fontSize = size;
            t.color = color;
            t.alignment =
                TextAlignmentOptions.Center;
            t.fontStyle =
                FontStyles.Bold;
        }


        static void CreateButton(
            Transform parent,
            string label,
            Vector2 pos)
        {
            GameObject b =
                new GameObject(
                    "Button",
                    typeof(RectTransform),
                    typeof(Image),
                    typeof(Button)
                );

            b.transform.SetParent(
                parent,
                false
            );

            RectTransform r =
                b.GetComponent<RectTransform>();

            r.anchorMin =
                new Vector2(.5f, .5f);

            r.anchorMax =
                new Vector2(.5f, .5f);

            r.anchoredPosition = pos;
            r.sizeDelta =
                new Vector2(500, 120);


            b.GetComponent<Image>().color =
                new Color(.7f, .4f, .05f);


            CreateText(
                b.transform,
                label,
                45,
                Color.white,
                Vector2.zero
            );
        }
    }
}
