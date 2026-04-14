# doc-classification.ps1 - Script de classification des fichiers personnels pour Covoiturage La Cite
# Ce script identifie les fichiers liés à l'espace de travail personnel et vérifie qu'ils sont
# correctement placés dans des dossiers ignorés par git.

param(
    [string]$ProjectRoot = ".",
    [string]$OutputDir = ".roo/analysis",
    [string]$OutputFile = "doc-classification-log.md",
    [switch]$MoveFiles = $false
)

$ErrorActionPreference = "Continue"

$ProjectRoot = Resolve-Path $ProjectRoot
$OutputPath = Join-Path $ProjectRoot $OutputDir
$OutputFilePath = Join-Path $OutputPath $OutputFile

if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Dossiers cibles pour les fichiers personnels (doivent être ignorés par git)
$PersonalFolders = @{
    ".roo" = "Configuration et commandes Roo AI"
    "docs" = "Documentation du projet (ignoré par git)"
    ".vscode" = "Configuration VS Code personnelle"
    ".idea" = "Configuration JetBrains/IntelliJ"
    "logs" = "Fichiers de logs"
    "temp" = "Fichiers temporaires"
    ".cache" = "Cache divers"
}

# Patterns de fichiers personnels à ignorer
$PersonalFilePatterns = @(
    "*.tmp", "*.bak", "*.swp", "*.swo", "*~",
    "*.log", "*.trace",
    ".env", ".env.*", "!.env.example",
    "*.user", "*.userprefs",
    ".DS_Store", "Thumbs.db",
    "*.ps1", "*.bat", "*.cmd",  # Scripts personnels (sauf scripts/ du projet)
    "*.md",  # Documentation personnelle
    "*.txt", "*.notes",
    "*.json.config", "*.config",
    "*.csv", "*.xlsx",  # Données exportées
    "*.zip", "*.rar", "*.7z",  # Archives
    "*.py",  # Scripts Python personnels
    "*.sh",  # Scripts shell personnels
    "test-*", "*-test.*",  # Fichiers de test locaux
    "scratch.*", "draft.*", "brouillon.*",
    "personal.*", "private.*", "local.*"
)

# Patterns de fichiers à EXCLURE de l'analyse (fichiers projet légitimes)
$ProjectFilePatterns = @(
    "scripts/architecture-check.ps1",
    "scripts/doc-classification.ps1",
    "Site_Web/covoiturage_la_cite_site_web/scripts/*",
    "Server_Core/**/*.cs",
    "Server_Core/**/*.csproj",
    "Server_Core/**/*.slnx",
    "App_Mobile/**/*.cs",
    "App_Mobile/**/*.csproj",
    "Site_Web/**/*.ts",
    "Site_Web/**/*.tsx",
    "Site_Web/**/*.js",
    "Site_Web/**/*.jsx",
    "Site_Web/package.json",
    "TalkiChatbot/**/*.py"
)

# Fichiers/dossiers à exclure totalement de l'analyse
$ExcludePatterns = @(".git", "node_modules", "bin", "obj", ".vs", "__pycache__", ".pyc", "dist", "build", ".next", "coverage", ".turbo", ".output")

# Catégories de classification
$Categories = @{
    "scripts_personnels" = "Scripts PowerShell, Bash, Python personnels"
    "logs" = "Fichiers de logs et traces"
    "config_personnelle" = "Configurations IDE, environnement"
    "documentation" = "Documentation personnelle, notes"
    "temporaire" = "Fichiers temporaires, cache"
    "archives" = "Fichiers compressés"
    "donnees_exportees" = "CSV, Excel, exports"
    "projet_legitime" = "Fichiers faisant partie du projet"
}

# Statistiques
$TotalFiles = 0
$PersonalFiles = 0
$MisplacedFiles = 0
$MovedFiles = 0
$ProjectFiles = 0
$ClassifiedFiles = New-Object System.Collections.ArrayList
$MisplacedList = New-Object System.Collections.ArrayList
$MoveOperations = New-Object System.Collections.ArrayList

function Test-ShouldExclude {
    param([string]$Path)
    foreach ($pattern in $ExcludePatterns) {
        if ($Path -like "*$pattern*") { return $true }
    }
    return $false
}

