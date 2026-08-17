# KingsDomino — Workflowربط ChatGPT + OpenCode

## مبدأ العمل

**ChatGPT** و **OpenCode** يشتغلوا على نفس المشروع في `C:\Users\mohamed\KingsDomino`
الربط يتم عبر **Git** — أي تغيير يتعمل في أي أداة لازم يعمل commit + push عشان التاني يقدر يجيبه.

---

## القواعد الذهبية

### 1. قبل ما تبدأ شغل
```bash
git pull origin feature/kingsdomino-final
```
دايماًجيب آخر تعديلات قبل ما تكتب أي كود جديد.

### 2. بعد ما تخلص شغل
```bash
git add .
git commit -m "feat: وصف التغيير"
git push origin feature/kingsdomino-final
```
لازم كل تغيير يعمل commit وpush عشان التاني يشوفه.

### 3. تسمية الـ Commits
| البادئة | الاستخدام |
|---------|----------|
| `feat:` | ميزة جديدة |
| `fix:` | إصلاح مشكلة |
| `refactor:` | إعادة تنظيم كود بدون تغيير السلوك |
| `chore:` | تنظيف، تحديث dependencies |
| `docs:` | توثيق |
| `ci:` | تغييرات CI/CD |
| `ui:` | تغييرات واجهة |
| `backend:` | تغييرات باك اند |

### 4. الفروع (Branches)
| الفرع | الغرض |
|-------|-------|
| `main` | الكود المستقر |
| `feature/kingsdomino-final` | شغل التطوير الرئيسي |
| `fix/*` | إصلاح أخطاء |
| `feat/*` | ميزات جديدة كبيرة |

### 5. مين بيعمل إيه
| المهمة | ChatGPT | OpenCode |
|--------|---------|----------|
| كتابة كود جديد | ✅ | ✅ |
| إصلاح أخطاء | ✅ | ✅ |
| تصميم Architecture | ✅ | ✅ |
| كتابة Tests | ✅ | ✅ |
| تثبيت Packages | ✅ | ✅ |
| تنفيذ Bash commands | ❌ محدود | ✅ كامل |
| قراءة/تعديل ملفات محلية | ❌ | ✅ مباشر |
| تشغيل الـ Server | ❌ | ✅ |
| Git operations | ❌ | ✅ |

---

## خطوات الربط الفعلي

### الخطوة 1: تأكد إن Git شغال
```bash
git status
```

### الخطوة 2: ا_pull آخر تعديلات
```bash
git pull origin feature/kingsdomino-final
```

### الخطوة 3: اشتغل على مشروعك
- عدّل الملفات اللي محتاجها
- اختبر التغييرات

### الخطوة 4: ا_commit وpush
```bash
git add .
git commit -m "feat: وصف واضح للتغيير"
git push origin feature/kingsdomino-final
```

### الخطوة 5: التاني يجيب التعديلات
```bash
git pull origin feature/kingsdomino-final
```

---

## بنية المشروع الحالية
```
C:\Users\mohamed\KingsDomino\
├── src/                    ← NestJS Backend
│   ├── auth/               ← JWT Auth + Login/Register
│   ├── users/              ← User Entity + Service
│   ├── wallet/             ← Wallet + Transactions (جديد)
│   ├── coupons/            ← Coupons + Redemptions (جديد)
│   ├── common/             ← Guards + Filters + Decorators (جديد)
│   ├── game/               ← Domino Logic + WebSocket
│   ├── rooms/              ← Room Management
│   └── main.ts             ← Entry point
├── mobile/                 ← Expo React Native App
├── unity/                  ← Unity 6 Game
├── .env                    ← Environment variables
├── package.json            ← Dependencies
└── nest-cli.json           ← NestJS config
```

---

## ملاحظات مهمة
1. **متعملش commit لـ secrets** — `.env` موجود في `.gitignore`
2. **متشتغلش على `main` مباشرة** — استخدم `feature/kingsdomino-final`
3. **اكتب commit message واضح** — عشان التاني يعرف اتعمل إيه
4. **اختبر قبل ما تpush** — شغّل `npm run build` وتأكد مفيش errors
5. **لو حصل merge conflict** — حلّه يدوياً ومتعملش force push
