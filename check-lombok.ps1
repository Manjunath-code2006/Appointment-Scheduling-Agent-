$jar = "$env:USERPROFILE\.m2\repository\org\projectlombok\lombok\1.18.38\lombok-1.18.38.jar"
if (Test-Path $jar) {
    $size = (Get-Item $jar).Length
    Write-Host "Lombok 1.18.38 JAR: $size bytes  OK"
} else {
    Write-Host "Lombok 1.18.38 JAR MISSING"
}

# Also check if the old stale .class files are gone
$target = Join-Path $PSScriptRoot "backend\target"
if (Test-Path $target) {
    Write-Host "WARNING: target/ still exists"
} else {
    Write-Host "target/ is clean"
}

# Show Lombok versions in cache
Write-Host "Lombok versions cached:"
Get-ChildItem "$env:USERPROFILE\.m2\repository\org\projectlombok\lombok" -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "  $_" }
