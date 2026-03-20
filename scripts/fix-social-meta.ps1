$ErrorActionPreference = "Stop"

$files = @(
  (Get-ChildItem -Path . -Filter *.html -File)
  (Get-ChildItem -Path .\blog -Filter *.html -File)
)

$updated = @()

foreach ($file in $files) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
  $original = $content
  $newline = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }

  # Normalize old domain variants in social image tags.
  $content = $content -replace "https://findyourinchrist\.com/", "https://davidadesina.com/"
  $content = $content -replace "https://findyourinkinchrist\.com/", "https://davidadesina.com/"

  $ogImageMatch = [regex]::Match(
    $content,
    "<meta\s+property=""og:image""\s+content=""([^""]+)""\s*/?>",
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  $hasTwitterImage = [regex]::IsMatch(
    $content,
    "<meta\s+name=""twitter:image""\s+content=""[^""]+""\s*/?>",
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  if ($ogImageMatch.Success -and -not $hasTwitterImage) {
    $ogImage = $ogImageMatch.Groups[1].Value
    $twitterImageTag = "  <meta name=""twitter:image"" content=""$ogImage"" />"

    if ($content -match "<meta\s+name=""twitter:description""\s+content=""[^""]*""\s*/?>") {
      $content = [regex]::Replace(
        $content,
        "(<meta\s+name=""twitter:description""\s+content=""[^""]*""\s*/?>)",
        "`$1$newline$twitterImageTag",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
      )
    }
    elseif ($content -match "<meta\s+name=""twitter:title""\s+content=""[^""]*""\s*/?>") {
      $content = [regex]::Replace(
        $content,
        "(<meta\s+name=""twitter:title""\s+content=""[^""]*""\s*/?>)",
        "`$1$newline$twitterImageTag",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
      )
    }
    elseif ($content -match "<meta\s+name=""twitter:card""\s+content=""[^""]*""\s*/?>") {
      $content = [regex]::Replace(
        $content,
        "(<meta\s+name=""twitter:card""\s+content=""[^""]*""\s*/?>)",
        "`$1$newline$twitterImageTag",
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
      )
    }
  }

  if ($content -ne $original) {
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
    $updated += $file.FullName
  }
}

Write-Output "UPDATED_FILES=$($updated.Count)"
$updated | ForEach-Object { Write-Output $_ }
