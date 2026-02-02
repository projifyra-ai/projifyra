
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Sky } from 'three/addons/objects/Sky.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    colors: {
        skyTop: 0x87CEEB, // SkyBlue
        water: 0x006994, // Sea Blue (more realistic)
        sand: 0xE6D8AD, // Beige Sand
        grass: 0x4F7942, // Fern Green
        neonBlue: 0x06b6d4,
        neonPurple: 0x8b5cf6,
        wall: 0xE8E8E8, // Off-white concrete/stucco
        roof: 0x8B4513, // SaddleBrown
        shutter: 0x708090, // SlateGray
        rock: 0x808080
    },
    camera: {
        fov: 50,
        near: 0.1,
        far: 2000,
        startPos: new THREE.Vector3(0, 10, 50)
    }
};

class IntroScene {
    constructor() {
        this.container = document.getElementById('intro-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Objects
        this.water = null;
        this.shutter = null;
        this.sky = null;
        this.sun = new THREE.Vector3();
        this.isTransitioning = false;

        this.init();
    }

    init() {
        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.copy(CONFIG.camera.startPos);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Balance quality/perf
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Tone mapping for realistic lighting
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stay above ground
        this.controls.minDistance = 15;
        this.controls.maxDistance = 80;

        // 5. Environment
        this.createSky();
        this.addLights();
        this.addWater();
        this.addTerrain();
        this.addRocks(); // New
        this.addVegetation();
        this.buildHouse(); // "Realistic House"

        // 6. Events
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

        this.animate();
    }

    createSky() {
        // Realistic Sky Shader
        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        this.scene.add(this.sky);

        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 2;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;

        // Sun Position (Daylight)
        const phi = THREE.MathUtils.degToRad(80); // Elevation (90 is horizon, 0 is zenith overhead)
        const theta = THREE.MathUtils.degToRad(180); // Azimuth

        this.sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(this.sun);
    }

    addLights() {
        // Ambient (bright daylight shadow fill)
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Sun Directional Light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
        dirLight.position.copy(this.sun).multiplyScalar(100);
        dirLight.castShadow = true;
        // Optimization: Shadow map size
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        const d = 50;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0001;
        this.scene.add(dirLight);
    }

    addWater() {
        // Use a simple plane but with a better color for realism
        const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.colors.water,
            shininess: 90,
            reflectivity: 0.8,
            transparent: true,
            opacity: 0.9,
            specular: 0x111111
        });

        this.water = new THREE.Mesh(geometry, material);
        this.water.rotation.x = -Math.PI / 2;
        // Water is sea level (0)
        this.water.position.y = -0.5;
        this.water.receiveShadow = true;
        this.scene.add(this.water);

