$m2 = "$env:USERPROFILE\.m2\repository"
# Remove all .lastUpdated files that block offline resolution
$broken = Get-ChildItem -Recurse "$m2" -Filter "*.lastUpdated" -ErrorAction SilentlyContinue
Write-Host "Removing $($broken.Count) .lastUpdated marker files..."
$broken | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "Done."
