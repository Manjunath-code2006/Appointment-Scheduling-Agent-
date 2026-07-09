Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
$target = Join-Path $PSScriptRoot "backend\target"
if (Test-Path $target) {
    Remove-Item -Recurse -Force $target
    Write-Host "DELETED: $target"
} else {
    Write-Host "already gone"
}
