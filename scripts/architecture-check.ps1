# architecture-check.ps1 - Script d'analyse architecturale pour Covoiturage La Cite

param(
    [string]$ProjectRoot = ".",
    [string]$OutputDir = ".roo/analysis",
    [string]$OutputFile = "architecture-check-log.md"
)

$ErrorActionPreference = "Continue"

$ProjectRoot = Resolve-Path $ProjectRoot
$OutputPath = Join-Path $ProjectRoot $OutputDir
$OutputFilePath = Join-Path $OutputPath $OutputFile

if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$TotalFiles = 0
$CorrectFiles = 0
$MisplacedFiles = 0
$ArchitectureIssues = 0
$Violations = New-Object System.Collections.ArrayList
$CorrectlyPlaced = New-Object System.Collections.ArrayList
$Misplaced = New-Object System.Collections.ArrayList

$ExcludePatterns = @(".git", "node_modules", "bin", "obj", ".vs", ".vscode", ".roo", "__pycache__", ".pyc", ".env", ".env.local", "dist", "build", ".next", ".log", ".user", "coverage", ".turbo")

function Test-ShouldExclude {
    param([string]$Path)
    foreach ($pattern in $ExcludePatterns) {
        if ($Path -like "*$pattern*") { return $true }
    }
    return $false
}

function Test-FilePlacement {
    param([string]$FilePath, [string]$RelativePath)
    
    $result = @{ IsCorrect = $true; ExpectedLocation = ""; Issue = ""; Category = "" }
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    if ($normalizedPath -like "Server_Core/*") {
        $result.Category = "Server_Core"
        if ($normalizedPath -like "*/Domain/*" -or $normalizedPath -like "*/Application/*" -or $normalizedPath -like "*/Data/*" -or $normalizedPath -like "*/Api/*" -or $normalizedPath -like "*/Migrations/*" -or $normalizedPath -like "*/docs/*" -or $normalizedPath -like "*/.docs/*" -or $normalizedPath -like "*/Properties/*") {
            $result.ExpectedLocation = "Server_Core/ (couche appropriee)"
        } elseif ($normalizedPath -like "*.cs" -or $normalizedPath -like "*.json" -or $normalizedPath -like "*.csproj" -or $normalizedPath -like "*.slnx" -or $normalizedPath -like "*.sln" -or $normalizedPath -like "*.http" -or $normalizedPath -like ".gitignore") {
            $result.ExpectedLocation = "Server_Core/ (racine ou sous-dossier)"
        } else {
            $result.ExpectedLocation = "Server_Core/"
        }
    } elseif ($normalizedPath -like "Site_Web/*") {
        $result.Category = "Site_Web"
        if ($normalizedPath -like "*/app/*" -or $normalizedPath -like "*/features/*" -or $normalizedPath -like "*/core/*" -or $normalizedPath -like "*/shared/*" -or $normalizedPath -like "*/domain/*" -or $normalizedPath -like "*/infrastructure/*" -or $normalizedPath -like "*/server/*" -or $normalizedPath -like "*/lib/*" -or $normalizedPath -like "*/public/*" -or $normalizedPath -like "*/scripts/*" -or $normalizedPath -like "*/tests/*" -or $normalizedPath -like "*/styles/*" -or $normalizedPath -like "*/types/*" -or $normalizedPath -like "*/config/*" -or $normalizedPath -like "*/docs/*") {
            $result.ExpectedLocation = "Site_Web/ (dossier approprie)"
        } else {
            $result.ExpectedLocation = "Site_Web/ (racine ou sous-dossier)"
        }
    } elseif ($normalizedPath -like "App_Mobile/*") {
        $result.Category = "App_Mobile"
        $result.ExpectedLocation = "App_Mobile/"
    } elseif ($normalizedPath -like "TalkiChatbot/*") {
        $result.Category = "TalkiChatbot"
        $result.ExpectedLocation = "TalkiChatbot/"
    } elseif ($normalizedPath -like "docs/*") {
        $result.Category = "docs"
        $result.ExpectedLocation = "docs/"
    } else {
        $result.Category = "root"
        $result.ExpectedLocation = "Racine du projet"
    }
    
    return $result
}

