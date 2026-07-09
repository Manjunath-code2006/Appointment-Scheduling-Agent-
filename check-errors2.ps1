$logFile = Join-Path $PSScriptRoot "backend\logs\appointment-agent.log"
if (Test-Path $logFile) {
    $all = Get-Content $logFile
    $errorIdx = @()
    for ($i = 0; $i -lt $all.Count; $i++) {
        if ($all[$i] -match " ERROR ") { $errorIdx += $i }
    }
    # Show last 2 errors with 3 lines of context each
    $last2 = $errorIdx | Select-Object -Last 2
    foreach ($idx in $last2) {
        $start = [Math]::Max(0, $idx - 1)
        $end   = [Math]::Min($all.Count - 1, $idx + 4)
        Write-Host "--- Error at line $idx ---"
        for ($j = $start; $j -le $end; $j++) { Write-Host $all[$j] }
        Write-Host ""
    }
} else {
    Write-Host "Log not found"
}