function Test-IsProjectFile {
    param([string]$RelativePath)
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    # Vérifier si c'est un fichier de script du projet
    if ($normalizedPath -eq "scripts/architecture-check.ps1") { return $true }
    if ($normalizedPath -eq "scripts/doc-classification.ps1") { return $true }
    
    # Fichiers dans le dossier scripts/ du projet sont légitimes
    if ($normalizedPath -like "scripts/*") { return $true }
    
    # Scripts dans Site_Web sont légitimes
    if ($normalizedPath -like "Site_Web/*/scripts/*") { return $true }
    
    # Code source est légitime
    if ($normalizedPath -like "Server_Core/*.cs" -or $normalizedPath -like "Server_Core/*.csproj") { return $true }
    if ($normalizedPath -like "App_Mobile/*.cs" -or $normalizedPath -like "App_Mobile/*.csproj") { return $true }
    if ($normalizedPath -like "Site_Web/*.ts" -or $normalizedPath -like "Site_Web/*.tsx") { return $true }
    if ($normalizedPath -like "TalkiChatbot/*.py") { return $true }
    
    # Fichiers de configuration projet
    if ($normalizedPath -like "*.slnx" -or $normalizedPath -like "*.sln") { return $true }
    if ($normalizedPath -like "*/package.json" -and $normalizedPath -notlike "*/node_modules/*") { return $true }
    if ($normalizedPath -like "*/tsconfig.json") { return $true }
    if ($normalizedPath -like "*/.gitignore") { return $true }
    if ($normalizedPath -like "*/README.md") { return $true }
    
    return $false
}

function Test-IsPersonalFile {
    param([string]$RelativePath, [string]$FileName)
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    # Fichiers dans .roo/ sont personnels
    if ($normalizedPath -like ".roo/*") { return $true }
    
    # Fichiers dans docs/ (déjà ignoré par git)
    if ($normalizedPath -like "docs/*") { return $true }
    
    # Fichiers temporaires
    if ($FileName -like "*.tmp" -or $FileName -like "*.bak" -or $FileName -like "*.swp" -or $FileName -like "*~") { 
        return $true 
    }
    
    # Fichiers de logs
    if ($FileName -like "*.log" -or $FileName -like "*.trace") { return $true }
    
    # Fichiers de configuration IDE
    if ($normalizedPath -like ".vscode/*" -or $normalizedPath -like ".idea/*") { return $true }
    if ($FileName -like "*.user" -or $FileName -like "*.userprefs") { return $true }
    
    # Fichiers système
    if ($FileName -eq ".DS_Store" -or $FileName -eq "Thumbs.db") { return $true }
    
    # Fichiers .env (sauf .env.example)
    if ($FileName -like ".env" -or ($FileName -like ".env.*" -and $FileName -ne ".env.example")) { return $true }
    
    return $false
}

function Get-FileCategory {
    param([string]$RelativePath, [string]$FileName)
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    if ($normalizedPath -like ".roo/*") { return "config_personnelle" }
    if ($normalizedPath -like "docs/*") { return "documentation" }
    if ($normalizedPath -like ".vscode/*" -or $normalizedPath -like ".idea/*") { return "config_personnelle" }
    if ($FileName -like "*.log" -or $FileName -like "*.trace") { return "logs" }
    if ($FileName -like "*.tmp" -or $FileName -like "*.bak" -or $FileName -like "*.swp") { return "temporaire" }
    if ($FileName -like "*.zip" -or $FileName -like "*.rar" -or $FileName -like "*.7z") { return "archives" }
    if ($FileName -like "*.csv" -or $FileName -like "*.xlsx") { return "donnees_exportees" }
    if ($FileName -like "*.ps1" -or $FileName -like "*.sh" -or $FileName -like "*.py") { return "scripts_personnels" }
    if ($FileName -like "*.md" -or $FileName -like "*.txt") { return "documentation" }
    if ($FileName -like "*.user" -or $FileName -like ".env*") { return "config_personnelle" }
    
    return "autre"
}

function Get-TargetFolder {
    param([string]$Category)
    switch ($Category) {
        "scripts_personnels" { return "docs/scripts-personnels" }
        "logs" { return "docs/logs" }
        "config_personnelle" { return "docs/config-personnelle" }
        "documentation" { return "docs" }
        "temporaire" { return "docs/temp" }
        "archives" { return "docs/archives" }
        "donnees_exportees" { return "docs/exports" }
        default { return "docs/divers" }
    }
}