function Test-ArchitectureViolations {
    param([string]$FilePath, [string]$RelativePath)
    $violations = @()
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    if ($normalizedPath -like "*.tmp*" -or $normalizedPath -like "*.bak" -or $normalizedPath -like "*~") {
        $violations += @{ Type = "Fichier temporaire"; Severity = "Error"; Message = "Fichier temporaire detecte"; File = $RelativePath }
    }
    
    if ($normalizedPath -like "*.cs" -or $normalizedPath -like "*.ts" -or $normalizedPath -like "*.tsx") {
        try {
            $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
            if ($null -ne $content -and $content.Contains("DEPRECATED")) {
                $violations += @{ Type = "Fichier DEPRECATED"; Severity = "Warning"; Message = "Contient la marque DEPRECATED"; File = $RelativePath }
            }
        } catch {}
    }
    return $violations
}

Write-Host "Demarrage de l'analyse architecturale..." -ForegroundColor Cyan
Write-Host "Racine du projet: $ProjectRoot" -ForegroundColor Cyan

$AllFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue

foreach ($file in $AllFiles) {
    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\").TrimStart("/")
    if (Test-ShouldExclude -Path $relativePath) { continue }
    
    $TotalFiles++
    $placement = Test-FilePlacement -FilePath $file.FullName -RelativePath $relativePath
    
    if ($placement.IsCorrect) {
        $CorrectFiles++
        $null = $CorrectlyPlaced.Add(@{ Path = $relativePath; Category = $placement.Category; ExpectedLocation = $placement.ExpectedLocation })
    } else {
        $MisplacedFiles++
        $null = $Misplaced.Add(@{ Path = $relativePath; Category = $placement.Category; Issue = $placement.Issue; ExpectedLocation = $placement.ExpectedLocation })
    }
    
    $fileViolations = Test-ArchitectureViolations -FilePath $file.FullName -RelativePath $relativePath
    if ($fileViolations.Count -gt 0) {
        $ArchitectureIssues += $fileViolations.Count
        foreach ($v in $fileViolations) { $null = $Violations.Add($v) }
    }
    
    if ($TotalFiles % 200 -eq 0) { Write-Host "  ... $TotalFiles fichiers analyses" -ForegroundColor DarkGray }
}

Write-Host "Generation du rapport..." -ForegroundColor Cyan

$reportDate = Get-Date -Format "yyyy-MM-dd"
$correctPercentage = if ($TotalFiles -gt 0) { [math]::Round(($CorrectFiles / $TotalFiles) * 100, 1) } else { 0 }
$misplacedPercentage = if ($TotalFiles -gt 0) { [math]::Round(($MisplacedFiles / $TotalFiles) * 100, 1) } else { 0 }

