$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "       KINGSDOMINO CONTROL CENTER" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Git" -ForegroundColor Yellow
git -C $Root status --short
git -C $Root branch --show-current
git -C $Root remote -v

Write-Host ""
Write-Host "[2] Unity" -ForegroundColor Yellow

$UnityProject = Join-Path $Root "unity"

if (Test-Path "$UnityProject\ProjectSettings\ProjectVersion.txt") {
    Write-Host "Unity project: OK" -ForegroundColor Green
    Get-Content "$UnityProject\ProjectSettings\ProjectVersion.txt"
} else {
    Write-Host "Unity project: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "[3] Arabic Font" -ForegroundColor Yellow

$Font = "$UnityProject\Assets\KingsDominos\Fonts\ArabicArial.ttf"
$Chars = "$UnityProject\Assets\KingsDominos\Fonts\ArabicCharacters.txt"
$FontAsset = "$UnityProject\Assets\Resources\KingsDominosFonts\ArabicArial SDF.asset"

Write-Host "TTF:       $(Test-Path $Font)"
Write-Host "Characters:$(Test-Path $Chars)"
Write-Host "SDF:       $(Test-Path $FontAsset)"

Write-Host ""
Write-Host "[4] Unity Scripts" -ForegroundColor Yellow

Get-ChildItem "$UnityProject\Assets\KingsDominos\Scripts" `
    -Recurse `
    -Filter "*.cs" `
    -ErrorAction SilentlyContinue |
    Select-Object Name,Length

Write-Host ""
Write-Host "[5] Scenes" -ForegroundColor Yellow

Get-ChildItem "$UnityProject\Assets\KingsDominos\Scenes" `
    -Filter "*.unity" `
    -ErrorAction SilentlyContinue |
    Select-Object Name,Length

Write-Host ""
Write-Host "[6] Backend" -ForegroundColor Yellow

$Backend = $Root

if (Test-Path "$Backend\package.json") {
    Write-Host "package.json: OK" -ForegroundColor Green

    $pkg = Get-Content "$Backend\package.json" -Raw | ConvertFrom-Json

    Write-Host "Project: $($pkg.name)"

    if (Test-Path "$Backend\node_modules") {
        Write-Host "node_modules: OK" -ForegroundColor Green
    } else {
        Write-Host "node_modules: MISSING" -ForegroundColor Red
    }
} else {
    Write-Host "package.json: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "[7] Mobile" -ForegroundColor Yellow

$Mobile = Join-Path $Root "mobile"

if (Test-Path $Mobile) {
    Write-Host "mobile folder: OK" -ForegroundColor Green

    Get-ChildItem $Mobile -Force -ErrorAction SilentlyContinue |
        Select-Object Mode,Name,Length
} else {
    Write-Host "mobile folder: NOT FOUND" -ForegroundColor Red
}

Write-Host ""
Write-Host "[8] GitHub Connection" -ForegroundColor Yellow

try {
    gh auth status
} catch {
    Write-Host "GitHub CLI not available." -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "       CHECK FINISHED" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
