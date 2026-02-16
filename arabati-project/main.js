import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* =========================
   ERROR OVERLAY
========================= */
window.addEventListener("error", (e) => {
  document.body.innerHTML =
    "<pre style='white-space:pre-wrap;padding:16px;font:14px/1.4 monospace;background:#111;color:#0f0;'>" +
    (e.error?.stack || e.message) +
    "</pre>";
});

/* =========================
   BASIC SETUP
========================= */
document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfc7d5, 20, 140);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(16, 10, 18);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xbfc7d5, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const maxAniso = renderer.capabilities.getMaxAnisotropy();

/* =========================
   TEXTURE HELPERS
========================= */
const textureLoader = new THREE.TextureLoader();
const texLoader = new THREE.TextureLoader();

function loadRepeatTex(url, repeatX = 1, repeatY = 1, isColor = false) {
  const t = textureLoader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = maxAniso;
  if (isColor) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function loadTex(url) {
  const t = texLoader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1);
  t.anisotropy = maxAniso;
  return t;
}

/* =========================
   WOOD (PILLARS / FENCES / DOOR FRAME)
========================= */
const woodColorBase = textureLoader.load("/textures/wood/wood_diffuse.jpg");
const woodNormalBase = textureLoader.load("/textures/wood/wood_normal.jpg");
const woodRoughBase = textureLoader.load("/textures/wood/wood_roughness.jpg");

woodColorBase.colorSpace = THREE.SRGBColorSpace;

for (const t of [woodColorBase, woodNormalBase, woodRoughBase]) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
}
woodColorBase.repeat.set(2, 2);
woodNormalBase.repeat.copy(woodColorBase.repeat);
woodRoughBase.repeat.copy(woodColorBase.repeat);

const texturedWoodMat = new THREE.MeshStandardMaterial({
  map: woodColorBase,
  normalMap: woodNormalBase,
  roughnessMap: woodRoughBase,
  roughness: 1.0,
});
texturedWoodMat.normalScale = new THREE.Vector2(1.0, 1.0);

// Creates a NEW wood material instance with its own tiling (prevents stretching)
function makeWoodMat(repeatX = 2, repeatY = 2, roughness = 1.0) {
  const map = woodColorBase.clone();
  const normalMap = woodNormalBase.clone();
  const roughMap = woodRoughBase.clone();

  map.needsUpdate = normalMap.needsUpdate = roughMap.needsUpdate = true;

  for (const t of [map, normalMap, roughMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
  }

  map.repeat.set(repeatX, repeatY);
  normalMap.repeat.copy(map.repeat);
  roughMap.repeat.copy(map.repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: roughMap,
    roughness,
  });

  mat.normalScale = new THREE.Vector2(1.0, 1.0);
  return mat;
}

/* =========================
   WOOD FLOORS (AROUND FOUNTAIN)
========================= */
const woodFloorColorBase = textureLoader.load(
  "/textures/wood/wood_floor/wood_floor_diffuse.jpg"
);
const woodFloorNormalBase = textureLoader.load(
  "/textures/wood/wood_floor/wood_floor_normal.jpg"
);
const woodFloorRoughBase = textureLoader.load(
  "/textures/wood/wood_floor/wood_floor_roughness.jpg"
);

woodFloorColorBase.colorSpace = THREE.SRGBColorSpace;

for (const t of [woodFloorColorBase, woodFloorNormalBase, woodFloorRoughBase]) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
}

function makeWoodFloorMat(repeatX = 6, repeatY = 3, roughness = 1.0) {
  const map = woodFloorColorBase.clone();
  const normalMap = woodFloorNormalBase.clone();
  const roughMap = woodFloorRoughBase.clone();

  map.needsUpdate = normalMap.needsUpdate = roughMap.needsUpdate = true;

  for (const t of [map, normalMap, roughMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
  }

  map.repeat.set(repeatX, repeatY);
  normalMap.repeat.copy(map.repeat);
  roughMap.repeat.copy(map.repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: roughMap,
    roughness,
  });

  mat.normalScale = new THREE.Vector2(1.0, 1.0);
  return mat;
}

/* =========================
   BACK FLOOR (VITE-SAFE)
========================= */
const backFloorDiffuseURL = new URL(
  "./textures/back_floor/back_floor_diffuse.jpg",
  import.meta.url
).href;
const backFloorNormalURL = new URL(
  "./textures/back_floor/back_floor_normal.jpg",
  import.meta.url
).href;
const backFloorRoughURL = new URL(
  "./textures/back_floor/back_floor_roughness.jpg",
  import.meta.url
).href;

const backFloorColorBase = loadTex(backFloorDiffuseURL);
backFloorColorBase.colorSpace = THREE.SRGBColorSpace;

const backFloorNormalBase = loadTex(backFloorNormalURL);
const backFloorRoughBase = loadTex(backFloorRoughURL);

function makeBackFloorMat(repeatX = 8, repeatY = 4, roughness = 1.0) {
  const map = backFloorColorBase.clone();
  const normalMap = backFloorNormalBase.clone();
  const roughMap = backFloorRoughBase.clone();

  map.needsUpdate = normalMap.needsUpdate = roughMap.needsUpdate = true;

  for (const t of [map, normalMap, roughMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
  }

  map.repeat.set(repeatX, repeatY);
  normalMap.repeat.copy(map.repeat);
  roughMap.repeat.copy(map.repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: roughMap,
    roughness,
  });

  mat.normalScale = new THREE.Vector2(1.0, 1.0);
  return mat;
}

/* =========================
   WALL + GROUND
========================= */
const wallColor = loadRepeatTex("/textures/wall/wall_diffuse.jpg", 3, 2, true);
const wallNormal = loadRepeatTex("/textures/wall/wall_normal.jpg", 3, 2, false);
const wallRough = loadRepeatTex("/textures/wall/wall_roughness.jpg", 3, 2, false);

const texturedWallMat = new THREE.MeshStandardMaterial({
  map: wallColor,
  normalMap: wallNormal,
  roughnessMap: wallRough,
  roughness: 1.0,
});
texturedWallMat.normalScale = new THREE.Vector2(1.0, 1.0);

const groundColor = loadRepeatTex("/textures/ground/ground_diffuse.jpg", 12, 12, true);
const groundNormal = loadRepeatTex("/textures/ground/ground_normal.jpg", 12, 12, false);
const groundRough = loadRepeatTex("/textures/ground/ground_roughness.jpg", 12, 12, false);

const groundMat = new THREE.MeshStandardMaterial({
  map: groundColor,
  normalMap: groundNormal,
  roughnessMap: groundRough,
  roughness: 1.0,
});
groundMat.normalScale = new THREE.Vector2(1.0, 1.0);

