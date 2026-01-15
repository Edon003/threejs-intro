import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'lil-gui'

/**
 * Scene / Camera / Renderer
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(18, 12, 18)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

function loadRepeatTexture(path, repeatX, repeatY) {
  const t = textureLoader.load(path)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeatX, repeatY)
  t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
  return t
}

const grassTex = loadRepeatTexture('/textures/grass.jpg', 12, 12)
const roadTex = loadRepeatTexture('/textures/road.jpg', 8, 8)
const brickTex = loadRepeatTexture('/textures/brick.jpg', 2, 2)
const concreteTex = loadRepeatTexture('/textures/concrete.jpg', 2, 2)

/**
 * Materials
 */
const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTex })
const roadMaterial = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 1 })
const brickMaterial = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 })
const concreteMaterial = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 1 })

// Transparent material (glass)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x99ccff,
  roughness: 0.1,
  metalness: 0,
  transparent: true,
  opacity: 0.6,
  transmission: 0.8,
  side: THREE.DoubleSide,
})

/**
 * Ground (grass)
 */
const grass = new THREE.Mesh(new THREE.PlaneGeometry(55, 55), grassMaterial)
grass.rotation.x = -Math.PI / 2
grass.receiveShadow = true
scene.add(grass)

/**
 * Yard
 */
const yardMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 1 })

function makeYard(w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), yardMaterial)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  scene.add(m)
  return m
}

makeYard(10, 0.2, 15, 1.5, 0.01, 6)
makeYard(1, 0.2, 4, 7, 0.01, 2)
makeYard(1.8, 0.2, 4, -9.4, 0.01, 12)
makeYard(1.8, 0.2, 4, -9.4, 0.01, 3)
makeYard(1.8, 0.2, 4, -13, 0.01, -17.5)
makeYard(24.5, 0.2, 2, 0, 0.01, -18.5)
makeYard(1.8, 0.2, 4, 12, 0.01, -17.5)

/**
 * Roads
 */
function makeRoadPlane(w, h, x, y, z) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(w, h), roadMaterial)
  r.rotation.x = -Math.PI / 2
  r.position.set(x, y, z)
  r.receiveShadow = true
  scene.add(r)
  return r
}

makeRoadPlane(5, 32, -6, 0.01, 4)
makeRoadPlane(40, 5, 0, 0.01, -13)
makeRoadPlane(35, 5, 0, 0.01, 22)
makeRoadPlane(5, 10, 4, 0.01, -6)

/**
 * Buildings
 */
const b810 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 20), brickMaterial)
b810.position.set(-12, 1.5, 7)
b810.castShadow = true
scene.add(b810)

const lhWidth = 10
const lhHeight = 5
const lhDepth = 18

const lh = new THREE.Mesh(new THREE.BoxGeometry(lhWidth, lhHeight, lhDepth), concreteMaterial)
lh.position.set(12.5, 2, 8)
lh.castShadow = true
scene.add(lh)

// dorms
const dormMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 1 })

const leftDorm = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 13), dormMaterial)
leftDorm.position.set(-8, 5, -22)
leftDorm.rotation.y = Math.PI / 2
leftDorm.castShadow = true
scene.add(leftDorm)

const rightDorm = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 13), dormMaterial)
rightDorm.position.set(7, 5, -22)
rightDorm.rotation.y = Math.PI / 2
rightDorm.castShadow = true
scene.add(rightDorm)

/**
 * Glass window on LH (make sure it sits slightly in front)
 */
const lhWindows = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.5), glassMaterial)
lhWindows.position.set(
  lh.position.x,
  lh.position.y + 0.8,
  lh.position.z + (lhDepth / 2) + 0.05 // push slightly forward
)
scene.add(lhWindows)

/**
 * GLTF Model (tree)
 */
const gltfLoader = new GLTFLoader()
let treeModel = null

gltfLoader.load(
  '/models/tree/tree_small_02_4k.gltf',
  (gltf) => {
    treeModel = gltf.scene
    treeModel.position.set(0, 0, -5)
    treeModel.scale.set(3, 3, 3)

    treeModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(treeModel)
  },
  undefined,
  (err) => {
    console.error('Tree GLTF load error:', err)
  }
)

/**
 * Lights
 */
const gui = new GUI()

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
directionalLight.position.set(10, 15, 5)
directionalLight.castShadow = true
scene.add(directionalLight)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 150
directionalLight.shadow.camera.left = -40
directionalLight.shadow.camera.right = 40
directionalLight.shadow.camera.top = 40
directionalLight.shadow.camera.bottom = -40

// Animated light
const pointLight = new THREE.PointLight(0xffeecc, 1.2, 120)
pointLight.position.set(0, 10, 0)
pointLight.castShadow = true
scene.add(pointLight)
gui.add(pointLight, 'intensity').min(0).max(5).step(0.01)

/**
 * Interaction (hover + click)
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const interactables = [b810, lh, leftDorm, rightDorm]
let hovered = null

let b810Alt = false
let lhAlt = false

const b810AltMaterial = new THREE.MeshStandardMaterial({ color: 0x6fbbe0, roughness: 0.8 })
const lhAltMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, roughness: 1 })

function setHover(obj) {
  if (hovered && hovered.material && hovered.material.emissive) {
    hovered.material.emissive.set(0x000000)
  }
  hovered = obj
  if (hovered && hovered.material && hovered.material.emissive) {
    hovered.material.emissive.set(0x222222)
  }
}

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(interactables, false)

  if (hits.length) setHover(hits[0].object)
  else setHover(null)
})

window.addEventListener('click', () => {
  if (!hovered) return

  if (hovered === b810) {
    b810Alt = !b810Alt
    b810.material = b810Alt ? b810AltMaterial : brickMaterial
  }

  if (hovered === lh) {
    lhAlt = !lhAlt
    lh.material = lhAlt ? lhAltMaterial : concreteMaterial
  }
})

/**
 * Keyboard interaction
 */
let animationsEnabled = true

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase()
  if (key === 'l') directionalLight.visible = !directionalLight.visible
  if (key === 'a') animationsEnabled = !animationsEnabled
})

/**
 * Resize
 */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

function animate() {
  const elapsedTime = clock.getElapsedTime()

  if (animationsEnabled) {
    // Move point light in a circle
    pointLight.position.x = Math.sin(elapsedTime) * 12
    pointLight.position.z = Math.cos(elapsedTime) * 12

    // Rotate the tree slightly so animation is obvious
    if (treeModel) {
      treeModel.rotation.y += 0.003
    }
  }

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
