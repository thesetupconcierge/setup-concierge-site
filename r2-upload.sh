# QR Event Hub — R2 Upload Guide
#
# This script provides wrangler CLI commands for uploading
# event media and manifests to the Cloudflare R2 bucket.
#
# PREREQUISITES:
# 1. Install wrangler: npm install -g wrangler
# 2. Login: wrangler login
# 3. Create R2 bucket: wrangler r2 bucket create sc-events
#
# ============================================

# ─── STEP 1: CREATE THE R2 BUCKET ──────────────────
# Run this once:
# wrangler r2 bucket create sc-events

# ─── STEP 2: UPLOAD MANIFESTS ───────────────────────

# Malakai's Birthday
wrangler r2 object put sc-events/malakais-birthday/manifest.json --file=".r2-manifests/malakais-birthday/manifest.json" --content-type="application/json"

# Anderson Corporate Gala
wrangler r2 object put sc-events/anderson-corporate-gala/manifest.json --file=".r2-manifests/anderson-corporate-gala/manifest.json" --content-type="application/json"

# Johnson Wedding Reception
wrangler r2 object put sc-events/johnson-wedding-reception/manifest.json --file=".r2-manifests/johnson-wedding-reception/manifest.json" --content-type="application/json"


# ─── STEP 3: UPLOAD MALAKAI'S IMAGES ───────────────

# Cover image (hero)
wrangler r2 object put sc-events/malakais-birthday/cover.jpg --file="events/malakais-birthday/images/hero.png" --content-type="image/png"

# Gallery images
wrangler r2 object put sc-events/malakais-birthday/gallery/001.jpg --file="events/malakais-birthday/images/gallery-1.png" --content-type="image/png"
wrangler r2 object put sc-events/malakais-birthday/gallery/002.jpg --file="events/malakais-birthday/images/gallery-2.png" --content-type="image/png"
wrangler r2 object put sc-events/malakais-birthday/gallery/003.jpg --file="events/malakais-birthday/images/gallery-3.png" --content-type="image/png"
wrangler r2 object put sc-events/malakais-birthday/gallery/004.jpg --file="events/malakais-birthday/images/gallery-4.png" --content-type="image/png"
wrangler r2 object put sc-events/malakais-birthday/gallery/005.jpg --file="events/malakais-birthday/images/gallery-5.png" --content-type="image/png"
wrangler r2 object put sc-events/malakais-birthday/gallery/006.jpg --file="events/malakais-birthday/images/gallery-6.png" --content-type="image/png"


# ─── STEP 4: VERIFY ────────────────────────────────

# List all objects in the bucket:
# wrangler r2 object list sc-events

# Check a specific manifest:
# wrangler r2 object get sc-events/malakais-birthday/manifest.json


# ═════════════════════════════════════════════════════
# FUTURE: ADDING NEW EVENTS
# ═════════════════════════════════════════════════════
#
# 1. Create a new manifest.json (copy from .r2-manifests/ template)
# 2. Upload manifest:
#    wrangler r2 object put sc-events/new-event-slug/manifest.json --file="path/to/manifest.json" --content-type="application/json"
#
# 3. Upload photos:
#    wrangler r2 object put sc-events/new-event-slug/gallery/001.jpg --file="path/to/photo.jpg" --content-type="image/jpeg"
#
# 4. Upload cover:
#    wrangler r2 object put sc-events/new-event-slug/cover.jpg --file="path/to/cover.jpg" --content-type="image/jpeg"
#
# 5. Update manifest.json status/images and re-upload:
#    wrangler r2 object put sc-events/new-event-slug/manifest.json --file="path/to/updated-manifest.json" --content-type="application/json"
#
# UPDATING PHOTOS:
# Just re-upload the manifest with new galleryImages entries
# and upload the new image files. Changes reflect immediately.
#
# CHANGING STATUS:
# Edit the manifest.json status field and re-upload.
# No code changes needed.
