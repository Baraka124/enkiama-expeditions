# Enkiama — /assets

Brand logo, favicons, and social share image. All generated from the official
Enkiama Tanzania logo (gold Maasai shield + wordmark).

## Files

| File                 | Size      | Used for                                  |
|----------------------|-----------|-------------------------------------------|
| logo-full.png        | 960×440   | Master transparent logo (source)          |
| logo-header.png      | 174×80    | Logo in the site nav/header               |
| logo-footer.png      | 139×64    | Logo in the site footer                   |
| favicon.svg          | vector*   | Browser tab icon (shield on dark tile)    |
| favicon-32.png       | 32×32     | Fallback tab icon                         |
| apple-touch-icon.png | 180×180   | iPhone/iPad home-screen icon              |
| enkiama-share.jpg    | 1200×630  | WhatsApp/social link preview image        |

*favicon.svg wraps a high-res PNG (the logo has photographic gold gradients,
so it isn't a true vector — this keeps the tab icon crisp at any size).

## If the logo ever changes
Replace `logo-full.png` with a new transparent-background PNG, then regenerate
the derivatives at the sizes above (same filenames). The header/footer/favicon
tags all point to these exact names at `/assets/...` — don't rename them.

## Refreshing the share preview
WhatsApp/Facebook cache link previews. After deploying, refresh via
https://developers.facebook.com/tools/debug/ → paste enkiama.com → "Scrape Again".
