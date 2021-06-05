import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { Object3D } from 'three'

/**
 * Base
 */

const planets = [
    {name: 'mercury', sizeRatio: 100/277, position: 15, rotation: 0.002},
    {name: 'venus', sizeRatio: 100/133, position: 20, rotation: 0.0075},
    {name: 'earth', sizeRatio: 100/103, position: 25, rotation: 0.0065},
    {name: 'mars', sizeRatio: 100/208, position: 30, rotation: 0.0025},
    {name: 'jupiter', sizeRatio: 30/9.68, position: 40, rotation: 0.0055},
    {name: 'saturn', sizeRatio: 30/11.4, position: 50, rotation: 0.004},
    {name: 'uranus', sizeRatio: 30/26.8, position: 60, rotation: 0.006},
    {name: 'neptune', sizeRatio: 30/27.7, position: 70, rotation: 0.003},
]

const orbitRadius = [15, 20, 25, 30, 40, 50, 60, 70]

const orbitsObject3D = []
const planetsObject3D = []

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */

 const loader = new THREE.FontLoader(); 
 let geometry;
 loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
 
    geometry =  new THREE.TextGeometry( 'Three.js Solar System', {
        font: font,
        size: 80,
        height: 20,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    } );
} )

 const textMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshNormalMaterial()
)
scene.add(textMesh)
textMesh.position.y = 20
const textureLoader = new THREE.TextureLoader()

const sun = new THREE.Mesh( 
    new THREE.SphereGeometry( 10, 32, 32 ), 
    new THREE.MeshStandardMaterial(
        {
            map: textureLoader.load('/textures/sun.jpg')
        }
    ));

scene.background = textureLoader.load('/textures/stars.jpg')

const orbitMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

const saturnRing =  new THREE.Mesh(  new THREE.TorusGeometry( 5, 0.05, 16, 100), orbitMaterial );
saturnRing.rotateX( Math.PI/2.5)

const createPlanets = () => {
    
    planets.forEach((planet, index) => {
        const orbitGroup = new THREE.Group()
        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(orbitRadius[index], 0.05, 16, 100),
            orbitMaterial
        )
        
        const texture = textureLoader.load(`/textures/${planet.name}.jpg`)
        const planetObject = new THREE.Mesh( 
            new THREE.SphereGeometry( planet.sizeRatio, 32, 32 ),
            new THREE.MeshStandardMaterial({ map: texture}))

        planetObject.position.x = planet.position

        if(planet.name === 'saturn') {
            saturnRing.position.x = planet.position
            orbitGroup.add(saturnRing)
        }
        orbitGroup.add(orbit, planetObject)

        orbit.rotateZ(Math.PI /2)
        orbit.rotateY(Math.PI/2)
        orbitsObject3D.push(orbitGroup)
        planetsObject3D.push(planetObject)
        scene.add(orbitGroup)
    })
}

createPlanets();


const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light

const hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );

scene.add(sun, ambientLight, hemisphereLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)
// camera.position.y = 15
// camera.position.z = 100
camera.position.set(0, 15, 100)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.zoomSpeed = 0.5

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper)

/**
 * Debug
 */
const gui = new dat.GUI({
    closed: true,
    width: 400
})
// gui.hide()
// gui.add(sun.position, 'y').min(- 3).max(3).step(0.01).name('elevation')
gui.add(camera.position, 'z', -100, 150, 1)
gui.add(camera.position, 'y', -100, 150, 1)
gui.add(camera.position, 'x', -100, 150, 1)

// gui
//     .addColor(parameters, 'color')
//     .onChange(() =>
//     {
//         material.color.set(parameters.color)
//     })

// gui.add(parameters, 'spin')

/**
 * Animate
 */

const tick = () =>
{

    sun.rotation.y += 0.001

    orbitsObject3D.forEach((group, index) => {
        group.rotation.y += planets[index].rotation
    })

    planetsObject3D.forEach((planet, index) => {
        planet.rotation.y += planets[index].rotation
    })
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()