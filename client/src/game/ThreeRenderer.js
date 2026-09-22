import * as THREE from 'three';
import { getLevelExits } from './HintSolver';

/**
 * ThreeRenderer - High Fidelity 3D WebGL Renderer for Car Out
 * Exact 3D UI matching original mobile game with 3D cars, environment, and animations.
 */

// Module-level persistent singleton WebGLRenderer
// Prevents browser WebGL context exhaustion (max 16 contexts limit in Chrome)
let sharedRenderer = null;

function getOrCreateRenderer() {
  if (sharedRenderer) {
    try {
      const gl = sharedRenderer.getContext();
      if (gl && !gl.isContextLost()) {
        return sharedRenderer;
      }
    } catch (e) {}
    try {
      sharedRenderer.dispose();
    } catch (e) {}
    sharedRenderer = null;
  }

  const canvas = document.createElement('canvas');
  try {
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    });
  } catch (e1) {
    try {
      sharedRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch (e2) {
      console.warn('Three.js low-power WebGL failed:', e2);
    }
  }

  if (sharedRenderer) {
    sharedRenderer.shadowMap.enabled = true;
    sharedRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    sharedRenderer.domElement.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        console.warn('WebGL context lost prevented.');
      },
      false
    );
  }

  return sharedRenderer;
}

