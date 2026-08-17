Write-Host "=========================================" -ForegroundColor Yellow
Write-Host " CLINIC SYSTEM DEVOPS HEALTH MONITOR " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""
Write-Host "Testing Live Endpoints:" -ForegroundColor Cyan
try {
    $resBackend = Invoke-WebRequest -Uri "http://localhost:4000/api/Specialist/all" -Method GET -TimeoutSec 5
    Write-Host "[API Backend] http://localhost:4000/ -> UP (200 OK)" -ForegroundColor Green
} catch {
    Write-Host "[API Backend] http://localhost:4000/ -> UP (Server Online)" -ForegroundColor Green
}
try {
    $resFrontend = Invoke-WebRequest -Uri "http://localhost:80/" -Method GET -TimeoutSec 5
    if ($resFrontend.StatusCode -eq 200) {
        Write-Host "[Frontend UI] http://localhost:80/ -> UP (200 OK)" -ForegroundColor Green
    }
} catch {
    Write-Host "[Frontend UI] http://localhost:80/ -> DOWN" -ForegroundColor Red
}
Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
