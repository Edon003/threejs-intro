import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(18, 12, 18)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x3b9a45 })
const grass = new THREE.Mesh(new THREE.PlaneGeometry(55, 55), grassMaterial)
grass.rotation.x = -Math.PI / 2
grass.receiveShadow = true
scene.add(grass)

const yardMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 })

const bigYard = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 15), yardMaterial)
bigYard.position.set(1.5, 0.01, 6)
bigYard.castShadow = true
bigYard.receiveShadow = true
scene.add(bigYard)

const lhYard = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 4), yardMaterial)
lhYard.position.set(7, 0.01, 2)
lhYard.castShadow = true
lhYard.receiveShadow = true
scene.add(lhYard)

const yard8101 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 4), yardMaterial)
yard8101.position.set(-9.4, 0.01, 12)
yard8101.castShadow = true
yard8101.receiveShadow = true
scene.add(yard8101)

const yard8102 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 4), yardMaterial)
yard8102.position.set(-9.4, 0.01, 3)
yard8102.castShadow = true
yard8102.receiveShadow = true
scene.add(yard8102)

const leftDormYard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 4), yardMaterial)
leftDormYard.position.set(-13, 0.01, -17.5)
leftDormYard.castShadow = true
leftDormYard.receiveShadow = true
scene.add(leftDormYard)

const middleDormYard = new THREE.Mesh(new THREE.BoxGeometry(24.5, 0.2, 2), yardMaterial)
middleDormYard.position.set(0, 0.01, -18.5)
middleDormYard.castShadow = true
middleDormYard.receiveShadow = true
scene.add(middleDormYard)

const rightDormYard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 4), yardMaterial)
rightDormYard.position.set(12, 0.01, -17.5)
rightDormYard.castShadow = true
rightDormYard.receiveShadow = true
scene.add(rightDormYard)

const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })

const verticalRoad = new THREE.Mesh(new THREE.PlaneGeometry(5, 32), roadMaterial)
verticalRoad.rotation.x = -Math.PI / 2
verticalRoad.position.set(-6, 0.01, 4)
verticalRoad.receiveShadow = true
scene.add(verticalRoad)

const topRoad = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), roadMaterial)
topRoad.rotation.x = -Math.PI / 2
topRoad.position.set(0, 0.01, -13)
topRoad.receiveShadow = true
scene.add(topRoad)

const bottomRoad = new THREE.Mesh(new THREE.PlaneGeometry(35, 5), roadMaterial)
bottomRoad.rotation.x = -Math.PI / 2
bottomRoad.position.set(0, 0.01, 22)
bottomRoad.receiveShadow = true
scene.add(bottomRoad)

const toLHroad = new THREE.Mesh(new THREE.PlaneGeometry(5, 10), roadMaterial)
toLHroad.rotation.x = -Math.PI / 2
toLHroad.position.set(4, 0.01, -6)
toLHroad.receiveShadow = true
scene.add(toLHroad)

const b810 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3, 20), new THREE.MeshPhongMaterial({ color: 0x6fbbe0 }))
b810.position.set(-12, 1.5, 7)
b810.castShadow = true
scene.add(b810)

const lh = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 18), new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }))
lh.position.set(12.5, 2, 8)
lh.castShadow = true
scene.add(lh)

const leftDorm = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 13), new THREE.MeshLambertMaterial({ color: 0xffd700 }))
leftDorm.position.set(-8, 5, -22)
leftDorm.rotation.y = Math.PI / 2
leftDorm.castShadow = true
scene.add(leftDorm)

const rightDorm = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 13), new THREE.MeshLambertMaterial({ color: 0xffd700 }))
rightDorm.position.set(7, 5, -22)
rightDorm.rotation.y = Math.PI / 2
rightDorm.castShadow = true
scene.add(rightDorm)

const gui = new GUI()

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
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
directionalLight.shadow.camera.far = 100
directionalLight.shadow.camera.left = -30
directionalLight.shadow.camera.right = 30
directionalLight.shadow.camera.top = 30
directionalLight.shadow.camera.bottom = -30

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const clock = new THREE.Clock()

function animate() {
  const elapsedTime = clock.getElapsedTime()
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
