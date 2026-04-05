/**
 * Worker Entrypoint — QR Event Hub API
 *
 * Handles:
 *   GET /api/events         → directory listing from R2
 *   GET /api/events/:slug   → single event data from R2
 *   GET /media/*            → R2 image proxy
 *
 * All other requests fall through to static assets (handled by Cloudflare).
 */

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── API: Events Directory ──────────────────────────
    if (path === '/api/events' || path === '/api/events/') {
      return handleEventsDirectory(env);
    }

    // ── API: Single Event ──────────────────────────────
    const eventMatch = path.match(/^\/api\/events\/([^/]+)\/?$/);
    if (eventMatch) {
      return handleSingleEvent(env, eventMatch[1]);
    }

    // ── Media Proxy ────────────────────────────────────
    if (path.startsWith('/media/')) {
      return handleMediaProxy(env, path.slice(7)); // strip "/media/"
    }

    // ── Everything else: let static assets handle it ───
    // Return a pass-through to the asset binding
    return env.ASSETS.fetch(request);
  },
};


/* ═══════════════════════════════════════════
   GET /api/events — Directory Listing
   ═══════════════════════════════════════════ */

async function handleEventsDirectory(env) {
  const bucket = env.EVENTS_BUCKET;
  const mediaBase = env.MEDIA_BASE_URL || '/media';

  const headers = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  };

  try {
    if (!bucket) {
      return new Response(JSON.stringify({ events: [], _fallback: true }), { headers });
    }

    // List all top-level prefixes (event slugs)
    const listed = await bucket.list({ delimiter: '/' });
    const prefixes = (listed.delimitedPrefixes || []).map(p => p.replace(/\/$/, ''));

    const events = [];

    for (const slug of prefixes) {
      if (slug.startsWith('_') || slug.startsWith('.')) continue;

      try {
        const manifestObj = await bucket.get(`${slug}/manifest.json`);
        if (!manifestObj) continue;

        const manifest = await manifestObj.json();
        if (manifest.published === false) continue;

        events.push({
          slug: manifest.slug || slug,
          title: manifest.title || slug,
          date: manifest.date || '',
          location: manifest.location || '',
          status: manifest.status || 'coming-soon',
          coverImage: manifest.coverImage
            ? `${mediaBase}/${slug}/${manifest.coverImage}`
            : '',
          description: manifest.description || '',
        });
      } catch (err) {
        console.error(`[Events API] Error reading manifest for ${slug}:`, err.message);
        continue;
      }
    }

    // Sort: live events first
    const statusOrder = {
      'capturing-live': 0,
      'gallery-live': 1,
      'preview-available': 2,
      'coming-soon': 3,
      'archived': 4,
    };
    events.sort((a, b) => {
      const sa = statusOrder[a.status] ?? 5;
      const sb = statusOrder[b.status] ?? 5;
      return sa - sb;
    });

    return new Response(JSON.stringify({ events }), { headers });
  } catch (err) {
    console.error('[Events API] Directory listing error:', err);
    return new Response(
      JSON.stringify({ events: [], error: 'Failed to load events' }),
      { status: 500, headers }
    );
  }
}


/* ═══════════════════════════════════════════
   GET /api/events/:slug — Single Event
   ═══════════════════════════════════════════ */

async function handleSingleEvent(env, slug) {
  const bucket = env.EVENTS_BUCKET;
  const mediaBase = env.MEDIA_BASE_URL || '/media';

  const headers = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
    'Cache-Control': 'public, max-age=30, s-maxage=30',
  };

  try {
    if (!bucket) {
      return new Response(
        JSON.stringify({ error: 'Storage not configured', status: 503 }),
        { status: 503, headers }
      );
    }

    const manifestObj = await bucket.get(`${slug}/manifest.json`);

    if (!manifestObj) {
      return new Response(
        JSON.stringify({ error: 'Event not found', status: 404 }),
        { status: 404, headers }
      );
    }

    const manifest = await manifestObj.json();

    // Resolve cover image
    const coverImage = manifest.coverImage
      ? `${mediaBase}/${slug}/${manifest.coverImage}`
      : '';

    // Resolve gallery images
    let galleryImages = [];
    if (manifest.galleryImages && manifest.galleryImages.length > 0) {
      galleryImages = manifest.galleryImages.map(img => ({
        src: `${mediaBase}/${slug}/${img.file}`,
        alt: img.alt || '',
      }));
    } else {
      galleryImages = await listGalleryFallback(bucket, slug, mediaBase);
    }

    // Resolve preview images
    let previewImages = [];
    if (manifest.previewImages && manifest.previewImages.length > 0) {
      previewImages = manifest.previewImages.map(img => ({
        src: `${mediaBase}/${slug}/${img.file}`,
        alt: img.alt || '',
      }));
    }

    // Resolve featured images
    let featuredImages = [];
    if (manifest.featuredImages && manifest.featuredImages.length > 0) {
      featuredImages = manifest.featuredImages.map(file =>
        `${mediaBase}/${slug}/${file}`
      );
    }

    const event = {
      slug: manifest.slug || slug,
      title: manifest.title || slug,
      date: manifest.date || '',
      location: manifest.location || '',
      status: manifest.status || 'coming-soon',
      published: manifest.published !== false,
      organizer: manifest.organizer || '',
      description: manifest.description || '',
      coverImage,
      galleryImages,
      previewImages,
      featuredImages,
      galleryLink: manifest.galleryLink || '',
      contextHeading: manifest.contextHeading || '',
      hostMessage: manifest.hostMessage || '',
      notifyEnabled: manifest.notifyEnabled !== false,
      signupHeading: manifest.signupHeading || '',
      signupSubtext: manifest.signupSubtext || '',
      accentColor: manifest.accentColor || '',
      bookingLink: manifest.bookingLink || '',
      updatedAt: manifest.updatedAt || '',
    };

    return new Response(JSON.stringify({ event }), { headers });
  } catch (err) {
    console.error(`[Events API] Error loading event "${slug}":`, err);
    return new Response(
      JSON.stringify({ error: 'Failed to load event', status: 500 }),
      { status: 500, headers }
    );
  }
}


/**
 * Fallback: list gallery/ folder objects from R2 when manifest has no galleryImages.
 */
async function listGalleryFallback(bucket, slug, mediaBase) {
  try {
    const prefix = `${slug}/gallery/`;
    const listed = await bucket.list({ prefix });

    if (!listed.objects || listed.objects.length === 0) return [];

    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    return listed.objects
      .filter(obj => {
        const key = obj.key.toLowerCase();
        return imageExts.some(ext => key.endsWith(ext));
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(obj => ({
        src: `${mediaBase}/${obj.key}`,
        alt: '',
      }));
  } catch (err) {
    console.error(`[Events API] Gallery fallback listing error for ${slug}:`, err);
    return [];
  }
}


/* ═══════════════════════════════════════════
   GET /media/* — R2 Image Proxy
   ═══════════════════════════════════════════ */

async function handleMediaProxy(env, key) {
  const bucket = env.EVENTS_BUCKET;

  if (!key) {
    return new Response('Not found', { status: 404 });
  }

  if (!bucket) {
    return new Response('Storage not configured', { status: 503 });
  }

  try {
    const object = await bucket.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const ext = '.' + key.split('.').pop().toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    headers.set('Access-Control-Allow-Origin', '*');

    if (object.httpEtag) {
      headers.set('ETag', object.httpEtag);
    }

    return new Response(object.body, { headers });
  } catch (err) {
    console.error(`[Media Proxy] Error serving ${key}:`, err);
    return new Response('Internal error', { status: 500 });
  }
}
