$m2 = "$env:USERPROFILE\.m2\repository"
# Check if the pom file itself exists (not just the directory)
$pomPath = "$m2\org\apache\apache\16\apache-16.pom"
Write-Host "apache-16.pom exists: $(Test-Path $pomPath)"

$math3Pom = "$m2\org\apache\commons\commons-math3\3.6.1\commons-math3-3.6.1.pom"
Write-Host "commons-math3 pom exists: $(Test-Path $math3Pom)"

# List all files in the apache-16 dir
if (Test-Path "$m2\org\apache\apache\16") {
    Write-Host "Files in apache/16:"
    Get-ChildItem "$m2\org\apache\apache\16" | ForEach-Object { Write-Host "  $($_.Name)" }
}
