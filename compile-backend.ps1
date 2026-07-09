$env:PATH = "C:\tools\apache-maven-3.9.6\bin;C:\Program Files\Java\jdk-24\bin;" + $env:PATH
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
Set-Location backend
Write-Host "Compiling backend (downloading dependencies)..."
mvn clean compile --no-transfer-progress 2>&1
$code = $LASTEXITCODE
Write-Host "---"
if ($code -eq 0) { Write-Host "BUILD SUCCESS" } else { Write-Host "BUILD FAILED (exit $code)" }
