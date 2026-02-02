/**
 * PROJIFYRA - Extraordinary UI/UX JavaScript
 * Professional Academic Project Platform
 */

// ===================================
// THREE.JS 3D ADVANCED ANIMATION SCENE
// ===================================
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x667eea, 30, 100);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        40, 
        window.innerWidth / window.innerHeight, 
        1, 
        100
    );
    camera.position.set(5, 8, 25);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clock for animation timing
    const clock = new THREE.Clock();

    // Lighting setup (enhanced)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x8b5cf6, 0.8);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Animated point lights
    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 50);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 1.5, 40);
    pointLight3.position.set(0, 15, 0);
    scene.add(pointLight3);

    // Create central animated structure
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    // Main rotating ring structure
    const ringGeometry = new THREE.TorusGeometry(8, 0.3, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x6366f1,
        emissiveIntensity: 0.3
    });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.castShadow = true;
    centerGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 2;
    ring2.material = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.3
    });
    centerGroup.add(ring2);

    const ring3 = ring1.clone();
    ring3.rotation.y = Math.PI / 2;
    ring3.material = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.3
    });
    centerGroup.add(ring3);

    // Central sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xa78bfa,
        emissiveIntensity: 0.5
    });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    centralSphere.castShadow = true;
    centerGroup.add(centralSphere);

    // Orbiting satellites
    const satellites = [];
    const satelliteCount = 12;
    for (let i = 0; i < satelliteCount; i++) {
        const satelliteGroup = new THREE.Group();
        
        const size = Math.random() * 0.8 + 0.5;
        const geometryTypes = [
            new THREE.BoxGeometry(size, size, size),
            new THREE.OctahedronGeometry(size),
            new THREE.TetrahedronGeometry(size),
            new THREE.IcosahedronGeometry(size)
        ];
        
        const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
        const material = new THREE.MeshStandardMaterial({
            color: [0x6366f1, 0x8b5cf6, 0x06b6d4, 0xa78bfa, 0x60a5fa][Math.floor(Math.random() * 5)],
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x6366f1,
            emissiveIntensity: 0.2
        });
        
        const satellite = new THREE.Mesh(geometry, material);
        satellite.castShadow = true;
        
        const distance = 12 + Math.random() * 5;
        const angle = (i / satelliteCount) * Math.PI * 2;
        satellite.position.x = Math.cos(angle) * distance;
        satellite.position.z = Math.sin(angle) * distance;
        satellite.position.y = (Math.random() - 0.5) * 4;
        
        satelliteGroup.add(satellite);
        centerGroup.add(satelliteGroup);
        
        satellites.push({
            group: satelliteGroup,
            mesh: satellite,
            orbitSpeed: 0.0005 + Math.random() * 0.001,
            orbitRadius: distance,
            orbitAngle: angle,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        });
    }

    // Floating background particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Smooth camera movement based on mouse
        targetX = mouseX * 8;
        targetY = mouseY * 8;
        camera.position.x += (targetX - camera.position.x + 5) * 0.05;
        camera.position.y += (targetY - camera.position.y + 8) * 0.05;
        camera.lookAt(0, 0, 0);

        // Rotate central group
        centerGroup.rotation.y += delta * 0.15;
        centerGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
        
        // Rotate individual rings
        ring1.rotation.x += delta * 0.5;
        ring2.rotation.y += delta * 0.7;
        ring3.rotation.z += delta * 0.6;
        
        // Pulse central sphere
        const pulseFactor = 1 + Math.sin(elapsedTime * 2) * 0.1;
        centralSphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
        centralSphere.rotation.y += delta * 0.5;
        
        // Animate satellites
        satellites.forEach((sat, index) => {
            // Orbit
            sat.orbitAngle += sat.orbitSpeed;
            sat.group.position.x = Math.cos(sat.orbitAngle) * sat.orbitRadius;
            sat.group.position.z = Math.sin(sat.orbitAngle) * sat.orbitRadius;
            sat.group.position.y = Math.sin(elapsedTime + index) * 2;
            
            // Rotate
            sat.mesh.rotation.x += sat.rotationSpeed.x;
            sat.mesh.rotation.y += sat.rotationSpeed.y;
            sat.mesh.rotation.z += sat.rotationSpeed.z;
        });
        
        // Animate point lights
        pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 15;
        pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 15;
        pointLight1.position.y = 10 + Math.sin(elapsedTime * 0.7) * 5;
        
        pointLight2.position.x = Math.cos(elapsedTime * 0.4) * 15;
        pointLight2.position.z = Math.sin(elapsedTime * 0.4) * 15;
        pointLight2.position.y = 10 + Math.cos(elapsedTime * 0.6) * 5;
        
        pointLight3.position.y = 15 + Math.sin(elapsedTime) * 3;
        pointLight3.intensity = 1.5 + Math.sin(elapsedTime * 2) * 0.5;
        
        // Rotate particles
        particles.rotation.y += delta * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
    };
}

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
    // Initialize 3D floating shapes
    initThreeJS();
    
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