/* =========================
   ROADS (BASE TEXTURES)
========================= */
const roadColorBase = textureLoader.load("/textures/roads/stone_road_diffuse.jpg");
roadColorBase.colorSpace = THREE.SRGBColorSpace;
roadColorBase.wrapS = roadColorBase.wrapT = THREE.RepeatWrapping;
roadColorBase.anisotropy = maxAniso;

const roadNormalBase = textureLoader.load("/textures/roads/stone_road_normal.jpg");
roadNormalBase.wrapS = roadNormalBase.wrapT = THREE.RepeatWrapping;
roadNormalBase.anisotropy = maxAniso;

const roadRoughBase = textureLoader.load("/textures/roads/stone_road_roughness.jpg");
roadRoughBase.wrapS = roadRoughBase.wrapT = THREE.RepeatWrapping;
roadRoughBase.anisotropy = maxAniso;

/* =========================
   PILLAR CAPITAL (WHITE BAND)
========================= */
const capitalDiffuseURL = new URL("./textures/capital/capital_diffuse.jpg", import.meta.url).href;
const capitalNormalURL = new URL("./textures/capital/capital_normal.jpg", import.meta.url).href;
const capitalRoughURL = new URL("./textures/capital/capital_roughness.jpg", import.meta.url).href;

const capitalColorBase = loadTex(capitalDiffuseURL);
capitalColorBase.colorSpace = THREE.SRGBColorSpace;

const capitalNormalBase = loadTex(capitalNormalURL);
const capitalRoughBase = loadTex(capitalRoughURL);

function makeCapitalMat(repeatX = 2, repeatY = 2, roughness = 1.0) {
  const map = capitalColorBase.clone();
  const normalMap = capitalNormalBase.clone();
  const roughMap = capitalRoughBase.clone();

  map.needsUpdate = normalMap.needsUpdate = roughMap.needsUpdate = true;

  for (const t of [map, normalMap, roughMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
  }

  map.repeat.set(repeatX, repeatY);
  normalMap.repeat.copy(map.repeat);
  roughMap.repeat.copy(map.repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: roughMap,
    roughness,
  });

  mat.normalScale = new THREE.Vector2(1.0, 1.0);
  return mat;
}
const plasterMat = makeCapitalMat(3, 2, 1.0);

/* =========================
   ROOF TILES (VITE-SAFE)
========================= */
const roofDiffuseURL = new URL("./textures/roof/roof_diffuse.jpg", import.meta.url).href;
const roofNormalURL = new URL("./textures/roof/roof_normal.jpg", import.meta.url).href;
const roofRoughURL = new URL("./textures/roof/roof_roughness.jpg", import.meta.url).href;

const roofColorBase = loadTex(roofDiffuseURL);
roofColorBase.colorSpace = THREE.SRGBColorSpace;

const roofNormalBase = loadTex(roofNormalURL);
const roofRoughBase = loadTex(roofRoughURL);

roofColorBase.repeat.set(2, 2);
roofNormalBase.repeat.copy(roofColorBase.repeat);
roofRoughBase.repeat.copy(roofColorBase.repeat);

const roofTileMat = new THREE.MeshStandardMaterial({
  map: roofColorBase,
  normalMap: roofNormalBase,
  roughnessMap: roofRoughBase,
  roughness: 1.0,
});
roofTileMat.normalScale = new THREE.Vector2(1.0, 1.0);

/* =========================
   FOUNTAIN STONE 
========================= */
const fountainDiffuseURL = new URL("./textures/fountain/fountain_diffuse.jpg", import.meta.url).href;
const fountainNormalURL = new URL("./textures/fountain/fountain_normal.jpg", import.meta.url).href;
const fountainRoughURL = new URL("./textures/fountain/fountain_roughness.jpg", import.meta.url).href;

const fountainMap = loadTex(fountainDiffuseURL);
fountainMap.colorSpace = THREE.SRGBColorSpace;

const fountainNormalMap = loadTex(fountainNormalURL);
const fountainRoughMap = loadTex(fountainRoughURL);

const fountainStoneMat = new THREE.MeshStandardMaterial({
  map: fountainMap,
  normalMap: fountainNormalMap,
  roughnessMap: fountainRoughMap,
  roughness: 1.0,
});
fountainStoneMat.normalScale = new THREE.Vector2(1.0, 1.0);

/* =========================
   LIGHTS + GROUND
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 5));

const sun = new THREE.DirectionalLight(0xffffff, 0.2);
sun.position.set(18, 25, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 120;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* =========================
   FIRST-PERSON CONTROLS
========================= */
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// Click to lock mouse and start walking
window.addEventListener("click", () => controls.lock());

// WASD + Shift
const keys = { w: false, a: false, s: false, d: false, shift: false };

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") keys.w = true;
  if (e.code === "KeyA") keys.a = true;
  if (e.code === "KeyS") keys.s = true;
  if (e.code === "KeyD") keys.d = true;
  if (e.code === "ShiftLeft") keys.shift = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") keys.w = false;
  if (e.code === "KeyA") keys.a = false;
  if (e.code === "KeyS") keys.s = false;
  if (e.code === "KeyD") keys.d = false;
  if (e.code === "ShiftLeft") keys.shift = false;
});

// Spawn near the front entrance road
controls.object.position.set(0, 1.7, 13);

let velocityY = 0;
const gravity = 18;
const eyeHeight = 1.7;
const groundY = 0;

function updateWalk(dt) {
  if (!controls.isLocked) return;

  const speed = (keys.shift ? 7.0 : 3.5) * dt;
  if (keys.w) controls.moveForward(speed);
  if (keys.s) controls.moveForward(-speed);
  if (keys.a) controls.moveRight(-speed);
  if (keys.d) controls.moveRight(speed);

  // Gravity + clamp to ground
  velocityY -= gravity * dt;
  controls.object.position.y += velocityY * dt;

  const minY = groundY + eyeHeight;
  if (controls.object.position.y < minY) {
    controls.object.position.y = minY;
    velocityY = 0;
  }
}

/* =========================
   PAVILION SETUP
========================= */
const pavilion = new THREE.Group();
scene.add(pavilion);

// Dimensions
const baseW = 10;
const baseD = 18;
const baseH = 1;

const splitZ = 0;

const xEdge = baseW / 2 - 0.6;
const zEdge = baseD / 2 - 0.6;

const baseYTop = baseH;

// Materials
const stoneMat = texturedWallMat;
const stoneWallMat = texturedWallMat;

const darkWoodMat = new THREE.MeshStandardMaterial({
  color: 0x1f1410,
  roughness: 0.92,
});

const pillarMat = texturedWoodMat;
const braceMat = texturedWoodMat;
const railWoodMat = texturedWoodMat;

/* =========================
   TWO STONE LAYERS (PLINTH + UPPER WALLS)
========================= */
const plinthLip = 0.1;
const upperInset = 0.1;

