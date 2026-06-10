/* ============================================
   ZHENG BOWEN — CREATIVE PORTFOLIO
   Interactive JavaScript Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // CUSTOM CURSOR
    // ==========================================
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower && !('ontouchstart' in window)) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Direct update for main cursor
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Smooth follow for the larger cursor
        function animateCursor() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor states on interactive elements
        const interactiveElements = document.querySelectorAll(
            'a, button, .btn-primary, .btn-ghost, .glass-card, .contact-item, ' +
            '.project-card, .nav-toggle, input, textarea, .skill-item, [data-cursor="active"]'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                cursorFollower.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                cursorFollower.classList.remove('active');
            });
        });
    } else if (cursor && cursorFollower) {
        // Hide custom cursor on touch devices
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // ==========================================
    // PARTICLE CANVAS
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrame;
        let mouseInfluence = { x: 0, y: 0 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Mouse interaction for particles
        document.addEventListener('mousemove', (e) => {
            mouseInfluence.x = e.clientX;
            mouseInfluence.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.pulseOffset = Math.random() * Math.PI * 2;
                this.connections = [];
            }

            update(time) {
                // Gentle floating movement
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                const dx = mouseInfluence.x - this.x;
                const dy = mouseInfluence.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150 * 0.5;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }

                // Wrap around edges
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                if (this.y > canvas.height + 10) this.y = -10;

                // Pulsing opacity
                const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.3 + 0.5;
                this.currentOpacity = this.opacity * pulse;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${this.currentOpacity})`;
                ctx.fill();
            }
        }

        // Initialize particles
        const PARTICLE_COUNT = window.innerWidth < 768 ? 50 : 80;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function drawConnections(ctx) {
            const CONNECTION_DISTANCE = 120;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles(timestamp) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const time = timestamp * 0.001;
            particles.forEach(p => p.update(time));
            drawConnections(ctx);
            particles.forEach(p => p.draw(ctx));

            animationFrame = requestAnimationFrame(animateParticles);
        }

        animationFrame = requestAnimationFrame(animateParticles);

        // Handle page visibility for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrame);
            } else {
                animationFrame = requestAnimationFrame(animateParticles);
            }
        });
    }

    // ==========================================
    // SCROLL-BASED ANIMATIONS
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    // Animate elements with [data-animate]
    const animatedElements = document.querySelectorAll('[data-animate]');
    const appearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                appearObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => appearObserver.observe(el));

    // Animate skill bars when they come into view
    const skillItems = document.querySelectorAll('.skill-item');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.skill-fill');
                const progress = entry.target.getAttribute('data-progress');
                if (fill && progress) {
                    setTimeout(() => {
                        fill.style.width = progress + '%';
                    }, 200);
                }
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillItems.forEach(el => skillObserver.observe(el));

    // ==========================================
    // COUNTER ANIMATION
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        const heroSection = document.querySelector('.hero');
        const rect = heroSection.getBoundingClientRect();
        // Only animate if hero is partially visible
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            countersAnimated = true;

            statNumbers.forEach(el => {
                const target = parseInt(el.getAttribute('data-count'));
                if (isNaN(target)) return;

                const duration = 2000;
                const startTime = performance.now();
                const suffix = el.nextElementSibling?.classList.contains('stat-suffix')
                    ? el.nextElementSibling : null;

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * eased);

                    el.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = target;
                    }
                }

                requestAnimationFrame(update);
            });
        }
    }

    // Check counters on scroll
    window.addEventListener('scroll', animateCounters, { passive: true });
    // Also check on load
    setTimeout(animateCounters, 500);

    // ==========================================
    // NAVIGATION
    // ==========================================
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Nav background on scroll
    function updateNav() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // Initial check

    // Mobile nav toggle
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => {
            const isActive = mobileNav.classList.contains('active');
            if (isActive) {
                mobileNav.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            } else {
                mobileNav.classList.add('active');
                navToggle.classList.add('active');
                document.body.classList.add('menu-open');
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // ==========================================
    // SMOOTH SCROLL FOR NAV LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const navHeight = parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-height'));
                const targetPosition = target.getBoundingClientRect().top
                    + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // PARALLAX EFFECT FOR HERO GLOW
    // ==========================================
    const heroGlow = document.querySelector('.hero-bg-glow');
    if (heroGlow) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            const moveX = (x - 0.5) * 30;
            const moveY = (y - 0.5) * 30;
            heroGlow.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }, { passive: true });
    }

    // ==========================================
    // TILT EFFECT ON CARDS
    // ==========================================
    const tiltCards = document.querySelectorAll('.glass-card:not(.timeline-card):not(.contact-item)');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ==========================================
    // ACTIVE NAV LINK HIGHLIGHT
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + currentSection) {
                link.style.color = 'var(--accent-1)';
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // ==========================================
    // PERFORMANCE: Throttled scroll handlers
    // ==========================================
    function throttle(callback, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                callback.apply(this, args);
            }
        };
    }

    // ==========================================
    // INIT LOG
    // ==========================================
    console.log('%c Bwen Portfolio %c Ready ',
        'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 4px 12px; border-radius: 4px 0 0 4px; font-weight: bold;',
        'background: #0a0a1e; color: #9090b0; padding: 4px 12px; border-radius: 0 4px 4px 0;');
    console.log('%c Designed with precision. Built for creators. ',
        'color: #5a5a78; font-style: italic;');
});
