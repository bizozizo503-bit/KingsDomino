using System;
using UnityEngine;

namespace KingsDominos.Games.Shared
{
    [Serializable]
    public sealed class GameDefinition
    {
        public string Id;
        public string NameAr;
        public string Category;
        public string Players;
        public bool Implemented;

        public GameDefinition(string id, string nameAr, string category, string players, bool implemented)
        {
            Id = id;
            NameAr = nameAr;
            Category = category;
            Players = players;
            Implemented = implemented;
        }
    }
}