const plinthH = 0.35;
const upperStoneH = baseH - plinthH;

const stoneWallT = 0.4;
const openingW = 1.2;

const upperOuterW_nominal = xEdge * 2 + stoneWallT;
const upperOuterD_nominal = zEdge * 2 + stoneWallT;

const plinthW = upperOuterW_nominal + plinthLip * 2;
const plinthD = upperOuterD_nominal + plinthLip * 2;

const upperOuterW = plinthW - upperInset * 2;
const upperOuterD = plinthD - upperInset * 2;

// Plinth block
const plinth = new THREE.Mesh(new THREE.BoxGeometry(plinthW, plinthH, plinthD), stoneMat);
plinth.position.y = plinthH / 2;
plinth.castShadow = true;
plinth.receiveShadow = true;
pavilion.add(plinth);

// Upper wall ring
const upperWall = new THREE.Group();
pavilion.add(upperWall);

const upperWallYCenter = plinthH + upperStoneH / 2;
const wallOuterX = (upperOuterW - stoneWallT) / 2;
const wallOuterZ = (upperOuterD - stoneWallT) / 2;

function addWallSegment(len, thickness, cx, cz, rotY) {
  const w = new THREE.Mesh(new THREE.BoxGeometry(len, upperStoneH, thickness), stoneWallMat);
  w.position.set(cx, upperWallYCenter, cz);
  w.rotation.y = rotY;
  w.castShadow = true;
  w.receiveShadow = true;
  upperWall.add(w);
}

// Front (+Z) split (entrance opening)
{
  const fullLen = wallOuterX * 2;
  const leftLen = (fullLen - openingW) / 2;
  const rightLen = leftLen;

  addWallSegment(leftLen, stoneWallT, -openingW / 2 - leftLen / 2, +wallOuterZ, 0);
  addWallSegment(rightLen, stoneWallT, +openingW / 2 + rightLen / 2, +wallOuterZ, 0);
}
// Back (-Z)
addWallSegment(wallOuterX * 2, stoneWallT, 0, -wallOuterZ, 0);
// Left/Right
addWallSegment(wallOuterZ * 2, stoneWallT, -wallOuterX, 0, Math.PI / 2);
addWallSegment(wallOuterZ * 2, stoneWallT, +wallOuterX, 0, Math.PI / 2);

/* =========================
   MIDDLE PARTITION (OPENING IN CENTER)
========================= */
const middleCurb = new THREE.Group();
pavilion.add(middleCurb);

const midDoorW = 2.0;
const curbLenFull = wallOuterX * 2;

{
  const leftLen = (curbLenFull - midDoorW) / 2;
  const rightLen = leftLen;

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(leftLen, upperStoneH, stoneWallT),
    stoneWallMat
  );
  left.position.set(-midDoorW / 2 - leftLen / 2, upperWallYCenter, splitZ);
  left.castShadow = true;
  left.receiveShadow = true;
  middleCurb.add(left);

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(rightLen, upperStoneH, stoneWallT),
    stoneWallMat
  );
  right.position.set(+midDoorW / 2 + rightLen / 2, upperWallYCenter, splitZ);
  right.castShadow = true;
  right.receiveShadow = true;
  middleCurb.add(right);
}

/* =========================
   PILLARS
========================= */
const pillars = new THREE.Group();
pavilion.add(pillars);

const pillarH = 3.6;
const pillarR = 0.2;

const pillarX = wallOuterX - stoneWallT / 2;
const pillarZ = wallOuterZ - stoneWallT / 2;

const pillarTopPoints = [];

function addFancyPillar(x, z, totalH, r) {
  const g = new THREE.Group();

  const bottomFrac = 0.3;
  const topFrac = 0.05;
  const midFrac = 1 - bottomFrac - topFrac;

  const hBottom = totalH * bottomFrac;
  const hMid = totalH * midFrac;
  const hTop = totalH * topFrac;

  const squareW = r * 2.1;

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(squareW, hBottom, squareW), pillarMat);
  bottom.position.y = hBottom / 2;
  bottom.castShadow = true;
  bottom.receiveShadow = true;

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hMid, 16), pillarMat);
  mid.position.y = hBottom + hMid / 2;
  mid.castShadow = true;
  mid.receiveShadow = true;

  const top = new THREE.Mesh(new THREE.BoxGeometry(squareW * 1.02, hTop, squareW * 1.02), pillarMat);
  top.position.y = hBottom + hMid + hTop / 2;
  top.castShadow = true;
  top.receiveShadow = true;

  g.add(bottom, mid, top);
  g.position.set(x, baseYTop - 0.02, z);
  pillars.add(g);

  pillarTopPoints.push(new THREE.Vector3(x, baseYTop - 0.02 + totalH, z));
}

// Corners
addFancyPillar(-pillarX, +pillarZ, pillarH, pillarR);
addFancyPillar(+pillarX, +pillarZ, pillarH, pillarR);
addFancyPillar(-pillarX, -pillarZ, pillarH, pillarR);
addFancyPillar(+pillarX, -pillarZ, pillarH, pillarR);

// Narrow sides
addFancyPillar(-pillarX * 0.33, +pillarZ, pillarH, pillarR);
addFancyPillar(+pillarX * 0.33, +pillarZ, pillarH, pillarR);
addFancyPillar(-pillarX * 0.33, -pillarZ, pillarH, pillarR);
addFancyPillar(+pillarX * 0.33, -pillarZ, pillarH, pillarR);

// Long sides
const longZ = [-0.66, -0.33, 0, 0.33, 0.66].map((t) => t * pillarZ);
for (const z of longZ) {
  addFancyPillar(-pillarX, z, pillarH, pillarR);
  addFancyPillar(+pillarX, z, pillarH, pillarR);
}

// Middle pillars (same as others)
const midPillarOffsetX = midDoorW / 2 + 0.12;
addFancyPillar(-midPillarOffsetX, splitZ, pillarH, pillarR);
addFancyPillar(+midPillarOffsetX, splitZ, pillarH, pillarR);

/* =========================
   ROOF + CEILING + PLASTER ABOVE PILLARS
========================= */
function makeNoiseTexture(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(size, size);

  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.floor(Math.random() * 35);
    img.data[i + 0] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }

  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAniso;
  return tex;
}

const snowRoughTex = makeNoiseTexture(128);

const roofUnderMat = new THREE.MeshStandardMaterial({
  color: 0x1a1411,
  roughness: 0.92,
  side: THREE.DoubleSide,
});

const roofEdgeMat = new THREE.MeshStandardMaterial({
  color: 0x130f0d,
  roughness: 0.9,
});

// Roof base height
const padH = 0.3;
const roofBaseY = baseYTop + pillarH + padH;

// Pads above each pillar (white blocks)
const pads = new THREE.Group();
pavilion.add(pads);

