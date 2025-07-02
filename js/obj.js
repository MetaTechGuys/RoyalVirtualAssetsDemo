/**
 * RoyalVirtualAssets 3D Object Visualizer
 * This module creates interactive 3D object models using Three.js
 */

class Object3DVisualizer {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerSelector: options.containerSelector || "#object-3d-container",
      width: options.width || window.innerWidth,
      height: options.height || window.innerHeight,
      backgroundColor: options.backgroundColor || 0x0a0a14,
      apiInstance: options.apiInstance || window.objectApi,
      objectCount: options.objectCount || 8,
      initialObjectCount: options.initialObjectCount || 8, // Load fewer objects initially
      logoSize: options.logoSize || 2.8,
      hoverDuration: options.hoverDuration || 8000,
      autoSelectCentral: options.autoSelectCentral !== false,
    };

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;

    // 3D objects and state
    this.objectModels = [];
    this.customObjects = {};
    this.animationFrame = null;
    this.initialized = false;
    this.hoveredObject = null;
    this.selectedObject = null;
    this.hoverTimer = null;
    this.textureLoader = null;

    // Bind methods
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  /**
   * Initialize the 3D visualizer
   */
  async init() {
    // Create container if it doesn't exist
    if (!document.querySelector(this.config.containerSelector)) {
      const container = document.createElement("div");
      container.id = this.config.containerSelector.replace("#", "");
      document.body.appendChild(container);
    }

    // Set container height
    const container = document.querySelector(this.config.containerSelector);
    container.style.height = `${this.config.height}px`;
    

    // Set up Three.js scene
    this.setupScene();

    // Add event listeners for both mouse and touch
    window.addEventListener("resize", this.onWindowResize);
    
    // Mouse events
    container.addEventListener("mousemove", this.onMouseMove);
    container.addEventListener("click", this.onClick);
    
    // Touch events
    container.addEventListener("touchmove", this.onMouseMove, { passive: false });
    container.addEventListener("touchend", this.onClick, { passive: false });

    // Initialize texture loader
    this.textureLoader = new THREE.TextureLoader();

    // Wait for objectApi to have data
    await this.waitForObjects();

    // Create 3D objects
    this.createCustomObjects();

    // Start animation loop
    this.animate();

    // Hide instructions after 5 seconds
    setTimeout(() => {
      const instructions = document.querySelector(".object-3d-instructions");
      if (instructions) {
        instructions.classList.add("fade");
      }
    }, 8000);

    // Hide zoom instruction after 8 seconds
    setTimeout(() => {
      const zoomInstruction = document.querySelector(".object-3d-zoom-instruction");
      if (zoomInstruction) {
        zoomInstruction.classList.add("fade-out");
      }
    }, 8000);

    this.initialized = true;

    // Explicitly remove loading spinner after initialization
    this.removeLoadingSpinner();

    return true;
  }

  
  /**
   * Clean up resources when the visualizer is no longer needed
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Clear any hover timer
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // Remove event listeners
    window.removeEventListener("resize", this.onWindowResize);
    const container = document.querySelector(this.config.containerSelector);
    if (container) {
      // Mouse events
      container.removeEventListener("mousemove", this.onMouseMove);
      container.removeEventListener("click", this.onClick);
      
      // Touch events
      container.removeEventListener("touchmove", this.onMouseMove);
      container.removeEventListener("touchend", this.onClick);

      // Remove wheel handler
      if (this.wheelHandler) {
        container.removeEventListener("wheel", this.wheelHandler);
      }
      
      // Remove touch handlers
      if (this.touchHandlers) {
        container.removeEventListener("touchstart", this.touchHandlers.touchstart);
        container.removeEventListener("touchmove", this.touchHandlers.touchmove);
        container.removeEventListener("touchend", this.touchHandlers.touchend);
      }

      // Remove Three.js canvas
      const canvas = container.querySelector("canvas");
      if (canvas) {
        container.removeChild(canvas);
      }

      // Remove info panel
      const infoPanel = document.getElementById("object-3d-info");
      if (infoPanel) {
        container.removeChild(infoPanel);
      }
    }

    // Dispose of all geometries and materials
    this.objectModels.forEach((obj) => {
      this.disposeObject(obj);
    });

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.objectModels = [];
    this.hoveredObject = null;
    this.selectedObject = null;
    this.initialized = false;
  }

  /**
   * Recursively dispose of an object and its children
   */
  disposeObject(object) {
    if (object.children) {
      const children = [...object.children];
      for (const child of children) {
        this.disposeObject(child);
      }
    }

    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          this.disposeMaterial(material);
        });
      } else {
        this.disposeMaterial(object.material);
      }
    }

    if (object.parent) {
      object.parent.remove(object);
    }
  }

  /**
   * Dispose of a material and its textures
   */
  disposeMaterial(material) {
    for (const prop in material) {
      const value = material[prop];
      if (value && typeof value === "object" && "isTexture" in value) {
        value.dispose();
      }
    }
    material.dispose();
  }

  /**
   * Remove the loading spinner
   */
  removeLoadingSpinner() {
    const loadingIndicator = document.querySelector(".object-3d-loading");
    if (loadingIndicator) {
      gsap.to(loadingIndicator, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          if (loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
          }
        },
      });
    }
  }

  /**
   * Wait for objectApi to have data available
   */
  async waitForObjects() {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (
        this.config.apiInstance &&
        this.config.apiInstance.objects &&
        this.config.apiInstance.objects.length > 0
      ) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      attempts++;
    }

    return false;
  }

  /**
   * Set up the Three.js scene, camera, and renderer
   */
 setupScene() {
  const container = document.querySelector(this.config.containerSelector);

  // Create scene
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(this.config.backgroundColor);

  // Add fog for depth
  this.scene.fog = new THREE.FogExp2(this.config.backgroundColor, 0.008);

  // Create camera with better positioning for orbital view
  this.camera = new THREE.PerspectiveCamera(
    88,
    this.config.width / this.config.height,
    0.2,
    1000
  );
  // Position camera to get a good view of the orbital system
  this.camera.position.z = 88;
  this.camera.position.y = 48;
  this.camera.position.x = 88;
  this.camera.lookAt(0, 0, 0);

  // Create renderer
  this.renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" 
  });
  this.renderer.setSize(this.config.width, this.config.height);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(this.renderer.domElement);

  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  this.scene.add(ambientLight);

  // Add directional light focused on the center
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 14, 10);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.8;
  directionalLight.shadow.camera.far = 48;
  directionalLight.shadow.camera.left = -40;
  directionalLight.shadow.camera.right = 40;
  directionalLight.shadow.camera.top = 40;
  directionalLight.shadow.camera.bottom = -40;
 this.scene.add(directionalLight);

  // Add point lights in a circle around the orbital system
  const colors = [0x3498db, 0xe74c3c, 0xf39c12, 0x2ecc71, 0x9b59b6, 0xe67e22,0x3498db, 0xe74c3c, 0xf39c12, 0x2ecc71, 0x9b59b6, 0xe67e22];
  for (let i = 0; i < 8; i++) {
    const pointLight = new THREE.PointLight(
      colors[i % colors.length],
      0.2,
      80
    );
    const angle = (i / 12) * Math.PI * 2;
    const radius = 48;
    pointLight.position.set(
      Math.cos(angle) * radius,
      14,
      Math.sin(angle) * radius
    );
    this.scene.add(pointLight);
  }

  // Add a central spotlight for the main object
    const centralSpotlight = new THREE.SpotLight(0xffffff, 1.4, 100, Math.PI / 8, 0.2);
  centralSpotlight.position.set(0, 30, 0);
  centralSpotlight.target.position.set(0, 0, 0);
  centralSpotlight.castShadow = true;
  this.scene.add(centralSpotlight);


  // Setup raycaster for mouse interaction
  this.raycaster = new THREE.Raycaster();
  this.mouse = new THREE.Vector2();

  // Add orbit controls if Three.OrbitControls is available
  if (typeof THREE.OrbitControls !== "undefined") {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    
    // Enhanced controls for orbital system viewing
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 40;
    this.controls.maxDistance = 120;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.4; // Slightly faster to complement the orbital motion

    // Enable rotation and panning
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 1.0;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.8;
    this.controls.keyPanSpeed = 8.0;
    
    // Touch-specific settings
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    
    // Mouse button settings
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };

    // Disable zoom via mouse wheel in OrbitControls
    this.controls.enableZoom = false;

    // Add our own wheel zoom handler
    this.addWheelZoomHandler();
    
    // Add touch zoom handler for mobile devices
    this.addTouchZoomHandler();
  }

}



  /**
   * Add custom wheel event handler for zooming
   */
 addWheelZoomHandler() {
  const container = document.querySelector(this.config.containerSelector);

  // Define min and max zoom values for orbital system
  const minZoom = 28; // Minimum FOV (maximum zoom in)
  const maxZoom = 88; // Maximum FOV (maximum zoom out)

  // Set initial FOV
  this.camera.fov = 60;
  this.camera.updateProjectionMatrix();

  // Add wheel event listener
  const handleWheel = (event) => {
    const delta = event.deltaY;
    const scrollingDown = delta > 0;
    const scrollingUp = delta < 0;

    const isAtPageTop = window.scrollY <= 0;
    const isAtMaxZoomOut = this.camera.fov >= maxZoom;

    // CASE 1: Scrolling down and at max zoom out - let page scroll
    if (scrollingDown && isAtMaxZoomOut) {
      return;
    }

    // CASE 2: Scrolling up and NOT at the top of the page - let page scroll
    if (scrollingUp && !isAtPageTop) {
      return;
    }

    // In all other cases, handle the zoom in the 3D visualization
    event.preventDefault();

    // Get current FOV
    let fov = this.camera.fov;

    // Calculate new FOV
    if (scrollingDown) {
      fov = Math.min(fov + 4, maxZoom); // Slightly faster zoom for orbital system
      if (fov === maxZoom) {
        this.showZoomIndicator("Maximum zoom out reached - scrolling page");
      }
    } else {
      fov = Math.max(fov - 4, minZoom);
      if (fov === minZoom) {
        this.showZoomIndicator("Maximum zoom in reached");
      }
    }

    // Update camera FOV
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();

    // Show zoom level indicator
    const zoomPercentage = Math.round(
      ((maxZoom - fov) / (maxZoom - minZoom)) * 100
    );
    this.showZoomLevel(zoomPercentage);
  };

  container.addEventListener("wheel", handleWheel, { passive: false });
  this.wheelHandler = handleWheel;
}


  /**
   * Show zoom indicator message
   */
  showZoomIndicator(message) {
    let indicator = document.querySelector(".object-3d-zoom-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "object-3d-zoom-indicator";
      document
        .querySelector(this.config.containerSelector)
        .appendChild(indicator);
    }

    indicator.textContent = message;
    indicator.classList.add("show");

    clearTimeout(this.indicatorTimeout);
    this.indicatorTimeout = setTimeout(() => {
      indicator.classList.remove("show");
    }, 2000);
  }

  /**
   * Add touch zoom handler for mobile devices
   */
  addTouchZoomHandler() {
    const container = document.querySelector(this.config.containerSelector);
    
    let initialDistance = 0;
    let currentDistance = 0;
    let isZooming = false;
    
    const minZoom = 20;
    const maxZoom = 80;

    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
        isZooming = true;
        
        if (this.controls) {
          this.controls.autoRotate = false;
        }
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 2 && isZooming) {
        event.preventDefault();
        
        currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        const deltaDistance = currentDistance - initialDistance;
        
        const zoomFactor = deltaDistance * 0.01;
        
        let fov = this.camera.fov;
        
        fov = Math.max(minZoom, Math.min(maxZoom, fov - zoomFactor));
        
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        
        const zoomPercentage = Math.round(
          ((maxZoom - fov) / (maxZoom - minZoom)) * 100
        );
        this.showZoomLevel(zoomPercentage);
        
        initialDistance = currentDistance;
      }
    };

    const handleTouchEnd = (event) => {
      if (event.touches.length < 2) {
        isZooming = false;
        
        setTimeout(() => {
          if (this.controls) {
            this.controls.autoRotate = true;
          }
        }, 2000);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    this.touchHandlers = {
      touchstart: handleTouchStart,
      touchmove: handleTouchMove,
      touchend: handleTouchEnd
    };
  }

  /**
   * Show zoom level percentage
   */
  showZoomLevel(percentage) {
    let zoomLevel = document.querySelector(".object-3d-zoom-level");
    if (!zoomLevel) {
      zoomLevel = document.createElement("div");
      zoomLevel.className = "object-3d-zoom-level";
      document
        .querySelector(this.config.containerSelector)
        .appendChild(zoomLevel);
    }

    const isMobile = window.innerWidth <= 992;
    const zoomText = isMobile ? `Zoom: ${percentage}%` : `Zoom: ${percentage}%`;
    zoomLevel.textContent = zoomText;
    zoomLevel.classList.add("show");

    clearTimeout(this.zoomLevelTimeout);
    this.zoomLevelTimeout = setTimeout(() => {
      zoomLevel.classList.remove("show");
    }, 1000);
  }

  /**
 * Create 3D objects for custom objects with central object and orbiting satellites
 */
createCustomObjects() {
  if (!this.config.apiInstance || !this.config.apiInstance.objects) {
    return;
  }

  // Clear existing objects
  this.objectModels.forEach((obj) => this.scene.remove(obj));
  this.objectModels = [];

  // Get custom objects
  const objects =
    this.config.objectCount > 0
      ? this.config.apiInstance.objects.slice(0, this.config.objectCount)
      : this.config.apiInstance.objects;

  if (objects.length === 0) return;


  // Load central object and initial batch immediately
  const centralObject = objects[0];
  this.createCentralObject(centralObject);


  // Create orbiting objects (remaining objects)
  const orbitingObjects = objects.slice(1);
  this.createOrbitingObjects(orbitingObjects);

  // Remove loading spinner
  this.removeLoadingSpinner();
}

/**
 * Create the central stationary object
 */
createCentralObject(centralObj) {
  // Create a larger circular geometry for the central object
  const geometry = new THREE.CircleGeometry(this.config.logoSize * 0.8, 32);

  // Define image file path
  const imagePath = `assets/object-images/700.webp`;

  // Create a material with enhanced properties for the central object
  const material = new THREE.MeshPhysicalMaterial({
    map: null,
    transparent: false,
    roughness: 0.4,
    metalness: 0.48,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    emissive: new THREE.Color(0x222244),
    emissiveIntensity: 0.8,
  });

  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Try to load image as texture
  this.textureLoader.load(
  imagePath,
  (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    material.map = texture;
    material.needsUpdate = true;
  },
  undefined,
  (error) => {
    this.createFallbackTexture(centralObj, material, 0);
  }
);

  // Position at center
  mesh.position.set(0, 0, 0);

  // Make it face the camera
  mesh.lookAt(this.camera.position);

  // Scale it larger than other objects
  const centralScale = 4.0; // Make it twice as large
  mesh.scale.set(centralScale, centralScale, centralScale);

  // Store object data
  mesh.userData = {
    customObject: centralObj,
    originalScale: mesh.scale.clone(),
    originalPosition: mesh.position.clone(),
    isCentral: true,
    isSelected: false,
    selectionTime: 0,
  };

  // Add to scene and store reference
  this.scene.add(mesh);
  this.objectModels.push(mesh);

  // Add enhanced glow effect for central object
  this.addCentralGlowEffect(mesh, centralObj);
  // this.addEnhancedCentralAnimation(mesh);
  
  // Add attention-grabbing spotlight that follows the central object
  this.addDynamicSpotlight(mesh);
  
  // Add floating animation
  this.addFloatingAnimation(mesh);
  
  // Add pulsing animation to the central object
  this.addPulsingAnimation(mesh);
}

/**
 * Add pulsing animation to the central object
 */
addPulsingAnimation(mesh) {
  if (window.gsap) {
    // Store the original scale for reference
    const originalScale = mesh.userData.originalScale;
    
    // Create a pulsing scale animation
    const pulseTimeline = gsap.timeline({ repeat: -1 });
    
    pulseTimeline
      .to(mesh.scale, {
        x: originalScale.x * 1.12,
        y: originalScale.y * 1.12,
        z: originalScale.z * 1.12,
        duration: 1.4,
        ease: "sine.inOut"
      })
      .to(mesh.scale, {
        x: originalScale.x * 0.88,
        y: originalScale.y * 0.88,
        z: originalScale.z * 0.88,
        duration: 1.2,
        ease: "sine.inOut"
      })
      .to(mesh.scale, {
        x: originalScale.x,
        y: originalScale.y,
        z: originalScale.z,
        duration: 1.2,
        ease: "sine.inOut"
      });

    // Add emissive intensity pulsing that syncs with scale
    if (mesh.material && mesh.material.emissive) {
      const emissivePulse = gsap.timeline({ repeat: -1 });
      
      emissivePulse
        .to(mesh.material, {
          emissiveIntensity: 1.12,
          duration: 1.4,
          ease: "sine.inOut"
        })
        .to(mesh.material, {
          emissiveIntensity: 0.6,
          duration: 1.2,
          ease: "sine.inOut"
        })
        .to(mesh.material, {
          emissiveIntensity: 0.8,
          duration: 1.0,
          ease: "sine.inOut"
        });
    }

    // Add glow mesh pulsing if it exists
    if (mesh.userData.glowMeshes) {
      mesh.userData.glowMeshes.forEach((glowMesh, index) => {
        const glowPulse = gsap.timeline({ repeat: -1, delay: index * 0.1 });
        
        glowPulse
          .to(glowMesh.scale, {
            x: 1.2,
            y: 1.2,
            z: 1.2,
            duration: 1.4,
            ease: "sine.inOut"
          })
          .to(glowMesh.scale, {
            x: 0.8,
            y: 0.8,
            z: 0.8,
            duration: 1.2,
            ease: "sine.inOut"
          })
          .to(glowMesh.scale, {
            x: 1.0,
            y: 1.0,
            z: 1.0,
            duration: 1.0,
            ease: "sine.inOut"
          });

        // Pulse the glow opacity as well
        const glowOpacityPulse = gsap.timeline({ repeat: -1, delay: index * 0.1 });
        const originalOpacity = glowMesh.material.opacity;
        
        glowOpacityPulse
          .to(glowMesh.material, {
            opacity: originalOpacity * 1.2,
            duration: 1.4,
            ease: "sine.inOut"
          })
          .to(glowMesh.material, {
            opacity: originalOpacity * 0.8,
            duration: 1.2,
            ease: "sine.inOut"
          })
          .to(glowMesh.material, {
            opacity: originalOpacity,
            duration: 1.0,
            ease: "sine.inOut"
          });
      });
    }

    // Store animation references for cleanup if needed
    mesh.userData.pulseAnimation = pulseTimeline;
  }
}


/**
 * Add dynamic spotlight that follows the central object
 */
addDynamicSpotlight(mesh) {
  const spotlight = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 4, 0.4);
  spotlight.position.set(0, 20, 10);
  spotlight.target = mesh;
  spotlight.castShadow = true;
  
  this.scene.add(spotlight);
  this.scene.add(spotlight.target);

  if (window.gsap) {
    // Create circular motion using trigonometry instead of motionPath
    const radius = 15;
    const centerY = 20;
    
    gsap.to({}, {
      duration: 12,
      repeat: -1,
      ease: "none",
      onUpdate: function() {
        const progress = this.progress();
        const angle = progress * Math.PI * 2;
        
        spotlight.position.x = Math.cos(angle) * radius;
        spotlight.position.y = centerY + Math.sin(angle * 2) * 5;
        spotlight.position.z = Math.sin(angle) * radius + 10;
      }
    });

    // Pulsing intensity
    gsap.to(spotlight, {
      intensity: 3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  mesh.userData.dynamicSpotlight = spotlight;
}
/**
 * Create orbiting objects around the central object
 */
createOrbitingObjects(orbitingObjects) {
  const baseOrbitRadius = 18; // Base distance from center
  
  orbitingObjects.forEach((customObj, index) => {
    // Create different orbital distances (like planets)
    const orbitLevel = Math.floor(index / 1) + 1; // Group objects in orbital rings
    const orbitRadius = baseOrbitRadius + (orbitLevel * 15); // Increasing distances
    const objectsInThisOrbit = orbitingObjects.filter((_, i) => Math.floor(i / 3) === Math.floor(index / 3));
    const angleStep = (2 * Math.PI) / objectsInThisOrbit.length;
    const positionInOrbit = index % 2;
    
    // Create a circular geometry for the orbiting object
    const geometry = new THREE.CircleGeometry(this.config.logoSize / 2, 32);

    // Define image file path
    const imagePath = `assets/object-images/${customObj.name.toLowerCase().replace(/\s+/g, '-')}.webp`;

    // Create a material
    const material = new THREE.MeshPhysicalMaterial({
      map: null,
      transparent: true,
      roughness: 0.4,
      metalness: 0.48,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      emissive: new THREE.Color(0x111122),
      emissiveIntensity: 0.2,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Try to load image as texture
    this.textureLoader.load(
      imagePath,
      (texture) => {
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => {
        this.createFallbackTexture(customObj, material, index + 1);
      }
    );

    // Calculate initial position on orbit
    const angle = positionInOrbit * angleStep + (orbitLevel * 0.5);
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    const y = Math.sin(angle * 2) * 0; // Add some vertical variation

     mesh.position.set(x, y, z);

    // Make it face the camera
    mesh.lookAt(this.camera.position);

    // Different sizes based on orbit distance (closer = larger, like perspective)
    const scale = Math.max(0.8, 2.8 - (orbitLevel * 0.08));
    mesh.scale.set(scale, scale, scale);

    // Store object data with enhanced orbit information
    mesh.userData = {
      customObject: customObj,
      originalScale: mesh.scale.clone(),
      originalPosition: mesh.position.clone(),
      isCentral: false,
      isOrbiting: true,
      orbitRadius: orbitRadius,
      orbitSpeed: this.calculateOrbitSpeed(orbitRadius),
      orbitAngle: angle,
      orbitHeight: y,
      orbitLevel: orbitLevel,
      isSelected: false,
      selectionTime: 0,
      orbitDirection: Math.random() > 0.4 ? 1 : -1,
      orbitInclination: (Math.random() - 0.4) * 0.2,
      verticalOffset: Math.sin(angle * 2) * 4,
      rotationSpeed: {
        x: (Math.random() - 0.4) * 0.02,
        y: (Math.random() - 0.4) * 0.02,
        z: (Math.random() - 0.4) * 0.02
      }
    };

    // Add to scene and store reference
    this.scene.add(mesh);
    this.objectModels.push(mesh);

    // Add glow effect
    this.addGlowEffect(mesh, customObj);
  });

  // Add subtle floating animation
    // this.addSubtleFloatingAnimation(mesh, index);

  // Add orbital rings visualization
  this.addMultipleOrbitPaths();
}


calculateOrbitSpeed(orbitRadius) {
  // Kepler's laws: closer objects orbit faster
  const baseSpeed = 0.008;
  const speedFactor = Math.sqrt(24 / orbitRadius); // Square root relationship
  return baseSpeed * speedFactor;
}

/**
 * Add multiple orbital path visualizations
 */
addMultipleOrbitPaths() {
  const baseRadius = 18;
  const maxOrbits = 8; // Show up to 4 orbital rings
  
  this.orbitPaths = [];
  this.orbitPathPoints = [];
  
  for (let i = 1; i <= maxOrbits; i++) {
    const orbitRadius = baseRadius + (i * 8.8);
    const points = [];
    const segments = 128;

    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      const y = Math.sin(angle * 4) * 1.4; // Add some wave to the orbit
      
      points.push(new THREE.Vector3(x, y, z));
    }

    this.orbitPathPoints[i] = points;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(0.6, 0.8, 0.6),
      // color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.8, 0.6),
      transparent: true,
      opacity: 0.4 - (i * 0.04),
      depthTest: true,    // Enable depth testing
      depthWrite: false   // Don't write to depth buffer
    });

    const orbitLine = new THREE.Line(geometry, material);
    // Set render order - lower numbers render first (behind)
    orbitLine.renderOrder = -1;

    this.scene.add(orbitLine);
    this.orbitPaths.push(orbitLine);

    if (window.gsap) {
      gsap.to(material, {
        opacity: (0.8 - (i * 0.08)) * 1.4,
        duration: 2 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }
}

/**
 * Add enhanced glow effect for the central object
 */
addCentralGlowEffect(mesh, customObj) {
  // Create multiple glow layers for enhanced effect
  const glowLayers = [
    { size: 0.8, opacity: 0.8, color: 0x4CAF50, animation: { duration: 1.8, intensity: 1.4 } },
    { size: 1.2, opacity: 0.4, color: 0x2196F3, animation: { duration: 2.0, intensity: 0.8 } },
  ];

  glowLayers.forEach((layer, index) => {
    const glowGeometry = new THREE.CircleGeometry(
      (this.config.logoSize * 0.8) * layer.size,
      48
    );

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: layer.color,
      transparent: true,
      opacity: layer.opacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.2 - (index * 0.04);
    glowMesh.rotation.x = Math.PI / 1;
    mesh.add(glowMesh);

    // Store reference to glow meshes
    if (!mesh.userData.glowMeshes) {
      mesh.userData.glowMeshes = [];
    }
    mesh.userData.glowMeshes.push(glowMesh);

    // Add pulsing animation with staggered timing
    if (window.gsap) {
      gsap.to(glowMaterial, {
        opacity: layer.opacity * layer.animation.intensity,
        duration: layer.animation.duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2, // Stagger the animations
      });

      // Add rotation animation with different speeds for each layer
      gsap.to(glowMesh.rotation, {
        z: Math.PI * 4 * (index % 2 === 0 ? 1 : -1), // Alternate directions
        duration: 8 + index * 2,
        repeat: -1,
        ease: "none",
      });

      // Add scale pulsing for outer layers
      if (index >= 4) {
        gsap.to(glowMesh.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 4 + index,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }
  });

}
  /**
   * Create a fallback texture when image loading fails
   */
createFallbackTexture(customObj, material, index) {
  // Create a canvas for the texture
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 256;

  // Different colors for central vs orbiting objects
  const isCentral = index === 0;
  const backgroundColor = isCentral 
    ? this.getColorForObject(customObj.name, index, true)
    : this.getColorForObject(customObj.name, index, false);

  // Draw background
  context.fillStyle = backgroundColor;
  context.beginPath();
  context.arc(128, 128, 128, 0, 2 * Math.PI);
  context.fill();

  // Add border for central object
  if (isCentral) {
    context.strokeStyle = "#FFD700";
    context.lineWidth = 8;
    context.stroke();
  }



  // Draw text
  context.fillStyle = "white";
  context.font = isCentral ? "bold 120px Arial" : "bold 100px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(0,0,0,0.5)";
  context.shadowBlur = 10;
  context.shadowOffsetX = 4;
  context.shadowOffsetY = 4;
  
  // Use first letter of name or a symbol
  const displayText = customObj.name.charAt(0).toUpperCase();
  context.fillText(displayText, 128, 128);

  // Apply as texture
  const fallbackTexture = new THREE.CanvasTexture(canvas);
  fallbackTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
  material.map = fallbackTexture;
  material.needsUpdate = true;
}

/**
 * Get color for custom objects
 */
getColorForObject(name, index, isCentral = false) {
  // Special colors for central object
  if (isCentral) {
    return "#1e88e5";
  }

  // Predefined colors for different categories
  const categoryColors = {
    tokenisation: "#2a2b41",
    wallet: "#2a2b41",
    trade: "#2a2b41",
    coin: "#2a2b41",
    dex: "#2a2b41",
    swap: "#2a2b41",
    ido: "#2a2b41",
    ico: "#2a2b41"
  };

  // Try to match category
  const nameLower = name.toLowerCase();
  for (const [category, color] of Object.entries(categoryColors)) {
    if (nameLower.includes(category)) {
      return color;
    }
  }

  // Generate color based on index if no category match
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 80%, 48%)`;
}


addPostProcessingEffects() {
  // This would require additional libraries like THREE.EffectComposer
  // For now, we'll enhance the existing renderer settings
  
  // Enable additional renderer features
  this.renderer.physicallyCorrectLights = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  this.renderer.shadowMap.autoUpdate = true;
  
  // Add bloom effect simulation through materials
  this.objectModels.forEach(obj => {
    if (obj.material && obj.material.emissive) {
      obj.material.emissiveIntensity = 0.3;
    }
  });
}
  /**
   * Add a subtle glow effect to the object
   */
  addGlowEffect(mesh, customObj) {

    const baseColor = new THREE.Color(
    this.getColorForObject(customObj.name, customObj.priority || 0)
  );
  
    // Create a slightly larger circle behind the object for the glow effect
    const glowGeometry = new THREE.CircleGeometry(
      (this.config.logoSize / 2) * 1.2,
      32
    );

    // Use the object's color for the glow
    const color = new THREE.Color(
      this.getColorForObject(customObj.name, customObj.priority || 0)
    );

    // Create a material that will emit light
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.1; // Position slightly behind the object
    mesh.add(glowMesh);

    // Store reference to glow mesh
    mesh.userData.glowMesh = glowMesh;

    // Add subtle pulsing animation to the glow
    const pulseIntensity = 0.2 + Math.random() * 0.2;
    const pulseDuration = 0.8 + Math.random() * 0.8;

    if (window.gsap) {
    const timeline = gsap.timeline({ repeat: -1 });
    
    timeline.to(glowMaterial, {
      opacity: 0.4,
      duration: 1.4,
      ease: "sine.inOut",
    }).to(glowMaterial, {
      opacity: 0.2,
      duration: 1.4,
      ease: "sine.inOut",
    });

    // Add color shifting
    gsap.to(glowMaterial.color, {
      r: baseColor.r * 1.2,
      g: baseColor.g * 1.2,
      b: baseColor.b * 1.2,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    }
    
  }


addFloatingAnimation(mesh) {
  if (window.gsap) {
    // 1. Magnetic floating motion (up and down)
    gsap.to(mesh.position, {
      y: mesh.position.y + 3,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // 2. Gentle rotation on Y-axis (spinning)
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 15,
      repeat: -1,
      ease: "none",
    });

    // 3. Subtle rotation on Z-axis for wobble effect
    gsap.to(mesh.rotation, {
      z: Math.PI * 0.1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // 4. Breathing scale animation
    gsap.to(mesh.scale, {
      x: mesh.scale.x * 1.1,
      y: mesh.scale.y * 1.1,
      z: mesh.scale.z * 1.1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    // 5. Material emissive intensity pulsing
    if (mesh.material && mesh.material.emissive) {
      gsap.to(mesh.material, {
        emissiveIntensity: 1.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // 6. Add orbital motion around its own center
    const orbitRadius = 1.5;
    let orbitAngle = 0;
    
    gsap.to({ angle: 0 }, {
      angle: Math.PI * 2,
      duration: 20,
      repeat: -1,
      ease: "none",
      onUpdate: function() {
        orbitAngle = this.targets()[0].angle;
        const offsetX = Math.cos(orbitAngle) * orbitRadius;
        const offsetZ = Math.sin(orbitAngle) * orbitRadius;
        
        // Apply orbital offset to the base position
        mesh.position.x = offsetX;
        mesh.position.z = offsetZ;
      }
    });
  }
}


addSubtleFloatingAnimation(mesh, index) {
  if (window.gsap) {
    const delay = index * 0.2; // Stagger animations
    
    // Store original position for reference
    if (!mesh.userData.originalFloatingPosition) {
      mesh.userData.originalFloatingPosition = mesh.position.clone();
    }
    
    // Subtle vertical floating (relative to current position)
    gsap.to(mesh.userData, {
      floatingOffset: 1,
      duration: 2 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay,
      onUpdate: () => {
        // Apply floating offset to the orbital position
        if (mesh.userData.isOrbiting && !mesh.userData.isSelected && mesh !== this.hoveredObject) {
          // The orbital position will be calculated in animate(), 
          // and we'll add the floating offset there
        }
      }
    });

    // Gentle rotation on multiple axes
    gsap.to(mesh.rotation, {
      x: mesh.rotation.x + Math.PI * 2,
      duration: 15 + Math.random() * 10,
      repeat: -1,
      ease: "none",
      delay: delay,
    });

    gsap.to(mesh.rotation, {
      z: mesh.rotation.z + Math.PI,
      duration: 12 + Math.random() * 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: delay,
    });

    // Initialize floating offset
    mesh.userData.floatingOffset = 0;
  }
}

/**
 * Create typewriter effect for text with cursor that moves with typing
 */
typewriterEffect(element, text, speed = 40) {
  return new Promise((resolve) => {
    // Clear the element and prepare for typing
    element.innerHTML = '';
    
    // Create text span and cursor span
    const textSpan = document.createElement('span');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    
    // Add both spans to the element
    element.appendChild(textSpan);
    element.appendChild(cursorSpan);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        // Add the next character
        textSpan.textContent += text.charAt(i);
        i++;
      } else {
        // Typing complete
        clearInterval(timer);
        
        // Keep cursor visible for a moment, then hide it
        setTimeout(() => {
          cursorSpan.classList.add('hidden');
          resolve();
        }, 1400);
      }
    }, speed);
    
    // Store timer reference for cleanup if needed
    element._typewriterTimer = timer;
  });
}

/**
 * Stop any ongoing typewriter effect
 */
stopTypewriterEffect(element) {
  if (element._typewriterTimer) {
    clearInterval(element._typewriterTimer);
    element._typewriterTimer = null;
  }
  
  // Remove cursor if it exists
  const cursor = element.querySelector('.typewriter-cursor');
  if (cursor) {
    cursor.remove();
  }
}

/**
 * Truncate text to fit within description area
 */
truncateDescription(text, maxLength = 200) {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) { // Only use last space if it's not too early
    return text.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}



  /**
   * Handle mouse movement for object interaction
   */
  onMouseMove(event) {
    const container = document.querySelector(this.config.containerSelector);
    const rect = container.getBoundingClientRect();

    let clientX, clientY;
    
    if (event.type === 'touchmove' && event.touches.length === 1) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.type === 'mousemove') {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return;
    }

    this.mouse.x = ((clientX - rect.left) / this.config.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / this.config.height) * 2 + 1;
  }

  /**
   * Handle click events for object selection
   */
  onClick(event) {
    let clientX, clientY;
    
    if (event.type === 'touchend' && event.changedTouches.length === 1) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
      
      const container = document.querySelector(this.config.containerSelector);
      const rect = container.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / this.config.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / this.config.height) * 2 + 1;
    } else if (event.type === 'click') {
      // Regular mouse click
    } else {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    const objectIntersects = intersects.filter((intersect) => {
      const rootObject = this.getRootObject(intersect.object);
      return this.objectModels.includes(rootObject);
    });

    if (objectIntersects.length > 0) {
      const rootObject = this.getRootObject(objectIntersects[0].object);

      if (this.selectedObject === rootObject) {
        this.deselectObject(rootObject);
      } else {
        if (this.selectedObject) {
          this.deselectObject(this.selectedObject);
        }
        this.selectObject(rootObject);
      }

      // If there's a different selected object, deselect it first
    if (this.selectedObject && this.selectedObject !== rootObject) {
      this.deselectObject(this.selectedObject);
    }

      if (this.controls) {
        event.stopPropagation();
      }
    } else if (this.selectedObject) {
      this.deselectObject(this.selectedObject);
    }
  }

  /**
   * Select an object and maintain hover effect
   */
  selectObject(object) {
    // Clear any existing hover timer
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // STOP ALL GSAP ANIMATIONS for this object
  gsap.killTweensOf(object.position);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.userData);

     // Store current position as selected position for orbiting objects
  if (object.userData.isOrbiting) {
    object.userData.selectedPosition = object.position.clone();
  }

    // Apply hover effect
    this.onObjectHover(object);

    // Mark as selected
    object.userData.isSelected = true;
    this.selectedObject = object;


    // Add enhanced selection effects
  const scaleMultiplier = object.userData.isCentral ? 1.4 : 1.8;
    // Add pulsing effect to the selected object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.4,
      y: object.userData.originalScale.y * 1.4,
      z: object.userData.originalScale.z * 1.4,
      duration: 2,
      ease: "elastic.out(1, 0.4)",
      yoyo: true,
      repeat: 2,
    });
    
      // Show object info ONLY on selection
  const customObj = object.userData.customObject;
  this.showObjectInfo(customObj);

    // Update instructions
    if (instructions) {
      instructions.classList.remove("fade");

      setTimeout(() => {
        instructions.classList.add("fade");
      }, 14000);
    }
  }

  /**
   * Deselect an object and remove hover effect
   */
  deselectObject(object) {
  if (this.hoverTimer) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = null;
  }

  object.userData.isSelected = false;
  
  // Clear the selected position so object can resume orbiting
  if (object.userData.selectedPosition) {
    object.userData.selectedPosition = null;
  }
  
  // Only clear selectedObject if this is the currently selected object
  if (this.selectedObject === object) {
    this.selectedObject = null;
    this.hideObjectInfo();
  }

  this.onObjectLeave(object);

  if (object.userData.highlightMesh) {
    object.remove(object.userData.highlightMesh);
    object.userData.highlightMesh = null;
  }
}

  /**
   * Handle object hover
   */
  onObjectHover(object) {
    if (object.userData.isSelected) return;

    // Provide haptic feedback on mobile devices
    if ('vibrate' in navigator && window.innerWidth <= 992) {
      navigator.vibrate(20);
    }

    // Scale up the object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.4,
      y: object.userData.originalScale.y * 1.4,
      z: object.userData.originalScale.z * 1.4,
      duration: 2,
      ease: "back.out",
    });

    // Move object slightly forward
    gsap.to(object.position, {
      y: object.position.y + 2,
      duration: 4,
      ease: "power2.out",
    });

  }

  /**
   * Handle object leave
   */
onObjectLeave(object) {
  if (object.userData.isSelected) return;

  // Scale back to original size
  gsap.to(object.scale, {
    x: object.userData.originalScale.x,
    y: object.userData.originalScale.y,
    z: object.userData.originalScale.z,
    duration: 0.4,
    ease: "elastic.out(1, 0.4)",
  });

  // Move back to original position
  gsap.to(object.position, {
    y: object.userData.originalPosition.y,
    duration: 0.4,
    ease: "power2.out",
  });

  // Reset rotation
  gsap.to(object.rotation, {
    y: 0,
    duration: 0.4,
    ease: "power2.out",
  });

  // Reset glow effect
  if (object.userData.glowMesh) {
    gsap.to(object.userData.glowMesh.material, {
      opacity: 0.4,
      duration: 0.4,
      ease: "power2.out",
    });
  }

}

/**
 * Show custom object information with typewriter effect
 */
async showObjectInfo(customObj) {
  // Find or create info panel
  let infoPanel = document.getElementById("object-3d-info");
  if (!infoPanel) {
    infoPanel = document.createElement("div");
    infoPanel.id = "object-3d-info";
    infoPanel.className = "object-3d-info";
    document
      .querySelector(this.config.containerSelector)
      .appendChild(infoPanel);
  }

  // Check if mobile device
  const isMobile = window.innerWidth <= 992;

  // Determine if this is the central object
  const isCentral = this.objectModels.find(obj => 
    obj.userData.customObject === customObj && obj.userData.isCentral
  );

  // Add special styling for central object
  const centralClass = isCentral ? " central-object" : "";
  const centralIcon = isCentral ? "" : "";

  // Truncate description to ensure consistent sizing
  const maxDescLength = isMobile ? 140 : 200;
  const truncatedDescription = this.truncateDescription(
    customObj.description || 'No description available.', 
    maxDescLength
  );

  // Update info panel content with responsive design
  if (isMobile) {
    infoPanel.innerHTML = `
      <div class="object-3d-info-header${centralClass}">
        <img src="${customObj.image}" alt="${customObj.name}" width="28" height="28" onerror="this.style.display='none'">
        <h2>${centralIcon}${customObj.name}${isCentral ? '' : ''}</h2>
      </div>
      <div class="object-3d-info-description">
        <p class="description-text"></p>
      </div>
      <div class="object-3d-info-actions">
        <button class="action-button details-button" data-object="${customObj.id || customObj.name}">View Details</button>
        ${customObj.actionUrl ? `<button class="action-button action-url-button" data-url="${customObj.actionUrl}">Open</button>` : ''}
      </div>
    `;
  } else {
    // Desktop layout
    infoPanel.innerHTML = `
      <div class="object-3d-info-header${centralClass}">
        <img src="${customObj.image}" alt="${customObj.name}" width="32" height="32" onerror="this.style.display='none'">
        <h2>${centralIcon}${customObj.name}${isCentral ? '' : ''}</h2>
      </div>
      <div class="object-3d-info-description">
        <p class="description-text"></p>
      </div>
      <div class="object-3d-info-actions">
        <button class="action-button details-button" data-object="${customObj.id || customObj.name}">View Details</button>
        ${customObj.actionUrl ? `<button class="action-button action-url-button" data-url="${customObj.actionUrl}">Open</button>` : ''}
      </div>
    `;
  }

  // Show with animation
  gsap.fromTo(
    infoPanel,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", display: "block" }
  );

  // Start typewriter effect for description
  const descriptionElement = infoPanel.querySelector('.description-text');
  if (descriptionElement) {
    // Add a small delay before starting typewriter effect
    setTimeout(() => {
      this.typewriterEffect(descriptionElement, truncatedDescription, isMobile ? 80 : 40);
    }, 200);
  }

  // Add event listeners to buttons
  const detailsButton = infoPanel.querySelector(".details-button");
  if (detailsButton) {
    const handleDetails = () => {
      if ('vibrate' in navigator && isMobile) {
        navigator.vibrate(100);
      }
      
      // Show full description in details
      const fullDescription = customObj.description || 'No additional details available.';
      alert(`Details for ${customObj.name}:\n\n${fullDescription}`);
    };

    detailsButton.addEventListener("click", handleDetails);
    detailsButton.addEventListener("touchend", handleDetails);
  }

  // Add event listener for action URL button
  const actionUrlButton = infoPanel.querySelector(".action-url-button");
  if (actionUrlButton) {
    const handleActionUrl = () => {
      if ('vibrate' in navigator && isMobile) {
        navigator.vibrate(80);
      }
      
      const url = actionUrlButton.getAttribute('data-url');
      if (url) {
        window.open(url, '_blank');
      }
    };

    actionUrlButton.addEventListener("click", handleActionUrl);
    actionUrlButton.addEventListener("touchend", handleActionUrl);
  }
}

/**
 * Hide object information and clear typewriter effects
 */
hideObjectInfo() {
  const infoPanel = document.getElementById("object-3d-info");
  if (infoPanel) {
    // Stop any ongoing typewriter effects
    const descriptionElement = infoPanel.querySelector('.description-text');
    if (descriptionElement) {
      this.stopTypewriterEffect(descriptionElement);
    }
    
    gsap.to(infoPanel, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        infoPanel.style.display = "none";
      },
    });
  }
}



  /**
   * Handle window resize
   */
  onWindowResize() {
    const container = document.querySelector(this.config.containerSelector);
    
    this.config.width = container.clientWidth;
    this.config.height = container.clientHeight;

    this.camera.aspect = this.config.width / this.config.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.config.width, this.config.height);
    
    if (this.controls) {
      const isMobile = window.innerWidth <= 992;
      
      if (isMobile) {
        this.controls.rotateSpeed = 1.5;
        this.controls.panSpeed = 1.2;
        this.controls.autoRotateSpeed = 0.5;
      } else {
        this.controls.rotateSpeed = 1.0;
        this.controls.panSpeed = 0.8;
        this.controls.autoRotateSpeed = 0.3;
      }
    }
  }

  /**
   * Animation loop
   */
  animate() {
this.animationFrame = requestAnimationFrame(this.animate);

  if (this.controls) {
    this.controls.update();
  }

  this.raycaster.setFromCamera(this.mouse, this.camera);

  const intersects = this.raycaster.intersectObjects(this.objectModels, true);
  // Reset previously hovered object if not selected
  if (
    this.hoveredObject &&
    !this.hoveredObject.userData.isSelected &&
    (!intersects.length ||
      !this.isPartOfObject(this.hoveredObject, intersects[0].object))
  ) {
    this.onObjectLeave(this.hoveredObject);
    this.hoveredObject = null;
  }

  // Handle new hover (ONLY visual effects, NO info display)
  if (intersects.length > 0) {
    const rootObject = this.getRootObject(intersects[0].object);

    if (
      this.hoveredObject !== rootObject &&
      !rootObject.userData.isSelected
    ) {
      this.hoveredObject = rootObject;
    }
  }

  // Animate all objects
  this.objectModels.forEach((obj) => {
    obj.lookAt(this.camera.position);

    // Handle central object with enhanced effects
    if (obj.userData.isCentral) {
      // Add dynamic lighting effect based on time
      const time = Date.now() * 0.001;
      
      // Update emissive intensity dynamically
      if (obj.material && obj.material.emissive && !obj.userData.isSelected && obj !== this.hoveredObject) {
        obj.material.emissiveIntensity = 0.8 + Math.sin(time * 2) * 0.3;
      }

      // Add subtle position variation for magnetic effect
      if (!obj.userData.isSelected && obj !== this.hoveredObject) {
        const magneticOffset = Math.sin(time * 1.5) * 0.2;
        obj.position.x += magneticOffset;
        obj.position.z += Math.cos(time * 1.2) * 0.15;
      }

      // Update energy rings if they exist
      if (obj.userData.energyRings) {
        obj.userData.energyRings.forEach((ring, index) => {
          // Add dynamic color shifting
          const hue = (time * 0.1 + index * 0.3) % 1;
          ring.material.color.setHSL(hue, 0.8, 0.6);
        });
      }

      return;
    }

    // Handle orbiting objects - SKIP ORBITAL MOVEMENT IF SELECTED
    if (obj.userData.isOrbiting) {
      
      // If object is selected, keep it in place
      if (obj.userData.isSelected) {
        // Store the position where it was selected if not already stored
        if (!obj.userData.selectedPosition) {
          obj.userData.selectedPosition = obj.position.clone();
        }
        
        // Keep object at selected position
        obj.position.copy(obj.userData.selectedPosition);
        
        // Add subtle floating animation even when selected
        const time = Date.now() * 0.001;
        const floatingOffset = obj.userData.floatingOffset || 0;
        obj.position.y = obj.userData.selectedPosition.y + floatingOffset + Math.sin(time * 0.5) * 0.2;
        
        return; // Skip orbital movement
      }
      
      // Clear selected position when not selected anymore
      if (obj.userData.selectedPosition) {
        obj.userData.selectedPosition = null;
      }
      
      // Continue normal orbital movement for non-selected objects
      if (obj !== this.hoveredObject) {
        // Update orbit angle
        obj.userData.orbitAngle += obj.userData.orbitSpeed;

        const pathPoints = this.orbitPathPoints[obj.userData.orbitLevel];
        
        if (pathPoints && pathPoints.length > 0) {
          const normalizedAngle = (obj.userData.orbitAngle % (Math.PI * 2)) / (Math.PI * 2);
          const pointIndex = Math.floor(normalizedAngle * (pathPoints.length - 1));
          const nextPointIndex = (pointIndex + 1) % pathPoints.length;
          
          const t = (normalizedAngle * (pathPoints.length - 1)) - pointIndex;
          const currentPoint = pathPoints[pointIndex];
          const nextPoint = pathPoints[nextPointIndex];
          
          const interpolatedPosition = new THREE.Vector3().lerpVectors(currentPoint, nextPoint, t);
          
          obj.position.x = interpolatedPosition.x;
          obj.position.z = interpolatedPosition.z;
          
          const baseY = interpolatedPosition.y;
          const floatingOffset = obj.userData.floatingOffset || 0;
          obj.position.y = baseY + floatingOffset;
        } else {
          const newX = Math.cos(obj.userData.orbitAngle) * obj.userData.orbitRadius;
          const newZ = Math.sin(obj.userData.orbitAngle) * obj.userData.orbitRadius;
          obj.position.x = newX;
          obj.position.z = newZ;
          obj.position.y = obj.userData.orbitHeight + (obj.userData.floatingOffset || 0);
        }

        if (!obj.scale.equals(obj.userData.originalScale)) {
          obj.scale.lerp(obj.userData.originalScale, 0.1);
        }
      }
    }
  });

  // Render scene
  this.renderer.render(this.scene, this.camera);
}

/**
 * Updated hover effect to handle different object types
 */
onObjectHover(object) {
  // Don't apply hover effect if already selected
  if (object.userData.isSelected) return;

  // Provide haptic feedback on mobile devices
  if ('vibrate' in navigator && window.innerWidth <= 992) {
    navigator.vibrate(50);
  }

  // Different hover effects for central vs orbiting objects
  const scaleMultiplier = object.userData.isCentral ? 1.2 : 1.4;
  const yOffset = object.userData.isCentral ? 2 : 4;

  // Scale up the object
 // Enhanced position animation
  gsap.to(object.position, {
    y: object.position.y + yOffset,
    duration: 0.4,
    ease: "power2.out",
  });

  // Add rotation animation
  gsap.to(object.rotation, {
    y: object.rotation.y + Math.PI / 4,
    duration: 0.4,
    ease: "power2.out",
  });

  // Enhance glow effect
  if (object.userData.glowMesh) {
    gsap.to(object.userData.glowMesh.material, {
      opacity: 1.0,
      duration: 0.3,
      ease: "power2.out",
    });
  }


  // Show object info
  const customObj = object.userData.customObject;
  this.showObjectInfo(customObj);
}

  /**
   * Get the root object from a child object
   */
  getRootObject(object) {
    let current = object;
    while (current.parent && !this.objectModels.includes(current)) {
      current = current.parent;
    }
    return current;
  }

  /**
   * Check if an object is part of another object
   */
  isPartOfObject(rootObject, childObject) {
    if (rootObject === childObject) return true;

    let current = childObject;
    while (current.parent) {
      if (current.parent === rootObject) return true;
      current = current.parent;
    }

    return false;
  }

  /**
   * Update the visualizer when objects change
   */
  update() {
    if (this.initialized) {
      // Store selected object ID if any
      let selectedId = null;
      if (this.selectedObject && this.selectedObject.userData.customObject) {
        selectedId = this.selectedObject.userData.customObject.id || this.selectedObject.userData.customObject.name;
      }

      // Recreate objects
      this.createCustomObjects();

      // Restore selection if applicable
      if (selectedId) {
        const newObject = this.objectModels.find(
          (obj) => obj.userData.customObject && 
          (obj.userData.customObject.id === selectedId || obj.userData.customObject.name === selectedId)
        );

        if (newObject) {
          this.selectObject(newObject);
        }
      }
    }
  }


}

// Create a simple API class for custom objects
class CustomObjectAPI {
  constructor() {
    this.objects = [];
    this.initialized = false;
  }

  /**
   * Add a custom object to the collection
   */
 addObject(objectData) {
    const defaultObject = {
      id: objectData.id || Date.now().toString(),
      name: objectData.name || 'Unnamed Object',
      description: objectData.description || '',
      image: objectData.image || null,
      value: objectData.value || null,
      category: objectData.category || null,
      priority: objectData.priority || this.objects.length + 1,
      status: objectData.status || 'Active',
      dateCreated: objectData.dateCreated || new Date().toISOString(),
      tags: objectData.tags || [],
      actionUrl: objectData.actionUrl || null,
      isCentral: objectData.isCentral || false, // New property for orbital system
      ...objectData
    };

    // If this is marked as central, make sure no other object is central
    if (defaultObject.isCentral) {
      this.objects.forEach(obj => obj.isCentral = false);
    }

    this.objects.push(defaultObject);
    return defaultObject;
  }

  /**
   * Remove an object by ID or name
   */
  removeObject(identifier) {
    const index = this.objects.findIndex(obj => 
      obj.id === identifier || obj.name === identifier
    );
    
    if (index !== -1) {
      return this.objects.splice(index, 1)[0];
    }
    return null;
  }


  /**
   * Set an object as central (moves it to first position)
   */
  setCentralObject(identifier) {
    const objectIndex = this.objects.findIndex(obj => 
      obj.id === identifier || obj.name === identifier
    );
    
    if (objectIndex !== -1) {
      // Remove from current position
      const [centralObject] = this.objects.splice(objectIndex, 1);
      
      // Mark as central and unmark others
      this.objects.forEach(obj => obj.isCentral = false);
      centralObject.isCentral = true;
      
      // Insert at beginning
      this.objects.unshift(centralObject);
      
      return centralObject;
    }
    return null;
  }


  /**
   * Update an object
   */
  updateObject(identifier, updateData) {
    const object = this.objects.find(obj => 
      obj.id === identifier || obj.name === identifier
    );
    
    if (object) {
      // Handle central object changes
      if (updateData.isCentral && !object.isCentral) {
        this.setCentralObject(identifier);
      }
      
      Object.assign(object, updateData);
      return object;
    }
    return null;
  }

  /**
   * Get all objects
   */
  getObjects() {
    return this.objects;
  }

  /**
   * Get object by ID or name
   */
  getObject(identifier) {
    return this.objects.find(obj => 
      obj.id === identifier || obj.name === identifier
    );
  }


    /**
   * Get central object
   */
  getCentralObject() {
    return this.objects.find(obj => obj.isCentral) || this.objects[0];
  }

  /**
   * Get orbiting objects
   */
  getOrbitingObjects() {
    return this.objects.filter(obj => !obj.isCentral);
  }
  /**
   * Initialize with sample data
   */
  initializeSampleData() {
    const sampleObjects = [
      {
        name: 'Royal Virtual Assets',
        description: 'Royal Virtual Assets is a new global atmosphere for investment and trading, RVA stands for transparency, efficiency, and security in blockchain technology.',
        isCentral: true
      },
      {
        name: 'Tokenisation',
        description: 'A data security process that involves substituting a sensitive data element with a non-sensitive equivalent, known as a token.',
      },
      {
        name: 'Wallet',
        description: 'A type of financial transaction app that runs on any connected device. It securely stores your payment information and passwords.',
      },
      {
        name: 'Trade Platform',
        description: 'A cryptocurrency trading platform is an online portal (exchange) that facilitates crypto-to-crypto transactions.',
      },
      {
        name: 'Coin',
        description: 'Cryptocurrencies are digital assets that rely on an encrypted network to execute, verify, and record transactions.',
      },
      {
        name: 'Dex',
        description: 'Decentralized exchanges are platforms that crypto traders can connect with using a web3 crypto wallet in order to perform trades.',
      },
      {
        name: 'Swap',
        description: 'Swap refers to exchanging one crypto asset for another.',
      }
      ,
      {
        name: 'IDO',
        description: 'An initial DEX offering (IDO) is a fundraising method for blockchain-based projects through decentralized exchanges (DEXs).',
      }
      ,
      {
        name: 'ICO',
        description: 'An initial coin offering (ICO) is the cryptocurrency industry’s equivalent of an initial public offering (IPO).',
      }
    ];

    sampleObjects.forEach(obj => this.addObject(obj));
    this.initialized = true;
  }
}

// Create and initialize the visualizer when the DOM is ready
// Replace the existing script loading section with this:
document.addEventListener("DOMContentLoaded", () => {
  // Add loading indicator
  const container = document.querySelector("#object-3d-container") || document.body;
  
  // Remove any existing loading indicator first
  const existingIndicator = container.querySelector(".object-3d-loading");
  if (existingIndicator) {
    container.removeChild(existingIndicator);
  }
  
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "object-3d-loading";
  
  const isMobile = window.innerWidth <= 992;
  const loadingMessage = isMobile 
    ? "Loading 3D Visualizer...<br>"
    : "Loading 3D Object Visualizer...";
    
  loadingIndicator.innerHTML = `
    <div class="spinner"></div>
    <div>${loadingMessage}</div>
  `;
  container.appendChild(loadingIndicator);

  // Initialize the custom object API
  if (!window.objectApi) {
    window.objectApi = new CustomObjectAPI();
    window.objectApi.initializeSampleData();
  }

  // Enhanced script loading with duplicate detection
  const loadScript = (url, callback, checkGlobal = null) => {
    // Check if the library is already loaded
    if (checkGlobal && window[checkGlobal]) {
      callback();
      return;
    }

    // Check if script is already in the document
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      if (existingScript.loaded || (checkGlobal && window[checkGlobal])) {
        callback();
      } else {
        existingScript.addEventListener('load', callback);
        existingScript.addEventListener('error', callback);
      }
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = () => {
      script.loaded = true;
      callback();
    };
    script.onerror = () => {
      callback(); // Continue anyway
    };
    document.head.appendChild(script);
  };

  // Load Three.js first (check for existing THREE global)
  loadScript(
    "././ajax/libs/three.js/r128/three.min.js",
    () => {
      
      // Load OrbitControls (check for existing OrbitControls)
      loadScript(
        "././npm/three@0.128.0/js/controls/OrbitControls.min.js",
        () => {
          
          // Load GSAP (check for existing gsap global)
          loadScript(
            "././ajax/libs/gsap/3.9.1/gsap.min.js",
            () => {
              
              // Initialize the visualizer
              initializeVisualizer();
            },
            "gsap"
          );
        }
      );
    },
    "THREE"
  );

  // Separate initialization function
  function initializeVisualizer() {
    // Wait for objectApi to be available
    const waitForObjectApi = setInterval(() => {
      if (
        window.objectApi &&
        window.objectApi.objects &&
        window.objectApi.objects.length > 0 &&
        window.THREE // Ensure Three.js is ready
      ) {
        clearInterval(waitForObjectApi);

        // Create and initialize the visualizer
        const isMobile = window.innerWidth <= 992;
        const object3DConfig = {
          containerSelector: "#object-3d-container",
          width: window.innerWidth,
          height: isMobile ? window.innerHeight * 0.8 : window.innerHeight,
          backgroundColor: 0x0a0a14,
          apiInstance: window.objectApi,
          objectCount: isMobile ? 8 : 8,
          logoSize: isMobile ? 2.0 : 2.8,
          hoverDuration: isMobile ? 6000 : 8000,
        };

        const object3D = new Object3DVisualizer(object3DConfig);
        
        object3D.init().then(() => {
          
          // Add mobile-specific instructions
          if (isMobile) {
            const instructions = document.createElement("div");
            container.appendChild(instructions);

            setTimeout(() => {
              instructions.classList.add("fade");
            }, 10000);
          }
        }).catch((err) => {
        });

        // Export for external use
        window.object3D = object3D;

        // Add event handlers...
        // (rest of your existing event handler code)
      }
    }, 100);

    // Add timeout for initialization
    setTimeout(() => {
      clearInterval(waitForObjectApi);
      const loadingIndicator = document.querySelector(".object-3d-loading");
      if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
        
        const timeoutMessage = document.createElement("div");
        timeoutMessage.className = "object-3d-timeout";
        timeoutMessage.innerHTML = `
          <div>⏱️ Loading timeout</div>
          <div><small>Please refresh the page to try again</small></div>
        `;
        container.appendChild(timeoutMessage);
      }
    }, 30000);
  }
});


// Export classes for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Object3DVisualizer, CustomObjectAPI };
} else {
  window.Object3DVisualizer = Object3DVisualizer;
  window.CustomObjectAPI = CustomObjectAPI;
}

// Helper function to add objects programmatically
window.addCustomObject = function(objectData) {
  if (window.objectApi) {
    const newObject = window.objectApi.addObject(objectData);
    
    // Update the visualizer if it exists
    if (window.object3D && window.object3D.initialized) {
      window.object3D.update();
    }
    
    return newObject;
  }
  return null;
};

// Helper function to remove objects programmatically
window.removeCustomObject = function(identifier) {
  if (window.objectApi) {
    const removedObject = window.objectApi.removeObject(identifier);
    
    // Update the visualizer if it exists
    if (window.object3D && window.object3D.initialized) {
      window.object3D.update();
    }
    
    return removedObject;
  }
  return null;
};

// Helper function to update objects programmatically
window.updateCustomObject = function(identifier, updateData) {
  if (window.objectApi) {
    const updatedObject = window.objectApi.updateObject(identifier, updateData);
    
    // Update the visualizer if it exists
    if (window.object3D && window.object3D.initialized) {
      window.object3D.update();
    }
    
    return updatedObject;
  }
  return null;
};
