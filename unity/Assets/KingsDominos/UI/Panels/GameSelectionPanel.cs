using UnityEngine;
using UnityEngine.UI;
using TMPro;
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

            if (headerText != null)
                headerText.text = "اختر اللعبة";

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

            foreach (Transform child in gameGrid)
                Object.Destroy(child.gameObject);

            var games = new (string id, string nameAr, string category, string players)[]
            {
                ("domino", "الدومينو", "board", "2-4"),
                ("ludo", "لودو", "board", "2-4"),
                ("chess", "الشطرنج", "board", "2"),
                ("backgammon", "الطاولة", "board", "2"),
                ("baloot", "البلوت", "card", "4"),
                ("uno", "يونو", "card", "2-6"),
                ("pool", "البلياردو", "casual", "2"),
                ("bingo", "البينجو", "casual", "1-100"),
            };

            foreach (var game in games)
            {
                if (_currentCategory != "all" && game.category != _currentCategory)
                    continue;
                CreateGameCard(game.id, game.nameAr, game.players);
            }
        }

        private void CreateGameCard(string gameId, string nameAr, string players)
        {
            var obj = new GameObject($"Card_{gameId}", typeof(RectTransform), typeof(Image), typeof(Button));
            obj.transform.SetParent(gameGrid, false);
            obj.GetComponent<RectTransform>().sizeDelta = new Vector2(280, 200);
            obj.GetComponent<Image>().color = new Color(0.15f, 0.08f, 0.25f);

            var btn = obj.GetComponent<Button>();
            btn.onClick.AddListener(() => OnGameSelected(gameId));

            var nameObj = new GameObject("Name", typeof(RectTransform), typeof(TextMeshProUGUI));
            nameObj.transform.SetParent(obj.transform, false);
            var nameTxt = nameObj.GetComponent<TextMeshProUGUI>();
            nameTxt.text = nameAr;
            nameTxt.fontSize = 28;
            nameTxt.color = Color.white;
            nameTxt.alignment = TextAlignmentOptions.Center;
            nameTxt.fontStyle = FontStyles.Bold;
            var nr = nameObj.GetComponent<RectTransform>();
            nr.anchorMin = new Vector2(0, 0.5f);
            nr.anchorMax = new Vector2(1, 0.85f);
            nr.offsetMin = Vector2.zero;
            nr.offsetMax = Vector2.zero;

            var infoObj = new GameObject("Info", typeof(RectTransform), typeof(TextMeshProUGUI));
            infoObj.transform.SetParent(obj.transform, false);
            var infoTxt = infoObj.GetComponent<TextMeshProUGUI>();
            infoTxt.text = $"{players} لاعبين";
            infoTxt.fontSize = 18;
            infoTxt.color = new Color(0.7f, 0.7f, 0.7f);
            infoTxt.alignment = TextAlignmentOptions.Center;
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
            Debug.Log($"[GameSelection] Selected: {gameId}");
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
