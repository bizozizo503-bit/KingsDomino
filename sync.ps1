# KingsDomino Sync Script for Windows PowerShell
# استخدمه عشان تsync التعديلات بين ChatGPT وOpenCode

Write-Host "=== KingsDomino Sync ===" -ForegroundColor Cyan
Write-Host ""

# تأكد من الموقع
Set-Location $PSScriptRoot

# اعرض الحالة
Write-Host "1. الحالة الحالية:" -ForegroundColor Yellow
git status --short
Write-Host ""

# سأل هل يعمل pull
$pullChoice = Read-Host "2. هل تريد سحب آخر التعديلات من GitHub؟ (y/n)"
if ($pullChoice -eq "y" -or $pullChoice -eq "Y") {
    Write-Host "جاري السحب..." -ForegroundColor Green
    git pull origin feature/kingsdomino-final
    Write-Host ""
}

# اعرض التغييرات
Write-Host "3. التغييرات الحالية:" -ForegroundColor Yellow
git diff --stat
Write-Host ""

# سأل هل يعمل commit
$commitChoice = Read-Host "4. هل تريد حفظ التغييرات؟ (y/n)"
if ($commitChoice -eq "y" -or $commitChoice -eq "Y") {
    $commitMsg = Read-Host "   اكتب وصف التغيير"
    git add .
    git commit -m $commitMsg
    
    $pushChoice = Read-Host "   هل تريد رفع التغييرات لـ GitHub؟ (y/n)"
    if ($pushChoice -eq "y" -or $pushChoice -eq "Y") {
        Write-Host "جاري الرفع..." -ForegroundColor Green
        git push origin feature/kingsdomino-final
        Write-Host "تم الرفع بنجاح!" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=== انتهى ===" -ForegroundColor Cyan
