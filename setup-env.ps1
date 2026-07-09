$env:PATH = "C:\tools\apache-maven-3.9.6\bin;C:\tools\node-v20.18.1-win-x64;C:\Program Files\Java\jdk-24\bin;" + $env:PATH
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
Write-Host "Java  : $((java -version 2>&1)[0])"
Write-Host "Maven : $((mvn -version 2>&1)[0])"
Write-Host "Node  : $(node --version)"
Write-Host "npm   : $(npm --version)"
Write-Host "Tools ready."
