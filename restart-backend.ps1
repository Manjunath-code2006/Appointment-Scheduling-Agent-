$env:PATH   = "C:\tools\apache-maven-3.9.6\bin;C:\Program Files\Java\jdk-24\bin;" + $env:PATH
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"

# 1. Kill any leftover Java processes
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Delete locked target directory
$target = "backend\target"
if (Test-Path $target) {
    Remove-Item -Recurse -Force $target
    Write-Host "Deleted target/"
}

# 3. Package (skip tests)
Set-Location backend
Write-Host "Building JAR..."
mvn package "-DskipTests" "--no-transfer-progress" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED"
    exit 1
}

# 4. Start Spring Boot with dev profile
$jar = (Get-ChildItem "target\*.jar" | Where-Object { $_.Name -notmatch "original" } | Select-Object -First 1).FullName
Write-Host "Starting: $jar"
java "-Dspring.profiles.active=dev" "-jar" $jar