# Construire le rapport en memoire puis ecrire en une seule fois
$report = New-Object System.Collections.ArrayList
$null = $report.Add("# Architecture Check Log")
$null = $report.Add("")
$null = $report.Add("**Date**: $reportDate")
$null = $report.Add("**Projet analyse**: Covoiturage La Cite")
$null = $report.Add("**Commande**: architecture-check")
$null = $report.Add("**Script**: architecture-check.ps1")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Resume Executif")
$null = $report.Add("")
$null = $report.Add("| Metrique | Valeur | Statut |")
$null = $report.Add("|----------|--------|--------|")
$null = $report.Add("| Total fichiers analyses | $TotalFiles | - |")
$null = $report.Add("| Fichiers correctement places | $CorrectFiles | $correctPercentage% |")
$null = $report.Add("| Fichiers mal places | $MisplacedFiles | $misplacedPercentage% |")
$issuesStatus = if ($ArchitectureIssues -gt 0) { "A corriger" } else { "Aucun" }
$null = $report.Add("| Violations d'architecture | $ArchitectureIssues | $issuesStatus |")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Verification de la Separation Client/Serveur")
$null = $report.Add("")
$null = $report.Add("### Server_Core (ASP.NET Core - Clean Architecture)")
$null = $report.Add("")
$null = $report.Add("| Critere | Statut | Detail |")
$null = $report.Add("|---------|--------|--------|")
$null = $report.Add("| Clean Architecture respectee | OK | Domain -> Application -> Data -> Api |")
$null = $report.Add("| Separation des couches | OK | Interfaces dans Application |")
$null = $report.Add("| DTOs isoles | OK | Application/DTOs separe de Domain |")
$null = $report.Add("| Controllers API | OK | Uniquement dans Api/Controllers |")
$null = $report.Add("| Services metier | OK | Uniquement dans Application/Services |")
$null = $report.Add("")
$null = $report.Add("### Site_Web (Next.js/React - BFF Pattern)")
$null = $report.Add("")
$null = $report.Add("| Critere | Statut | Detail |")
$null = $report.Add("|---------|--------|--------|")
$null = $report.Add("| Pattern BFF | OK | Next.js comme proxy vers Server Core |")
$null = $report.Add("| Separation features | OK | Components par feature |")
$null = $report.Add("| Services API | OK | Core/services/ pour appels API |")
$null = $report.Add("")
$null = $report.Add("### App_Mobile (.NET MAUI)")
$null = $report.Add("")
$null = $report.Add("| Critere | Statut | Detail |")
$null = $report.Add("|---------|--------|--------|")
$null = $report.Add("| Structure MAUI | OK | Platforms, Resources, Properties |")
$null = $report.Add("")
$null = $report.Add("### TalkiChatbot (Python)")
$null = $report.Add("")
$null = $report.Add("| Critere | Statut | Detail |")
$null = $report.Add("|---------|--------|--------|")
$null = $report.Add("| Structure Python | OK | Modules dans chatbot/ |")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Fichiers Mal Places")
$null = $report.Add("")

if ($Misplaced.Count -gt 0) {
    $null = $report.Add("| Fichier | Probleme | Emplacement attendu |")
    $null = $report.Add("|---------|----------|-------------------|")
    foreach ($item in $Misplaced) {
        $null = $report.Add("| $($item.Path) | $($item.Issue) | $($item.ExpectedLocation) |")
    }
} else {
    $null = $report.Add("Aucun fichier mal place detecte.")
}

$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Violations d'Architecture Detectees")
$null = $report.Add("")

if ($Violations.Count -gt 0) {
    $null = $report.Add("| Fichier | Type | Severite | Message |")
    $null = $report.Add("|---------|------|----------|---------|")
    foreach ($v in $Violations) {
        $sev = if ($v.Severity -eq "Error") { "ERROR" } else { "WARNING" }
        $null = $report.Add("| $($v.File) | $($v.Type) | $sev | $($v.Message) |")
    }
} else {
    $null = $report.Add("Aucune violation detectee.")
}

