using System.Collections.Generic;
using KingsDominos.Games.Shared;

namespace KingsDominos.Games
{
    public static class GameRegistry
    {
        private static readonly IReadOnlyList<GameDefinition> Definitions = new List<GameDefinition>
        {
            new GameDefinition("domino", "الدومينو الملكي", "board", "2-4", true),
            new GameDefinition("ludo", "لودو", "board", "2-4", false),
            new GameDefinition("chess", "الشطرنج", "board", "2", false),
            new GameDefinition("backgammon", "الطاولة", "board", "2", false),
            new GameDefinition("baloot", "البلوت", "card", "4", false),
            new GameDefinition("uno", "يونو", "card", "2-6", false),
            new GameDefinition("pool", "البلياردو", "casual", "2", false),
            new GameDefinition("bingo", "البينجو", "casual", "1-100", false),
        };

        public static IReadOnlyList<GameDefinition> All => Definitions;

        public static GameDefinition Get(string gameId)
        {
            if (string.IsNullOrWhiteSpace(gameId)) return null;
            for (int i = 0; i < Definitions.Count; i++)
            {
                if (Definitions[i].Id == gameId)
                    return Definitions[i];
            }
            return null;
        }
    }
}
