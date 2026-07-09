$env:PATH    = "C:\tools\apache-maven-3.9.6\bin;C:\Program Files\Java\jdk-24\bin;" + $env:PATH
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"

# Resolve backend path relative to this script's location
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"

Set-Location $backendDir
Write-Host "Working directory: $(Get-Location)"
Write-Host "Packaging backend (skipping tests)..."

mvn package "-DskipTests" "--no-transfer-progress" 2>&1
$code = $LASTEXITCODE

Write-Host "---"
if ($code -eq 0) {
    $jar = Get-ChildItem "target\*.jar" |
           Where-Object { $_.Name -notmatch "original" } |
           Select-Object -First 1
    Write-Host "JAR built: $($jar.Name)"
    Write-Host "BUILD SUCCESS"
} else {
    Write-Host "BUILD FAILED (exit $code)"
}
