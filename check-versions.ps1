$m2 = "$env:USERPROFILE\.m2\repository"
$checks = @(
    "io\jsonwebtoken\jjwt-api",
    "org\springdoc\springdoc-openapi-starter-webmvc-ui",
    "org\mapstruct\mapstruct",
    "com\h2database\h2",
    "com\mysql\mysql-connector-j",
    "org\apache\poi\poi-ooxml",
    "com\itextpdf\itextpdf",
    "org\apache\commons\commons-lang3",
    "org\springframework\boot\spring-boot-starter-parent",
    "org\projectlombok\lombok"
)
foreach ($c in $checks) {
    $path = "$m2\$c"
    if (Test-Path $path) {
        $vers = (Get-ChildItem $path -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) -join ", "
        Write-Host "  $($c.Split('\')[-1]) = $vers"
    } else {
        Write-Host "  MISSING: $c"
    }
}
