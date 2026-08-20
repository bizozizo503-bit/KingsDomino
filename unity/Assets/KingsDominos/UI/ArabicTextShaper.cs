using System.Collections.Generic;

namespace KingsDominos.UI
{
    public static class ArabicTextShaper
    {
        private enum JoiningType { U, R, D, T, C }

        private struct CharInfo
        {
            public char Base;
            public char Isolated;
            public char Final;
            public char Initial;
            public char Medial;
            public JoiningType JoinType;
        }

        private static readonly Dictionary<char, CharInfo> _charMap;

        static ArabicTextShaper()
        {
            _charMap = new Dictionary<char, CharInfo>();

            // Alef variants (Right-joining)
            AddChar('\u0622', '\uFE81', '\uFE82', '\uFE81', '\uFE82', JoiningType.R); // Alef with Madda
            AddChar('\u0623', '\uFE83', '\uFE84', '\uFE83', '\uFE84', JoiningType.R); // Alef with Hamza Above
            AddChar('\u0625', '\uFE87', '\uFE88', '\uFE87', '\uFE88', JoiningType.R); // Alef with Hamza Below
            AddChar('\u0627', '\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E', JoiningType.R); // Alef

            // Ba/Ta/Tha family (Dual-joining)
            AddChar('\u0628', '\uFE8F', '\uFE90', '\uFE91', '\uFE92', JoiningType.D); // Ba
            AddChar('\u062A', '\uFE95', '\uFE96', '\uFE97', '\uFE98', JoiningType.D); // Ta
            AddChar('\u062B', '\uFE99', '\uFE9A', '\uFE9B', '\uFE9C', JoiningType.D); // Tha
            AddChar('\u062C', '\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0', JoiningType.D); // Jim
            AddChar('\u062D', '\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4', JoiningType.D); // Ha
            AddChar('\u062E', '\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8', JoiningType.D); // Kha

            // Dal/Thal/Ra/Zain (Right-joining)
            AddChar('\u062F', '\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA', JoiningType.R); // Dal
            AddChar('\u0630', '\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC', JoiningType.R); // Thal
            AddChar('\u0631', '\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE', JoiningType.R); // Ra
            AddChar('\u0632', '\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0', JoiningType.R); // Zain

            // Seen/Sheen family (Dual-joining)
            AddChar('\u0633', '\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4', JoiningType.D); // Seen
            AddChar('\u0634', '\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8', JoiningType.D); // Sheen
            AddChar('\u0635', '\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC', JoiningType.D); // Sad
            AddChar('\u0636', '\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0', JoiningType.D); // Dad
            AddChar('\u0637', '\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4', JoiningType.D); // Tah
            AddChar('\u0638', '\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8', JoiningType.D); // Dhah
            AddChar('\u0639', '\uFEC9', '\uFECA', '\uFECB', '\uFECC', JoiningType.D); // Ain
            AddChar('\u063A', '\uFECD', '\uFECE', '\uFECF', '\uFED0', JoiningType.D); // Ghain

            // Fa/Qaf/Kaf/Lam/Mim/Nun/Ha/Waw/Ya (Dual-joining)
            AddChar('\u0641', '\uFED1', '\uFED2', '\uFED3', '\uFED4', JoiningType.D); // Fa
            AddChar('\u0642', '\uFED5', '\uFED6', '\uFED7', '\uFED8', JoiningType.D); // Qaf
            AddChar('\u0643', '\uFED9', '\uFEDA', '\uFEDB', '\uFEDC', JoiningType.D); // Kaf
            AddChar('\u0644', '\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0', JoiningType.D); // Lam
            AddChar('\u0645', '\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4', JoiningType.D); // Mim
            AddChar('\u0646', '\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8', JoiningType.D); // Nun
            AddChar('\u0647', '\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC', JoiningType.D); // Ha
            AddChar('\u0648', '\uFEED', '\uFEEE', '\uFEED', '\uFEEE', JoiningType.R); // Waw

            // Ya
            AddChar('\u0649', '\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0', JoiningType.D); // Alef Maqsura / Ya
            AddChar('\u064A', '\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4', JoiningType.D); // Ya

            // Teh Marbuta, Lam-Alef handled separately
            AddChar('\u0629', '\uFE93', '\uFE94', '\uFE93', '\uFE94', JoiningType.R); // Teh Marbuta

            // Hamza (transparent)
            AddChar('\u0621', '\uFE80', '\uFE80', '\uFE80', '\uFE80', JoiningType.U); // Hamza

            // Tatweel / Kashida (join-causing)
            AddChar('\u0640', '\u0640', '\u0640', '\u0640', '\u0640', JoiningType.C); // Tatweel

            // Small Alef (transparent)
            AddChar('\u0670', '\u0670', '\u0670', '\u0670', '\u0670', JoiningType.T); // Superscript Alef
        }

        private static void AddChar(char baseChar, char isolated, char finalF, char initial, char medial, JoiningType joinType)
        {
            _charMap[baseChar] = new CharInfo
            {
                Base = baseChar,
                Isolated = isolated,
                Final = finalF,
                Initial = initial,
                Medial = medial,
                JoinType = joinType
            };
        }

