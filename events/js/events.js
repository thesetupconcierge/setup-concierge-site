/* ============================================
   QR EVENT HUB — Shared JavaScript
   Setup Concierge Event Experience System
   v2.0 — Storage-Fed Architecture

   Single shared script for:
   · Universal QR Landing Page
   · Event Shell Pages
   · Event Directory Page

   Data flow:
   1. Fetch from /api/events (directory) or /api/events/:slug (event)
   2. If API fails, fall back to inline EVENT_CONFIG / EVENTS_REGISTRY
   3. If neither exists, render polished empty/error state

   Page type detection is automatic via
   data-page-type attribute on <body>.
   ============================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     API CONFIGURATION
     ───────────────────────────────────────── */

  const API_BASE = '/api/events';
  const API_TIMEOUT = 8000; // ms


  /* ─────────────────────────────────────────
     STATUS MODEL
     ───────────────────────────────────────── */

  const STATUS = {
    'coming-soon': {
      label: 'Coming Soon',
      chipClass: 'status-chip--coming-soon',
      heroHeadline: 'Photos Coming Soon',
      heroSubtext: 'This event hasn\'t happened yet. Come back after the event or sign up to get notified when photos drop.',
      primaryCTA: { text: 'Get Notified', action: 'notify' },
      secondaryCTA: null,
      galleryState: 'empty',
      emptyTitle: 'Photos will be posted here',
      emptyText: 'This gallery will be updated with photos during and after the event.',
    },
    'capturing-live': {
      label: 'Capturing Live',
      chipClass: 'status-chip--capturing-live',
      heroHeadline: 'Being Captured Now',
      heroSubtext: 'Photos are being taken right now. Check back soon or sign up to get notified the moment the gallery goes live.',
      primaryCTA: { text: 'Get Notified', action: 'notify' },
      secondaryCTA: null,
      galleryState: 'teaser',
      emptyTitle: 'Photos are being captured live',
      emptyText: 'The gallery will be updated with fresh photos throughout the event.',
    },
    'preview-available': {
      label: 'Preview Available',
      chipClass: 'status-chip--preview-available',
      heroHeadline: 'Preview Photos Available',
      heroSubtext: 'A first look is ready. The full gallery is still being prepared.',
      primaryCTA: { text: 'View Preview', action: 'scroll-gallery' },
      secondaryCTA: { text: 'Get Full Gallery Alert', action: 'notify' },
      galleryState: 'preview',
      emptyTitle: 'More photos on the way',
      emptyText: 'The full gallery is being prepared and will be available soon.',
    },
    'gallery-live': {
      label: 'Gallery Live',
      chipClass: 'status-chip--gallery-live',
      heroHeadline: 'Your Photos Are Here',
      heroSubtext: 'Relive the moments. Browse the gallery, download your favorites.',
      primaryCTA: { text: 'View Gallery', action: 'gallery' },
      secondaryCTA: { text: 'Get Full Album Updates', action: 'notify' },
      galleryState: 'full',
      emptyTitle: 'Gallery photos loading',
      emptyText: 'Photos are being loaded. Please check back shortly.',
    },
    'archived': {
      label: 'Archived',
      chipClass: 'status-chip--archived',
      heroHeadline: 'Event Gallery',
      heroSubtext: 'Browse the gallery from this past event.',
      primaryCTA: { text: 'View Gallery', action: 'gallery' },
      secondaryCTA: null,
      galleryState: 'full',
      emptyTitle: 'Gallery archived',
      emptyText: 'This gallery may no longer be available.',
    },
  };


  /* ─────────────────────────────────────────
     DATA FETCHING
     ───────────────────────────────────────── */

  /**
   * Fetch with timeout. Returns parsed JSON or null on failure.
   */
  async function apiFetch(url) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!resp.ok) return null;
      return await resp.json();
    } catch (err) {
      console.warn('[QR Event Hub] API fetch failed:', url, err.message);
      return null;
    }
  }

  /**
   * Fetch single event data from API.
   * Falls back to inline EVENT_CONFIG if API unavailable.
   */
  async function fetchEventData(slug) {
    // Try API first
    const data = await apiFetch(`${API_BASE}/${slug}`);
    if (data && data.event) {
      console.log('[QR Event Hub] Event loaded from API:', slug);
      return data.event;
    }

    // Fallback: inline EVENT_CONFIG (for backward compatibility / pre-R2 state)
    if (typeof EVENT_CONFIG !== 'undefined') {
      console.log('[QR Event Hub] Using fallback EVENT_CONFIG for:', slug);
      return EVENT_CONFIG;
    }

    console.warn('[QR Event Hub] No event data available for:', slug);
    return null;
  }

  /**
   * Fetch events directory from API.
   * Falls back to inline EVENTS_REGISTRY if API unavailable.
   */
  async function fetchEventsDirectory() {
    // Try API first
    const data = await apiFetch(API_BASE);
    if (data && data.events) {
      console.log('[QR Event Hub] Events directory loaded from API:', data.events.length, 'events');
      return data.events;
    }

    // Fallback: inline EVENTS_REGISTRY
    if (typeof EVENTS_REGISTRY !== 'undefined') {
      console.log('[QR Event Hub] Using fallback EVENTS_REGISTRY');
      return EVENTS_REGISTRY;
    }

    console.warn('[QR Event Hub] No events directory available');
    return [];
  }


  /* ─────────────────────────────────────────
     UTILITY HELPERS
     ───────────────────────────────────────── */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el && html != null) el.innerHTML = html;
  }

  function setHref(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.href = value;
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }


  /* ─────────────────────────────────────────
     LOADING STATE
     ───────────────────────────────────────── */

  function showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="loading-state" style="text-align: center; padding: 3rem 1rem;">
        <div class="loading-state__spinner" style="
          width: 32px; height: 32px; margin: 0 auto 1rem;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--accent, #C8A96E);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        "></div>
        <p style="color: var(--text-muted, rgba(255,255,255,0.5)); font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.875rem;">
          Loading...
        </p>
      </div>`;
  }

  function showErrorState(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="directory-empty" style="grid-column: 1 / -1;">
        <span class="directory-empty__icon">⚠️</span>
        <h3 class="directory-empty__title">${message || 'Unable to load'}</h3>
        <p class="directory-empty__text">Please check back in a moment.</p>
      </div>`;
  }


  /* ─────────────────────────────────────────
     TOAST NOTIFICATIONS
     ───────────────────────────────────────── */

  let toastTimeout = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
  }


  /* ─────────────────────────────────────────
     SHARE
     ───────────────────────────────────────── */

  function initShare() {
    document.querySelectorAll('[data-action="share"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const shareData = {
          title: document.title,
          text: document.querySelector('meta[name="description"]')?.content || '',
          url: window.location.href,
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            if (err.name !== 'AbortError') copyToClipboard();
          }
        } else {
          copyToClipboard();
        }
      });
    });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('✓ Link copied to clipboard');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✓ Link copied to clipboard');
    });
  }


  /* ─────────────────────────────────────────
     LIGHTBOX
     ───────────────────────────────────────── */

  let lightboxImages = [];
  let lightboxIndex = 0;

  function openLightbox(index) {
    if (!lightboxImages.length) return;
    lightboxIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (!lb || !img) return;
    img.src = lightboxImages[index].src;
    img.alt = lightboxImages[index].alt || '';
    if (counter) counter.textContent = `${index + 1} / ${lightboxImages.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.focus();
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(dir) {
    if (!lightboxImages.length) return;
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (img) {
      img.src = lightboxImages[lightboxIndex].src;
      img.alt = lightboxImages[lightboxIndex].alt || '';
    }
    if (counter) counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  }

  function initLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox__nav--prev')?.addEventListener('click', () => navigateLightbox(-1));
    lb.querySelector('.lightbox__nav--next')?.addEventListener('click', () => navigateLightbox(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
    // Swipe
    let sx = 0;
    lb.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const diff = sx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) navigateLightbox(diff > 0 ? 1 : -1);
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     FORM HANDLING
     ───────────────────────────────────────── */

  function initForms() {
    document.querySelectorAll('[data-form="signup"]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = form.querySelector('[name="name"]');
        const emailInput = form.querySelector('[name="email"]');
        let valid = true;

        // Clear errors
        form.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
        form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

        if (nameInput && !nameInput.value.trim()) {
          nameInput.classList.add('error');
          const err = nameInput.parentElement.querySelector('.form-error') || nameInput.nextElementSibling;
          if (err) { err.textContent = 'Please enter your name'; err.classList.add('show'); }
          valid = false;
        }
        if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
          emailInput.classList.add('error');
          const err = emailInput.parentElement.querySelector('.form-error') || emailInput.nextElementSibling;
          if (err) { err.textContent = 'Please enter a valid email'; err.classList.add('show'); }
          valid = false;
        }
        if (!valid) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
          const endpoint = form.dataset.endpoint;
          if (endpoint) {
            const fd = new FormData(form);
            fd.append('_source', 'qr-event-hub');
            const resp = await fetch(endpoint, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error('Submission failed');
          } else {
            console.log('[QR Event Hub] Mock form submission:', {
              name: nameInput?.value,
              email: emailInput?.value,
            });
            await new Promise(r => setTimeout(r, 800));
          }

          // Success
          form.style.display = 'none';
          form.closest('.signup__card')?.querySelector('.form-trust')?.style.setProperty('display', 'none');
          const success = form.closest('.signup__card')?.querySelector('.signup__success');
          if (success) success.classList.add('show');
        } catch (err) {
          console.error('[QR Event Hub] Form error:', err);
          submitBtn.textContent = origText;
          submitBtn.disabled = false;
          const errState = form.closest('.signup__card')?.querySelector('.signup__error-state');
          if (errState) {
            errState.classList.add('show');
            setTimeout(() => errState.classList.remove('show'), 4000);
          }
        }
      });
    });
  }


  /* ─────────────────────────────────────────
     SCROLL ANIMATIONS
     ───────────────────────────────────────── */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-animate], [data-stagger]').forEach(el => observer.observe(el));
  }


  /* ─────────────────────────────────────────
     PAGE LOADER
     ───────────────────────────────────────── */

  function initLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 300);
    });
    setTimeout(() => loader.classList.add('hidden'), 3000);
  }


  /* ─────────────────────────────────────────
     QUICK ACTIONS
     ───────────────────────────────────────── */

  function initQuickActions() {
    document.querySelectorAll('[data-action="contact"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.email || 'admin@setupconcierge.com';
        const subject = btn.dataset.subject || 'Inquiry from QR Event Hub';
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
      });
    });

    document.querySelectorAll('[data-action="notify"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById('signupSection');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    document.querySelectorAll('[data-action="scroll-gallery"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('gallerySection');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }


  /* ═════════════════════════════════════════
     EVENT SHELL PAGE (API-Fed)
     ═════════════════════════════════════════ */

  async function initEventPage() {
    // Get slug from inline config or URL path
    const slug = (typeof EVENT_SLUG !== 'undefined' && EVENT_SLUG)
      || (typeof EVENT_CONFIG !== 'undefined' && EVENT_CONFIG.slug)
      || window.location.pathname.split('/').filter(Boolean).pop()
      || '';

    if (!slug) {
      console.error('[QR Event Hub] No event slug found');
      return;
    }

    // Fetch event data (API → fallback → null)
    const C = await fetchEventData(slug);

    if (!C) {
      // No data at all — show graceful "not ready" state
      renderEventNotFound();
      return;
    }

    const S = STATUS[C.status] || STATUS['coming-soon'];

    // Apply custom accent color
    if (C.accentColor) {
      const r = document.documentElement;
      r.style.setProperty('--accent', C.accentColor);
      r.style.setProperty('--accent-text', C.accentColor);
      r.style.setProperty('--accent-soft', C.accentColor + '1f');
    }

    // Status chip
    const chipEl = document.getElementById('statusChip');
    if (chipEl) {
      chipEl.className = 'status-chip ' + S.chipClass;
      chipEl.innerHTML = `<span class="status-chip__dot"></span>${S.label}`;
    }

    // Hero
    setText('heroHeadline', C.heroHeadline || S.heroHeadline);
    setText('heroSubtext', C.heroSubtext || S.heroSubtext);
    setText('heroEventName', C.title);
    setText('heroDate', C.date);
    setText('heroLocation', C.location);

    // Hero image
    const heroImg = document.getElementById('heroImage');
    if (heroImg && C.coverImage) {
      heroImg.src = C.coverImage;
      heroImg.alt = C.title + ' — event';
    }

    // Primary CTA
    const primaryBtn = document.getElementById('heroPrimaryCTA');
    if (primaryBtn) {
      primaryBtn.textContent = S.primaryCTA.text;
      if (S.primaryCTA.action === 'gallery' && C.galleryLink) {
        primaryBtn.href = C.galleryLink;
      } else if (S.primaryCTA.action === 'gallery') {
        primaryBtn.href = '#gallerySection';
      } else if (S.primaryCTA.action === 'notify') {
        primaryBtn.href = '#signupSection';
        primaryBtn.setAttribute('data-action', 'notify');
      } else if (S.primaryCTA.action === 'scroll-gallery') {
        primaryBtn.href = '#gallerySection';
      }
    }

    // Secondary CTA
    const secondaryBtn = document.getElementById('heroSecondaryCTA');
    if (secondaryBtn) {
      if (S.secondaryCTA) {
        secondaryBtn.textContent = S.secondaryCTA.text;
        if (S.secondaryCTA.action === 'notify') {
          secondaryBtn.href = '#signupSection';
        }
        secondaryBtn.style.display = '';
      } else {
        secondaryBtn.style.display = 'none';
      }
    }

    // Event context
    setText('contextHeading', C.contextHeading || 'Thanks for being there');
    setText('contextMessage', C.hostMessage || C.description || '');
    if (C.organizer) {
      setText('contextHost', '— ' + C.organizer);
    }

    // Gallery rendering
    renderGallery(C, S);

    // Signup
    if (C.notifyEnabled !== false) {
      setText('signupHeading', C.signupHeading || (S.primaryCTA.action === 'notify'
        ? 'Want the gallery as soon as it drops?'
        : 'Want the full album when it\'s ready?'));
      setText('signupSubtext', C.signupSubtext || 'Drop your email and we\'ll send you the complete gallery — no spam, no strings.');
    } else {
      hide('signupSection');
    }

    // Creator (defaults — not in manifest, keeps branding consistent)
    setText('creatorName', C.creatorName || 'Justice McKinney');
    setText('creatorTitle', C.creatorTitle || 'Event Media & Digital Experience Design');
    setText('creatorDescription', C.creatorDescription || 'I create clean, memorable digital experiences for events, brands, and organizations.');
    setText('creatorBrand', 'Powered by ' + (C.brandName || 'Setup Concierge'));
    setHref('creatorWebsiteLink', C.creatorWebsite || 'https://setupconcierge.com/contact');
    setHref('creatorContactLink', 'mailto:' + (C.creatorEmail || 'admin@setupconcierge.com'));

    // Creator avatar
    const avatarEl = document.getElementById('creatorAvatar');
    if (avatarEl) {
      if (C.creatorPhoto) {
        avatarEl.innerHTML = `<img src="${C.creatorPhoto}" alt="${C.creatorName || 'Creator'}" loading="lazy" />`;
      } else {
        const name = C.creatorName || 'Justice McKinney';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarEl.innerHTML = `<span class="creator__avatar-initials">${initials}</span>`;
      }
    }

    // Soft offer
    setText('softCTAHeading', C.softCTAHeading || 'Want something like this for your next event?');
    setText('softCTAText', C.softCTAText || 'I build custom QR event pages, polished guest experiences, and clean digital presentation systems that make your event feel complete.');
    const softBtn = document.getElementById('softCTAButton');
    if (softBtn) {
      softBtn.textContent = C.softCTAButtonText || 'Work With Me';
      softBtn.href = C.softCTAButtonLink || C.bookingLink || 'https://setupconcierge.com/contact';
    }

    // Footer
    setText('footerBrandName', C.brandName || 'Setup Concierge');
    setText('footerClosing', C.footerText || 'The event ends. The impression does not.');
    setText('footerCopyright', `© ${new Date().getFullYear()} ${C.brandName || 'Setup Concierge'}. Built with care.`);

    // Update page title
    if (C.title) {
      document.title = `${C.title} — Photos & Memories`;
    }
  }


  /**
   * Graceful fallback when no event data exists at all.
   */
  function renderEventNotFound() {
    const S = STATUS['coming-soon'];
    const chipEl = document.getElementById('statusChip');
    if (chipEl) {
      chipEl.className = 'status-chip ' + S.chipClass;
      chipEl.innerHTML = `<span class="status-chip__dot"></span>${S.label}`;
    }
    setText('heroHeadline', 'Event Page Coming Soon');
    setText('heroSubtext', 'This event page is being set up. Check back soon or sign up to get notified.');
    setText('heroEventName', '');
    const primaryBtn = document.getElementById('heroPrimaryCTA');
    if (primaryBtn) {
      primaryBtn.textContent = 'Get Notified';
      primaryBtn.href = '#signupSection';
    }
    const secondaryBtn = document.getElementById('heroSecondaryCTA');
    if (secondaryBtn) secondaryBtn.style.display = 'none';

    // Show empty gallery
    renderGallery({ galleryImages: [], previewImages: [] }, S);

    // Creator defaults
    setText('creatorName', 'Justice McKinney');
    setText('creatorTitle', 'Event Media & Digital Experience Design');
    setText('creatorDescription', 'I create clean, memorable digital experiences for events, brands, and organizations.');
    setText('creatorBrand', 'Powered by Setup Concierge');
    setHref('creatorWebsiteLink', 'https://setupconcierge.com/contact');
    setHref('creatorContactLink', 'mailto:admin@setupconcierge.com');
    const avatarEl = document.getElementById('creatorAvatar');
    if (avatarEl) avatarEl.innerHTML = '<span class="creator__avatar-initials">JM</span>';

    setText('softCTAHeading', 'Want something like this for your next event?');
    setText('softCTAText', 'I build custom QR event pages, polished guest experiences, and clean digital presentation systems that make your event feel complete.');
    const softBtn = document.getElementById('softCTAButton');
    if (softBtn) { softBtn.textContent = 'Work With Me'; softBtn.href = 'https://setupconcierge.com/contact'; }

    setText('footerBrandName', 'Setup Concierge');
    setText('footerClosing', 'The event ends. The impression does not.');
    setText('footerCopyright', `© ${new Date().getFullYear()} Setup Concierge. Built with care.`);
  }


  /* ─────────────────────────────────────────
     GALLERY STATE RENDERING
     ───────────────────────────────────────── */

  function renderGallery(C, S) {
    const gallerySection = document.getElementById('gallerySection');
    if (!gallerySection) return;

    const grid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('galleryEmpty');
    const teaserState = document.getElementById('galleryTeaser');
    const moreIndicator = document.getElementById('galleryMore');
    const ctaArea = document.getElementById('galleryCTA');

    // Determine effective state
    const images = C.galleryImages || [];
    const previews = C.previewImages || [];
    let effectiveState = S.galleryState;

    // Override: if status says 'full' but no images, downgrade to empty
    if (effectiveState === 'full' && images.length === 0) effectiveState = 'empty';
    if (effectiveState === 'preview' && previews.length === 0) effectiveState = 'teaser';

    // Gallery heading
    const headingMap = {
      'empty': 'Gallery',
      'teaser': 'Gallery',
      'preview': 'A Preview',
      'full': 'A Few Moments',
    };
    setText('galleryHeading', headingMap[effectiveState] || 'Gallery');

    const subtextMap = {
      'empty': 'Check back after the event for photos.',
      'teaser': 'Photos are on the way. Check back soon.',
      'preview': 'Here\'s a first look. The full gallery is being prepared.',
      'full': 'Tap any photo to preview. Open the full gallery to see everything.',
    };
    setText('gallerySubtext', subtextMap[effectiveState]);

    // Render based on state
    switch (effectiveState) {
      case 'empty':
        if (grid) grid.style.display = 'none';
        if (teaserState) teaserState.style.display = 'none';
        if (emptyState) {
          emptyState.style.display = '';
          setText('galleryEmptyTitle', S.emptyTitle);
          setText('galleryEmptyText', S.emptyText);
        }
        if (moreIndicator) moreIndicator.style.display = 'none';
        if (ctaArea) ctaArea.style.display = 'none';
        break;

      case 'teaser':
        if (grid) grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        if (teaserState) {
          teaserState.style.display = '';
          teaserState.innerHTML = '';
          for (let i = 0; i < 6; i++) {
            const item = document.createElement('div');
            item.className = 'gallery__teaser-item';
            item.style.animationDelay = `${i * 0.3}s`;
            teaserState.appendChild(item);
          }
        }
        if (moreIndicator) moreIndicator.style.display = 'none';
        if (ctaArea) ctaArea.style.display = 'none';
        break;

      case 'preview':
        if (emptyState) emptyState.style.display = 'none';
        if (teaserState) teaserState.style.display = 'none';
        if (grid) {
          grid.style.display = '';
          grid.innerHTML = '';
          lightboxImages = previews;
          previews.forEach((img, i) => {
            const item = createGalleryItem(img, i);
            grid.appendChild(item);
          });
        }
        if (moreIndicator) {
          moreIndicator.style.display = '';
          moreIndicator.innerHTML = '<span class="gallery__more-dot"></span> More photos coming soon';
        }
        if (ctaArea) ctaArea.style.display = 'none';
        break;

      case 'full':
        if (emptyState) emptyState.style.display = 'none';
        if (teaserState) teaserState.style.display = 'none';
        if (grid) {
          grid.style.display = '';
          grid.innerHTML = '';
          lightboxImages = images;
          images.forEach((img, i) => {
            const item = createGalleryItem(img, i);
            grid.appendChild(item);
          });
        }
        if (moreIndicator) moreIndicator.style.display = 'none';
        if (ctaArea) {
          ctaArea.style.display = '';
          const ctaLink = ctaArea.querySelector('[data-gallery-cta]');
          if (ctaLink && C.galleryLink) {
            ctaLink.href = C.galleryLink;
          } else if (ctaLink) {
            ctaLink.href = '#';
          }
        }
        break;
    }
  }

  function createGalleryItem(img, index) {
    const item = document.createElement('div');
    item.className = 'gallery__item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `View photo: ${img.alt || 'Event photo ' + (index + 1)}`);
    item.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" loading="lazy" />`;
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); }
    });
    return item;
  }


  /* ═════════════════════════════════════════
     UNIVERSAL QR PAGE (API-Fed)
     ═════════════════════════════════════════ */

  async function initUniversalPage() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    // Show loading
    showLoading('eventsGrid');

    // Fetch events
    const events = await fetchEventsDirectory();

    grid.innerHTML = '';

    if (events.length === 0) {
      grid.innerHTML = `
        <div class="directory-empty" style="grid-column: 1 / -1;">
          <span class="directory-empty__icon">📅</span>
          <h3 class="directory-empty__title">No events yet</h3>
          <p class="directory-empty__text">Events will appear here as they're created.</p>
        </div>`;
      return;
    }

    events.forEach(event => {
      grid.appendChild(createEventCard(event));
    });
  }


  /* ═════════════════════════════════════════
     DIRECTORY PAGE (API-Fed)
     ═════════════════════════════════════════ */

  async function initDirectoryPage() {
    const grid = document.getElementById('directoryGrid');
    const searchInput = document.getElementById('directorySearch');
    const emptyState = document.getElementById('directoryEmpty');

    if (!grid) return;

    // Show loading
    showLoading('directoryGrid');

    // Fetch events
    const allEvents = await fetchEventsDirectory();
    let activeFilter = 'all';

    function renderEvents() {
      const query = searchInput?.value?.toLowerCase().trim() || '';
      grid.innerHTML = '';

      const filtered = allEvents.filter(event => {
        const matchesFilter = activeFilter === 'all' || event.status === activeFilter;
        const matchesSearch = !query ||
          event.title.toLowerCase().includes(query) ||
          event.date.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = '';
        return;
      }

      grid.style.display = '';
      if (emptyState) emptyState.style.display = 'none';

      filtered.forEach(event => {
        grid.appendChild(createEventCard(event));
      });
    }

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', renderEvents);
    }

    // Filter chips
    document.querySelectorAll('[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        renderEvents();
      });
    });

    renderEvents();
  }


  /* ─────────────────────────────────────────
     EVENT CARD BUILDER
     ───────────────────────────────────────── */

  function createEventCard(event) {
    const S = STATUS[event.status] || STATUS['coming-soon'];
    const card = document.createElement('div');
    card.className = 'card';

    const coverHTML = event.coverImage
      ? `<img src="${event.coverImage}" alt="${event.title}" loading="lazy" />`
      : `<div class="card__cover-placeholder">
           <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
         </div>`;

    // Resolve event page URL — handle both directory-relative and slug-based
    const eventUrl = event.slug ? `${event.slug}/` : '#';

    card.innerHTML = `
      <div class="card__cover">
        ${coverHTML}
        <span class="status-chip ${S.chipClass}">
          <span class="status-chip__dot"></span>${S.label}
        </span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${event.title}</h3>
        <div class="card__meta">
          <span class="card__meta-item">
            <svg class="card__meta-icon" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
            ${event.date}
          </span>
          <span class="card__meta-item">
            <svg class="card__meta-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${event.location}
          </span>
        </div>
        <div class="card__action">
          <a href="${eventUrl}" class="btn btn--outline btn--sm">View Event Page</a>
        </div>
      </div>`;

    return card;
  }


  /* ═════════════════════════════════════════
     INITIALIZATION
     ═════════════════════════════════════════ */

  function init() {
    const pageType = document.body.dataset.pageType;

    // Inject loading spinner keyframe (once)
    if (!document.getElementById('qr-hub-keyframes')) {
      const style = document.createElement('style');
      style.id = 'qr-hub-keyframes';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // Shared (non-async)
    initLoader();
    initShare();
    initLightbox();
    initForms();
    initQuickActions();
    initScrollAnimations();

    // Page-specific (async — fetch from API)
    if (pageType === 'event') {
      initEventPage();
    } else if (pageType === 'universal') {
      initUniversalPage();
    } else if (pageType === 'directory') {
      initDirectoryPage();
    }

    /* FUTURE EXPANSION HOOKS:
       ─ initAnalytics()        // Track page views, CTA clicks
       ─ initQRGenerator()      // Auto-generate QR codes
       ─ initPasswordGate()     // Protect galleries
       ─ initSMSDelivery()      // SMS gallery links
       ─ initSponsorSection()   // Dynamic sponsor blocks
       ─ initFeedbackCapture()  // Post-event surveys
       ─ initDownloadables()    // Digital keepsakes
       ─ initHostDashboard()    // Real-time analytics
       ─ initAdminUploader()    // Protected upload interface
       ─ initManifestEditor()   // Inline manifest editing */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