const padW = 0.58;
const padD = 0.58;

for (const p of pillarTopPoints) {
  const pad = new THREE.Mesh(new THREE.BoxGeometry(padW, padH, padD), plasterMat);
  pad.position.set(p.x, p.y + padH / 2, p.z);
  pad.castShadow = true;
  pad.receiveShadow = true;
  pads.add(pad);
}

// Continuous plaster band
const plasterBand = new THREE.Group();
pavilion.add(plasterBand);

const bandH = 0.2;
const bandT = 0.28;
const bandY = roofBaseY - bandH / 2;

const bandOuterW = pillarX * 2 + 0.7;
const bandOuterD = pillarZ * 2 + 0.7;

function addPlasterSeg(w, h, d, x, y, z, rotY = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plasterMat);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  m.castShadow = true;
  m.receiveShadow = true;
  plasterBand.add(m);
}

addPlasterSeg(bandOuterW, bandH, bandT, 0, bandY, +bandOuterD / 2 - bandT / 2, 0);
addPlasterSeg(bandOuterW, bandH, bandT, 0, bandY, -bandOuterD / 2 + bandT / 2, 0);
addPlasterSeg(bandT, bandH, bandOuterD - bandT * 2, -bandOuterW / 2 + bandT / 2, bandY, 0, 0);
addPlasterSeg(bandT, bandH, bandOuterD - bandT * 2, +bandOuterW / 2 - bandT / 2, bandY, 0, 0);

// Plaster band across the middle partition
{
  const middleBandSpan = new THREE.Mesh(
    new THREE.BoxGeometry(bandOuterW - bandT * 2, bandH, bandT),
    plasterMat
  );
  middleBandSpan.position.set(0, bandY, splitZ);
  middleBandSpan.castShadow = true;
  middleBandSpan.receiveShadow = true;
  plasterBand.add(middleBandSpan);
}

// Wood ceiling slab
const ceiling = new THREE.Mesh(
  new THREE.BoxGeometry(bandOuterW - 0.12, 0.1, bandOuterD - 0.12),
  roofUnderMat
);
ceiling.position.set(0, roofBaseY + 0.06, 0);
ceiling.castShadow = true;
ceiling.receiveShadow = true;
pavilion.add(ceiling);

// Extra beam above middle pillars
const middleBeam = new THREE.Mesh(
  new THREE.BoxGeometry(midDoorW + 1.6, 0.22, 0.46),
  darkWoodMat
);
middleBeam.position.set(0, roofBaseY + 0.05, splitZ);
middleBeam.castShadow = true;
middleBeam.receiveShadow = true;
pavilion.add(middleBeam);

// Roof geometry (hip roof)
const roof = new THREE.Group();
pavilion.add(roof);

const roofOverhangX = 0.85;
const roofOverhangZ = 1.05;

const roofHeight = 2.35;
const roofTopScale = 0.42;
const roofThickness = 0.12;
const cornerChamfer = 1.2;

const baseRoofW = bandOuterW + 0.35;
const baseRoofD = bandOuterD + 0.45;

const yBottom = roofBaseY + 0.18;
const yTop = yBottom + roofHeight;

const halfW = baseRoofW / 2 + roofOverhangX;
const halfD = baseRoofD / 2 + roofOverhangZ;
const halfWTop = halfW * roofTopScale;
const halfDTop = halfD * roofTopScale;

function chamferedRectPoints(hw, hd, chamfer, y) {
  const c = Math.min(chamfer, hw * 0.8, hd * 0.8);
  return [
    new THREE.Vector3(-hw + c, y, +hd),
    new THREE.Vector3(+hw - c, y, +hd),
    new THREE.Vector3(+hw, y, +hd - c),
    new THREE.Vector3(+hw, y, -hd + c),
    new THREE.Vector3(+hw - c, y, -hd),
    new THREE.Vector3(-hw + c, y, -hd),
    new THREE.Vector3(-hw, y, -hd + c),
    new THREE.Vector3(-hw, y, +hd - c),
  ];
}

const bottomPts = chamferedRectPoints(halfW, halfD, cornerChamfer, yBottom);
const topPts = chamferedRectPoints(
  halfWTop,
  halfDTop,
  cornerChamfer * roofTopScale,
  yTop
);

function makeQuad(a, b, c, d) {
  const geo = new THREE.BufferGeometry();

  const vertices = new Float32Array([
    a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
    a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z,
  ]);

  // Simple UVs so tile textures map correctly
  const uvs = new Float32Array([
    0, 0, 1, 0, 1, 1,
    0, 0, 1, 1, 0, 1,
  ]);

  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();

  return geo;
}

// Side faces + underside
for (let i = 0; i < bottomPts.length; i++) {
  const j = (i + 1) % bottomPts.length;

  const A = bottomPts[i];
  const B = bottomPts[j];
  const C = topPts[j];
  const D = topPts[i];

  const face = new THREE.Mesh(makeQuad(A, B, C, D), roofTileMat);
  face.castShadow = true;
  roof.add(face);

  const mid = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5);
  const inward = new THREE.Vector3(mid.x, 0, mid.z).normalize().multiplyScalar(-0.12);

  const A2 = A.clone().add(inward); A2.y -= roofThickness;
  const B2 = B.clone().add(inward); B2.y -= roofThickness;
  const C2 = C.clone().add(inward); C2.y -= roofThickness;
  const D2 = D.clone().add(inward); D2.y -= roofThickness;

  const under = new THREE.Mesh(makeQuad(D2, C2, B2, A2), roofUnderMat);
  roof.add(under);
}

// Top cap
{
  const s = new THREE.Shape();
  for (let i = 0; i < topPts.length; i++) {
    const p = topPts[i];
    if (i === 0) s.moveTo(p.x, p.z);
    else s.lineTo(p.x, p.z);
  }
  s.closePath();

  const capGeo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false });

  const cap = new THREE.Mesh(capGeo, roofTileMat);
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = yTop + 0.02;
  cap.castShadow = true;
  roof.add(cap);

  const capUnder = new THREE.Mesh(capGeo, roofUnderMat);
  capUnder.rotation.x = -Math.PI / 2;
  capUnder.position.y = yTop - 0.06;
  roof.add(capUnder);
}

// Fascia band
{
  const outer = bottomPts.map((p) => new THREE.Vector2(p.x, p.z));
  const innerScale = 0.92;
  const inner = bottomPts.map((p) => new THREE.Vector2(p.x * innerScale, p.z * innerScale));

  const shape = new THREE.Shape(outer);
  const hole = new THREE.Path(inner.slice().reverse());
  shape.holes.push(hole);

  const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });

  const fascia = new THREE.Mesh(edgeGeo, roofEdgeMat);
  fascia.rotation.x = -Math.PI / 2;
  fascia.position.y = yBottom - 0.08;
  fascia.castShadow = true;
  fascia.receiveShadow = true;
  roof.add(fascia);
}

