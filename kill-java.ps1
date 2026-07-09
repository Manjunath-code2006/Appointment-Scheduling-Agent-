Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
$remaining = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Still running: $($remaining.Count) java process(es)"
} else {
    Write-Host "All java processes stopped."
}
