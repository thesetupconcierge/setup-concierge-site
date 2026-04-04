/**
 * GET /media/*
 *
 * Proxies R2 objects as publicly accessible media files.
 * Serves images with correct Content-Type and cache headers.
 *
 * URL pattern: /media/{slug}/{path}
 * Example:     /media/malakais-birthday/gallery/001.jpg
 *              /media/malakais-birthday/cover.jpg
 *
 * FUTURE: When R2 custom domain (media.setupconcierge.com) is connected,
 * this proxy can be deprecated. Update MEDIA_BASE_URL in wrangler.jsonc
 * to point to the custom domain instead.
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

export async function onRequestGet(context) {
  const { env, params } = context;
  const bucket = env.EVENTS_BUCKET;

  // [[path]] captures all segments as an array
  const pathSegments = params.path;
  const key = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

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

    // Determine content type
    const ext = '.' + key.split('.').pop().toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Build response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    headers.set('Access-Control-Allow-Origin', '*');

    // Forward R2 metadata if present
    if (object.httpEtag) {
      headers.set('ETag', object.httpEtag);
    }

    return new Response(object.body, { headers });
  } catch (err) {
    console.error(`[Media Proxy] Error serving ${key}:`, err);
    return new Response('Internal error', { status: 500 });
  }
}
