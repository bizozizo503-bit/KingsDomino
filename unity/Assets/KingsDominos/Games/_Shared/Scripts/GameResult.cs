using System;
using System.Collections.Generic;

namespace KingsDominos.Games
{
    [Serializable]
    public sealed class GameResult
    {
        public string gameId;
        public string matchId;
        public int position;
        public int score;
        public int durationSeconds;
        public List<GamePlayerResult> players = new();
        public List<GameReward> rewards = new();
    }

    [Serializable]
    public sealed class GamePlayerResult
    {
        public string playerId;
        public int position;
        public int score;
        public bool winner;
    }

    [Serializable]
    public sealed class GameReward
    {
        public string type;
        public int amount;
        public string currency;
    }
}
