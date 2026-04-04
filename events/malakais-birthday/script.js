/* ============================================
   QR EVENT PAGE — Script
   Setup Concierge Event Experience System

   ╔═══════════════════════════════════════════╗
   ║  EVENT CONFIGURATION — EDIT THIS SECTION  ║
   ╚═══════════════════════════════════════════╝

   To customize for a new event:
   1. Duplicate this entire event folder
   2. Edit the EVENT_CONFIG object below
   3. Replace images in the /images folder
   4. Deploy

   ============================================ */

const EVENT_CONFIG = {

  // ─── Core Event Info ────────────────────────
  eventTitle:    "Malakai's Birthday Celebration",
  eventSubtitle: "Thanks for celebrating with us",
  eventDate:     "November 5, 2026",
  eventLocation: "Chicago, Illinois",
  hostName:      "Malakai & Family",

  // ─── Hero Section ──────────────────────────
  heroHeadline: "Your Event Photos Are Here",
  heroSubtext:  "Relive the moments. Download your favorites.",
  heroImage:    "./images/hero.png",

  // ─── Gallery ───────────────────────────────
  // Replace with your external gallery URL:
  // Google Drive, Pixieset, Dropbox, SmugMug, etc.
  galleryLink: "#",

  // Gallery preview images — add 6-9 for best results
  galleryPreviewImages: [
    { src: "./images/gallery-1.png", alt: "Friends celebrating together" },
    { src: "./images/gallery-2.png", alt: "Elegant table setting" },
    { src: "./images/gallery-3.png", alt: "Birthday cake with sparklers" },
    { src: "./images/gallery-4.png", alt: "Toast to the guest of honor" },
    { src: "./images/gallery-5.png", alt: "Dance floor moments" },
    { src: "./images/gallery-6.png", alt: "Celebration decorations" },
  ],

  // ─── Creator / Brand ──────────────────────
  creatorName:         "Justice McKinney",
  creatorTitle:        "Event Media & Digital Experience Design",
  creatorDescription:  "I create clean, memorable digital experiences for events, brands, and organizations.",
  creatorPhoto:        "",        // Optional: "./images/creator.jpg"
  creatorWebsite:      "https://setupconcierge.com",
  creatorContactEmail: "admin@setupconcierge.com",
  creatorContactPhone: "+1 (773) 773-0380",
  brandName:           "Setup Concierge",
  logoImage:           "",        // Optional: "./images/logo.png"

  // ─── Soft CTA ─────────────────────────────
  softCTAHeading:    "Want something like this for your next event?",
  softCTAText:       "I build custom QR event pages, polished guest experiences, and clean digital presentation systems that make your event feel complete.",
  softCTAButtonText: "Work With Me",
  softCTAButtonLink: "https://setupconcierge.com/contact",

  // ─── Lead Capture ─────────────────────────
  fullGallerySignupEnabled: true,
  signupHeading: "Want the full album when it's ready?",
  signupSubtext: "Drop your email and we'll send you the complete gallery — no spam, no strings.",

  // WEBHOOK ENDPOINT:
  // Replace with FormSubmit, Formspree, Make.com webhook, or Zapier URL
  // Leave empty for mock submission demo
  signupEndpoint: "",
  // Example: "https://formsubmit.co/admin@setupconcierge.com"

  // ─── Thank You Message ────────────────────
  thankYouMessage: "Thank you for being part of this celebration. We hope these photos bring back great memories.",

  // ─── Share Config ─────────────────────────
  shareMessage: "Check out the photos from Malakai's Birthday Celebration! 🎉",

  // ─── Social Links ─────────────────────────
  // Uncomment and fill in as needed:
  socialLinks: {
    // instagram: "https://instagram.com/username",
    // facebook: "https://facebook.com/username",
    // twitter: "https://x.com/username",
    // linkedin: "https://linkedin.com/in/username",
    // tiktok: "https://tiktok.com/@username",
  },

  // ─── Footer ───────────────────────────────
  footerText:    "The event ends. The impression does not.",
  copyrightText: `© ${new Date().getFullYear()} Setup Concierge. Built with care.`,

  // ─── Host Message (Optional) ──────────────
  hostMessage: "Thank you for celebrating Malakai's special day with us. Your presence made it even more memorable. We hope you enjoy these photos as much as we enjoyed having you there.",

  // ─── Event Theme ──────────────────────────
  // Used for future templating: birthday, wedding, corporate, gala, etc.
  eventTheme: "birthday",

  // ─── Visual Customization (Optional) ──────
  customAccentColor:   "",   // e.g., "#c9a84c" — leave empty for default gold
  customBackgroundTone: "", // "warm" | "cool" | "neutral" — future use

  // ─── Sponsor (Optional) ───────────────────
  sponsorName: "",
  sponsorLogo: "",

  // ─── Advanced / Future Use ────────────────
  pageSlug:           "malakais-birthday",
  qrCodeImage:        "",          // "./images/qr-code.png"
  downloadableAssets: [],          // [{ name: "Party Favors Guide", url: "./assets/guide.pdf" }]
};


