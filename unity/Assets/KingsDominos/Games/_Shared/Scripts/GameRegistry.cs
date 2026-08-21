using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using KingsDominos;

namespace KingsDominos.Games
{
    public sealed class GameRegistry : Singleton<GameRegistry>
    {
        private readonly List<GameDefinition> _games = new();
        private readonly Dictionary<string, System.Type> _types = new();
        public IReadOnlyList<GameDefinition> AllGames => _games;

        protected override void Awake()
        {
            base.Awake();
            if (_games.Count == 0) BuildRegistry();
            RegisterBuiltIns();
        }

        private void BuildRegistry()
        {
            _games.Clear();
            Add("domino", "الدومينو الملكي", "board", "board", 2, 4, GameStatus.Implemented, 1, 1);
            Add("ludo", "لودو", "board", "board", 2, 4, GameStatus.Upcoming, 2, 2);
            Add("chess", "الشطرنج", "board", "board", 2, 2, GameStatus.Upcoming, 2, 3);
            Add("backgammon", "الطاولة", "board", "board", 2, 2, GameStatus.Upcoming, 2, 4);
            Add("baloot", "البلوت", "cards", "card", 4, 4, GameStatus.Upcoming, 2, 5);
            Add("uno", "أونو", "cards", "card", 2, 6, GameStatus.Upcoming, 3, 6);
            Add("pool", "البلياردو", "sports", "sports", 2, 2, GameStatus.Upcoming, 3, 7);
            Add("bingo", "البينجو", "casual", "casual", 1, 100, GameStatus.Upcoming, 3, 8);
            Add("mahjong", "ماجونج", "board", "board", 1, 4, GameStatus.Upcoming, 3, 9);
            Add("solitaire", "سوليتير", "cards", "card", 1, 1, GameStatus.Upcoming, 3, 10);
            Add("dice", "النرد الملكي", "dice", "casual", 1, 6, GameStatus.Upcoming, 3, 11);
            Add("ball_sort", "فرز الكرات", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("block_puzzle", "ألغاز المكعبات", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("match3", "مطابقة الجواهر", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("tile_match", "مطابقة البلاطات", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("bubble_shooter", "تصويب الفقاعات", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("candy_rush", "سباق الحلوى", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("memory", "تحدي الذاكرة", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("word_puzzle", "ألغاز الكلمات", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("2048", "2048", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("sudoku", "سودوكو", "puzzle", "puzzle", 1, 1, GameStatus.Upcoming, 4);
            Add("knife_hit", "تحدي السكين", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("fruit_slice", "تقطيع الفاكهة", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("flappy", "الطائر الملكي", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("tower_stack", "برج الملوك", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("runner", "العداء الملكي", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("brick_breaker", "كاسر الطوب", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("space_defense", "دفاع الفضاء", "arcade", "arcade", 1, 1, GameStatus.Upcoming, 5);
            Add("archery", "رماية السهام", "action", "action", 1, 1, GameStatus.Upcoming, 5);
            Add("battle_arena", "ساحة الملوك", "action", "action", 2, 4, GameStatus.Upcoming, 5);
            Add("knight_duel", "مبارزة الفرسان", "action", "action", 2, 2, GameStatus.Upcoming, 5);
            Add("tower_defense", "دفاع القلعة", "strategy", "strategy", 1, 1, GameStatus.Upcoming, 5);
            Add("checkers", "الدامة", "board", "board", 2, 2, GameStatus.Upcoming, 2);
            Add("connect4", "أربعة على خط", "board", "board", 2, 2, GameStatus.Upcoming, 2);
            Add("reversi", "ريفيرسي", "board", "board", 2, 2, GameStatus.Upcoming, 2);
            Add("tic_tac_toe", "إكس أو", "board", "board", 2, 2, GameStatus.Upcoming, 2);
            Add("domino_solo", "دومينو فردي", "board", "board", 1, 1, GameStatus.Upcoming, 1);
            Add("domino_teams", "دومينو الفرق", "board", "board", 4, 4, GameStatus.Upcoming, 1);
            Add("domino_tournament", "بطولة الدومينو", "board", "board", 2, 64, GameStatus.Upcoming, 1);
            Add("soccer", "كرة القدم", "sports", "sports", 2, 2, GameStatus.Upcoming, 6);
            Add("basketball", "كرة السلة", "sports", "sports", 2, 2, GameStatus.Upcoming, 6);
            Add("tennis", "التنس", "sports", "sports", 2, 2, GameStatus.Upcoming, 6);
            Add("football_penalty", "ركلات الترجيح", "sports", "sports", 1, 2, GameStatus.Upcoming, 6);
            Add("golf", "الجولف", "sports", "sports", 1, 4, GameStatus.Upcoming, 6);
            Add("racing", "السباق الملكي", "sports", "sports", 2, 8, GameStatus.Upcoming, 6);
            Add("hades", "حراس الأساطير", "action", "action", 1, 1, GameStatus.Upcoming, 7);
            Add("warriors", "محاربو العرش", "action", "action", 1, 4, GameStatus.Upcoming, 7);
            Add("treasure_adventure", "مغامرة الكنز", "adventure", "adventure", 1, 1, GameStatus.Upcoming, 7);
            Add("dragon_adventure", "مغامرة التنين", "adventure", "adventure", 1, 1, GameStatus.Upcoming, 7);
            Add("royal_quest", "مهمة الملوك", "adventure", "adventure", 1, 4, GameStatus.Upcoming, 7);
            Add("island_adventure", "جزيرة المغامرات", "adventure", "adventure", 1, 4, GameStatus.Upcoming, 7);
            Add("daily_challenge", "التحدي اليومي", "events", "casual", 1, 1, GameStatus.Upcoming, 8);
            Add("weekly_challenge", "التحدي الأسبوعي", "events", "casual", 1, 1, GameStatus.Upcoming, 8);
            Add("royal_tournament", "البطولة الملكية", "events", "casual", 2, 64, GameStatus.Upcoming, 8);
            Add("team_event", "فعالية الفرق", "events", "casual", 4, 100, GameStatus.Upcoming, 8);
            Add("season_event", "موسم الملوك", "events", "casual", 1, 100, GameStatus.Upcoming, 8);
            Add("jackpot_challenge", "تحدي الجائزة", "events", "casual", 1, 100, GameStatus.Upcoming, 8);
            Add("spin_challenge", "عجلة التحدي", "events", "casual", 1, 1, GameStatus.Upcoming, 8);
            Add("treasure_draw", "سحب الكنز", "events", "casual", 1, 100, GameStatus.Upcoming, 8);
            Add("quiz", "مسابقة المعرفة", "casual", "casual", 1, 8, GameStatus.Upcoming, 8);
            Add("trivia", "تريفيا الملوك", "casual", "casual", 1, 8, GameStatus.Upcoming, 8);
            Add("reaction", "سرعة الاستجابة", "casual", "casual", 1, 4, GameStatus.Upcoming, 8);
        }

        private void Add(string id, string name, string family, string category, int min, int max, GameStatus status, int wave, int priority = 100)
            => _games.Add(new GameDefinition(id, name, family, category, min, max, status, wave, priority));

        public GameDefinition Get(string gameId) => _games.FirstOrDefault(x => x.gameId == gameId);
        public IReadOnlyList<GameDefinition> GetByCategory(string category) => _games.Where(x => category == "all" || x.category == category).ToList();
        public IReadOnlyList<GameDefinition> GetByWave(int wave) => _games.Where(x => x.wave == wave).OrderBy(x => x.priority).ToList();
        public void RegisterType(string gameId, System.Type type) { if (type != null) _types[gameId] = type; }
        public System.Type GetGameType(string gameId) => _types.TryGetValue(gameId, out var type) ? type : null;

        public void RegisterBuiltIns()
        {
            RegisterType("domino", typeof(Domino.DominoGame));
        }
    }
}