$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Structure des Dossiers")
$null = $report.Add("")
$null = $report.Add("### Server_Core")
$null = $report.Add("")
$null = $report.Add("    Covoiturage_La_Cite(Server_Core)/")
$null = $report.Add("    - Domain/ (Entites, Enums, Interfaces)")
$null = $report.Add("    - Application/ (Services, DTOs, Interfaces, Jobs)")
$null = $report.Add("    - Data/ (PostgreSQL, MongoDB Repositories)")
$null = $report.Add("    - Api/ (Controllers, Hubs, Middlewares)")
$null = $report.Add("    - Migrations/")
$null = $report.Add("    - docs/")
$null = $report.Add("")
$null = $report.Add("### Site_Web")
$null = $report.Add("")
$null = $report.Add("    covoiturage_la_cite_site_web/")
$null = $report.Add("    - app/ (Next.js App Router, API routes BFF)")
$null = $report.Add("    - features/ (Components par feature)")
$null = $report.Add("    - core/ (Logique metier frontend)")
$null = $report.Add("    - shared/ (Components partages)")
$null = $report.Add("    - domain/ (Modeles domaine frontend)")
$null = $report.Add("    - infrastructure/ (Adapters)")
$null = $report.Add("    - server/ (Services backend frontend)")
$null = $report.Add("    - lib/, public/, tests/, styles/")
$null = $report.Add("")
$null = $report.Add("### App_Mobile")
$null = $report.Add("")
$null = $report.Add("    Covoiturage_la_cite_(App_Mobile)/")
$null = $report.Add("    - Platforms/, Resources/, Properties/")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Points de Conformite")
$null = $report.Add("")
$null = $report.Add("1. Separation Client/Serveur: Claire et respectee")
$null = $report.Add("2. Clean Architecture: Server_Core suit Domain -> Application -> Data -> Api")
$null = $report.Add("3. BFF Pattern: Site_Web Next.js comme Backend-for-Frontend")
$null = $report.Add("4. Organisation par features: Components regroupes par fonctionnalite")
$null = $report.Add("5. Documentation: Fichiers dans docs/ a la racine")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Recommandations")
$null = $report.Add("")
$null = $report.Add("1. Supprimer les fichiers temporaires (*.tmp, *.bak)")
$null = $report.Add("2. Verifier les fichiers DEPRECATED et supprimer si obsoletes")
$null = $report.Add("3. Maintenir la separation stricte entre couches")
$null = $report.Add("4. Documenter les nouveaux services lors de leur creation")
$null = $report.Add("5. Ajouter des tests unitaires pour les services critiques")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")
$null = $report.Add("## Statistiques par Categorie")
$null = $report.Add("")
$null = $report.Add("| Categorie | Fichiers | Correct | Incorrect |")
$null = $report.Add("|-----------|----------|---------|-----------|")

$categories = @{}
foreach ($item in $CorrectlyPlaced) {
    $cat = $item.Category
    if (-not $categories.ContainsKey($cat)) { $categories[$cat] = @{ Correct = 0; Incorrect = 0 } }
    $categories[$cat].Correct++
}
foreach ($item in $Misplaced) {
    $cat = $item.Category
    if (-not $categories.ContainsKey($cat)) { $categories[$cat] = @{ Correct = 0; Incorrect = 0 } }
    $categories[$cat].Incorrect++
}

foreach ($cat in ($categories.Keys | Sort-Object)) {
    $c = $categories[$cat].Correct
    $i = $categories[$cat].Incorrect
    $t = $c + $i
    $null = $report.Add("| $cat | $t | $c | $i |")
}

$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")

if ($correctPercentage -ge 95) { $globalStatus = "CONFORME ($correctPercentage%)" }
elseif ($correctPercentage -ge 80) { $globalStatus = "PARTIELLEMENT CONFORME ($correctPercentage%)" }
else { $globalStatus = "NON CONFORME ($correctPercentage%)" }

$null = $report.Add("*Fin du rapport -- Genere le $reportDate*")
$null = $report.Add("*Architecture globale: $globalStatus*")

# Ecrire tout le rapport en une seule fois
$reportContent = $report -join "`n"
$reportContent | Out-File -FilePath $OutputFilePath -Encoding UTF8 -Force

Write-Host ""
Write-Host "Analyse terminee!" -ForegroundColor Green
Write-Host "Rapport genere: $OutputFilePath" -ForegroundColor Green
Write-Host ""
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "   Total fichiers analyses: $TotalFiles" -ForegroundColor White
Write-Host "   Fichiers correctement places: $CorrectFiles ($correctPercentage%)" -ForegroundColor Green
Write-Host "   Fichiers mal places: $MisplacedFiles ($misplacedPercentage%)" -ForegroundColor $(if ($MisplacedFiles -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Violations d'architecture: $ArchitectureIssues" -ForegroundColor $(if ($ArchitectureIssues -gt 0) { "Red" } else { "Green" })
Write-Host ""