/* =========================
   FENCES
========================= */
const fence = new THREE.Group();
pavilion.add(fence);

const railH = 0.95;
const topBeamH = 0.18;
const topBeamT = Math.min(0.32, stoneWallT * 0.75);

const woodInset = 0.1;
const woodX = pillarX - woodInset;
const woodZ = pillarZ - woodInset;

const spindleR = 0.06;
const spindleGap = 0.34;

function addTopBeam(len, thickness, cx, cz, rotY) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, topBeamH, thickness), railWoodMat);
  m.position.set(cx, baseYTop + railH + topBeamH / 2, cz);
  m.rotation.y = rotY;
  m.castShadow = true;
  m.receiveShadow = true;
  fence.add(m);
}

function addSpindles(len, cx, cz, rotY, skipGapHalfWidth) {
  const yMid = baseYTop + railH / 2;
  const count = Math.floor(len / spindleGap);
  const start = -len / 2 + spindleGap * 0.5;
  const geo = new THREE.CylinderGeometry(spindleR, spindleR, railH, 10);

  for (let i = 0; i < count; i++) {
    const t = start + i * spindleGap;
    if (skipGapHalfWidth && Math.abs(t) < skipGapHalfWidth) continue;

    const s = new THREE.Mesh(geo, railWoodMat);
    let x = cx, z = cz;
    if (Math.abs(rotY) < 1e-6) x += t;
    else z += t;

    s.position.set(x, yMid, z);
    s.castShadow = true;
    s.receiveShadow = true;
    fence.add(s);
  }
}

// Outer front split
{
  const fullLen = woodX * 2;
  const leftLen = (fullLen - openingW) / 2;
  const rightLen = leftLen;

  addTopBeam(leftLen, topBeamT, -openingW / 2 - leftLen / 2, +woodZ, 0);
  addTopBeam(rightLen, topBeamT, +openingW / 2 + rightLen / 2, +woodZ, 0);
  addSpindles(fullLen, 0, +woodZ, 0, openingW / 2);
}
// Outer back
{
  const len = woodX * 2;
  addTopBeam(len, topBeamT, 0, -woodZ, 0);
  addSpindles(len, 0, -woodZ, 0, 0);
}
// Outer left/right
{
  const len = woodZ * 2;

  addTopBeam(len, topBeamT, -woodX, 0, Math.PI / 2);
  addSpindles(len, -woodX, 0, Math.PI / 2, 0);

  addTopBeam(len, topBeamT, +woodX, 0, Math.PI / 2);
  addSpindles(len, +woodX, 0, Math.PI / 2, 0);
}
// Middle fence split
{
  const fullLen = wallOuterX * 2;
  const segLen = (fullLen - midDoorW) / 2;
  const midFenceZ = splitZ - (stoneWallT * 0.5 - topBeamT * 0.5) + 0.02;

  addTopBeam(segLen, topBeamT, -midDoorW / 2 - segLen / 2, midFenceZ, 0);
  addSpindles(segLen, -midDoorW / 2 - segLen / 2, midFenceZ, 0, 0);

  addTopBeam(segLen, topBeamT, +midDoorW / 2 + segLen / 2, midFenceZ, 0);
  addSpindles(segLen, +midDoorW / 2 + segLen / 2, midFenceZ, 0, 0);
}

/* =========================
   ENTRANCE STEP
========================= */
const step = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 1.2), stoneWallMat);
step.position.set(0, 0.125, baseD / 2 + 0.6);
step.castShadow = true;
step.receiveShadow = true;
pavilion.add(step);

/* =========================
   FLOORS (BACK ROOM + WOOD AROUND FOUNTAIN)
========================= */
const pitCenterZ = baseD * 0.25;
const frontHalfDepth = baseD / 2 - 1.2;

const upperT = 0.12;
const upperY = baseYTop + 0.12;

const woodLiftY = 0.05;

const pitDepth = 0.7;
const pitY = upperY - pitDepth;

// Your insets
const floorInsetX = 1.7;
const floorInsetZ = 1;

// Back room floor
const backFloorW = Math.max(0.2, baseW - floorInsetX);
const backFloorD = Math.max(0.2, baseD / 2 - floorInsetZ);

const backFloorGeo = new THREE.PlaneGeometry(backFloorW, backFloorD);
const backFloorMat = makeBackFloorMat(2, 2, 1.0);

backFloorMat.side = THREE.DoubleSide;
backFloorMat.polygonOffset = true;
backFloorMat.polygonOffsetFactor = -1;
backFloorMat.polygonOffsetUnits = -1;

const backFloor = new THREE.Mesh(backFloorGeo, backFloorMat);
backFloor.rotation.x = -Math.PI / 2;
backFloor.position.set(0, upperY - 0.7, -baseD * 0.25 + 0.15);
backFloor.receiveShadow = true;
pavilion.add(backFloor);

// Wood floor halves around fountain (octagon hole + neck openings)
const woodOuterMargin = 0.5;
const woodHoleR = 2.75;
const woodSides = 8;

const neckHalf = 0.8;
const neckZ = 2.7;

const floorTopY = upperY + woodLiftY;
const thickness = 0.7;

const z0 = -frontHalfDepth / 2 + 0.1;
const z1 = +frontHalfDepth / 2 + 0.4;

function makeOctPoints(r, sides = 8) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * r, z: Math.sin(a) * r });
  }
  return pts;
}

function makeShapeFromPolylineXZ(pts) {
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].z);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].z);
  s.closePath();
  return s;
}

function buildHalf(isLeft) {
  const halfW = baseW / 2;

  const xL = -halfW + woodOuterMargin;
  const xR = +halfW - woodOuterMargin;

  const zB = z0;
  const zT = z1;

  const oct = makeOctPoints(woodHoleR, woodSides);
  const octLeft = [oct[3], oct[4], oct[5]];
  const octRight = [oct[7], oct[0], oct[1]];

  let pts;

  if (isLeft) {
    pts = [
      { x: xL, z: zT },
      { x: -neckHalf, z: zT },
      { x: -neckHalf, z: neckZ },
      ...octLeft,
      { x: -neckHalf, z: -neckZ },
      { x: -neckHalf, z: zB },
      { x: xL, z: zB },
    ];
  } else {
    pts = [
      { x: +neckHalf, z: zT },
      { x: xR, z: zT },
      { x: xR, z: zB },
      { x: +neckHalf, z: zB },
      { x: +neckHalf, z: -neckZ },
      ...octRight,
      { x: +neckHalf, z: neckZ },
    ];
  }

  const shape = makeShapeFromPolylineXZ(pts);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });

  const mat = makeWoodFloorMat(6, 3, 1.0);
  mat.side = THREE.DoubleSide;
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -1;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, floorTopY - thickness, pitCenterZ);

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  pavilion.add(mesh);
}

