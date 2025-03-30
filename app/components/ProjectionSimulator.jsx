// components/ProjectionSimulator.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function ProjectionSimulator({ image }) {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const wallTextureRef = useRef(null)
  
  useEffect(() => {
    // Initialize the Three.js scene
    const initScene = () => {
      if (!containerRef.current) return
      
      // Scene, camera, renderer setup
      const scene = new THREE.Scene()
      sceneRef.current = scene
      scene.background = new THREE.Color(0x111111)
      
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      )
      cameraRef.current = camera
      camera.position.set(0, 1.6, 5)
      
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      containerRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer
      
      // Add orbit controls to navigate the scene
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.screenSpacePanning = false
      controls.minDistance = 3
      controls.maxDistance = 8
      controls.maxPolarAngle = Math.PI / 2
      controlsRef.current = controls
      
      // Add ambient and directional light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 5, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)
      
      // Create room geometry (floor and walls)
      createRoom(scene)
      
      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return
        
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
      
      window.addEventListener('resize', handleResize)
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      
      animate()
      setIsLoading(false)
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize)
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
        rendererRef.current?.dispose()
        controlsRef.current?.dispose()
      }
    }
    
    initScene()
  }, [])
  
  // Update the wall texture when image changes
  useEffect(() => {
    if (!sceneRef.current || !image) return
    
    updateWallTexture(image)
  }, [image])
  
  const createRoom = (scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      roughness: 0.8 
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    
    // Back wall (projection wall)
    const wallGeometry = new THREE.PlaneGeometry(8, 4)
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdddddd,
      roughness: 0.2
    })
    const wall = new THREE.Mesh(wallGeometry, wallMaterial)
    wall.position.set(0, 2, -5)
    wall.receiveShadow = true
    wallTextureRef.current = wall
    scene.add(wall)
    
    // Side walls
    const leftWallGeometry = new THREE.PlaneGeometry(10, 4)
    const leftWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x999999,
      roughness: 0.5
    })
    const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial)
    leftWall.position.set(-5, 2, 0)
    leftWall.rotation.y = Math.PI / 2
    leftWall.receiveShadow = true
    scene.add(leftWall)
    
    const rightWallGeometry = new THREE.PlaneGeometry(10, 4)
    const rightWallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x999999,
      roughness: 0.5
    })
    const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial)
    rightWall.position.set(5, 2, 0)
    rightWall.rotation.y = -Math.PI / 2
    rightWall.receiveShadow = true
    scene.add(rightWall)
  }
  
  const updateWallTexture = (imageUrl) => {
    if (!wallTextureRef.current || !sceneRef.current) return
    
    // Load the texture and apply it to the wall
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        
        // Create a new material with the texture
        const newMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.2
        })
        
        // Apply the material to the wall
        wallTextureRef.current.material = newMaterial
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error)
      }
    )
  }
  
  return (
    <div className="relative w-full h-96 rounded-md overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Loading simulator...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
      {!image && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-400">Generate an image to see it projected</p>
        </div>
