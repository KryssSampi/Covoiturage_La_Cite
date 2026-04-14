# register_task.ps1 — Créé automatiquement par setup_cron.sh
# Lance dans PowerShell en tant qu'Administrateur

$action = New-ScheduledTaskAction `
    -Execute "python" `
    -Argument '"\d\Covoiturage_La_Cite\.docs\auto-commit\auto_commit.py" --model claude' `
    -WorkingDirectory "\d\Covoiturage_La_Cite\.docs\auto-commit"

$trigger  = New-ScheduledTaskTrigger -Daily -At "23:00"
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 3) `
    -StartWhenAvailable

# Variable d'environnement ANTHROPIC_API_KEY dans la tâche
$envVar = New-Object System.Collections.Specialized.StringDictionary
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -RunLevel Highest

Register-ScheduledTask `
    -TaskName "AutoCommit_auto-commit" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Force

Write-Host "✅ Tâche planifiée créée : AutoCommit_auto-commit"
Write-Host "   Pour tester : python '\d\Covoiturage_La_Cite\.docs\auto-commit\auto_commit.py' --dry-run"
Write-Host "   Logs        : \d\Covoiturage_La_Cite\.docs\auto-commit\auto_commit.log"
