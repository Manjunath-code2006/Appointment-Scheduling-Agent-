$files = Get-ChildItem -Recurse -File "frontend\src" -Include "*.tsx","*.ts" | Select-Object -ExpandProperty FullName
$hits = @()
foreach ($f in $files) {
    $lines = Get-Content $f
    $i = 0
    foreach ($line in $lines) {
        $i++
        if ($line -match "Popover|react-day-picker|framer-motion") {
            $hits += "$($f.Split('\')[-1]):$i  $($line.Trim())"
        }
    }
}
if ($hits.Count -eq 0) { Write-Host "None of those patterns found in src." }
else { $hits | ForEach-Object { Write-Host $_ } }