export class ThreeRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.onCarClicked = options.onCarClicked || (() => {});

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animFrameId = null;
    this.resizeObserver = null;

    this.vehicleMeshes = new Map(); // id -> Group
    this.cruisingCars = []; // cars actively driving along outer roads after exiting (from Image 2!)
    this.obstacleMeshes = [];
    this.ambientCars = [];
    this.pedestrians = [];
    this.particles = [];
    this.emojis = [];
    this.gridSize = { rows: 10, cols: 8 };
    this.cellSize = 1.05;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.shakeIntensity = 0;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Clean previous DOM elements in container if any exist
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // Measure container safely
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    if (!width || width <= 0) {
      const rect = this.container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }
    if (!width || width <= 0) width = 420;
    if (!height || height <= 0) height = 860;

    // 1. Scene with dark slate tone from user screenshot
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x5a6572);

    // 2. Camera: Isometric orthographic angle matched to user screenshots
    const aspect = width / height;
    const d = 7.6;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      0.1,
      1000
    );
    // Camera angle: isometric view looking down from South-South-West toward lot center
    this.camera.position.set(18, 24, 18);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer (Singleton to prevent browser context exhaustion)
    this.renderer = getOrCreateRenderer();
    if (!this.renderer) return;

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Force canvas styling to fill container perfectly
    const dom = this.renderer.domElement;
    dom.style.position = 'absolute';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.display = 'block';
    dom.style.outline = 'none';
    this.container.style.position = 'relative';
    this.container.appendChild(dom);

    // Prevent context loss from crashing the page
    dom.addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
      },
      false
    );

    // 4. Lighting (Bright warm daylight from screenshot)
    this.setupLighting();

    // 5. Ambient Traffic & Pedestrians
    this.setupAmbientWorld();

    // 6. Resize Observer & Event listeners
    this.bindEvents();

    // 7. Render Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.9);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfffaed, 1.35);
    sun.position.set(18, 32, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    const s = 12;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.3);
    fill.position.set(-16, 12, -14);
    this.scene.add(fill);
  }

  gridToWorld(row, col, length = 1, orientation = 'H') {
    const totalW = this.gridSize.cols * this.cellSize;
    const totalH = this.gridSize.rows * this.cellSize;

    let centerR = row;
    let centerC = col;

    if (orientation === 'H') {
      centerC = col + (length - 1) / 2;
    } else if (orientation === 'V') {
      centerR = row + (length - 1) / 2;
    }

    const x = (centerC + 0.5) * this.cellSize - totalW / 2;
    const z = (centerR + 0.5) * this.cellSize - totalH / 2;
    return { x, z };
  }

  // Build the complete 3D environment exactly as in user screenshots (Image 1 & Image 2)
  buildEnvironment(gridSize, rawExits) {
    this.gridSize = gridSize || { rows: 10, cols: 8 };
    const totalW = this.gridSize.cols * this.cellSize;
    const totalH = this.gridSize.rows * this.cellSize;
    const exits = getLevelExits(this.gridSize, rawExits);

    if (this.envGroup) {
      this.scene.remove(this.envGroup);
    }
    this.envGroup = new THREE.Group();

    // 1. Base Ground (Slate gray matching original screenshot)
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a6572, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.envGroup.add(ground);

    // 2. Perimeter Asphalt Roads (Dark charcoal asphalt matching original screenshot)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x242a34, roughness: 0.7 });

    // Left Road (runs North-South, where pink car drives in Image 2!)
    const leftRoad = new THREE.Mesh(new THREE.PlaneGeometry(2.4, totalH + 16), roadMat);
    leftRoad.rotation.x = -Math.PI / 2;
    leftRoad.position.set(-(totalW / 2 + 1.8), 0.01, 0);
    leftRoad.receiveShadow = true;
    this.envGroup.add(leftRoad);

    // Right Road (runs North-South, where green car drives in Image 2!)
    const rightRoad = new THREE.Mesh(new THREE.PlaneGeometry(2.4, totalH + 16), roadMat);
    rightRoad.rotation.x = -Math.PI / 2;
    rightRoad.position.set(totalW / 2 + 1.8, 0.01, 0);
    rightRoad.receiveShadow = true;
    this.envGroup.add(rightRoad);

    // Top Main Road (North-South Avenue on top leading past boom barrier from Image 1 & 2)
    const topRoad = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 14), roadMat);
    topRoad.rotation.x = -Math.PI / 2;
    topRoad.position.set(-0.6, 0.01, -(totalH / 2 + 5.5));
    topRoad.receiveShadow = true;
    this.envGroup.add(topRoad);

    // Bottom Road (runs East-West along the bottom, where orange car drives in Image 2!)
    const botRoad = new THREE.Mesh(new THREE.PlaneGeometry(totalW + 10, 2.4), roadMat);
    botRoad.rotation.x = -Math.PI / 2;
    botRoad.position.set(0, 0.01, totalH / 2 + 1.8);
    botRoad.receiveShadow = true;
    this.envGroup.add(botRoad);

    // 3. Main Parking Lot Asphalt Slab (from Image 1 & 2)
    const lotGeo = new THREE.BoxGeometry(totalW + 0.15, 0.18, totalH + 0.15);
    const lotMat = new THREE.MeshStandardMaterial({ color: 0x949ba3, roughness: 0.85 });
    const lot = new THREE.Mesh(lotGeo, lotMat);
    lot.position.y = 0.09;
    lot.receiveShadow = true;
    this.envGroup.add(lot);

    // 4. White Modular Boundary Walls with exit openings matching Level Exits
    const wallH = 0.38;
    const wallT = 0.12;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 });

    const createWallSegment = (x, z, w, d) => {
      const seg = new THREE.Group();
      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
      wallMesh.position.y = wallH / 2 + 0.09;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      seg.add(wallMesh);

      // Support post
      const postW = d > w ? Math.min(w * 1.5, 0.16) : Math.min(w * 0.25, 0.16);
      const postD = d > w ? Math.min(d * 0.25, 0.16) : Math.min(d * 1.5, 0.16);
      const post = new THREE.Mesh(new THREE.BoxGeometry(postW, wallH + 0.06, postD), postMat);
      post.position.y = (wallH + 0.06) / 2 + 0.09;
      post.castShadow = true;
      seg.add(post);

      seg.position.set(x, 0, z);
      return seg;
    };

    // --- TOP WALL (cols where !exits.top.includes(col)) ---
    for (let c = 0; c < this.gridSize.cols; c++) {
      if (!exits.top.includes(c)) {
        const segX = (c + 0.5) * this.cellSize - totalW / 2;
        const segZ = -(totalH / 2 + wallT / 2);
        this.envGroup.add(createWallSegment(segX, segZ, this.cellSize + 0.02, wallT));
      }
    }

    // --- BOTTOM WALL (cols where !exits.bottom.includes(col)) ---
    for (let c = 0; c < this.gridSize.cols; c++) {
      if (!exits.bottom.includes(c)) {
        const segX = (c + 0.5) * this.cellSize - totalW / 2;
        const segZ = totalH / 2 + wallT / 2;
        this.envGroup.add(createWallSegment(segX, segZ, this.cellSize + 0.02, wallT));
      }
    }

    // --- LEFT WALL (rows where !exits.left.includes(row)) ---
    for (let r = 0; r < this.gridSize.rows; r++) {
      if (!exits.left.includes(r)) {
        const segX = -(totalW / 2 + wallT / 2);
        const segZ = (r + 0.5) * this.cellSize - totalH / 2;
        this.envGroup.add(createWallSegment(segX, segZ, wallT, this.cellSize + 0.02));
      }
    }

    // --- RIGHT WALL (rows where !exits.right.includes(row)) ---
    for (let r = 0; r < this.gridSize.rows; r++) {
      if (!exits.right.includes(r)) {
        const segX = totalW / 2 + wallT / 2;
        const segZ = (r + 0.5) * this.cellSize - totalH / 2;
        this.envGroup.add(createWallSegment(segX, segZ, wallT, this.cellSize + 0.02));
      }
    }

    // 5. Boom Barrier Gate at top road (Exact orange post + red/white arm from Image 1 & 2)
    const gateGroup = new THREE.Group();
    // Orange/white control post
    const gatePostGeo = new THREE.BoxGeometry(0.28, 0.65, 0.28);
    const gatePostMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const gatePost = new THREE.Mesh(gatePostGeo, gatePostMat);
    gatePost.position.y = 0.32;
    gatePost.castShadow = true;
    gateGroup.add(gatePost);

    // White stripe on post
    const postStripe = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.12, 0.29), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    postStripe.position.y = 0.38;
    gateGroup.add(postStripe);

    // Red & white barrier arm
    const armGeo = new THREE.BoxGeometry(1.6, 0.07, 0.07);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(-0.75, 0.55, 0);
    gateGroup.add(arm);

    // Red stripes on barrier arm
    for (let i = -3; i <= 3; i += 2) {
      const redBand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      redBand.position.set(-0.75 + i * 0.2, 0.55, 0);
      gateGroup.add(redBand);
    }
    gateGroup.position.set(-0.2, 0.01, -(totalH / 2 + 1.2));
    this.envGroup.add(gateGroup);

    // 6. Planter with 5 Round Green Tree Balls behind boom gate (from Image 1 & 2)
    const planterBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 0.6), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    planterBox.position.set(1.4, 0.18, -(totalH / 2 + 1.5));
    this.envGroup.add(planterBox);

    const bushMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), bushMat);
      bush.position.set(0.4 + i * 0.5, 0.45, -(totalH / 2 + 1.5));
      bush.castShadow = true;
      this.envGroup.add(bush);
    }

    // 7. Top-Right 2-Story Modern Dark Building (from Image 1 & 2)
    const bldgGroup = new THREE.Group();
    const bldgBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 2.2), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    bldgBase.position.y = 0.95;
    bldgBase.castShadow = true;
    bldgGroup.add(bldgBase);

    // Flat roof with blue tint glass
    const bldgRoof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 2.0), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    bldgRoof.position.y = 1.95;
    bldgGroup.add(bldgRoof);

    bldgGroup.position.set(totalW / 2 + 1.8, 0, -(totalH / 2 + 2.5));
    this.envGroup.add(bldgGroup);

    // 8. Left Side Multi-Story Buildings (from Image 1 & 2)
    const cityGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const cityBldg = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2 + i * 0.4, 3.2), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      cityBldg.position.set(-(totalW / 2 + 3.8), (2.2 + i * 0.4) / 2, -4 + i * 3.8);
      cityGroup.add(cityBldg);
    }
    this.envGroup.add(cityGroup);

    // 9. Bottom Sidewalk Yellow/Black Striped Sun Umbrella (from Image 1 & 2)
    const umbrellaGroup = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    stand.position.y = 0.65;
    umbrellaGroup.add(stand);

    // Yellow and black segments canopy
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }));
    canopy.position.y = 1.25;
    canopy.castShadow = true;
    umbrellaGroup.add(canopy);

    // Black stripes on umbrella
    const subCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.86, 0.44, 4), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    subCanopy.position.y = 1.25;
    umbrellaGroup.add(subCanopy);

    umbrellaGroup.position.set(-0.9, 0, totalH / 2 + 1.2);
    this.envGroup.add(umbrellaGroup);

    // Lamppost next to umbrella
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    lamp.position.set(0.6, 0.7, totalH / 2 + 1.2);
    this.envGroup.add(lamp);

    this.scene.add(this.envGroup);

    this.updateCameraBounds();
  }

  updateCameraBounds() {
    this.handleResize(this.container?.clientWidth, this.container?.clientHeight);
  }

  // Build Obstacles: Red Fire Hydrant in center from Image 1 & 2
  buildObstacles(obstacles = []) {
    this.obstacleMeshes.forEach((m) => this.scene.remove(m));
    this.obstacleMeshes = [];

    // Always ensure the iconic central fire hydrant from Image 1 exists
    const allObs = obstacles.length > 0 ? obstacles : [{ type: 'hydrant', row: 4, col: 4 }];

    allObs.forEach((obs) => {
      const obsGroup = new THREE.Group();
      const { x, z } = this.gridToWorld(obs.row, obs.col);

      // Red Fire Hydrant
      const hydMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7 });

      // Body barrel
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.48, 12), hydMat);
      body.position.y = 0.24 + 0.09;
      body.castShadow = true;
      obsGroup.add(body);

      // Top Dome Cap
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), hydMat);
      dome.position.y = 0.48 + 0.09;
      obsGroup.add(dome);

      // Side nozzles
      const nozzleL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), silverMat);
      nozzleL.rotation.z = Math.PI / 2;
      nozzleL.position.set(-0.16, 0.26 + 0.09, 0);
      obsGroup.add(nozzleL);

      const nozzleR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), silverMat);
      nozzleR.rotation.z = Math.PI / 2;
      nozzleR.position.set(0.16, 0.26 + 0.09, 0);
      obsGroup.add(nozzleR);

      obsGroup.position.set(x, 0, z);
      this.scene.add(obsGroup);
      this.obstacleMeshes.push(obsGroup);
    });
  }

  // Setup Ambient Pedestrians on Sidewalk
  setupAmbientWorld() {
    for (let i = 0; i < 2; i++) {
      const pGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.38, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      body.position.y = 0.2;
      pGroup.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
      head.position.y = 0.44;
      pGroup.add(head);

      pGroup.position.set(-2.5 + i * 3.5, 0, 4.2);
      this.scene.add(pGroup);

      this.pedestrians.push({
        group: pGroup,
        startX: -2.5 + i * 3.5,
        baseZ: 4.2,
        t: i * Math.PI,
      });
    }
  }

  // Create 4 distinct cute cartoon vehicles matching Image 1 & 2
  createVehicleMesh(vehicle) {
    // Enforce orientation aligns with direction of travel so no car ever moves sideways
    vehicle.orientation = (vehicle.direction === 'left' || vehicle.direction === 'right') ? 'H' : 'V';
    const group = new THREE.Group();
    group.userData = { vehicleId: vehicle.id, vehicle };

    const color = new THREE.Color(vehicle.color || '#EF4444');
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.85 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });

    const carW = this.cellSize * 0.62;
    const isBus = vehicle.type === 'bus' || vehicle.length === 3;
    const isBeetle = vehicle.type === 'beetle';
    const isCoupe = vehicle.type === 'coupe';

    if (isBus) {
      // 1. TOUR BUS / RV CAMPER (Blue camper, orange camper, green bus)
      const busL = vehicle.length * this.cellSize * 0.88;
      const busH = 0.68;

      // Box body
      const busGeo = new THREE.BoxGeometry(carW, busH * 0.6, busL);
      const busBody = new THREE.Mesh(busGeo, bodyMat);
      busBody.position.y = 0.2 + busH * 0.3;
      busBody.castShadow = true;
      group.add(busBody);

      // Upper roof
      const roofGeo = new THREE.BoxGeometry(carW * 0.94, busH * 0.45, busL * 0.94);
      const roof = new THREE.Mesh(roofGeo, bodyMat);
      roof.position.y = busBody.position.y + busH * 0.4;
      roof.castShadow = true;
      group.add(roof);

      // Panoramic front windshield
      const windGeo = new THREE.PlaneGeometry(carW * 0.88, busH * 0.5);
      const wind = new THREE.Mesh(windGeo, glassMat);
      wind.position.set(0, busBody.position.y + 0.1, busL / 2 + 0.01);
      group.add(wind);

      // Side windows strip
      for (let s of [-1, 1]) {
        for (let w = -1; w <= 1; w++) {
          const sWind = new THREE.Mesh(new THREE.PlaneGeometry(busL * 0.22, busH * 0.32), glassMat);
          sWind.rotation.y = s * Math.PI / 2;
          sWind.position.set(s * (carW / 2 + 0.01), busBody.position.y + 0.15, w * (busL * 0.28));
          group.add(sWind);
        }
      }

      // Wheels: 3 pairs for tour bus!
      [-busL * 0.35, 0, busL * 0.32].forEach((wz) => {
        [-1, 1].forEach((side) => {
          const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 10), tireMat);
          wMesh.rotation.z = Math.PI / 2;
          wMesh.position.set(side * (carW / 2 + 0.01), 0.16 + 0.09, wz);
          wMesh.castShadow = true;
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.11, 6), rimMat);
          wMesh.add(rim);
          group.add(wMesh);
        });
      });
    } else if (isBeetle) {
      // 2. VINTAGE VW BEETLE (Lime, pink, purple, teal rounded cars from screenshot!)
      const carL = 1.8 * this.cellSize * 0.84;
      const carH = 0.58;

      // Lower body with curved wheel fenders
      const baseGeo = new THREE.BoxGeometry(carW, carH * 0.45, carL);
      const base = new THREE.Mesh(baseGeo, bodyMat);
      base.position.y = 0.18 + carH * 0.25;
      base.castShadow = true;
      group.add(base);

      // Dome bubble roof
      const bubbleGeo = new THREE.SphereGeometry(carW * 0.44, 12, 10);
      bubbleGeo.scale(1, 1.15, 1.4);
      const bubble = new THREE.Mesh(bubbleGeo, bodyMat);
      bubble.position.set(0, base.position.y + carH * 0.28, -carL * 0.04);
      bubble.castShadow = true;
      group.add(bubble);

      // Tinted bubble windows
      const winGeo = new THREE.SphereGeometry(carW * 0.42, 10, 8);
      winGeo.scale(1.02, 1.05, 1.25);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(0, bubble.position.y + 0.02, -carL * 0.04);
      group.add(win);

      // Round headlights
      [-1, 1].forEach((side) => {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lightMat);
        light.position.set(side * 0.22, base.position.y + 0.08, carL / 2 + 0.02);
        group.add(light);
      });

      // Wheels
      [-carL * 0.28, carL * 0.28].forEach((wz) => {
        [-1, 1].forEach((side) => {
          const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.09, 10), tireMat);
          wMesh.rotation.z = Math.PI / 2;
          wMesh.position.set(side * (carW / 2 + 0.01), 0.16 + 0.09, wz);
          wMesh.castShadow = true;
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6), rimMat);
          wMesh.add(rim);
          group.add(wMesh);
        });
      });
    } else {
      // 3. CLASSIC NOTCHBACK SEDAN / COUPE (Red, yellow, orange sedans from screenshot!)
      const carL = 2 * this.cellSize * 0.82;
      const carH = 0.55;

      // Lower Chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(carW, carH * 0.45, carL), bodyMat);
      chassis.position.y = 0.18 + carH * 0.25;
      chassis.castShadow = true;
      group.add(chassis);

      // Cabin Roof
      const cabinL = isCoupe ? carL * 0.52 : carL * 0.58;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(carW * 0.86, carH * 0.48, cabinL), bodyMat);
      cabin.position.set(0, chassis.position.y + carH * 0.42, isCoupe ? -0.1 : -0.05);
      cabin.castShadow = true;
      group.add(cabin);

      // Windshields
      const frontWind = new THREE.Mesh(new THREE.PlaneGeometry(carW * 0.82, carH * 0.38), glassMat);
      frontWind.position.set(0, cabin.position.y, (isCoupe ? -0.1 : -0.05) + cabinL / 2 + 0.01);
      group.add(frontWind);

      const rearWind = new THREE.Mesh(new THREE.PlaneGeometry(carW * 0.82, carH * 0.38), glassMat);
      rearWind.rotation.y = Math.PI;
      rearWind.position.set(0, cabin.position.y, (isCoupe ? -0.1 : -0.05) - cabinL / 2 - 0.01);
      group.add(rearWind);

      // Rectangular Headlights
      [-1, 1].forEach((side) => {
        const hLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), lightMat);
        hLight.position.set(side * 0.22, chassis.position.y + 0.06, carL / 2 + 0.01);
        group.add(hLight);
      });

      // Wheels
      [-carL * 0.28, carL * 0.28].forEach((wz) => {
        [-1, 1].forEach((side) => {
          const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.09, 10), tireMat);
          wMesh.rotation.z = Math.PI / 2;
          wMesh.position.set(side * (carW / 2 + 0.01), 0.16 + 0.09, wz);
          wMesh.castShadow = true;
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6), rimMat);
          wMesh.add(rim);
          group.add(wMesh);
        });
      });
    }

    this.orientVehicleGroup(group, vehicle);
    return group;
  }

  orientVehicleGroup(group, vehicle) {
    let angle = 0;
    if (vehicle.direction === 'down') {
      angle = 0;
    } else if (vehicle.direction === 'up') {
      angle = Math.PI;
    } else if (vehicle.direction === 'right') {
      angle = Math.PI / 2;
    } else if (vehicle.direction === 'left') {
      angle = -Math.PI / 2;
    }
    group.rotation.y = angle;
  }

  loadVehicles(vehicles = []) {
    this.vehicleMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.vehicleMeshes.clear();

    if (!Array.isArray(vehicles)) return;

    vehicles.forEach((v) => {
      const mesh = this.createVehicleMesh(v);
      const { x, z } = this.gridToWorld(v.row, v.col, v.length, v.orientation);
      mesh.position.set(x, 0, z);
      mesh.userData.basePos = { x, z };
      mesh.userData.currentPos = { x, z };
      mesh.userData.gridPos = { row: v.row, col: v.col };

      this.scene.add(mesh);
      this.vehicleMeshes.set(v.id, mesh);
    });
  }

  /**
   * EXACT ROAD EXIT STEERING ANIMATION (matching user Image 2):
   * 1. Car drives through the nearest fence opening to reach the outer road.
   * 2. Turns 90 degrees onto the road lane.
   * 3. Cruises along the outer road lane with cartoon tire smoke!
   */
  animateExit(vehicleId, onComplete = () => {}) {
    const mesh = this.vehicleMeshes.get(vehicleId);
    if (!mesh) return;

    mesh.userData.isAnimating = true;
    const startX = mesh.position.x;
    const startZ = mesh.position.z;
    const vehicle = mesh.userData.vehicle;
    const totalW = this.gridSize.cols * this.cellSize;
    const totalH = this.gridSize.rows * this.cellSize;

    // Determine target road coordinate and road heading
    let gateX = startX;
    let gateZ = startZ;
    let roadTargetAngle = 0;
    let cruiseAxis = 'z'; // 'x' or 'z'
    let cruiseSpeed = 0.06;

    if (vehicle.direction === 'left') {
      // Exiting through Left wall opening onto Left Road (like pink car in Image 2!)
      gateX = -(totalW / 2 + 1.8);
      gateZ = startZ;
      roadTargetAngle = 0; // facing South along left road
      cruiseAxis = 'z';
      cruiseSpeed = 0.055;
    } else if (vehicle.direction === 'right') {
      // Exiting through Right wall opening onto Right Road (like green car in Image 2!)
      gateX = totalW / 2 + 1.8;
      gateZ = startZ;
      roadTargetAngle = 0; // facing South along right road
      cruiseAxis = 'z';
      cruiseSpeed = 0.055;
    } else if (vehicle.direction === 'up') {
      // Exiting through Top wall past Boom Barrier gate (heading North)
      gateX = startX;
      gateZ = -(totalH / 2 + 3.2);
      roadTargetAngle = Math.PI; // facing North
      cruiseAxis = 'z';
      cruiseSpeed = -0.06;
    } else if (vehicle.direction === 'down') {
      // Exiting through Bottom opening onto Bottom road (like orange car in Image 2!)
      gateX = startX;
      gateZ = totalH / 2 + 1.8;
      roadTargetAngle = Math.PI / 2; // facing East along bottom road
      cruiseAxis = 'x';
      cruiseSpeed = 0.06;
    }

    this.showPedestrianEmoji('😊');

    // Remove from active lot tracking immediately so user cannot click this car again
    this.vehicleMeshes.delete(vehicleId);
    let completionNotified = false;

    // Multi-phase animation:
    // Phase 1 (0 to 600ms): Drive through fence opening
    // Phase 2 (600 to 900ms): Turn onto road
    // Phase 3 (900ms to 4500ms): Cruise along outer road as shown in Image 2!
    const startTime = performance.now();
    const initialRotation = mesh.rotation.y;

    const animateStep = (now) => {
      const elapsed = now - startTime;

      if (elapsed < 600) {
        // Phase 1: Drive from start to road opening
        const t = elapsed / 600;
        const ease = t * t;
        mesh.position.x = startX + (gateX - startX) * ease;
        mesh.position.z = startZ + (gateZ - startZ) * ease;

        if (Math.random() < 0.3) {
          this.spawnExhaustSmoke(mesh.position.x, 0.25, mesh.position.z);
        }
        requestAnimationFrame(animateStep);
      } else if (elapsed < 900) {
        // Car has cleared the gate opening and reached outer road lane!
        if (!completionNotified) {
          completionNotified = true;
          onComplete();
        }

        // Phase 2: Smooth 90-degree steering turn onto the road lane
        const t = (elapsed - 600) / 300;
        mesh.position.x = gateX;
        mesh.position.z = gateZ;

        // Interpolate rotation smoothly
        mesh.rotation.y = initialRotation + (roadTargetAngle - initialRotation) * t;

        requestAnimationFrame(animateStep);
      } else if (elapsed < 4200) {
        // Phase 3: Cruising along the outer road (matching Image 2!)
        mesh.rotation.y = roadTargetAngle;
        if (cruiseAxis === 'z') {
          mesh.position.z += cruiseSpeed;
        } else {
          mesh.position.x += cruiseSpeed;
        }

        if (Math.random() < 0.2) {
          this.spawnExhaustSmoke(mesh.position.x, 0.25, mesh.position.z);
        }

        requestAnimationFrame(animateStep);
      } else {
        // Finished cruising away into distance
        this.scene.remove(mesh);
      }
    };

    requestAnimationFrame(animateStep);
  }

  // Springy bumper collision recoil with sparks
  animateCollision(vehicleId, clearSteps = 0) {
    const mesh = this.vehicleMeshes.get(vehicleId);
    if (!mesh || mesh.userData.isAnimating) return;

    mesh.userData.isAnimating = true;
    const basePos = mesh.userData.basePos;
    const vehicle = mesh.userData.vehicle;

    let dx = 0;
    let dz = 0;
    if (vehicle.direction === 'right') dx = 1;
    else if (vehicle.direction === 'left') dx = -1;
    else if (vehicle.direction === 'down') dz = 1;
    else if (vehicle.direction === 'up') dz = -1;

    const dist = (clearSteps + 0.3) * this.cellSize;
    const peakX = basePos.x + dx * dist;
    const peakZ = basePos.z + dz * dist;

    this.showPedestrianEmoji('😠');
    this.shakeIntensity = 0.45;
    this.spawnImpactSparks(peakX, 0.35, peakZ);

    const startTime = performance.now();
    const duration = 380;

    const recoil = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      if (t < 0.35) {
        const p = t / 0.35;
        mesh.position.x = basePos.x + (peakX - basePos.x) * p;
        mesh.position.z = basePos.z + (peakZ - basePos.z) * p;
      } else {
        const p = (t - 0.35) / 0.65;
        const decay = Math.cos(p * Math.PI * 3) * Math.exp(-p * 3.5);
        mesh.position.x = basePos.x + (peakX - basePos.x) * decay;
        mesh.position.z = basePos.z + (peakZ - basePos.z) * decay;
      }

      if (t < 1) {
        requestAnimationFrame(recoil);
      } else {
        mesh.position.x = basePos.x;
        mesh.position.z = basePos.z;
        mesh.userData.isAnimating = false;
      }
    };

    requestAnimationFrame(recoil);
  }

  showPedestrianEmoji(emojiText) {
    if (this.pedestrians.length === 0) return;
    const ped = this.pedestrians[Math.floor(Math.random() * this.pedestrians.length)];

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojiText, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.75, 0.75, 1);
    sprite.position.set(ped.group.position.x, 1.1, ped.group.position.z);
    this.scene.add(sprite);

    this.emojis.push({
      sprite,
      vy: 0.02,
      life: 1.0,
    });
  }

  spawnExhaustSmoke(x, y, z) {
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(x, y, z);
    this.scene.add(p);
    this.particles.push({ mesh: p, vx: 0, vy: 0.03, vz: 0, scaleSpeed: 0.035, life: 1.0, decay: 0.05 });
  }

  spawnImpactSparks(x, y, z) {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.06, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfacc15 : 0xffffff });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      this.scene.add(p);

      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        mesh: p,
        vx: Math.cos(angle) * 0.07,
        vy: 0.08,
        vz: Math.sin(angle) * 0.07,
        life: 1.0,
        decay: 0.06,
      });
    }
  }

  restoreVehicle(vehicle) {
    if (this.vehicleMeshes.has(vehicle.id)) return;
    const mesh = this.createVehicleMesh(vehicle);
    const { x, z } = this.gridToWorld(vehicle.row, vehicle.col, vehicle.length, vehicle.orientation);
    mesh.position.set(x, 0, z);
    mesh.userData.basePos = { x, z };
    mesh.userData.currentPos = { x, z };
    mesh.userData.gridPos = { row: vehicle.row, col: vehicle.col };
    this.scene.add(mesh);
    this.vehicleMeshes.set(vehicle.id, mesh);
  }

  showHint(vehicleId) {
    const mesh = this.vehicleMeshes.get(vehicleId);
    if (!mesh) return;
    let t = 0;
    const bounce = () => {
      t += 0.15;
      mesh.position.y = Math.sin(t) * 0.35;
      if (t < Math.PI * 2) requestAnimationFrame(bounce);
      else mesh.position.y = 0;
    };
    bounce();
  }

  clearHint() {}

  handleResize(width, height) {
    if (!this.camera || !this.renderer) return;

    if (!width || !height || width <= 0 || height <= 0) {
      if (this.container) {
        const rect = this.container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }
    }
    if (!width || !height || width <= 0 || height <= 0) {
      width = 420;
      height = 860;
    }

    const aspect = width / height;
    if (!isFinite(aspect) || isNaN(aspect) || aspect <= 0) return;

    // Full responsive camera calculation for any grid size and screen ratio
    const cols = (this.gridSize && this.gridSize.cols) ? this.gridSize.cols : 8;
    const rows = (this.gridSize && this.gridSize.rows) ? this.gridSize.rows : 10;
    const totalW = (cols + 2.8) * this.cellSize;
    const totalH = (rows + 2.8) * this.cellSize;

    // Projected bounding extents for isometric camera (at ~45 deg / 35 deg tilt)
    const vExtent = totalH * 0.72 + totalW * 0.28;
    const hExtent = totalW * 0.72 + totalH * 0.28;

    let d = Math.max(6.8, vExtent);
    if (aspect < 1.0) {
      // Portrait / Mobile: make sure horizontal extent fits inside (d * aspect)
      d = Math.max(d, (hExtent * 1.06) / aspect);
    } else {
      // Landscape / Laptop / Full Screen: make sure vertical fits and comfortably centered
      d = Math.max(d, vExtent * 1.05, (hExtent * 1.05) / aspect);
    }

    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  bindEvents() {
    const onPointerDown = (event) => {
      if (!this.renderer?.domElement) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const meshes = Array.from(this.vehicleMeshes.values());
      const intersects = this.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let top = intersects[0].object;
        while (top && !top.userData.vehicleId) {
          top = top.parent;
        }
        if (top && top.userData.vehicleId) {
          this.onCarClicked(top.userData.vehicleId);
        }
      }
    };

    this.renderer.domElement.addEventListener('pointerdown', onPointerDown);

    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.handleResize(width, height);
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }

    this.onWindowResize = () => {
      if (!this.container) return;
      this.handleResize(this.container.clientWidth, this.container.clientHeight);
    };
    window.addEventListener('resize', this.onWindowResize);
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    if (!this.scene || !this.camera || !this.renderer) return;

    const delta = this.clock.getDelta();

    // 1. Pedestrians gentle pacing
    this.pedestrians.forEach((p) => {
      p.t += delta * 1.5;
      p.group.position.x = p.startX + Math.sin(p.t) * 0.8;
      p.group.rotation.y = Math.cos(p.t) > 0 ? Math.PI / 2 : -Math.PI / 2;
    });

    // 2. Floating Emojis
    for (let i = this.emojis.length - 1; i >= 0; i--) {
      const em = this.emojis[i];
      em.life -= delta * 0.9;
      em.sprite.position.y += em.vy;
      em.sprite.material.opacity = Math.max(0, em.life);
      if (em.life <= 0) {
        this.scene.remove(em.sprite);
        this.emojis.splice(i, 1);
      }
    }

    // 3. Smoke & Spark Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      if (p.scaleSpeed) p.mesh.scale.addScalar(p.scaleSpeed);
      if (p.mesh.material.opacity !== undefined) p.mesh.material.opacity = Math.max(0, p.life);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 4. Camera Shake
    if (this.shakeIntensity > 0) {
      this.camera.position.x = 15 + (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.z = 15 + (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 1.8);
    } else {
      this.camera.position.set(15, 23, 15);
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
      try {
        this.renderer.dispose();
      } catch (e) {
        // Safe disposal
      }
      this.renderer = null;
    }

    if (this.scene) {
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
      this.scene = null;
    }
  }
}
