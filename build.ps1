param(
  [ValidateSet('chrome', 'firefox', 'safari')]
  [string]$Target = 'chrome'
)

$root = $PSScriptRoot
$output = Join-Path $root "dist\$Target"
New-Item -ItemType Directory -Path $output -Force | Out-Null
Get-ChildItem -LiteralPath $root -File | Where-Object { $_.Name -notmatch '^manifest\.(firefox|safari)\.json$|^build\.ps1$' } | Copy-Item -Destination $output -Force

$sourceManifest = if ($Target -eq 'chrome') { Join-Path $root 'manifest.json' } else { Join-Path $root "manifest.$Target.json" }
Copy-Item -LiteralPath $sourceManifest -Destination (Join-Path $output 'manifest.json') -Force
Compress-Archive -Path (Join-Path $output '*') -DestinationPath (Join-Path $root "dist\Muslim-Companion-$Target.zip") -Force
Write-Output "Package created: $output"
