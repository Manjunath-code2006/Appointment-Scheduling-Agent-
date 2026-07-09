$dirs = @(
  "src\components\ui",
  "src\components\layout",
  "src\components\common",
  "src\pages\auth",
  "src\pages\admin",
  "src\pages\customer",
  "src\pages\shared",
  "src\hooks",
  "src\services",
  "src\context",
  "src\utils",
  "src\types",
  "src\assets"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}
Write-Host "Frontend dirs created"
