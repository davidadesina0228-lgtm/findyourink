Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = Resolve-Path '.'
$imagesDir = Join-Path $root 'images'
$logoPath = Join-Path $imagesDir 'david-adesina-logo.png'

if (-not (Test-Path $logoPath)) {
  throw "Logo file not found: $logoPath"
}

$logo = [System.Drawing.Image]::FromFile($logoPath)

function New-Jpeg {
  param(
    [string]$Path,
    [string]$TitleText,
    [string]$SubtitleText
  )

  $width = 1200
  $height = 630
  $canvas = New-Object System.Drawing.Bitmap($width, $height)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  # Background
  $g.Clear([System.Drawing.Color]::FromArgb(7, 7, 7))
  $topGlow = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle(0, 0, $width, $height)),
    [System.Drawing.Color]::FromArgb(26, 35, 42),
    [System.Drawing.Color]::FromArgb(7, 7, 7),
    55
  )
  $g.FillRectangle($topGlow, 0, 0, $width, $height)
  $topGlow.Dispose()

  # Logo placement
  $targetLogoWidth = 640
  $targetLogoHeight = [int]($logo.Height * ($targetLogoWidth / [double]$logo.Width))
  $logoX = [int](($width - $targetLogoWidth) / 2)
  $logoY = 56
  $g.DrawImage($logo, $logoX, $logoY, $targetLogoWidth, $targetLogoHeight)

  # Title and subtitle
  $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 232, 232))
  $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(143, 157, 168))
  $titleFont = New-Object System.Drawing.Font('Segoe UI Semibold', 42, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $subFont = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

  $titleSize = $g.MeasureString($TitleText, $titleFont)
  $subSize = $g.MeasureString($SubtitleText, $subFont)
  $titleX = [int](($width - $titleSize.Width) / 2)
  $subX = [int](($width - $subSize.Width) / 2)
  $titleY = 500
  $subY = 555

  $g.DrawString($TitleText, $titleFont, $titleBrush, $titleX, $titleY)
  $g.DrawString($SubtitleText, $subFont, $subBrush, $subX, $subY)

  # Save as JPEG with quality
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
  $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParams.Param[0] = $qualityParam
  $canvas.Save($Path, $encoder, $encoderParams)

  $titleFont.Dispose()
  $subFont.Dispose()
  $titleBrush.Dispose()
  $subBrush.Dispose()
  $qualityParam.Dispose()
  $encoderParams.Dispose()
  $g.Dispose()
  $canvas.Dispose()
}

# Core social images
$core = @{
  'og-home.jpg' = @('David Adesina', 'Official Website')
  'og-about.jpg' = @('About David Adesina', 'Story, calling, and mission')
  'og-blog.jpg' = @('Find Your Ink', 'Essays on faith, healing, and growth')
  'og-resources.jpg' = @('Resources', 'Guides and materials for the journey')
  'og-contact.jpg' = @('Contact David Adesina', 'Partnerships, invitations, and collaboration')
}

foreach ($name in $core.Keys) {
  $entry = $core[$name]
  $outPath = Join-Path $imagesDir $name
  New-Jpeg -Path $outPath -TitleText $entry[0] -SubtitleText $entry[1]
}

# Blog OG images
for ($i = 1; $i -le 49; $i++) {
  $number = $i.ToString('00')
  $outPath = Join-Path $imagesDir ("og-post-" + $number + ".jpg")
  New-Jpeg -Path $outPath -TitleText 'Find Your Ink Essay' -SubtitleText 'David Adesina'
}

# RSS logo
$rssSize = 144
$rssCanvas = New-Object System.Drawing.Bitmap($rssSize, $rssSize)
$rssG = [System.Drawing.Graphics]::FromImage($rssCanvas)
$rssG.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$rssG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$rssG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$rssG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$rssG.Clear([System.Drawing.Color]::FromArgb(7, 7, 7))

$logoW = 124
$logoH = [int]($logo.Height * ($logoW / [double]$logo.Width))
$logoX = [int](($rssSize - $logoW) / 2)
$logoY = [int](($rssSize - $logoH) / 2)
$rssG.DrawImage($logo, $logoX, $logoY, $logoW, $logoH)

$rssOut = Join-Path $imagesDir 'rss-logo.png'
$rssCanvas.Save($rssOut, [System.Drawing.Imaging.ImageFormat]::Png)

$rssG.Dispose()
$rssCanvas.Dispose()
$logo.Dispose()

Write-Output 'Generated social image set: core OG, 49 post OG images, and rss-logo.png.'
