$m2 = "$env:USERPROFILE\.m2\repository"
$checks = @(
    "org\springframework\boot\spring-boot-starter-web\3.2.5",
    "org\springframework\boot\spring-boot\3.2.5",
    "org\springframework\boot\spring-boot-autoconfigure\3.2.5",
    "org\springframework\spring-web\6.1.6",
    "org\springframework\spring-core\6.1.6",
    "com\fasterxml\jackson\core\jackson-databind\2.15.4",
    "org\hibernate\orm\hibernate-core\6.4.4.Final",
    "io\jsonwebtoken\jjwt-api\0.11.5",
    "org\mapstruct\mapstruct\1.5.5.Final",
    "org\projectlombok\lombok\1.18.30",
    "org\springdoc\springdoc-openapi-starter-webmvc-ui\2.5.0",
    "org\apache\commons\commons-lang3\3.14.0",
    "com\h2database\h2\2.2.224"
)
foreach ($c in $checks) {
    $path = "$m2\$c"
    $name = $c.Split("\")[-2]
    $ver  = $c.Split("\")[-1]
    if (Test-Path $path) {
        $jars = Get-ChildItem $path -Filter "*.jar" -ErrorAction SilentlyContinue | Measure-Object
        $poms = Get-ChildItem $path -Filter "*.pom" -ErrorAction SilentlyContinue | Measure-Object
        Write-Host "OK  $name-$ver  (jars=$($jars.Count) poms=$($poms.Count))"
    } else {
        Write-Host "MISS $name-$ver"
    }
}
