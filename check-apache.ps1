$m2 = "$env:USERPROFILE\.m2\repository"
$p1 = Test-Path "$m2\org\apache\apache"
$p2 = if ($p1) { (Get-ChildItem "$m2\org\apache\apache" | Select-Object -ExpandProperty Name) -join ", " } else { "N/A" }
Write-Host "org.apache:apache present: $p1  versions: $p2"
$p3 = Test-Path "$m2\org\springframework\boot\spring-boot-starter-parent\3.2.5"
Write-Host "spring-boot-parent 3.2.5 present: $p3"
$p4 = Test-Path "$m2\org\flywaydb"
Write-Host "flyway present: $p4"
