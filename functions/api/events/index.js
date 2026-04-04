/**
 * GET /api/events
 *
 * Returns a directory listing of all published events.
 * Reads each event's manifest.json from R2 and returns
 * a filtered, sorted array for the universal and directory pages.
 *
 * FUTURE: Add pagination, cache headers, tag filtering.
 */

export async function onRequestGet(context) {
  const { env } = context;
  const bucket = env.EVENTS_BUCKET;
  const mediaBase = env.MEDIA_BASE_URL || '/media';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  };

  try {
    if (!bucket) {
      return new Response(JSON.stringify({ events: [], _fallback: true }), { headers });
    }

    // List all objects ending in manifest.json
    const listed = await bucket.list({ delimiter: '/' });
    const prefixes = (listed.delimitedPrefixes || []).map(p => p.replace(/\/$/, ''));

    const events = [];

    for (const slug of prefixes) {
      // Skip internal/hidden prefixes
      if (slug.startsWith('_') || slug.startsWith('.')) continue;

      try {
        const manifestObj = await bucket.get(`${slug}/manifest.json`);
        if (!manifestObj) continue;

        const manifest = await manifestObj.json();

        // Only include published events
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
        // Skip events with invalid manifests
        console.error(`[Events API] Error reading manifest for ${slug}:`, err.message);
        continue;
      }
    }

    // Sort: gallery-live first, then by date descending
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
      if (sa !== sb) return sa - sb;
      return 0; // Preserve manifest order within same status
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
