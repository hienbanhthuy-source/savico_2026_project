# Server tinh toi gian + gia lap Google Drive API v3 (chi de chay thu tren may, khong can API key).
# Chay: powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 5173]
#   /drive/v3/files?q='<folder>' in parents   -> danh sach file (lay tu thu muc Drive cong khai)
#   /drive/v3/files/<id>?alt=media            -> noi dung file .xlsx
#   /drive/v3/files/<id>/export?mimeType=...  -> Google Sheets xuat ra .xlsx
# Ban online dung that https://www.googleapis.com/drive/v3 voi api_key trong contest.config.js.
param([int]$Port = 5173)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = $PSScriptRoot
$types = @{ ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
            ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".json"="application/json; charset=utf-8";
            ".webmanifest"="application/manifest+json"; ".md"="text/plain; charset=utf-8" }
$XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
$GSHEET = "application/vnd.google-apps.spreadsheet"
$cache = @{}   # id -> @{ md5; modified; bytes; at; name; mime }

function Get-DriveBytes($id, $mime) {
  # Thu nghiem tu cap nhat: dat .drive-mock\<id>.xlsx de gia lap file tren Drive vua bi sua
  $ov = Join-Path $root ".drive-mock\$id.xlsx"
  if (Test-Path $ov) { return ,[IO.File]::ReadAllBytes($ov) }
  $url =if ($mime -eq $GSHEET) { "https://docs.google.com/spreadsheets/d/$id/export?format=xlsx" } else { "https://drive.google.com/uc?export=download&id=$id" }
  $wc = New-Object Net.WebClient
  $wc.Headers.Add("User-Agent", "Mozilla/5.0")
  return ,$wc.DownloadData($url)
}
function Update-Cache($id, $name, $mime) {
  $c = $cache[$id]
  if ($c -and ((Get-Date) - $c.at).TotalSeconds -lt 5) { return $c }
  $bytes = Get-DriveBytes $id $mime
  $md5 = ([BitConverter]::ToString((New-Object Security.Cryptography.MD5CryptoServiceProvider).ComputeHash($bytes)) -replace "-", "").ToLower()
  $modified = if ($c -and $c.md5 -eq $md5) { $c.modified } else { (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ") }
  $n = if ($name) { $name } elseif ($c) { $c.name } else { $id }
  $m = if ($mime) { $mime } elseif ($c) { $c.mime } else { $XLSX }
  $cache[$id] = @{ md5 = $md5; modified = $modified; bytes = $bytes; at = Get-Date; name = $n; mime = $m }
  return $cache[$id]
}
function Get-FolderFiles($folder) {
  $html = (New-Object Net.WebClient)
  $html.Encoding = [Text.Encoding]::UTF8
  $page = $html.DownloadString("https://drive.google.com/embeddedfolderview?id=$folder")
  $rx = '<a href="([^"]+)"[^>]*>.*?<div class="flip-entry-title">([^<]+)</div>'
  $files = @()
  foreach ($m in [regex]::Matches($page, $rx, [Text.RegularExpressions.RegexOptions]::Singleline)) {
    $href = $m.Groups[1].Value; $name = [Net.WebUtility]::HtmlDecode($m.Groups[2].Value)
    if ($href -match '/spreadsheets/d/([\w-]+)') { $id = $Matches[1]; $mime = $GSHEET }
    elseif ($href -match '/file/d/([\w-]+)') { $id = $Matches[1]; $mime = if ($name -match '\.xlsx$') { $XLSX } elseif ($name -match '\.xls$') { "application/vnd.ms-excel" } else { "application/octet-stream" } }
    else { continue }
    $f = @{ id = $id; name = $name; mimeType = $mime }
    if ($mime -ne "application/octet-stream") {
      $c = Update-Cache $id $name $mime
      $f.modifiedTime = $c.modified
      if ($mime -ne $GSHEET) { $f.md5Checksum = $c.md5 }
      $f.size = "$($c.bytes.Length)"
    }
    $files += $f
  }
  return ,$files
}
function Send($res, [byte[]]$bytes, $type, $method) {
  $res.ContentType = $type
  $res.Headers.Add("Cache-Control", "no-cache")
  $res.ContentLength64 = $bytes.Length
  if ($method -ne "HEAD") { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
}
function Send-Json($res, $obj, $method, $code = 200) {
  $res.StatusCode = $code
  Send $res ([Text.Encoding]::UTF8.GetBytes((ConvertTo-Json -InputObject $obj -Depth 6 -Compress))) "application/json; charset=utf-8" $method
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Drive API mock at /drive/v3)"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ($path -eq "drive/v3/files") {
        $q = $req.QueryString["q"]
        if ($q -match "'([\w-]+)'\s+in\s+parents") { Send-Json $res @{ files = (Get-FolderFiles $Matches[1]) } $req.HttpMethod }
        else { Send-Json $res @{ error = @{ code = 400; message = "Thieu q='<folder>' in parents" } } $req.HttpMethod 400 }
      }
      elseif ($path -match '^drive/v3/files/([\w-]+)(/export)?$') {
        $id = $Matches[1]; $exp = [bool]$Matches[2]
        $c = Update-Cache $id $null $(if ($exp) { $GSHEET } else { $null })
        if ($exp -or $req.QueryString["alt"] -eq "media") { Send $res $c.bytes $XLSX $req.HttpMethod }
        else { Send-Json $res @{ id = $id; name = $c.name; mimeType = $c.mime; modifiedTime = $c.modified; md5Checksum = $c.md5 } $req.HttpMethod }
      }
      else {
        if ($path -eq "") { $path = "index.html" }
        $file = [IO.Path]::GetFullPath((Join-Path $root $path))
        if (Test-Path $file -PathType Container) { $file = Join-Path $file "index.html" }
        if ($file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $file -PathType Leaf)) {
          $ext = [IO.Path]::GetExtension($file).ToLower()
          Send $res ([IO.File]::ReadAllBytes($file)) $(if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }) $req.HttpMethod
        } else { $res.StatusCode = 404 }
      }
    } catch {
      Write-Host "ERR $($req.Url): $_"
      try { Send-Json $res @{ error = @{ code = 502; message = "$_" } } $req.HttpMethod 502 } catch {}
    }
    try { $res.Close() } catch {}
  }
} finally { $listener.Stop() }