buildHalf(true);
buildHalf(false);

/* =========================
   DOORS (CARVED WOOD PORTAL + ANIMATION)
========================= */
const PASS_H = 2.75;
const DOOR_T = 0.08;

const FRONT_MAX_L = 1.6;
const FRONT_MAX_R = 1.6;
const MID_MAX_L = 1.5;
const MID_MAX_R = 1.5;

const doorAnim = {
  front: { open: 0, target: 0, speed: 7, leftPivot: null, rightPivot: null, maxL: FRONT_MAX_L, maxR: FRONT_MAX_R },
  mid: { open: 0, target: 0, speed: 7, leftPivot: null, rightPivot: null, maxL: MID_MAX_L, maxR: MID_MAX_R },
};

const carvedWoodMat = makeWoodMat(1.6, 2.8, 1.1);
const carvedWoodMat2 = makeWoodMat(2.4, 2.2, 1.0);

function addCarvedPortalDoor({
  parent,
  openingWidth,
  openingHeight,
  doorThickness,
  pos,
  yaw,
  unifiedWidth = null,
}) {
  const G = new THREE.Group();
  G.position.copy(pos);
  G.rotation.y = yaw;
  parent.add(G);

  const baseW = unifiedWidth ?? openingWidth;
  const innerW = Math.max(0.6, baseW * 0.98);
  const innerH = openingHeight;

  const postW = 0.38;
  const postD = 0.32;
  const postPad = 0;
  const portalW = innerW + postW * 2 + postPad * 2;
  const portalH = innerH + 0.95;

  const headerH = 0.5;

  const leftPost = new THREE.Mesh(new THREE.BoxGeometry(postW, portalH, postD), carvedWoodMat);
  leftPost.position.set(-(innerW / 2 + postPad + postW / 2), portalH / 2, 0);
  leftPost.castShadow = true;
  leftPost.receiveShadow = true;
  G.add(leftPost);

  const rightPost = leftPost.clone();
  rightPost.position.x *= -1;
  G.add(rightPost);

  const header = new THREE.Mesh(new THREE.BoxGeometry(portalW, headerH, postD * 1.12), carvedWoodMat);
  header.position.set(0, portalH - headerH / 2, 0);
  header.castShadow = true;
  header.receiveShadow = true;
  G.add(header);

  const frieze = new THREE.Mesh(
    new THREE.BoxGeometry(portalW * 0.92, headerH * 0.56, postD * 0.62),
    carvedWoodMat2
  );
  frieze.position.set(0, portalH - headerH * 0.65, postD * 0.18);
  frieze.castShadow = true;
  frieze.receiveShadow = true;
  G.add(frieze);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(portalW * 0.86, headerH * 0.38, postD * 0.55),
    carvedWoodMat2
  );
  crown.position.set(0, portalH - headerH * 0.22, postD * 0.22);
  crown.castShadow = true;
  crown.receiveShadow = true;
  G.add(crown);

  const doorsZ = postD * -0.2;

  const leafGap = 0.05;
  const leafW = innerW / 2 - leafGap;
  const leafH = innerH;
  const leafT = doorThickness;

  function makeDoorLeaf(isRight) {
    const leaf = new THREE.Group();

    const slab = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, leafT), carvedWoodMat);
    slab.position.set(isRight ? -leafW / 2 : +leafW / 2, leafH / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    leaf.add(slab);

    const plankCount = 6;
    for (let i = 0; i < plankCount; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(leafW / plankCount - 0.012, leafH * 0.98, leafT * 0.22),
        carvedWoodMat2
      );
      const x = (i + 0.5) * (leafW / plankCount);
      plank.position.set(isRight ? -(x) : +(x), leafH / 2, leafT * 0.48);
      plank.castShadow = true;
      plank.receiveShadow = true;
      leaf.add(plank);
    }

    const p1 = new THREE.Mesh(
      new THREE.BoxGeometry(leafW * 0.82, leafH * 0.26, leafT * 0.42),
      carvedWoodMat2
    );
    p1.position.set(isRight ? -leafW * 0.5 : +leafW * 0.5, leafH * 0.30, leafT * 0.48);
    p1.castShadow = true;
    p1.receiveShadow = true;
    leaf.add(p1);

    const p2 = p1.clone();
    p2.position.y = leafH * 0.62;
    leaf.add(p2);

    const topStrip = new THREE.Mesh(
      new THREE.BoxGeometry(leafW * 0.86, leafH * 0.10, leafT * 0.35),
      carvedWoodMat2
    );
    topStrip.position.set(isRight ? -leafW * 0.5 : +leafW * 0.5, leafH * 0.86, leafT * 0.48);
    topStrip.castShadow = true;
    topStrip.receiveShadow = true;
    leaf.add(topStrip);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.55 })
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(isRight ? -leafW * 0.18 : +leafW * 0.18, leafH * 0.52, leafT * 0.62);
    handle.castShadow = true;
    leaf.add(handle);

    return leaf;
  }

  const leftPivot = new THREE.Group();
  leftPivot.position.set(-innerW / 2, 0, doorsZ);
  G.add(leftPivot);
  leftPivot.add(makeDoorLeaf(false));

  const rightPivot = new THREE.Group();
  rightPivot.position.set(+innerW / 2, 0, doorsZ);
  G.add(rightPivot);
  rightPivot.add(makeDoorLeaf(true));

  return { group: G, leftPivot, rightPivot };
}

const frontDoorZ = wallOuterZ - stoneWallT / 2 + 0.015;
const frontDoor = addCarvedPortalDoor({
  parent: pavilion,
  openingWidth: openingW,
  openingHeight: PASS_H,
  doorThickness: DOOR_T,
  pos: new THREE.Vector3(0, baseYTop - 0.65, frontDoorZ),
  yaw: 0,
  unifiedWidth: openingW,
});
doorAnim.front.leftPivot = frontDoor.leftPivot;
doorAnim.front.rightPivot = frontDoor.rightPivot;

const midDoorZPos = splitZ + stoneWallT / 2 - 0.015;
const midDoor = addCarvedPortalDoor({
  parent: pavilion,
  openingWidth: openingW,
  openingHeight: PASS_H,
  doorThickness: DOOR_T,
  pos: new THREE.Vector3(0, baseYTop - 0.65, midDoorZPos),
  yaw: 0,
  unifiedWidth: openingW,
});
doorAnim.mid.leftPivot = midDoor.leftPivot;
doorAnim.mid.rightPivot = midDoor.rightPivot;

