#!/bin/bash
# KingsDomino Sync Script
# استخدمه عشان تsync التعديلات بين ChatGPT وOpenCode

echo "=== KingsDomino Sync ==="
echo ""

# تأكد من الموقع
cd "$(dirname "$0")"

# اعرض الحالة
echo "1. الحالية الحالية:"
git status --short
echo ""

# سأل هل يعمل pull
read -p "2. هل تريد سحب آخر التعديلات من GitHub؟ (y/n): " pull_choice
if [ "$pull_choice" = "y" ] || [ "$pull_choice" = "Y" ]; then
    echo "جاري السحب..."
    git pull origin feature/kingsdomino-final
    echo ""
fi

# اعرض التغييرات
echo "3. التغييرات الحالية:"
git diff --stat
echo ""

# سأل هل يعمل commit
read -p "4. هل تريد حفظ التغييرات؟ (y/n): " commit_choice
if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
    read -p "   اكتب وصف التغيير: " commit_msg
    git add .
    git commit -m "$commit_msg"
    
    read -p "   هل تريد رفع التغييرات لـ GitHub؟ (y/n): " push_choice
    if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
        echo "جاري الرفع..."
        git push origin feature/kingsdomino-final
        echo "تم الرفع بنجاح!"
    fi
fi

echo ""
echo "=== انتهى ==="
