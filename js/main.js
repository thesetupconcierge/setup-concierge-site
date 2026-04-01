/* ============================================
   MAIN.JS — Setup Concierge
   Cleaned interactions — no gimmicks
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Loader: fast brand fade ---
    const loader = document.querySelector('.page-loader');
    if (loader) {
        // Fade immediately once DOM is ready
        requestAnimationFrame(() => {
            loader.classList.add('is-loaded');
        });
        // Remove from DOM after transition
        setTimeout(() => loader.remove(), 400);
    }

    // --- Mobile Navigation ---
    const hamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            navLinks.classList.toggle('is-open');
            document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
        });

        // Close mobile nav when a link is clicked
        navLinks.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('is-active');
                navLinks.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Nav Scroll Effect ---
    const nav = document.getElementById('nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
            lastScroll = scrollY;
        }, { passive: true });
    }

    // --- Scroll Animations (IntersectionObserver) ---
    const animatedElements = document.querySelectorAll('[data-animate], [data-stagger]');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // --- Smooth Scroll for Same-Page Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Subtle Card Tilt (only on desktop, only on cards) ---
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.service-card, .testimonial-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;
                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
});
