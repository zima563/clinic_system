# Clinic System Database Backup Script
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$PSScriptRoot\..\backups"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$backupFile = "$backupDir\clinic_db_backup_$timestamp.sql"

Write-Host "📦 Starting MySQL Database Backup..." -ForegroundColor Cyan
docker exec clinic_mysql mysqldump -u root -prootpassword clinic_system_db > $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup completed successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Host "❌ Backup failed!" -ForegroundColor Red
}
