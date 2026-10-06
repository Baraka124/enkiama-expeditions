# Journey media quality guard

Full-bleed and large editorial surfaces must not use thumbnail-scale images.

## Current rules

- Prefer source files at least 1600 px on their long edge for cinematic/full-width placements.
- Avoid assets under ~150 KB for large photographic surfaces unless they are highly efficient WebP/AVIF files whose dimensions have been verified.
- Do not upscale crops extracted from collages or screenshots for production use.
- Journey-specific synthetic photography must be generated/exported as standalone high-resolution images, not cropped from multi-scene contact sheets.
- Keep crop/focal-point decisions in `data/journey-media.json`.
- Use `source_type: "synthetic"` only for standalone generated assets of sufficient resolution.

## Replacement workflow

1. Generate or source the standalone image.
2. Save it with a journey-specific descriptive filename.
3. Verify dimensions and file size.
4. Add/update alt text, focal point, caption and provenance in `data/journey-media.json`.
5. Check desktop, laptop and mobile crops before merging.
