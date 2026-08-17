param(
    [string]$Command = "menu"
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Unity = Join-Path $Root "unity"
$Mobile = Join-Path $Root "mobile"

function Header($text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Check-All {

    Header "KINGSDOMINO CONTROL CENTER"

    Write-Host "[1] GITHUB / GIT" -ForegroundColor Yellow

    git -C $Root status --short
    git -C $Root branch --show-current
    git -C $Root remote -v

    Write-Host ""
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        gh auth status
    }
    else {
        Write-Host "GitHub CLI not installed." -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[2] UNITY" -ForegroundColor Yellow

    if (Test-Path "$Unity\ProjectSettings\ProjectVersion.txt") {
        Write-Host "Unity project: OK" -ForegroundColor Green
        Get-Content "$Unity\ProjectSettings\ProjectVersion.txt"
    }
    else {
        Write-Host "Unity project: NOT FOUND" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[3] ARABIC FONT" -ForegroundColor Yellow

    Write-Host "TTF:        $(Test-Path "$Unity\Assets\KingsDominos\Fonts\ArabicArial.ttf")"
    Write-Host "Characters: $(Test-Path "$Unity\Assets\KingsDominos\Fonts\ArabicCharacters.txt")"
    Write-Host "SDF:        $(Test-Path "$Unity\Assets\Resources\KingsDominosFonts\ArabicArial SDF.asset")"

    Write-Host ""
    Write-Host "[4] UNITY SCRIPTS" -ForegroundColor Yellow

    Get-ChildItem "$Unity\Assets\KingsDominos\Scripts" `
        -Recurse `
        -Filter "*.cs" `
        -ErrorAction SilentlyContinue |
        Select-Object Name,Length

    Write-Host ""
    Write-Host "[5] UNITY SCENES" -ForegroundColor Yellow

    Get-ChildItem "$Unity\Assets\KingsDominos\Scenes" `
        -Filter "*.unity" `
        -ErrorAction SilentlyContinue |
        Select-Object Name,Length

    Write-Host ""
    Write-Host "[6] NESTJS BACKEND" -ForegroundColor Yellow

    if (Test-Path "$Root\package.json") {
        Write-Host "package.json: OK" -ForegroundColor Green

        $pkg = Get-Content "$Root\package.json" -Raw |
            ConvertFrom-Json

        Write-Host "Project: $($pkg.name)"

        if (Test-Path "$Root\node_modules") {
            Write-Host "node_modules: OK" -ForegroundColor Green
        }
        else {
            Write-Host "node_modules: MISSING" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "[7] MOBILE" -ForegroundColor Yellow

    if (Test-Path $Mobile) {
        Write-Host "mobile folder: OK" -ForegroundColor Green

        if (Test-Path "$Mobile\package.json") {
            Write-Host "mobile package.json: OK" -ForegroundColor Green
        }
        else {
            Write-Host "mobile package.json: MISSING" -ForegroundColor Red
        }

        if (Test-Path "$Mobile\node_modules") {
            Write-Host "mobile node_modules: OK" -ForegroundColor Green
        }
    }
    else {
        Write-Host "mobile folder: MISSING" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "[8] IMPORTANT UNTRACKED FILES" -ForegroundColor Yellow

    git -C $Root status --short

    Header "CHECK FINISHED"
}

function Install-Backend {
    Header "INSTALLING BACKEND"

    Set-Location $Root

    if (Test-Path ".\package.json") {
        npm install
    }
    else {
        Write-Host "package.json not found." -ForegroundColor Red
    }
}

function Install-Mobile {
    Header "INSTALLING MOBILE"

    if (!(Test-Path $Mobile)) {
        Write-Host "mobile folder not found." -ForegroundColor Red
        return
    }

    Set-Location $Mobile

    if (Test-Path ".\package.json") {
        npm install
    }
    else {
        Write-Host "mobile/package.json does not exist yet." -ForegroundColor Red
    }
}

function Start-Backend {
    Header "STARTING NESTJS"

    Set-Location $Root
    npm run start:dev
}

function Start-Mobile {
    Header "STARTING MOBILE"

    Set-Location $Mobile

    if (Test-Path ".\package.json") {
        npm start
    }
    else {
        Write-Host "mobile/package.json missing." -ForegroundColor Red
    }
}

function Git-Status {
    Header "GIT STATUS"

    Set-Location $Root

    git status
    git branch --show-current
    git remote -v
}

function Git-Pull {
    Header "GIT PULL"

    Set-Location $Root
    git pull origin main
}

function Git-Push {
    Header "GIT PUSH"

    Set-Location $Root

    git status --short

    Write-Host ""
    Write-Host "IMPORTANT: This will NOT automatically add node_modules." -ForegroundColor Yellow

    git add KingsDomino-Control.ps1

    git status --short

    Write-Host ""
    $msg = Read-Host "Commit message"

    if ([string]::IsNullOrWhiteSpace($msg)) {
        $msg = "Update KingsDomino Control Center"
    }

    git commit -m $msg
    git push origin main
}

function Menu {

    while ($true) {

        Header "KINGSDOMINO MASTER CONTROL"

        Write-Host "1  - Check everything"
        Write-Host "2  - Git status"
        Write-Host "3  - Git pull"
        Write-Host "4  - Install backend"
        Write-Host "5  - Start NestJS"
        Write-Host "6  - Install mobile"
        Write-Host "7  - Start mobile"
        Write-Host "8  - Git push Control Center"
        Write-Host "9  - Open Unity project folder"
        Write-Host "0  - Exit"

        Write-Host ""

        $choice = Read-Host "Choose"

        switch ($choice) {

            "1" { Check-All }
            "2" { Git-Status }
            "3" { Git-Pull }
            "4" { Install-Backend }
            "5" { Start-Backend }
            "6" { Install-Mobile }
            "7" { Start-Mobile }
            "8" { Git-Push }

            "9" {
                Start-Process explorer.exe $Unity
            }

            "0" {
                return
            }

            default {
                Write-Host "Invalid choice." -ForegroundColor Red
            }
        }

        Write-Host ""
        Read-Host "Press Enter to continue"
    }
}

switch ($Command.ToLower()) {

    "check" { Check-All }
    "status" { Git-Status }
    "pull" { Git-Pull }
    "backend" { Start-Backend }
    "mobile" { Start-Mobile }
    "menu" { Menu }

    default {
        Write-Host "Commands: menu, check, status, pull, backend, mobile"
    }
}
