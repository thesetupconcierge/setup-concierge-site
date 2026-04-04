/**
 * GET /api/events/:slug
 *
 * Returns full event data for a single event.
 * Reads the event's manifest.json from R2 and resolves
 * all image paths to public URLs.
 *
 * Falls back to listing the gallery/ folder if galleryImages
 * is missing from the manifest.
 *
 * FUTURE: Add auth for draft events, ETag caching, image variants.
 */

export async function onRequestGet(context) {
  const { env, params } = context;
  const slug = params.slug;
  const bucket = env.EVENTS_BUCKET;
  const mediaBase = env.MEDIA_BASE_URL || '/media';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=30, s-maxage=30',
  };

  try {
    if (!bucket) {
      return new Response(
        JSON.stringify({ error: 'Storage not configured', status: 503 }),
        { status: 503, headers }
      );
    }

    // Read manifest
    const manifestObj = await bucket.get(`${slug}/manifest.json`);

    if (!manifestObj) {
      return new Response(
        JSON.stringify({ error: 'Event not found', status: 404 }),
        { status: 404, headers }
      );
    }

    const manifest = await manifestObj.json();

    // Resolve cover image URL
    const coverImage = manifest.coverImage
      ? `${mediaBase}/${slug}/${manifest.coverImage}`
      : '';

    // Resolve gallery images
    let galleryImages = [];
    if (manifest.galleryImages && manifest.galleryImages.length > 0) {
      // Manifest-driven (preferred: curated order, alt text)
      galleryImages = manifest.galleryImages.map(img => ({
        src: `${mediaBase}/${slug}/${img.file}`,
        alt: img.alt || '',
      }));
    } else {
      // Fallback: list gallery/ folder contents from R2
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

    // Build response
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

      /* FUTURE: captions, tags, sponsors, downloadables */
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
 * Fallback: list objects in the gallery/ prefix and return them
 * sorted by key name. Used when manifest.galleryImages is empty.
 */
async function listGalleryFallback(bucket, slug, mediaBase) {
  try {
    const prefix = `${slug}/gallery/`;
    const listed = await bucket.list({ prefix });

    if (!listed.objects || listed.objects.length === 0) return [];

    // Filter to image files only
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    const images = listed.objects
      .filter(obj => {
        const key = obj.key.toLowerCase();
        return imageExts.some(ext => key.endsWith(ext));
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(obj => ({
        src: `${mediaBase}/${obj.key}`,
        alt: '',
      }));

    return images;
  } catch (err) {
    console.error(`[Events API] Gallery fallback listing error for ${slug}:`, err);
    return [];
  }
}
