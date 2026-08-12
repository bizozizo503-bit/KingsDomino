// Original KingsDomino game catalog. Inspired by broad market patterns, not copied assets.
export const GAME_CATALOG = Object.freeze([
  { id: 'domino', title: 'دومينو كلاسيك', mode: '2-4 لاعبين', category: 'domino' },
  { id: 'battle', title: 'معركة الدومينو', mode: '2 ضد 2', category: 'domino' },
  { id: 'olympus', title: 'Kings Olympus', mode: 'جولة برق', category: 'arcade' },
  { id: 'treasure', title: 'كنوز الملوك', mode: 'جمع الجواهر', category: 'arcade' },
  { id: 'cards', title: 'الكروت الملكية', mode: 'تكتيك سريع', category: 'cards' },
  { id: 'arcade', title: 'أركيد راش', mode: 'رقم قياسي', category: 'arcade' },
  { id: 'tournament', title: 'البطولة الملكية', mode: 'تحديات يومية', category: 'competitive' },
  { id: 'arena', title: 'الساحة', mode: 'تحدي النخبة', category: 'competitive' },
  { id: 'plinko', title: 'هرم الملوك', mode: 'مسار الجوائز', category: 'arcade' },
  { id: 'crash', title: 'صاروخ الملوك', mode: 'توقيت سريع', category: 'arcade' },
  { id: 'dice', title: 'نرد الملوك', mode: 'جولة نرد', category: 'table' },
  { id: 'mines', title: 'مناجم الكنوز', mode: 'كشف آمن', category: 'arcade' },
  { id: 'wheel', title: 'عجلة الملوك', mode: 'مكافأة يومية', category: 'arcade' },
  { id: 'fruit', title: 'فاكهة ذهبية', mode: 'مطابقة سريعة', category: 'arcade' },
]);

export const GAME_CATEGORIES = Object.freeze(['domino', 'arcade', 'cards', 'competitive', 'table']);