        public static string Shape(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            var chars = new List<ShapedChar>(input.Length);

            for (int i = 0; i < input.Length; i++)
            {
                char c = input[i];

                if (_charMap.TryGetValue(c, out var info))
                {
                    chars.Add(new ShapedChar
                    {
                        Original = c,
                        Info = info,
                        ShapeIndex = chars.Count
                    });
                }
                else
                {
                    chars.Add(new ShapedChar
                    {
                        Original = c,
                        Info = new CharInfo { Base = c, JoinType = GetDefaultJoinType(c) },
                        ShapeIndex = chars.Count
                    });
                }
            }

            // Lam-Alef ligatures
            for (int i = chars.Count - 1; i >= 1; i--)
            {
                if (chars[i].Original == '\u0644') // Lam
                {
                    char next = chars[i - 1].Original;
                    char ligature = GetLamAlef(next);
                    if (ligature != '\0')
                    {
                        chars[i] = new ShapedChar
                        {
                            Original = ligature,
                            Info = new CharInfo { Base = ligature, Isolated = ligature, JoinType = JoiningType.R },
                            ShapeIndex = chars[i].ShapeIndex,
                            IsLigature = true
                        };
                        chars.RemoveAt(i - 1);
                        i--;
                    }
                }
            }

            // Determine joining form for each character
            for (int i = 0; i < chars.Count; i++)
            {
                if (chars[i].IsLigature || chars[i].Info.JoinType == JoiningType.U || chars[i].Info.JoinType == JoiningType.T)
                    continue;

                if (chars[i].Info.JoinType == JoiningType.C)
                    continue;

                bool joinRight = false;
                bool joinLeft = false;

                // Check right neighbor (previous in logical order, next in visual RTL)
                if (i < chars.Count - 1)
                {
                    var rightNeighbor = chars[i + 1];
                    if (CanJoinRight(rightNeighbor))
                        joinRight = true;
                }

                // Check left neighbor
                if (i > 0)
                {
                    var leftNeighbor = chars[i - 1];
                    if (CanJoinLeft(leftNeighbor))
                        joinLeft = true;
                }

                char shaped = chars[i].Info.Isolated;
                if (chars[i].Info.JoinType == JoiningType.R)
                {
                    if (joinRight)
                        shaped = chars[i].Info.Final;
                }
                else if (chars[i].Info.JoinType == JoiningType.D)
                {
                    if (joinRight && joinLeft)
                        shaped = chars[i].Info.Medial;
                    else if (joinRight)
                        shaped = chars[i].Info.Initial;
                    else if (joinLeft)
                        shaped = chars[i].Info.Final;
                }

                chars[i] = new ShapedChar
                {
                    Original = chars[i].Original,
                    Info = chars[i].Info,
                    ShapedChar_ = shaped,
                    ShapeIndex = chars[i].ShapeIndex,
                    IsShaped = true
                };
            }

            // Build result
            var result = new char[chars.Count];
            for (int i = 0; i < chars.Count; i++)
            {
                result[i] = chars[i].IsShaped ? chars[i].ShapedChar_ : chars[i].Original;
            }

            return new string(result);
        }

        private static bool CanJoinRight(ShapedChar ch)
        {
            if (ch.IsLigature) return true;
            if (ch.Info.JoinType == JoiningType.D || ch.Info.JoinType == JoiningType.R)
                return true;
            if (ch.Info.JoinType == JoiningType.T)
                return false;
            return false;
        }

        private static bool CanJoinLeft(ShapedChar ch)
        {
            if (ch.IsLigature) return true;
            if (ch.Info.JoinType == JoiningType.D)
                return true;
            if (ch.Info.JoinType == JoiningType.T)
                return false;
            return false;
        }

        private static JoiningType GetDefaultJoinType(char c)
        {
            if (c >= '\u0600' && c <= '\u06FF')
                return JoiningType.U;
            if (c >= '\u0750' && c <= '\u077F')
                return JoiningType.U;
            if (c >= '\u08A0' && c <= '\u08FF')
                return JoiningType.U;
            if (c >= '\uFB50' && c <= '\uFDCF')
                return JoiningType.R;
            if (c >= '\uFDF0' && c <= '\uFDFF')
                return JoiningType.R;
            if (c >= '\uFE70' && c <= '\uFEFF')
                return JoiningType.D;
            return JoiningType.U;
        }

        private static char GetLamAlef(char alef)
        {
            switch (alef)
            {
                case '\u0622': return '\uFEF5'; // Lam + Alef with Madda (isolated)
                case '\u0623': return '\uFEF7'; // Lam + Alef with Hamza Above
                case '\u0625': return '\uFEF9'; // Lam + Alef with Hamza Below
                case '\u0627': return '\uFEFB'; // Lam + Alef
                default: return '\0';
            }
        }

        private struct ShapedChar
        {
            public char Original;
            public CharInfo Info;
            public char ShapedChar_;
            public int ShapeIndex;
            public bool IsShaped;
            public bool IsLigature;
        }
    }
}
