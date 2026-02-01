/**
 * PROJIFYRA - Extraordinary UI/UX JavaScript
 * Professional Academic Project Platform
 */

// ===================================
// LOADING SCREEN
// ===================================
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Remove loading screen after animations complete
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('loading');
        }, 2500);
    });
}

// ===================================
// PARALLAX SCROLLING
// ===================================
function initParallax() {
    const layers = document.querySelectorAll('.bg-layer');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        layers.forEach((layer, index) => {
            const speed = (index + 1) * 0.15;
            const yPos = -(scrolled * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===================================
// MOBILE MENU TOGGLE
// ===================================
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
}

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL REVEAL ANIMATIONS
// ===================================
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-scroll]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// ===================================
// ANIMATED COUNTERS
// ===================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.status');
    
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => {
                        const target = parseInt(counter.textContent);
                        animateCounter(counter, target);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// ===================================
// BUTTON RIPPLE EFFECT
// ===================================
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation to head
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===================================
// CARD HOVER EFFECTS
// ===================================
function initCardHover() {
    const cards = document.querySelectorAll('.feature-card, .bento-card, .coverage-card, .stat-card, .contact-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initLoadingScreen();
    initParallax();
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initCounters();
    initRippleEffect();
    initCardHover();
    
    // Performance monitoring
    if (performance.timing) {
        const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        console.log(`✨ PROJIFYRA loaded in ${loadTime}ms`);
    }
    
    // Console branding
    console.log('%c🚀 PROJIFYRA', 'color: #6366f1; font-size: 24px; font-weight: bold;');
    console.log('%cAcademic Project Support Platform', 'color: #8b5cf6; font-size: 14px;');
});

// ===================================
// HANDLE WINDOW RESIZE
// ===================================
window.addEventListener('resize', debounce(() => {
    // Close mobile menu on resize
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav');
    
    if (window.innerWidth > 768 && nav && toggle) {
        toggle.classList.remove('active');
        nav.classList.remove('active');
    }
}, 250));

// ===================================
// EXTERNAL LINK TRACKING
// ===================================
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('External link clicked:', link.href);
    });
});
