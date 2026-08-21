using UnityEngine;
using UnityEngine.UI;
using TMPro;
using KingsDominos.Games;
using KingsDominos.Managers;

namespace KingsDominos.UI.Panels
{
    public class GameSelectionPanel : PanelBase
    {
        private TMP_Text headerText;
        private Button backButton;
        private Button allTab;
        private Button boardTab;
        private Button cardTab;
        private Button casualTab;
        private Transform gameGrid;

        private PanelManager _panelManager;
        private string _currentCategory = "all";
        private bool _wired;

        public void Initialize(PanelManager panelManager)
        {
            _panelManager = panelManager;
            AutoWire();
            backButton?.onClick.AddListener(OnBackClicked);
            allTab?.onClick.AddListener(() => FilterGames("all"));
            boardTab?.onClick.AddListener(() => FilterGames("board"));
            cardTab?.onClick.AddListener(() => FilterGames("card"));
            casualTab?.onClick.AddListener(() => FilterGames("casual"));
            if (headerText != null) ArabicFontHelper.SetText(headerText, "اختر اللعبة");
            PopulateGames();
        }

        private void AutoWire()
        {
            if (_wired) return;
            headerText = GetChildText("Header");
            backButton = GetChildButton("BackButton");
            allTab = GetChildButton("AllTab");
            boardTab = GetChildButton("BoardTab");
            cardTab = GetChildButton("CardTab");
            casualTab = GetChildButton("CasualTab");
            gameGrid = transform.Find("GameGrid");
            _wired = true;
        }

        private void PopulateGames()
        {
            if (gameGrid == null) return;
            foreach (Transform child in gameGrid) Object.Destroy(child.gameObject);
            foreach (var game in GameRegistry.All)
            {
                if (_currentCategory != "all" && game.Category != _currentCategory) continue;
                CreateGameCard(game);
            }
        }

        private void CreateGameCard(GameDefinition game)
        {
            var obj = new GameObject($"Card_{game.Id}", typeof(RectTransform), typeof(Image), typeof(Button));
            obj.transform.SetParent(gameGrid, false);
            obj.GetComponent<RectTransform>().sizeDelta = new Vector2(280, 200);
            obj.GetComponent<Image>().color = game.Implemented
                ? new Color(0.15f, 0.08f, 0.25f)
                : new Color(0.10f, 0.10f, 0.13f);

            var btn = obj.GetComponent<Button>();
            btn.interactable = game.Implemented;
            btn.onClick.AddListener(() => OnGameSelected(game.Id));

            var nameObj = new GameObject("Name", typeof(RectTransform), typeof(TextMeshProUGUI));
            nameObj.transform.SetParent(obj.transform, false);
            var nameTxt = nameObj.GetComponent<TextMeshProUGUI>();
            nameTxt.fontSize = 30;
            nameTxt.color = Color.white;
            nameTxt.alignment = TextAlignmentOptions.Center;
            nameTxt.fontStyle = FontStyles.Bold;
            ArabicFontHelper.ApplyToText(nameTxt);
            ArabicFontHelper.SetText(nameTxt, game.NameAr);
            var nr = nameObj.GetComponent<RectTransform>();
            nr.anchorMin = new Vector2(0, 0.5f);
            nr.anchorMax = new Vector2(1, 0.85f);
            nr.offsetMin = Vector2.zero;
            nr.offsetMax = Vector2.zero;

            var infoObj = new GameObject("Info", typeof(RectTransform), typeof(TextMeshProUGUI));
            infoObj.transform.SetParent(obj.transform, false);
            var infoTxt = infoObj.GetComponent<TextMeshProUGUI>();
            infoTxt.fontSize = 22;
            infoTxt.color = new Color(0.7f, 0.7f, 0.7f);
            infoTxt.alignment = TextAlignmentOptions.Center;
            ArabicFontHelper.ApplyToText(infoTxt);
            ArabicFontHelper.SetText(infoTxt, game.Implemented ? $"{game.Players} لاعبين" : "قريبًا");
            var ir = infoObj.GetComponent<RectTransform>();
            ir.anchorMin = new Vector2(0, 0.15f);
            ir.anchorMax = new Vector2(1, 0.4f);
            ir.offsetMin = Vector2.zero;
            ir.offsetMax = Vector2.zero;
        }

        private void FilterGames(string category)
        {
            _currentCategory = category;
            PopulateGames();
        }

        private void OnGameSelected(string gameId)
        {
            var definition = GameRegistry.Get(gameId);
            if (definition == null || !definition.Implemented)
            {
                Debug.LogWarning($"[GameSelection] Game is not implemented: {gameId}");
                return;
            }

            var loader = FindFirstObjectByType<GameLoader>();
            if (loader == null)
            {
                var loaderObject = new GameObject("GameLoader");
                loader = loaderObject.AddComponent<GameLoader>();
            }

            if (loader.Load(gameId))
                Debug.Log($"[GameSelection] Loaded game: {gameId}");
        }

        private void OnBackClicked() => _panelManager?.GoBack();

        private Button GetChildButton(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<Button>() : null;
        }

        private TMP_Text GetChildText(string name)
        {
            var t = transform.Find(name);
            return t != null ? t.GetComponent<TMP_Text>() : null;
        }
    }
}