// E toggles both doors
window.addEventListener("keydown", (e) => {
  if (e.code === "KeyE") {
    const next = doorAnim.front.target > 0.5 ? 0 : 1;
    doorAnim.front.target = next;
    doorAnim.mid.target = next;
  }
});

/* =========================
   FOUNTAIN (STONE + WATER)
========================= */
const fountain = new THREE.Group();
fountain.position.set(0, pitY - 0.2, pitCenterZ);
pavilion.add(fountain);

const basinOuterR = 1.0;
const basinH = 1.1;
const basinSides = 8;
const basinWallT = 0.18;
const basinInnerR = Math.max(0.2, basinOuterR - basinWallT);

function makeOctShape(r, sides = 8) {
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  }
  shape.closePath();
  return shape;
}

function makeHolePath(r, sides = 8) {
  const path = new THREE.Path();
  for (let i = sides - 1; i >= 0; i--) {
    const a = (i / sides) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (i === sides - 1) path.moveTo(x, z);
    else path.lineTo(x, z);
  }
  path.closePath();
  return path;
}

const basinShape = makeOctShape(basinOuterR, basinSides);
basinShape.holes.push(makeHolePath(basinInnerR, basinSides));

const basinGeo = new THREE.ExtrudeGeometry(basinShape, {
  depth: basinH,
  bevelEnabled: false,
});

const basin = new THREE.Mesh(basinGeo, fountainStoneMat);
basin.rotation.x = -Math.PI / 2;
basin.position.y = 0.45 - basinH / 2;
basin.castShadow = true;
basin.receiveShadow = true;
fountain.add(basin);

const basinWaterY = 0.45 + 0.2;
const basinWaterMat = new THREE.MeshStandardMaterial({
  color: 0x4e7482,
  transparent: true,
  opacity: 0.62,
  roughness: 0.12,
});
const basinWater = new THREE.Mesh(
  new THREE.CylinderGeometry(basinInnerR * 0.92, basinInnerR * 0.92, 0.06, basinSides),
  basinWaterMat
);
basinWater.position.y = basinWaterY;
basinWater.receiveShadow = true;
fountain.add(basinWater);

const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16), fountainStoneMat);
col.position.y = 0.95;
col.castShadow = true;
fountain.add(col);

const cupGroup = new THREE.Group();
cupGroup.position.y = 1.55;
fountain.add(cupGroup);

const cupOuterR = 0.34;
const cupWallT2 = 0.055;
const cupInnerR = cupOuterR - cupWallT2;
const cupH = 0.22;

const cupShape = new THREE.Shape();
cupShape.absarc(0, 0, cupOuterR, 0, Math.PI * 2, false);

const cupHole = new THREE.Path();
cupHole.absarc(0, 0, cupInnerR, 0, Math.PI * 2, true);
cupShape.holes.push(cupHole);

const cupWallGeo = new THREE.ExtrudeGeometry(cupShape, {
  depth: cupH,
  bevelEnabled: false,
  curveSegments: 64,
});

const cupWall = new THREE.Mesh(cupWallGeo, fountainStoneMat);
cupWall.rotation.x = -Math.PI / 2;
cupWall.position.y = -cupH / 2;
cupWall.castShadow = true;
cupWall.receiveShadow = true;
cupGroup.add(cupWall);

const cupBottom = new THREE.Mesh(
  new THREE.CylinderGeometry(cupInnerR * 0.98, cupInnerR * 0.98, 0.035, 48),
  fountainStoneMat
);
cupBottom.position.y = -cupH / 2 + 0.02;
cupBottom.castShadow = true;
cupBottom.receiveShadow = true;
cupGroup.add(cupBottom);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(cupOuterR * 0.99, 0.018, 12, 56),
  new THREE.MeshStandardMaterial({ color: 0xd7d2c8, roughness: 0.85 })
);
rim.rotation.x = Math.PI / 2;
rim.position.y = +cupH / 2 - 0.004;
rim.castShadow = true;
cupGroup.add(rim);

const nozzle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.015, 0.02, 0.09, 24),
  new THREE.MeshStandardMaterial({ color: 0xbfb7ad, roughness: 0.85 })
);
nozzle.position.y = -cupH / 2 + 0.085;
nozzle.castShadow = true;
nozzle.receiveShadow = true;
cupGroup.add(nozzle);

const nozzleTip = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.012, 0.02, 24),
  new THREE.MeshStandardMaterial({ color: 0xbfb7ad, roughness: 0.85 })
);
nozzleTip.position.y = nozzle.position.y + 0.055;
nozzleTip.castShadow = true;
cupGroup.add(nozzleTip);

const cupWaterMat = new THREE.MeshStandardMaterial({
  color: 0x66bde8,
  transparent: true,
  opacity: 0.55,
  roughness: 0.08,
});
const cupWaterYLocal = cupH / 2 - 0.022;

const cupWater = new THREE.Mesh(
  new THREE.CylinderGeometry(cupInnerR * 0.92, cupInnerR * 0.92, 0.03, 48),
  cupWaterMat
);
cupWater.position.y = cupWaterYLocal;
cupWater.receiveShadow = true;
cupGroup.add(cupWater);

// Water materials for jet + overflow
const waterColorMat = new THREE.MeshStandardMaterial({
  color: 0x66bde8,
  transparent: true,
  opacity: 0.45,
  roughness: 0.05,
});

const overflowMat = new THREE.MeshStandardMaterial({
  color: 0x66bde8,
  transparent: true,
  opacity: 0.45,
  roughness: 0.05,
});

let jetMesh = null;
let overflowMeshes = [];

function rebuildJet() {
  const start = new THREE.Vector3(
    0,
    cupGroup.position.y + nozzleTip.position.y + 0.01,
    0
  );

  const end = new THREE.Vector3(
    0,
    cupGroup.position.y + cupWaterYLocal + 0.01,
    0
  );

  const control = new THREE.Vector3(0, start.y + 0.40, 0.18);
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);

  const geo = new THREE.TubeGeometry(curve, 44, 0.0075, 10, false);

  if (!jetMesh) {
    jetMesh = new THREE.Mesh(geo, waterColorMat);
    fountain.add(jetMesh);
  } else {
    jetMesh.geometry.dispose();
    jetMesh.geometry = geo;
  }
}

function buildOverflow() {
  for (const m of overflowMeshes) {
    fountain.remove(m);
    m.geometry.dispose();
  }
  overflowMeshes = [];

  const spillAngle = Math.PI * 0.15;
  const landY = basinWaterY + 0.02;

  const cupWaterSurfaceY = cupGroup.position.y + cupWaterYLocal + 0.01;
  const rimY = cupGroup.position.y + (cupH / 2 - 0.01);

  const cx = Math.cos(spillAngle);
  const cz = Math.sin(spillAngle);

  const startRadius = cupInnerR * 0.98;
  const rimRadius = cupOuterR * 1.03;

  const p0 = new THREE.Vector3(cx * startRadius, cupWaterSurfaceY, cz * startRadius);
  const p1 = new THREE.Vector3(cx * rimRadius, rimY + 0.005, cz * rimRadius);
  const p2 = new THREE.Vector3(cx * rimRadius, landY, cz * rimRadius);

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2], false, "catmullrom", 0.5);
  const geo = new THREE.TubeGeometry(curve, 40, 0.016, 10, false);

  const mesh = new THREE.Mesh(geo, overflowMat);
  fountain.add(mesh);
  overflowMeshes.push(mesh);
}

