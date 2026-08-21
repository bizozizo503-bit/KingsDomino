using System;

namespace KingsDominos.Games
{
    public enum GameStatus { Upcoming, Implemented, Maintenance }

    [Serializable]
    public sealed class GameDefinition
    {
        public string gameId;
        public string displayNameAr;
        public string family;
        public string category;
        public int minPlayers;
        public int maxPlayers;
        public GameStatus status;
        public int wave;
        public int priority;

        public GameDefinition(string id, string nameAr, string gameFamily, string gameCategory, int min, int max, GameStatus gameStatus, int implementationWave, int gamePriority = 100)
        {
            gameId = id;
            displayNameAr = nameAr;
            family = gameFamily;
            category = gameCategory;
            minPlayers = min;
            maxPlayers = max;
            status = gameStatus;
            wave = implementationWave;
            priority = gamePriority;
        }

        public bool IsPlayable => status == GameStatus.Implemented;
        public string PlayersText => minPlayers == maxPlayers ? minPlayers.ToString() : $"{minPlayers}-{maxPlayers}";
    }
}