function Test-IsInIgnoredFolder {
    param([string]$RelativePath)
    $normalizedPath = $RelativePath.Replace("\", "/")
    
    # Vérifier si le fichier est dans un dossier ignoré par git
    if ($normalizedPath -like ".roo/*") { return $true }
    if ($normalizedPath -like "docs/*") { return $true }
    if ($normalizedPath -like ".vscode/*") { return $true }  # Sera ajouté au .gitignore
    if ($normalizedPath -like ".idea/*") { return $true }    # Sera ajouté au .gitignore
    if ($normalizedPath -like "logs/*") { return $true }     # Sera ajouté au .gitignore
    if ($normalizedPath -like "temp/*") { return $true }     # Sera ajouté au .gitignore
    
    return $false
}

function Move-PersonalFile {
    param([string]$SourcePath, [string]$Category)
    $targetFolder = Get-TargetFolder $Category
    $targetPath = Join-Path $ProjectRoot $targetFolder
    
    if (-not (Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    
    $fileName = [System.IO.Path]::GetFileName($SourcePath)
    $destination = Join-Path $targetPath $fileName
    
    # Éviter les conflits de noms
    $counter = 1
    while (Test-Path $destination) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
        $extension = [System.IO.Path]::GetExtension($fileName)
        $destination = Join-Path $targetPath "${baseName}_${counter}${extension}"
        $counter++
    }
    
    try {
        Move-Item -Path $SourcePath -Destination $destination -Force
        return @{ Success = $true; Destination = $destination }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ============================================================
# DÉBUT DE L'ANALYSE
# ============================================================

Write-Host "Demarrage de l'analyse de classification des fichiers personnels..." -ForegroundColor Cyan
Write-Host "Racine du projet: $ProjectRoot" -ForegroundColor Cyan
Write-Host "Mode deplacement: $(if ($MoveFiles) { 'OUI' } else { 'NON (analyse seule)' })" -ForegroundColor $(if ($MoveFiles) { "Yellow" } else { "Green" })

$AllFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue

foreach ($file in $AllFiles) {
    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\").TrimStart("/")
    
    # Exclure les dossiers système
    if (Test-ShouldExclude -Path $relativePath) { continue }
    
    $TotalFiles++
    $fileName = $file.Name
    
    # Vérifier si c'est un fichier projet légitime
    if (Test-IsProjectFile -RelativePath $relativePath) {
        $ProjectFiles++
        $null = $ClassifiedFiles.Add(@{
            Path = $relativePath
            Category = "projet_legitime"
            IsPersonal = $false
            IsMisplaced = $false
        })
        continue
    }
    
    # Vérifier si c'est un fichier personnel
    if (Test-IsPersonalFile -RelativePath $relativePath -FileName $fileName) {
        $PersonalFiles++
        $category = Get-FileCategory -RelativePath $relativePath -FileName $fileName
        $isInIgnoredFolder = Test-IsInIgnoredFolder -RelativePath $relativePath
        $isMisplaced = -not $isInIgnoredFolder
        
        if ($isMisplaced) {
            $MisplacedFiles++
            $targetFolder = Get-TargetFolder $category
            
            $null = $MisplacedList.Add(@{
                Path = $relativePath
                Category = $category
                TargetFolder = $targetFolder
                IsInIgnoredFolder = $false
            })
            
            # Déplacer si demandé
            if ($MoveFiles) {
                $moveResult = Move-PersonalFile -SourcePath $file.FullName -Category $category
                if ($moveResult.Success) {
                    $MovedFiles++
                    $null = $MoveOperations.Add(@{
                        Source = $relativePath
                        Destination = $moveResult.Destination.Replace($ProjectRoot, "").TrimStart("\")
                        Success = $true
                    })
                } else {
                    $null = $MoveOperations.Add(@{
                        Source = $relativePath
                        Destination = $targetFolder
                        Success = $false
                        Error = $moveResult.Error
                    })
                }
            }
        }
        
        $null = $ClassifiedFiles.Add(@{
            Path = $relativePath
            Category = $category
            IsPersonal = $true
            IsMisplaced = $isMisplaced
            IsInIgnoredFolder = $isInIgnoredFolder
        })
    } else {
        # Fichier non classifié comme personnel mais pas un fichier projet connu
        $ProjectFiles++
        $null = $ClassifiedFiles.Add(@{
            Path = $relativePath
            Category = "projet_legitime"
            IsPersonal = $false
            IsMisplaced = $false
        })
    }
    
    if ($TotalFiles % 200 -eq 0) { Write-Host "  ... $TotalFiles fichiers analyses" -ForegroundColor DarkGray }
}

# ============================================================
# GENERATION DU RAPPORT
# ============================================================

Write-Host "Generation du rapport..." -ForegroundColor Cyan

$reportDate = Get-Date -Format "yyyy-MM-dd"
$reportTime = Get-Date -Format "HH:mm:ss"
$correctPercentage = if ($TotalFiles -gt 0) { [math]::Round(($ProjectFiles / $TotalFiles) * 100, 1) } else { 0 }
$personalPercentage = if ($TotalFiles -gt 0) { [math]::Round(($PersonalFiles / $TotalFiles) * 100, 1) } else { 0 }
$misplacedPercentage = if ($PersonalFiles -gt 0) { [math]::Round(($MisplacedFiles / $PersonalFiles) * 100, 1) } else { 0 }

$report = New-Object System.Collections.ArrayList

# En-tête
$null = $report.Add("# Document Classification Log")
$null = $report.Add("")
$null = $report.Add("**Date**: $reportDate")
$null = $report.Add("**Heure**: $reportTime")
$null = $report.Add("**Commande**: doc-classification")
$null = $report.Add("**Projet**: Covoiturage La Cite")
$null = $report.Add("**Script**: doc-classification.ps1")
$null = $report.Add("**Mode deplacement**: $(if ($MoveFiles) { 'Actif' } else { 'Analyse seule' })")
$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")

# Résumé exécutif
$null = $report.Add("## Resume Executif")
$null = $report.Add("")
$null = $report.Add("| Metrique | Valeur |")
$null = $report.Add("|----------|--------|")
$null = $report.Add("| Total fichiers analyses | $TotalFiles |")
$null = $report.Add("| Fichiers projet legitimes | $ProjectFiles |")
$null = $report.Add("| Fichiers personnels identifies | $PersonalFiles |")
$null = $report.Add("| Fichiers personnels mal places | $MisplacedFiles |")
$null = $report.Add("| Fichiers deplaces | $MovedFiles |")
$null = $report.Add("")

# Statistiques par catégorie
$null = $report.Add("## Repartition par Categorie")
$null = $report.Add("")
$null = $report.Add("| Categorie | Description | Nombre |")
$null = $report.Add("|-----------|-------------|--------|")

$categoryCounts = @{}
foreach ($file in $ClassifiedFiles) {
    $cat = $file.Category
    if (-not $categoryCounts.ContainsKey($cat)) {
        $categoryCounts[$cat] = 0
    }
    $categoryCounts[$cat]++
}

foreach ($cat in ($categoryCounts.Keys | Sort-Object)) {
    $desc = if ($Categories.ContainsKey($cat)) { $Categories[$cat] } else { "Autre" }
    $null = $report.Add("| $cat | $desc | $($categoryCounts[$cat]) |")
}

$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")

# Vérification .gitignore
$null = $report.Add("## Verification Git Ignore")
$null = $report.Add("")
$null = $report.Add("### Contenu actuel du .gitignore")
$null = $report.Add("")
$gitignorePath = Join-Path $ProjectRoot ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    $null = $report.Add("``````")
    $null = $report.Add($gitignoreContent)
    $null = $report.Add("``````")
} else {
    $null = $report.Add("*Fichier .gitignore non trouve*")
}
$null = $report.Add("")

$null = $report.Add("### Dossiers qui devraient etre ignores")
$null = $report.Add("")
$null = $report.Add("| Dossier | Statut | Contenu |")
$null = $report.Add("|---------|--------|---------|")
$null = $report.Add("| `.roo/` | $(if ($gitignoreContent -like "*.roo*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Logs, commandes Roo AI |")
$null = $report.Add("| `docs/` | $(if ($gitignoreContent -like "*docs*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Documentation, scripts personnels |")
$null = $report.Add("| `.vscode/` | $(if ($gitignoreContent -like "*.vscode*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Configuration VS Code |")
$null = $report.Add("| `.idea/` | $(if ($gitignoreContent -like "*.idea*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Configuration JetBrains |")
$null = $report.Add("| `logs/` | $(if ($gitignoreContent -like "*logs*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Fichiers de logs |")
$null = $report.Add("| `temp/` | $(if ($gitignoreContent -like "*temp*") { 'Ignore' } else { 'NON IGNORE - A AJOUTER' }) | Fichiers temporaires |")
$null = $report.Add("")

$null = $report.Add("---")
$null = $report.Add("")

# Fichiers mal placés
$null = $report.Add("## Fichiers Personnels Mal Places")
$null = $report.Add("")

if ($MisplacedList.Count -gt 0) {
    $null = $report.Add("| Fichier | Categorie | Dossier cible | Action |")
    $null = $report.Add("|---------|-----------|---------------|--------|")
    foreach ($item in $MisplacedList) {
        $action = if ($MoveFiles) { "Deplace" } else { "A deplacer" }
        $null = $report.Add("| ``$($item.Path)`` | $($item.Category) | $($item.TargetFolder) | $action |")
    }
} else {
    $null = $report.Add("Aucun fichier personnel mal place detecte.")
}

$null = $report.Add("")
$null = $report.Add("---")
$null = $report.Add("")

# Opérations de déplacement
if ($MoveOperations.Count -gt 0) {
    $null = $report.Add("## Operations de Deplacement")
    $null = $report.Add("")
    $null = $report.Add("| Source | Destination | Statut |")
    $null = $report.Add("|--------|-------------|--------|")
    foreach ($op in $MoveOperations) {
        $status = if ($op.Success) { "Reussi" } else { "Echec: $($op.Error)" }
        $null = $report.Add("| ``$($op.Source)`` | ``$($op.Destination)`` | $status |")
    }
    $null = $report.Add("")
    $null = $report.Add("---")
    $null = $report.Add("")
}

# Recommandations
$null = $report.Add("## Recommandations")
$null = $report.Add("")
$null = $report.Add("### 1. Mise a jour du .gitignore")
$null = $report.Add("")
$null = $report.Add("Les entrees suivantes devraient etre ajoutees au fichier ``.gitignore`` a la racine du projet :")
$null = $report.Add("")
$null = $report.Add("``````")
$null = $report.Add("# Dossiers personnels")
$null = $report.Add(".roo/")
$null = $report.Add("docs/")
$null = $report.Add(".vscode/")
$null = $report.Add(".idea/")
$null = $report.Add("logs/")
$null = $report.Add("temp/")
$null = $report.Add(".cache/")
$null = $report.Add("")
$null = $report.Add("# Fichiers temporaires")
$null = $report.Add("*.tmp")
$null = $report.Add("*.bak")
$null = $report.Add("*.swp")
$null = $report.Add("*~")
$null = $report.Add("")
$null = $report.Add("# Fichiers de logs")
$null = $report.Add("*.log")
$null = $report.Add("*.trace")
$null = $report.Add("")
$null = $report.Add("# Fichiers de configuration personnelle")
$null = $report.Add("*.user")
$null = $report.Add("*.userprefs")
$null = $report.Add(".env")
$null = $report.Add(".env.*")
$null = $report.Add("!.env.example")
$null = $report.Add("")
$null = $report.Add("# Fichiers systeme")
$null = $report.Add(".DS_Store")
$null = $report.Add("Thumbs.db")
$null = $report.Add("``````")
$null = $report.Add("")

$null = $report.Add("### 2. Actions a effectuer")
$null = $report.Add("")
$null = $report.Add("1. **Executer avec -MoveFiles** pour deplacer automatiquement les fichiers mal places :")
$null = $report.Add("   ``````powershell")
$null = $report.Add("   powershell -ExecutionPolicy Bypass -File scripts/doc-classification.ps1 -MoveFiles")
$null = $report.Add("   ``````")
$null = $report.Add("")
$null = $report.Add("2. **Verifier les fichiers deplaces** dans le dossier ``docs/`` et ses sous-dossiers")
$null = $report.Add("")
$null = $report.Add("3. **Mettre a jour le .gitignore** avec les entrees recommandees ci-dessus")
$null = $report.Add("")
$null = $report.Add("4. **Executer ``git status``** pour verifier que les fichiers personnels sont bien ignores")
$null = $report.Add("")

$null = $report.Add("---")
$null = $report.Add("")

# Statut global
if ($MisplacedFiles -eq 0) {
    $globalStatus = "CONFORME - Tous les fichiers personnels sont dans des dossiers ignores"
} elseif ($MisplacedFiles -le 5) {
    $globalStatus = "PARTIELLEMENT CONFORME - $MisplacedFiles fichiers a deplacer"
} else {
    $globalStatus = "NON CONFORME - $MisplacedFiles fichiers personnels mal places"
}

$null = $report.Add("*Fin du rapport -- Genere le $reportDate a $reportTime*")
$null = $report.Add("*Classification: $globalStatus*")

# Ecrire le rapport
$reportContent = $report -join "`n"
$reportContent | Out-File -FilePath $OutputFilePath -Encoding UTF8 -Force

Write-Host ""
Write-Host "Analyse terminee!" -ForegroundColor Green
Write-Host "Rapport genere: $OutputFilePath" -ForegroundColor Green
Write-Host ""
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "   Total fichiers analyses: $TotalFiles" -ForegroundColor White
Write-Host "   Fichiers projet legitimes: $ProjectFiles" -ForegroundColor Green
Write-Host "   Fichiers personnels identifies: $PersonalFiles" -ForegroundColor Yellow
Write-Host "   Fichiers personnels mal places: $MisplacedFiles" -ForegroundColor $(if ($MisplacedFiles -gt 0) { "Red" } else { "Green" })
Write-Host "   Fichiers deplaces: $MovedFiles" -ForegroundColor $(if ($MovedFiles -gt 0) { "Green" } else { "DarkGray" })
Write-Host ""
