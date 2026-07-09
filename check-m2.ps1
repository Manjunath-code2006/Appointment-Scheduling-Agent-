$m2 = "$env:USERPROFILE\.m2\repository"
$checks = @(
    "io\jsonwebtoken",
    "org\springdoc",
    "org\mapstruct",
    "com\h2database",
    "com\mysql",
    "org\apache\poi",
    "com\itextpdf",
    "org\apache\commons",
    "com\fasterxml\jackson",
    "org\hibernate",
    "org\flywaydb"
)
foreach ($c in $checks) {
    $path = "$m2\$c"
    if (Test-Path $path) {
        $vers = (Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) -join ", "
        Write-Host "FOUND $c -> $vers"
    } else {
        Write-Host "MISSING $c"
    }
}
