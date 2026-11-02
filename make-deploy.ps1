# Gom dung cac file can dang len GitHub Pages vao thu muc .\deploy (keo-tha len repo GitHub).
# KHONG chua file .xlsx (co ten khach hang), serve.ps1, .claude, tai lieu noi bo.
# Chay: powershell -ExecutionPolicy Bypass -File make-deploy.ps1
$root = $PSScriptRoot
$out = Join-Path $root "deploy"
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Force $out | Out-Null
$items = @("index.html", "contest.config.js", "css\report.css", "js\report-adapter.js", "js\report.js", "js\upload.js", "js\loader.js")
foreach ($i in $items) {
  $src = Join-Path $root $i
  $dst = Join-Path $out $i
  New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
  Copy-Item -Recurse -Force $src $dst
}
# Tat Jekyll de GitHub Pages phuc vu nguyen trang cac file
New-Item -ItemType File -Force (Join-Path $out ".nojekyll") | Out-Null
$cfg = Get-Content (Join-Path $out "contest.config.js") -Raw -Encoding UTF8
if ($cfg -match 'api_key:\s*""') { Write-Host "CANH BAO: source.api_key dang trong - tren GitHub Pages trang se khong tu doc Google Drive (van dung duoc nut Upload)." -ForegroundColor Yellow }
Get-ChildItem -Recurse -Force -File $out | ForEach-Object { $_.FullName.Substring($out.Length + 1) }
Write-Host "`nDa tao: $out"
