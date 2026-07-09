$base = "backend\src\main\java\com\appointmentagent"
$dirs = @(
    "$base\controller",
    "$base\service",
    "$base\service\impl",
    "$base\repository",
    "$base\entity",
    "$base\dto\request",
    "$base\dto\response",
    "$base\mapper",
    "$base\security",
    "$base\config",
    "$base\exception",
    "$base\validation",
    "$base\utils",
    "$base\chatbot",
    "backend\src\main\resources",
    "backend\src\test\java\com\appointmentagent"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-Host "Backend directories created successfully."
