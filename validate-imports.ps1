$srcBase = "frontend\src"
$allFiles = Get-ChildItem -Recurse -File $srcBase -Include "*.tsx","*.ts" | Select-Object -ExpandProperty FullName
$imports = @()
foreach ($f in $allFiles) {
    $lines = Get-Content $f
    foreach ($line in $lines) {
        if ($line -match "from '@/(.+?)'") {
            $imports += $Matches[1]
        }
    }
}
$unique = $imports | Sort-Object -Unique
$missing = @()
foreach ($imp in $unique) {
    $rel = $imp -replace '/', '\'
    $candidates = @(
        "$srcBase\$rel.ts",
        "$srcBase\$rel.tsx",
        "$srcBase\$rel\index.ts",
        "$srcBase\$rel\index.tsx"
    )
    if (-not ($candidates | Where-Object { Test-Path $_ })) {
        $missing += $imp
    }
}
if ($missing.Count -eq 0) {
    Write-Host "All $($unique.Count) @/ imports resolve OK."
} else {
    Write-Host "MISSING ($($missing.Count)):"
    $missing | ForEach-Object { Write-Host "  - $_" }
}
