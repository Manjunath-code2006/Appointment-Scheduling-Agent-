$logFile = Join-Path $PSScriptRoot "backend\logs\appointment-agent.log"
if (Test-Path $logFile) {
    $lines = Get-Content $logFile | Where-Object { $_ -match " ERROR " } | Select-Object -Last 5
    if ($lines) {
        Write-Host "=== Recent ERRORs ==="
        $lines | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "No ERRORs in log."
    }
} else {
    Write-Host "Log file not found at $logFile"
}