// Build static jet/overflow once
rebuildJet();
buildOverflow();

// Splashes (animated scale + opacity)
const basinSplashMat = new THREE.MeshStandardMaterial({
  color: 0x66bde8,
  transparent: true,
  opacity: 0.16,
  side: THREE.DoubleSide,
  roughness: 0.1,
});
const basinSplash = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.28, 32), basinSplashMat);
basinSplash.rotation.x = -Math.PI / 2;
basinSplash.position.y = basinWaterY + 0.02;
fountain.add(basinSplash);

const cupSplashMat = new THREE.MeshStandardMaterial({
  color: 0x66bde8,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
  roughness: 0.1,
});
const cupSplash = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.11, 24), cupSplashMat);
cupSplash.rotation.x = -Math.PI / 2;
cupSplash.position.set(0, cupWaterYLocal + 0.02, 0);
cupGroup.add(cupSplash);

/* =========================
   V BRACES
========================= */
const braces = new THREE.Group();
pavilion.add(braces);

function addBrace(from, to, thickness = 0.14) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();

  const geo = new THREE.BoxGeometry(thickness, thickness, len);
  const mesh = new THREE.Mesh(geo, braceMat);

  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  mesh.position.copy(mid);
  mesh.lookAt(to);

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  braces.add(mesh);
}

const baseBraceY = baseYTop + 0.1;
const topBraceY = baseYTop + pillarH - 0.15;
const zNear = 0.33 * zEdge;

function addVBrace(sideX) {
  const bottomCenter = new THREE.Vector3(sideX, baseBraceY, 0);
  const bottomMinus = new THREE.Vector3(sideX, baseBraceY, -zNear);
  const bottomPlus = new THREE.Vector3(sideX, baseBraceY, +zNear);
  const apex = new THREE.Vector3(sideX, topBraceY, 0);

  addBrace(bottomCenter, apex, 0.16);
  addBrace(bottomMinus, apex, 0.14);
  addBrace(bottomPlus, apex, 0.14);
}

addVBrace(xEdge);
addVBrace(-xEdge);

/* =========================
   ROADS (NO STRETCH)
========================= */
const roads = new THREE.Group();
scene.add(roads);

function addRoadSegment(x1, z1, x2, z2, width = 3.2, y = 0.012) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);

  const geo = new THREE.PlaneGeometry(width, len);

  const map = roadColorBase.clone();
  const normalMap = roadNormalBase.clone();
  const roughMap = roadRoughBase.clone();

  map.needsUpdate = true;
  normalMap.needsUpdate = true;
  roughMap.needsUpdate = true;

  const tileSize = 0.5;
  map.repeat.set(width / tileSize, len / tileSize);
  normalMap.repeat.copy(map.repeat);
  roughMap.repeat.copy(map.repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: roughMap,
    roughness: 1.0,
  });
  mat.normalScale = new THREE.Vector2(1.0, 1.0);

  const mesh = new THREE.Mesh(geo, mat);

  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  mesh.position.set(mx, y, mz);

  mesh.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz));

  mesh.receiveShadow = true;
  roads.add(mesh);
}

// Your road layout
addRoadSegment(-50, +13, +31.6, +13, 3.2);
addRoadSegment(-30, -40, +30, -10, 3.2);
addRoadSegment(+30, +14, +30, -30, 3.2);

/* =========================
   TREES (GLTF)
========================= */
const gltfLoader = new GLTFLoader();

gltfLoader.load("/models/trees/tree_small_02_4k/tree_small_02_4k.gltf", (gltf) => {
  const baseTree = gltf.scene;

  baseTree.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // Normalize size
  const targetHeight = 6;
  const box = new THREE.Box3().setFromObject(baseTree);
  const size = new THREE.Vector3();
  box.getSize(size);
  const s = targetHeight / Math.max(size.y, 0.0001);
  baseTree.scale.setScalar(s);

  // Ground offset
  const box2 = new THREE.Box3().setFromObject(baseTree);
  const baseYOffset = -box2.min.y;

  function addTree(x, z, rotationY = 0, scaleMultiplier = 1) {
    const tree = baseTree.clone(true);
    tree.position.set(x, baseYOffset, z);
    tree.rotation.y = rotationY;
    tree.scale.multiplyScalar(scaleMultiplier);
    scene.add(tree);
  }

  // Tree placements
  addTree(40, 5);
  addTree(0, -30);
  addTree(10, -30);
  addTree(-18, -30);
  addTree(-10, -50);
  addTree(-25, 10);
  addTree(20, 10);
  addTree(10, 2);
  addTree(15, -4);
  addTree(-12, 8, Math.PI * 0.3);
  addTree(8, 18, Math.PI * 1.2, 0.9);
  addTree(-25, 18, 0, 1.1);
  addTree(-10, 18, 0, 1.1);
});

/* =========================
   RESIZE
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* =========================
   ANIMATION LOOP
========================= */
const clock = new THREE.Clock();
let t = 0;

function updateDoor(door, dt) {
  door.open += (door.target - door.open) * Math.min(1, dt * door.speed);
  if (door.leftPivot) door.leftPivot.rotation.y = -door.maxL * door.open;
  if (door.rightPivot) door.rightPivot.rotation.y = +door.maxR * door.open;
}

function animate() {
  const dt = Math.min(0.05, clock.getDelta());
  t += dt;

  updateWalk(dt);

  // Small water shimmer
  cupWaterMat.opacity = 0.54 + Math.sin(t * 4) * 0.03;
  basinWaterMat.opacity = 0.6 + Math.sin(t * 3) * 0.03;
  waterColorMat.opacity = 0.4 + Math.sin(t * 6) * 0.05;

  // Splash rings animation
  const r1 = 1 + Math.sin(t * 5) * 0.12;
  basinSplash.scale.set(r1, r1, 1);
  basinSplashMat.opacity = 0.12 + Math.sin(t * 5) * 0.05;

  const r2 = 1 + Math.sin(t * 7) * 0.15;
  cupSplash.scale.set(r2, r2, 1);
  cupSplashMat.opacity = 0.18 + Math.sin(t * 7) * 0.06;

  updateDoor(doorAnim.front, dt);
  updateDoor(doorAnim.mid, dt);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
