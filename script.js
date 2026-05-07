document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lucide Icons
    lucide.createIcons();

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    // Scroll progress + back-to-top
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');

    const onScroll = () => {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        if (scrollProgress) scrollProgress.style.width = `${progress}%`;
        if (backToTop) {
            if (scrollTop > 500) backToTop.classList.add('show');
            else backToTop.classList.remove('show');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Change menu icon to 'x' when active
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons(); // Re-render the icon
        });

        // Close mobile menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
        });
    }

    // 3. Active Navigation Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinkItems = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null, // relative to viewport
        rootMargin: '-50% 0px -50% 0px', // triggers when section is in the middle
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active class from all
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    // Check if link's href matches the section id
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // 4.1 Stagger delays for repeated items (nice, subtle motion)
    const applyStagger = (selector, stepMs = 80, maxMs = 360) => {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach((node, idx) => {
            const delay = Math.min(idx * stepMs, maxMs);
            node.style.setProperty('--delay', `${delay}ms`);
        });
    };

    if (!prefersReducedMotion) {
        applyStagger('.projects-grid .project-card.fade-in, .projects-grid .project-card', 90, 450);
        applyStagger('.skills-container .skill-category.fade-in, .skills-container .skill-category', 70, 350);
        applyStagger('.timeline .timeline-item.fade-in, .timeline .timeline-item', 90, 450);
        applyStagger('.education-container .education-card.fade-in, .education-container .education-card', 90, 450);
        applyStagger('.contact-cards .contact-card.fade-in, .contact-cards .contact-card', 70, 350);
    }

    // 4. Fade-in Elements on Scroll
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once it's visible
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // 5. Premium 3D tilt (mouse only, subtle)
    const tiltNodes = document.querySelectorAll('.tilt');
    if (!prefersReducedMotion && canHover && finePointer && tiltNodes.length) {
        const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

        tiltNodes.forEach((el) => {
            const strength = 6; // degrees (gentler movement)
            const zLift = 4; // px

            const onMove = (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const px = clamp(x / rect.width, 0, 1);
                const py = clamp(y / rect.height, 0, 1);

                const rotY = (px - 0.5) * strength * 2;
                const rotX = (0.5 - py) * strength * 2;

                el.style.setProperty('--mx', `${Math.round(px * 100)}%`);
                el.style.setProperty('--my', `${Math.round(py * 100)}%`);
                el.style.transform = `perspective(900px) translateY(-2px) translateZ(${zLift}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
            };

            const onLeave = () => {
                el.style.transform = '';
                el.style.removeProperty('--mx');
                el.style.removeProperty('--my');
            };

            el.addEventListener('mousemove', onMove);
            el.addEventListener('mouseleave', onLeave);
        });
    }

});
