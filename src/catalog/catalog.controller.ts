import { Controller, Get } from '@nestjs/common';

export interface CatalogGame {
  id: string;
  title: string;
  category: 'domino' | 'arcade' | 'spin' | 'mini';
  description: string;
  featured?: boolean;
  playMoneyOnly: true;
}

const catalog: CatalogGame[] = [
  { id: 'domino-classic', title: 'دومينو كلاسيك', category: 'domino', description: 'النسخة الأساسية من ملوك الدومينو.', featured: true, playMoneyOnly: true },
  { id: 'domino-all-fives', title: 'دومينو All Fives', category: 'domino', description: 'تحدي النقاط السريع.', playMoneyOnly: true },
  { id: 'domino-block', title: 'دومينو Block', category: 'domino', description: 'أغلق اللعب وخطط لحركتك.', playMoneyOnly: true },
  { id: 'domino-draw', title: 'دومينو Draw', category: 'domino', description: 'اسحب قطعة عندما لا تجد حركة مناسبة.', playMoneyOnly: true },
  { id: 'olympus-storm', title: 'Olympus Storm', category: 'spin', description: 'لعبة Spin أصلية بطابع أسطوري ومضاعفات افتراضية.', featured: true, playMoneyOnly: true },
  { id: 'kings-wheel', title: 'Kings Wheel', category: 'arcade', description: 'عجلة جوائز ترفيهية بالعملات الافتراضية.', playMoneyOnly: true },
  { id: 'royal-scratch', title: 'Royal Scratch', category: 'mini', description: 'لعبة خدش سريعة للمتعة فقط.', playMoneyOnly: true },
  { id: 'crown-crash', title: 'Crown Rush', category: 'arcade', description: 'لعبة توقيت ومضاعفات افتراضية.', playMoneyOnly: true },
];

@Controller('api/games')
export class CatalogController {
  @Get()
  getAll(): CatalogGame[] { return catalog; }

  @Get('featured')
  getFeatured(): CatalogGame[] { return catalog.filter((game) => game.featured); }
}