/* ============================================
   APPLICATION CODE
   ============================================
   No edits needed below this line unless
   you are extending functionality.
   ============================================ */

(function () {
  'use strict';

  const C = EVENT_CONFIG;


  /* ─── Apply Custom Accent Color ─── */

  function applyCustomColors() {
    if (C.customAccentColor) {
      const r = document.documentElement;
      r.style.setProperty('--accent', C.customAccentColor);
      r.style.setProperty('--accent-text', C.customAccentColor);
      // Derive soft variants
      r.style.setProperty('--accent-soft', C.customAccentColor + '1f');
      r.style.setProperty('--accent-glow', C.customAccentColor + '0f');
      r.style.setProperty('--border-accent', C.customAccentColor + '2e');
    }
  }


  /* ─── Populate DOM from Config ─── */

  function populateContent() {
    // Helper: safely set text
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    };

    // Helper: safely set href
    const setHref = (id, value) => {
      const el = document.getElementById(id);
      if (el && value) el.href = value;
    };

    // Hero
    setText('heroHeadline', C.heroHeadline);
    setText('heroSubtext', C.heroSubtext);
    setText('heroEventName', C.eventTitle);
    setText('heroDate', C.eventDate);
    setText('heroLocation', C.eventLocation);

    // Hero image
    const heroImg = document.getElementById('heroImage');
    if (heroImg && C.heroImage) {
      heroImg.src = C.heroImage;
      heroImg.alt = C.eventTitle + ' — event venue';
    }

    // Gallery CTA links
    document.querySelectorAll('[data-gallery-link]').forEach(el => {
      if (C.galleryLink) el.href = C.galleryLink;
    });

    // Event context
    setText('contextHeading', C.eventSubtitle || 'Thanks for being there');
    setText('contextMessage', C.hostMessage || C.thankYouMessage);
    if (C.hostName) {
      setText('contextHost', '— ' + C.hostName);
    }

    // Gallery heading
    setText('galleryHeading', 'A Few Moments');
    setText('gallerySubtext', 'Tap any photo to preview. Open the full gallery to see everything.');

    // Build gallery grid
    buildGalleryGrid();

    // Signup section
    if (!C.fullGallerySignupEnabled) {
      const signupSection = document.getElementById('signupSection');
      if (signupSection) signupSection.style.display = 'none';
    } else {
      setText('signupHeading', C.signupHeading);
      setText('signupSubtext', C.signupSubtext);
    }

    // Creator block
    setText('creatorName', C.creatorName);
    setText('creatorTitle', C.creatorTitle);
    setText('creatorDescription', C.creatorDescription);
    setText('creatorBrand', 'Powered by ' + C.brandName);
    setHref('creatorWebsiteLink', C.creatorWebsite);
    setHref('creatorContactLink', 'mailto:' + C.creatorContactEmail);

    // Creator avatar
    const avatarContainer = document.getElementById('creatorAvatar');
    if (avatarContainer) {
      if (C.creatorPhoto) {
        avatarContainer.innerHTML = `<img src="${C.creatorPhoto}" alt="${C.creatorName}" loading="lazy" />`;
      } else {
        // Generate initials
        const initials = C.creatorName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatarContainer.innerHTML = `<span class="creator__avatar-initials">${initials}</span>`;
      }
    }

    // Soft offer
    setText('softCTAHeading', C.softCTAHeading);
    setText('softCTAText', C.softCTAText);
    const softBtn = document.getElementById('softCTAButton');
    if (softBtn) {
      softBtn.textContent = C.softCTAButtonText;
      softBtn.href = C.softCTAButtonLink;
    }

    // Footer
    setText('footerBrandName', C.brandName);
    setText('footerClosing', C.footerText);
    setText('footerCopyright', C.copyrightText);
    setHref('footerWebsite', C.creatorWebsite);
    setHref('footerEmail', 'mailto:' + C.creatorContactEmail);

    // Social links
    buildSocialLinks();
  }


  /* ─── Gallery Grid ─── */

  function buildGalleryGrid() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const images = C.galleryPreviewImages;

    if (images && images.length > 0) {
      images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-preview__item';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `View photo: ${img.alt || 'Event photo ' + (index + 1)}`);
        item.dataset.index = index;
        item.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" loading="lazy" />`;
        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(index);
          }
        });
        grid.appendChild(item);
      });
    }
  }


  /* ─── Social Links ─── */

  const socialIcons = {
    instagram: `<svg viewBox="0 0 24 24" class="footer__social-icon"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" class="footer__social-icon"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" class="footer__social-icon"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" class="footer__social-icon"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" class="footer__social-icon"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor"/></svg>`,
  };

  function buildSocialLinks() {
    const container = document.getElementById('footerSocial');
    if (!container) return;

    const links = C.socialLinks;
    if (!links || Object.keys(links).length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = '';
    for (const [platform, url] of Object.entries(links)) {
      if (!url) continue;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'footer__social-link';
      a.setAttribute('aria-label', platform.charAt(0).toUpperCase() + platform.slice(1));
      a.innerHTML = socialIcons[platform] || '';
      container.appendChild(a);
    }

    if (container.children.length === 0) {
      container.style.display = 'none';
    }
  }


  /* ─── Lightbox ─── */

  let currentLightboxIndex = 0;

  function openLightbox(index) {
    const images = C.galleryPreviewImages;
    if (!images || images.length === 0) return;

    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');

    if (!lightbox || !img) return;

    img.src = images[index].src;
    img.alt = images[index].alt || '';
    if (counter) counter.textContent = `${index + 1} / ${images.length}`;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Trap focus
    lightbox.focus();
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(direction) {
    const images = C.galleryPreviewImages;
    if (!images || images.length === 0) return;

    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = images.length - 1;
    if (currentLightboxIndex >= images.length) currentLightboxIndex = 0;

    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');

    if (img) {
      img.src = images[currentLightboxIndex].src;
      img.alt = images[currentLightboxIndex].alt || '';
    }
    if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${images.length}`;
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Close button
    const closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // Nav buttons
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    // Background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox(-1);
          break;
        case 'ArrowRight':
          navigateLightbox(1);
          break;
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        navigateLightbox(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }


  /* ─── Share Feature ─── */

  function initShare() {
    const shareBtn = document.getElementById('shareAction');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: C.eventTitle,
        text: C.shareMessage,
        url: window.location.href,
      };

      // Use native share API if available (mobile)
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // User cancelled or error — fall back to copy
          if (err.name !== 'AbortError') {
            copyToClipboard();
          }
        }
      } else {
        copyToClipboard();
      }
    });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('✓ Link copied to clipboard');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('✓ Link copied to clipboard');
    });
  }


  /* ─── Toast Notification ─── */

  let toastTimeout = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }


  /* ─── Form Handling ─── */

  function initForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate
      const nameInput = form.querySelector('[name="name"]');
      const emailInput = form.querySelector('[name="email"]');
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.signup__field-error').forEach(el => el.classList.remove('show'));
      form.querySelectorAll('.signup__input').forEach(el => el.classList.remove('error'));

      if (nameInput && !nameInput.value.trim()) {
        showFieldError(nameInput, 'nameError', 'Please enter your name');
        valid = false;
      }

      if (emailInput && !isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'emailError', 'Please enter a valid email address');
        valid = false;
      }

      if (!valid) return;

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        if (C.signupEndpoint) {
          // ── REAL SUBMISSION ──
          // Send to configured webhook/form endpoint
          const formData = new FormData(form);

          // Add hidden fields for context
          formData.append('_event', C.eventTitle);
          formData.append('_date', C.eventDate);
          formData.append('_source', 'qr-event-page');

          const response = await fetch(C.signupEndpoint, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
          });

          if (!response.ok) throw new Error('Submission failed');

        } else {
          // ── MOCK SUBMISSION ──
          // No endpoint configured — simulate success for demo
          // TODO: Connect to your form endpoint:
          //   FormSubmit:  "https://formsubmit.co/your@email.com"
          //   Formspree:   "https://formspree.io/f/your-form-id"
          //   Make.com:    "https://hook.us1.make.com/your-webhook-id"
          //   Zapier:      "https://hooks.zapier.com/hooks/catch/your-id"
          //   Custom API:  "https://your-api.com/submit"
          console.log('[QR Event Page] Mock submission:', {
            name: nameInput?.value,
            email: emailInput?.value,
            event: C.eventTitle,
          });
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Show success state
        form.style.display = 'none';
        document.querySelector('.signup__trust')?.style.setProperty('display', 'none');
        const success = document.getElementById('signupSuccess');
        if (success) success.classList.add('show');

      } catch (err) {
        // Show error state
        console.error('[QR Event Page] Form submission error:', err);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        const errorState = document.getElementById('signupError');
        if (errorState) errorState.classList.add('show');

        // Auto-hide error after 4s
        setTimeout(() => {
          if (errorState) errorState.classList.remove('show');
        }, 4000);
      }
    });
  }

  function showFieldError(input, errorId, message) {
    input.classList.add('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ─── Scroll Animations ─── */

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
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    document.querySelectorAll('[data-animate], [data-stagger]').forEach((el) => {
      observer.observe(el);
    });
  }


  /* ─── Page Loader ─── */

  function initLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 300);
    });

    // Fallback: hide after 3s max
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 3000);
  }


  /* ─── Quick Action: Copy Link ─── */

  function initCopyLink() {
    const copyBtn = document.getElementById('copyLinkAction');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', copyToClipboard);
  }


  /* ─── Quick Action: Contact ─── */

  function initContact() {
    const contactBtn = document.getElementById('contactAction');
    if (!contactBtn) return;

    contactBtn.addEventListener('click', () => {
      if (C.creatorContactEmail) {
        window.location.href = `mailto:${C.creatorContactEmail}?subject=${encodeURIComponent('Inquiry from ' + C.eventTitle + ' Event Page')}`;
      } else if (C.creatorWebsite) {
        window.open(C.creatorWebsite, '_blank');
      }
    });
  }


  /* ─── Quick Action: Gallery Updates ─── */

  function initUpdatesAction() {
    const updatesBtn = document.getElementById('updatesAction');
    if (!updatesBtn) return;

    updatesBtn.addEventListener('click', () => {
      const signupSection = document.getElementById('signupSection');
      if (signupSection) {
        signupSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }


  /* ─── Initialize Everything ─── */

  function init() {
    applyCustomColors();
    populateContent();
    initLoader();
    initLightbox();
    initShare();
    initCopyLink();
    initContact();
    initUpdatesAction();
    initForm();
    initScrollAnimations();

    // FUTURE EXPANSION HOOKS:
    // ─ initAnalytics()         // Track page views, CTA clicks, gallery opens
    // ─ initQRGenerator()       // Auto-generate QR code for this page
    // ─ initPasswordGate()      // Password-protect the gallery
    // ─ initSMSDelivery()       // SMS gallery link to guests
    // ─ initSponsorSection()    // Dynamic sponsor block injection
    // ─ initFeedbackCapture()   // Post-event guest feedback form
    // ─ initDownloadables()     // Keepsakes, digital favors, etc.
    // ─ initHostDashboard()     // Real-time view count, form submissions
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