        // We will animate waves in the loop
        this.water.geometry.userData = { originalPos: this.water.geometry.attributes.position.array.slice() };
    }

    addTerrain() {
        // An island like platform
        const geometry = new THREE.CylinderGeometry(40, 50, 5, 64);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.sand,
            roughness: 1,
            metalness: 0
        });
        const island = new THREE.Mesh(geometry, material);
        island.position.y = -2; // Slightly submerged so top is at ~0.5
        island.receiveShadow = true;
        island.castShadow = true;
        this.scene.add(island);

        // Grass/Top layer
        const topGeo = new THREE.CircleGeometry(40, 64);
        const topMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.sand, // Keep sandy for coastline look
            roughness: 1
        });
        const top = new THREE.Mesh(topGeo, topMat);
        top.rotation.x = -Math.PI / 2;
        top.position.y = 0.51;
        top.receiveShadow = true;
        this.scene.add(top);
    }

    addRocks() {
        // Procedural rocks scattered
        const rockGeo = new THREE.DodecahedronGeometry(1, 0);
        const rockMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.rock,
            roughness: 0.9,
            flatShading: true
        });

        for (let i = 0; i < 30; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);

            // Random Pos
            const r = 15 + Math.random() * 20; // 15 to 35 radius
            const a = Math.random() * Math.PI * 2;
            rock.position.set(Math.cos(a) * r, 1, Math.sin(a) * r);

            // Random Scale
            const s = 0.2 + Math.random() * 0.8;
            rock.scale.set(s, s * 0.6, s);
            rock.rotation.set(Math.random(), Math.random(), Math.random());

            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    addVegetation() {
        // Simple Pines/Palms
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 7);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 }); // Wood
        const leavesGeo = new THREE.ConeGeometry(2, 5, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.grass });

        for (let i = 0; i < 12; i++) {
            const group = new THREE.Group();

            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 1.5;
            trunk.castShadow = true;
            group.add(trunk);

            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.y = 4;
            leaves.castShadow = true;
            group.add(leaves);

            // Group Pos
            const r = 20 + Math.random() * 15;
            const a = Math.random() * Math.PI * 2;
            group.position.set(Math.cos(a) * r, 0.5, Math.sin(a) * r);

            // Avoid placing inside house area (center)

            // Scale
            const s = 0.8 + Math.random();
            group.scale.set(s, s, s);

            this.scene.add(group);
        }
    }

    buildHouse() {
        const houseGroup = new THREE.Group();

        // Textures (Procedural-ish colors)
        const wallMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.wall, roughness: 0.5 });
        const roofMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.roof, roughness: 0.6 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            roughness: 0.1,
            metalness: 0.6,
            opacity: 0.8,
            transparent: true
        });

        // 1. Structure (Main Box)
        const bodyGeo = new THREE.BoxGeometry(16, 10, 12);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 5.5; // Sit on ground (0.5)
        body.castShadow = true;
        body.receiveShadow = true;
        houseGroup.add(body);

        // 2. Roof (Gabled)
        const roofGeo = new THREE.ConeGeometry(14, 6, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 13.5;
        roof.rotation.y = Math.PI / 4; // Align 
        roof.scale.set(1.4, 1, 1.2); // Overhang
        roof.castShadow = true;
        houseGroup.add(roof);

        // 3. Entrance Steps
        const stepsGeo = new THREE.BoxGeometry(8, 0.5, 4);
        const steps = new THREE.Mesh(stepsGeo, new THREE.MeshStandardMaterial({ color: 0x808080 }));
        steps.position.set(0, 0.75, 7);
        steps.castShadow = true;
        steps.receiveShadow = true;
        houseGroup.add(steps);

        // 4. Door Frame
        const frameGeo = new THREE.BoxGeometry(7, 7, 1);
        const frame = new THREE.Mesh(frameGeo, woodMat);
        frame.position.set(0, 4, 6.1);
        houseGroup.add(frame);

        // 5. The Shutter (Door)
        const shutterGeo = new THREE.BoxGeometry(5.5, 6, 0.2);
        const shutterMat = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.shutter,
            roughness: 0.5,
            metalness: 0.5
        });
        this.shutter = new THREE.Mesh(shutterGeo, shutterMat);
        this.shutter.position.set(0, 4, 6.2);
        this.shutter.name = "shutter";
        houseGroup.add(this.shutter);

        // 6. Windows (Left/Right)
        const winGeo = new THREE.BoxGeometry(3, 3, 0.2);

        const winL = new THREE.Mesh(winGeo, glassMat);
        winL.position.set(-5, 6, 6.1);
        houseGroup.add(winL);

        const winR = new THREE.Mesh(winGeo, glassMat);
        winR.position.set(5, 6, 6.1);
        houseGroup.add(winR);

        // Window frames
        const frameWinGeo = new THREE.BoxGeometry(3.4, 3.4, 0.1);
        const frameWinMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        const fL = new THREE.Mesh(frameWinGeo, frameWinMat);
        fL.position.set(-5, 6, 6.05);
        houseGroup.add(fL);

        const fR = new THREE.Mesh(frameWinGeo, frameWinMat);
        fR.position.set(5, 6, 6.05);
        houseGroup.add(fR);


        // 7. Sign (Neon)
        const loader = new FontLoader();
        loader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            const textGeo = new TextGeometry('PROJIFYRA', {
                font: font,
                size: 1.0,
                height: 0.1,
                curveSegments: 6
            });
            textGeo.center();
            const textMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00, // Goldish Sign
                emissive: 0xffaa00,
                emissiveIntensity: 0.5
            });
            const textMesh = new THREE.Mesh(textGeo, textMat);
            textMesh.position.set(0, 8.5, 6.3);
            houseGroup.add(textMesh);

            // "Enter" Hint
            const hintGeo = new TextGeometry('CLICK DOOR', {
                font: font, size: 0.4, height: 0.05
            });
            hintGeo.center();
            const hintMesh = new THREE.Mesh(hintGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            hintMesh.position.set(0, 1.5, 9);
            hintMesh.rotation.x = -Math.PI / 4;
            houseGroup.add(hintMesh);
        });

        this.scene.add(houseGroup);
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        if (this.isTransitioning) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Intersect shutter or windows
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const hit = intersects.find(i => i.object.name === 'shutter');
        if (hit) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    onClick(event) {
        if (this.isTransitioning) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Allow clicking the door or nearby
        for (let hit of intersects) {
            if (hit.object.name === 'shutter' || hit.distance < 30) {
                // Simple hit test check for general house vicinity if precise click fails
                if (hit.object.name === 'shutter' || hit.point.y < 8 && Math.abs(hit.point.x) < 5 && Math.abs(hit.point.z) < 10) {
                    this.enterSite();
                    break;
                }
            }
        }
    }

    enterSite() {
        this.isTransitioning = true;
        const startTime = Date.now();
        const duration = 1500;

        const animateTransition = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            if (this.shutter) {
                // Open shutter
                this.shutter.position.y = 4 + (ease * 4);
                this.shutter.scale.y = 1 - (ease * 0.9);
            }

            // Move Camera
            this.camera.position.lerp(new THREE.Vector3(0, 5, 0), 0.05);
            this.camera.lookAt(0, 5, -20);
            // Simulating increasing light brightness on entry?
            this.renderer.toneMappingExposure = 0.8 + ease * 2;

            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                this.finishIntro();
            }
        };
        animateTransition();
    }

    finishIntro() {
        this.container.style.transition = 'opacity 1s ease';
        this.container.style.opacity = '0';
        setTimeout(() => {
            this.container.style.display = 'none';
            this.renderer.dispose();
            // Optional: clean up scene
        }, 1000);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = this.clock.getElapsedTime();

        // Animate Water
        if (this.water) {
            const pos = this.water.geometry.attributes.position;
            const orig = this.water.geometry.userData.originalPos;
            for (let i = 0; i < pos.count; i++) {
                const ix = i * 3;
                const z = orig[ix + 1]; // Z in local
                // Gentle waves
                const wave = Math.sin(orig[ix] * 0.1 + time * 0.5) * 0.3 + Math.cos(z * 0.1 + time * 0.3) * 0.3;
                pos.setZ(i, wave);
            }
            pos.needsUpdate = true;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new IntroScene();
