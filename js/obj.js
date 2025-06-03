/**
 * RoyalVirtualAssets 3D Cryptocurrency Visualizer
 * This module creates interactive 3D cryptocurrency models using Three.js
 */

class Crypto3DVisualizer {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerSelector: options.containerSelector || "#crypto-3d-container",
      width: options.width || window.innerWidth,
      height: options.height || window.innerHeight, // Increased height to 900px
      backgroundColor: options.backgroundColor || 0x0a0a14,
      apiInstance: options.apiInstance || window.cryptoApi,
      cryptoCount: options.cryptoCount || 20, // 0 means include all available cryptos
      logoSize: options.logoSize || 3.5,
      hoverDuration: options.hoverDuration || 8000, // Duration in ms to maintain hover effect after click
    };

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;

    // 3D objects and state
    this.cryptoObjects = [];
    this.cryptoModels = {};
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
  /**
   * Initialize the 3D visualizer (continued)
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

    // Setup SVG directory
    await this.setupSVGDirectory();

    // Wait for cryptoApi to have prices
    await this.waitForPrices();

    // Create 3D objects
    this.createCryptoObjects();

    // Start animation loop
    this.animate();

    // Hide instructions after 5 seconds
    setTimeout(() => {
      const instructions = document.querySelector(".crypto-3d-instructions");
      if (instructions) {
        instructions.classList.add("fade");
      }
    }, 8000);

   

    // Hide zoom instruction after 8 seconds
    setTimeout(() => {
      zoomInstruction.classList.add("fade-out");
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
      const infoPanel = document.getElementById("crypto-3d-info");
      if (infoPanel) {
        container.removeChild(infoPanel);
      }
    }

    // Dispose of all geometries and materials
    this.cryptoObjects.forEach((obj) => {
      this.disposeObject(obj);
    });

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.cryptoObjects = [];
    this.hoveredObject = null;
    this.selectedObject = null;
    this.initialized = false;
  }
  /**
   * Recursively dispose of an object and its children
   */
  disposeObject(object) {
    if (object.children) {
      // Clone the children array to avoid modification during iteration
      const children = [...object.children];
      for (const child of children) {
        this.disposeObject(child);
      }
    }

    // Dispose of geometries and materials
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      // Material might be an array
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          this.disposeMaterial(material);
        });
      } else {
        this.disposeMaterial(object.material);
      }
    }

    // Remove from parent
    if (object.parent) {
      object.parent.remove(object);
    }
  }

  /**
   * Dispose of a material and its textures
   */
  disposeMaterial(material) {
    // Dispose of textures
    for (const prop in material) {
      const value = material[prop];
      if (value && typeof value === "object" && "isTexture" in value) {
        value.dispose();
      }
    }

    // Dispose of material
    material.dispose();
  }

  /**
   * Remove the loading spinner
   */
  removeLoadingSpinner() {
    const loadingIndicator = document.querySelector(".crypto-3d-loading");
    if (loadingIndicator) {
      // Fade out and remove
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
   * Wait for cryptoApi to have prices available
   */
  async waitForPrices() {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      if (
        this.config.apiInstance &&
        this.config.apiInstance.prices &&
        this.config.apiInstance.prices.length > 0
      ) {
        return true;
      }

      // Wait 500ms before checking again
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
    this.scene.fog = new THREE.FogExp2(this.config.backgroundColor, 0.02);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.z = 240; // Move camera further back to see more objects
    this.camera.position.y = 140;
    this.camera.position.x = 180;
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Add directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);

    // Add point lights for better highlights
    const colors = [0x3498db, 0xe74c3c, 0xf39c12, 0x2ecc71, 0x9b59b6];
    for (let i = 0; i < 8; i++) {
      // More lights for more objects
      const pointLight = new THREE.PointLight(
        colors[i % colors.length],
        0.8,
        800
      );
      const angle = (i / 8) * Math.PI * 2;
      const radius = 25;
      pointLight.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 5,
        Math.sin(angle) * radius
      );
      this.scene.add(pointLight);
    }

    // Setup raycaster for mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add orbit controls if Three.OrbitControls is available
    if (typeof THREE.OrbitControls !== "undefined") {
      this.controls = new THREE.OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      
      // Enhanced controls for all devices including touch
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 20;
      this.controls.maxDistance = 60;
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.3;

      // Enable rotation (dragging) on all devices
      this.controls.enableRotate = true;
      this.controls.rotateSpeed = 1.0;
      
      // Enable panning for better navigation
      this.controls.enablePan = true;
      this.controls.panSpeed = 0.8;
      this.controls.keyPanSpeed = 7.0;
      
      // Touch-specific settings
      this.controls.touches = {
        ONE: THREE.TOUCH.ROTATE,    // Single finger drag to rotate
        TWO: THREE.TOUCH.DOLLY_PAN  // Two finger pinch to zoom and pan
      };
      
      // Mouse button settings
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,   // Left click drag to rotate
        MIDDLE: THREE.MOUSE.DOLLY,  // Middle mouse to zoom
        RIGHT: THREE.MOUSE.PAN      // Right click drag to pan
      };

      // IMPORTANT: Disable zoom via mouse wheel in OrbitControls
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

    // Define min and max zoom values
    const minZoom = 20; // Minimum FOV (maximum zoom in)
    const maxZoom = 80; // Maximum FOV (maximum zoom out)

    // Set initial FOV
    this.camera.fov = 60;
    this.camera.updateProjectionMatrix();

    // Add wheel event listener
    const handleWheel = (event) => {
      // Determine scroll direction
      const delta = event.deltaY;
      const scrollingDown = delta > 0;
      const scrollingUp = delta < 0;

      // Check if we're at the top of the page
      const isAtPageTop = window.scrollY <= 0;

      // Check if we're at max zoom out
      const isAtMaxZoomOut = this.camera.fov >= maxZoom;

      // CASE 1: Scrolling down and at max zoom out - let page scroll
      if (scrollingDown && isAtMaxZoomOut) {
        // Allow default behavior (page scroll)
        return;
      }

      // CASE 2: Scrolling up and NOT at the top of the page - let page scroll
      if (scrollingUp && !isAtPageTop) {
        // Allow default behavior (page scroll)
        return;
      }

      // In all other cases, handle the zoom in the 3D visualization
      event.preventDefault();

      // Get current FOV
      let fov = this.camera.fov;

      // Calculate new FOV
      if (scrollingDown) {
        // Scrolling down - zoom out
        fov = Math.min(fov + 2, maxZoom);

        // Show indicator if reaching max zoom out
        if (fov === maxZoom) {
          this.showZoomIndicator("Maximum zoom out reached - scrolling page");
        }
      } else {
        // Scrolling up - zoom in (only if at page top)
        fov = Math.max(fov - 2, minZoom);

        // Show indicator if reaching max zoom in
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

    // Add the event listener with passive: false to allow preventDefault
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Store the handler for cleanup
    this.wheelHandler = handleWheel;
  }

  /**
   * Show zoom indicator message
   */
  showZoomIndicator(message) {
    // Get or create indicator element
    let indicator = document.querySelector(".crypto-3d-zoom-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "crypto-3d-zoom-indicator";
      document
        .querySelector(this.config.containerSelector)
        .appendChild(indicator);
    }

    // Update message
    indicator.textContent = message;
    indicator.classList.add("show");

    // Hide after a delay
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
    
    // Touch zoom variables
    let initialDistance = 0;
    let currentDistance = 0;
    let isZooming = false;
    
    // Define min and max zoom values
    const minZoom = 20; // Minimum FOV (maximum zoom in)
    const maxZoom = 80; // Maximum FOV (maximum zoom out)

    // Helper function to get distance between two touches
    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Touch start handler
    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        // Two finger touch - prepare for zoom
        initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
        isZooming = true;
        
        // Disable auto-rotation during zoom
        if (this.controls) {
          this.controls.autoRotate = false;
        }
      }
    };

    // Touch move handler
    const handleTouchMove = (event) => {
      if (event.touches.length === 2 && isZooming) {
        event.preventDefault(); // Prevent page zoom
        
        currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        const deltaDistance = currentDistance - initialDistance;
        
        // Calculate zoom factor
        const zoomFactor = deltaDistance * 0.01; // Adjust sensitivity
        
        // Get current FOV
        let fov = this.camera.fov;
        
        // Apply zoom
        fov = Math.max(minZoom, Math.min(maxZoom, fov - zoomFactor));
        
        // Update camera FOV
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        
        // Show zoom level indicator
        const zoomPercentage = Math.round(
          ((maxZoom - fov) / (maxZoom - minZoom)) * 100
        );
        this.showZoomLevel(zoomPercentage);
        
        // Update initial distance for next frame
        initialDistance = currentDistance;
      }
    };

    // Touch end handler
    const handleTouchEnd = (event) => {
      if (event.touches.length < 2) {
        isZooming = false;
        
        // Re-enable auto-rotation after a delay
        setTimeout(() => {
          if (this.controls) {
            this.controls.autoRotate = true;
          }
        }, 2000);
      }
    };

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Store handlers for cleanup
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
    // Get or create zoom level indicator
    let zoomLevel = document.querySelector(".crypto-3d-zoom-level");
    if (!zoomLevel) {
      zoomLevel = document.createElement("div");
      zoomLevel.className = "crypto-3d-zoom-level";
      document
        .querySelector(this.config.containerSelector)
        .appendChild(zoomLevel);
    }

    // Update zoom level with device-specific text
    const isMobile = window.innerWidth <= 992;
    const zoomText = isMobile ? `Zoom: ${percentage}%` : `Zoom: ${percentage}%`;
    zoomLevel.textContent = zoomText;
    zoomLevel.classList.add("show");

    // Hide after a delay
    clearTimeout(this.zoomLevelTimeout);
    this.zoomLevelTimeout = setTimeout(() => {
      zoomLevel.classList.remove("show");
    }, 1000);
  }


  /**
   * Create 3D objects for cryptocurrencies using their SVG logos as textures
   */
  createCryptoObjects() {
    if (!this.config.apiInstance || !this.config.apiInstance.prices) {
      return;
    }

    // Clear existing objects
    this.cryptoObjects.forEach((obj) => this.scene.remove(obj));
    this.cryptoObjects = [];

    // Get cryptocurrencies
    const cryptos =
      this.config.cryptoCount > 0
        ? this.config.apiInstance.prices.slice(0, this.config.cryptoCount)
        : this.config.apiInstance.prices;


    // Process each cryptocurrency
    cryptos.forEach((crypto, index) => {
      // Create a circular geometry for the logo
      const geometry = new THREE.CircleGeometry(this.config.logoSize / 2, 32);

      // Define SVG file path based on crypto symbol
      const svgPath = `assets/crypto-logos/${crypto.symbol.toLowerCase()}.svg`;

      // Create a material with the SVG as texture
      const material = new THREE.MeshStandardMaterial({
        map: null, // Will be set when texture loads
        transparent: true,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.4,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.2,
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Try to load SVG as texture
      this.textureLoader.load(
        svgPath,
        (texture) => {
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        (error) => {
         // Use fallback
          this.createFallbackTexture(crypto, material, index);
        }
      );

      // Calculate position using spherical distribution
      const layerCount = 5;
      const layer = index % layerCount;
      const itemsPerLayer = Math.ceil(cryptos.length / layerCount);
      const angleStep = (2 * Math.PI) / itemsPerLayer;
      const layerIndex = Math.floor(index / layerCount);
      const angle = layerIndex * angleStep;

      const baseRadius = 15 + layer * 5;
      const height = -10 + layer * 5;

      const radiusVariation = Math.random() * 3 - 1.5;
      const heightVariation = Math.random() * 3 - 1.5;

      mesh.position.x = (baseRadius + radiusVariation) * Math.cos(angle);
      mesh.position.z = (baseRadius + radiusVariation) * Math.sin(angle);
      mesh.position.y = height + heightVariation;

      // Make logos always face the camera
      mesh.lookAt(this.camera.position);

      // Scale based on market cap rank
      const rankScale = 1 + 1 / Math.sqrt(crypto.market_cap_rank || index + 1);
      const scale = rankScale * (0.8 + Math.random() * 0.4);
      mesh.scale.set(scale, scale, scale);

      // Store crypto data
      mesh.userData = {
        crypto: crypto,
        originalScale: mesh.scale.clone(),
        originalPosition: mesh.position.clone(),
        rotationSpeed: {
          x: 0.001 + Math.random() * 0.002,
          y: 0.001 + Math.random() * 0.002,
          z: 0.001 + Math.random() * 0.002,
        },
        orbitSpeed: 0.001 + Math.random() * 0.002,
        orbitRadius: baseRadius + radiusVariation,
        orbitAngle: angle,
        orbitHeight: height + heightVariation,
        isSelected: false,
        selectionTime: 0,
      };

      // Add to scene and store reference
      this.scene.add(mesh);
      this.cryptoObjects.push(mesh);

      // Create text label
      this.createCryptoLabel(crypto, mesh);

      // Add glow effect
      this.addGlowEffect(mesh, crypto);
    });

    // Remove loading spinner
    this.removeLoadingSpinner();
  }

  /**
   * Create a fallback texture when SVG loading fails
   */
  createFallbackTexture(crypto, material, index) {
    // Create a canvas for the texture
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    // Draw background
    context.fillStyle = this.getColorForCrypto(crypto.symbol, index);
    context.beginPath();
    context.arc(128, 128, 128, 0, 2 * Math.PI);
    context.fill();

    // Draw text
    context.fillStyle = "white";
    context.font = "bold 120px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(crypto.symbol.charAt(0).toUpperCase(), 128, 128);

    // Apply as texture
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    material.map = fallbackTexture;
    material.needsUpdate = true;
  }

  /**
   * Create a fallback object when SVG loading fails
   */
  createFallbackObject(crypto, index) {
    // Create a circular geometry
    const geometry = new THREE.CircleGeometry(this.config.logoSize / 2, 32);

    // Create a canvas for the texture
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    // Draw background
    context.fillStyle = this.getColorForCrypto(crypto.symbol, index);
    context.beginPath();
    context.arc(128, 128, 128, 0, 2 * Math.PI);
    context.fill();

    // Draw text
    context.fillStyle = "white";
    context.font = "bold 120px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(crypto.symbol.charAt(0).toUpperCase(), 128, 128);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);

    // Create material
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.2,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Calculate position using spherical distribution
    const layerCount = 5;
    const layer = index % layerCount;
    const itemsPerLayer = Math.ceil(
      this.config.apiInstance.prices.length / layerCount
    );
    const angleStep = (2 * Math.PI) / itemsPerLayer;
    const layerIndex = Math.floor(index / layerCount);
    const angle = layerIndex * angleStep;

    const baseRadius = 15 + layer * 5;
    const height = -10 + layer * 5;

    const radiusVariation = Math.random() * 3 - 1.5;
    const heightVariation = Math.random() * 3 - 1.5;

    mesh.position.x = (baseRadius + radiusVariation) * Math.cos(angle);
    mesh.position.z = (baseRadius + radiusVariation) * Math.sin(angle);
    mesh.position.y = height + heightVariation;

    // Make logos always face the camera
    mesh.lookAt(this.camera.position);

    // Scale based on market cap rank
    const rankScale = 1 + 1 / Math.sqrt(crypto.market_cap_rank || index + 1);
    const scale = rankScale * (0.8 + Math.random() * 0.4);
    mesh.scale.set(scale, scale, scale);

    // Store crypto data
    mesh.userData = {
      crypto: crypto,
      originalScale: mesh.scale.clone(),
      originalPosition: mesh.position.clone(),
      rotationSpeed: {
        x: 0.001 + Math.random() * 0.002,
        y: 0.001 + Math.random() * 0.002,
        z: 0.001 + Math.random() * 0.002,
      },
      orbitSpeed: 0.001 + Math.random() * 0.002,
      orbitRadius: baseRadius + radiusVariation,
      orbitAngle: angle,
      orbitHeight: height + heightVariation,
      isSelected: false,
      selectionTime: 0,
    };

    // Add to scene and store reference
    this.scene.add(mesh);
    this.cryptoObjects.push(mesh);

    // Create text label
    this.createCryptoLabel(crypto, mesh);

    // Add glow effect
    this.addGlowEffect(mesh, crypto);
  }

  /**
   * Add a subtle glow effect to the crypto logo
   */
  addGlowEffect(mesh, crypto) {
    // Create a slightly larger circle behind the logo for the glow effect
    const glowGeometry = new THREE.CircleGeometry(
      (this.config.logoSize / 2) * 1.2,
      32
    );

    // Use the crypto's color for the glow
    const color = new THREE.Color(
      this.getColorForCrypto(crypto.symbol, crypto.market_cap_rank || 0)
    );

    // Create a material that will emit light
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.1; // Position slightly behind the logo
    mesh.add(glowMesh);

    // Store reference to glow mesh
    mesh.userData.glowMesh = glowMesh;

    // Add subtle pulsing animation to the glow
    const pulseIntensity = 0.2 + Math.random() * 0.3; // Random intensity between 0.2 and 0.5
    const pulseDuration = 1.5 + Math.random() * 1.5; // Random duration between 1.5 and 3 seconds

    // Only apply animation if GSAP is available
    if (window.gsap) {
      gsap.to(glowMaterial, {
        opacity: pulseIntensity,
        duration: pulseDuration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  /**
   * Get a consistent color for a cryptocurrency based on its symbol
   */
  getColorForCrypto(symbol, index) {
    // Predefined colors for common cryptocurrencies
    const knownColors = {
      btc: "#F7931A", // Bitcoin
      eth: "#627EEA", // Ethereum
      usdt: "#26A17B", // Tether
      bnb: "#F3BA2F", // Binance Coin
      sol: "#00FFA3", // Solana
      xrp: "#23292F", // XRP
      ada: "#0033AD", // Cardano
      doge: "#C3A634", // Dogecoin
      trx: "#EF0027", // TRON
      dot: "#E6007A", // Polkadot
      matic: "#8247E5", // Polygon
      ltc: "#345D9D", // Litecoin
      shib: "#FFA409", // Shiba Inu
      avax: "#E84142", // Avalanche
      link: "#2A5ADA", // Chainlink
      atom: "#2E3148", // Cosmos
      uni: "#FF007A", // Uniswap
      xlm: "#14B6E7", // Stellar
      etc: "#328332", // Ethereum Classic
      algo: "#000000", // Algorand
      near: "#000000", // NEAR Protocol
      fil: "#0090FF", // Filecoin
      vet: "#15BDFF", // VeChain
      icp: "#3B00B9", // Internet Computer
      hbar: "#00BAFF", // Hedera
      mana: "#FF2D55", // Decentraland
      sand: "#00AEFF", // The Sandbox
      axs: "#0055D5", // Axie Infinity
      egld: "#1D40FF", // MultiversX
      theta: "#2AB8E6", // Theta Network
      xmr: "#FF6600", // Monero
      ftm: "#1969FF", // Fantom
      aave: "#B6509E", // Aave
      cake: "#D1884F", // PancakeSwap
      xtz: "#A6E000", // Tezos
      flow: "#00EF8B", // Flow
      kcs: "#0093DD", // KuCoin Token
      neo: "#00E599", // Neo
      btt: "#000000", // BitTorrent
      mkr: "#1AAB9B", // Maker
      rune: "#00CCFF", // THORChain
      dash: "#008CE7", // Dash
      chz: "#CD0124", // Chiliz
      zec: "#ECB244", // Zcash
      enj: "#624DBF", // Enjin Coin
      celo: "#FBCC5C", // Celo
      bat: "#FF4724", // Basic Attention Token
      amp: "#2775CA", // Amp
      qnt: "#000000", // Quant
      waves: "#0155FF", // Waves
      hot: "#FF4C4C", // Holo
      nexo: "#3CA9E5", // Nexo
      ar: "#000000", // Arweave
      comp: "#00D395", // Compound
      one: "#00AEE9", // Harmony
      klay: "#FF1F2D", // Klaytn
      xdc: "#25292E", // XDC Network
      dcr: "#2ED8A3", // Decred
      zen: "#00EAAB", // Horizen
      stx: "#5546FF", // Stacks
      gala: "#00D8E2", // Gala
      qtum: "#2E9AD0", // Qtum
      omg: "#101010", // OMG Network
      sc: "#00CBA0", // Siacoin
      zil: "#49C1BF", // Zilliqa
      icx: "#1FC5C9", // ICON
      bch: "#8DC351", // Bitcoin Cash
      xem: "#67B2E8", // NEM
      iota: "#242424", // IOTA
      rvn: "#384182", // Ravencoin
      sushi: "#FA52A0", // SushiSwap
      snx: "#5FCDF9", // Synthetix
      crv: "#FF1E00", // Curve DAO Token
      yfi: "#006AE3", // yearn.finance
      lrc: "#2AB6F6", // Loopring
      ksm: "#000000", // Kusama
      bsv: "#EAB300", // Bitcoin SV
      hnt: "#474DFF", // Helium
      ht: "#0ECAF0", // Huobi Token
      tfuel: "#F68C24", // Theta Fuel
      xvs: "#FF5000", // Venus
      ren: "#001C3A", // Ren
      lpt: "#000000", // Livepeer
      srm: "#30C5F5", // Serum
      nft: "#EBFF00", // APENFT
      storj: "#2683FF", // Storj
      ont: "#00A6C2", // Ontology
      tel: "#14C8FF", // Telcoin
      iotx: "#00CDCE", // IoTeX
      glm: "#181EA9", // Golem
      ctsi: "#000000", // Cartesi
      knc: "#31CB9E", // Kyber Network Crystal
      ocean: "#7B1173", // Ocean Protocol
      rlc: "#FFD800", // iExec RLC
      fet: "#1E2F5D", // Fetch.ai
      celr: "#00B5EB", // Celer Network
      alpha: "#29B1EB", // Alpha Finance Lab
      ankr: "#3693FF", // Ankr
      band: "#526DFF", // Band Protocol
      skl: "#000000", // SKALE Network
      bnt: "#000D2B", // Bancor
      nu: "#5D50D5", // NuCypher
      ogn: "#1A82FF", // Origin Protocol
      reef: "#7E0EC6", // Reef
      audio: "#FF457B", // Audius
      uma: "#FF4A4A", // UMA
      gtc: "#773DF3", // Gitcoin
      nkn: "#0C327A", // NKN
      clv: "#000000", // Clover Finance
      ach: "#3163F3", // Alchemy Pay
      poly: "#4C5A95", // Polymath
      perp: "#8B5CF6", // Perpetual Protocol
      req: "#00E6A0", // Request
      badger: "#F1A23A", // Badger DAO
      forth: "#452CF4", // Ampleforth Governance Token
      tribe: "#29A17E", // Tribe
      quick: "#418E8E", // QuickSwap
      tru: "#1A5AFF", // TrueFi
      pla: "#00BFFF", // PlayDapp
      dydx: "#6966FF", // dYdX
      grt: "#6747ED", // The Graph
      ens: "#5284FF", // Ethereum Name Service
      imx: "#00EBFF", // Immutable X
      gmt: "#BFA15F", // STEPN
      apt: "#000000", // Aptos
      op: "#FF0420", // Optimism
      arb: "#28A0F0", // Arbitrum
      blur: "#000000", // Blur
      pepe: "#00CC00", // Pepe
      sui: "#4DA1FF", // Sui
      sei: "#FF00FF", // Sei
    };

    // Use known color if available, otherwise generate one based on index
    if (knownColors[symbol.toLowerCase()]) {
      return knownColors[symbol.toLowerCase()];
    } else {
      // Generate a color based on index for consistency
      const hue = (index * 137.508) % 360; // Golden angle approximation for good distribution
      return `hsl(${hue}, 80%, 60%)`;
    }
  }

  /**
   * Create text label for a cryptocurrency
   */
  createCryptoLabel(crypto, parentMesh) {
    // Create canvas for text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 128;

    // Draw background
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "bold 36px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context;
    // Draw text
    context.font = "bold 36px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(crypto.symbol.toUpperCase(), canvas.width / 2, 40);

    // Draw price
    context.font = "24px Arial";
    const price = this.formatPrice(
      crypto.current_price,
      this.config.apiInstance.config.currency
    );
    context.fillText(price, canvas.width / 2, 80);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    // Create sprite
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 1.5, 1); // Larger text labels
    sprite.position.y = -2.5;

    // Add to parent mesh
    parentMesh.add(sprite);

    return sprite;
  }

  /**
   * Format price for display
   */
  formatPrice(price, currency) {
    if (price === null || price === undefined) return "N/A";

    const currencySymbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      jpy: "¥",
    };

    const symbol = currencySymbols[currency] || "";

    if (price < 0.01) {
      return `${symbol}${price.toFixed(6)}`;
    } else if (price < 1) {
      return `${symbol}${price.toFixed(4)}`;
    } else if (price < 1000) {
      return `${symbol}${price.toFixed(2)}`;
    } else {
      return `${symbol}${Math.round(price).toLocaleString()}`;
    }
  }

  /**
   * Handle mouse movement for object interaction
   */
  onMouseMove(event) {
    const container = document.querySelector(this.config.containerSelector);
    const rect = container.getBoundingClientRect();

    // Handle both mouse and touch events
    let clientX, clientY;
    
    if (event.type === 'touchmove' && event.touches.length === 1) {
      // Single touch
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.type === 'mousemove') {
      // Mouse
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return; // Multi-touch or unsupported event
    }

    // Calculate mouse position in normalized device coordinates
    this.mouse.x = ((clientX - rect.left) / this.config.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / this.config.height) * 2 + 1;
  }

  /**
   * Handle click events for object selection
   */
  /**
   * Handle click events for object selection (continued)
   */
  onClick(event) {
    // Handle both click and touch events
    let clientX, clientY;
    
    if (event.type === 'touchend' && event.changedTouches.length === 1) {
      // Single touch end
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
      
      // Update mouse position for touch
      const container = document.querySelector(this.config.containerSelector);
      const rect = container.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / this.config.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / this.config.height) * 2 + 1;
    } else if (event.type === 'click') {
      // Regular mouse click - mouse position already updated in onMouseMove
    } else {
      return; // Multi-touch or unsupported event
    }

    // Update raycaster with current mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with all objects and their children
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    // Filter intersections to only include our crypto objects or their children
    const cryptoIntersects = intersects.filter((intersect) => {
      const rootObject = this.getRootObject(intersect.object);
      return this.cryptoObjects.includes(rootObject);
    });

    if (cryptoIntersects.length > 0) {
      const rootObject = this.getRootObject(cryptoIntersects[0].object);

      // If clicking on already selected object, deselect it
      if (this.selectedObject === rootObject) {
        this.deselectObject(rootObject);
      } else {
        // Deselect previous object if any
        if (this.selectedObject) {
          this.deselectObject(this.selectedObject);
        }

        // Select the clicked object
        this.selectObject(rootObject);
      }

      // Prevent orbit controls from responding to this click
      if (this.controls) {
        event.stopPropagation();
      }
    } else if (this.selectedObject) {
      // Clicking elsewhere deselects current object
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

    // Apply hover effect
    this.onObjectHover(object);

    // Mark as selected
    object.userData.isSelected = true;
    this.selectedObject = object;

    // Add pulsing effect to the selected object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.8,
      y: object.userData.originalScale.y * 1.8,
      z: object.userData.originalScale.z * 1.8,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
      yoyo: true,
      repeat: 1,
    });

    // Add a highlight effect for SVG objects
    if (object instanceof THREE.Group) {
      // For SVG groups, add a highlight to the entire group
      if (!object.userData.highlightMesh) {
        // Create a circular highlight behind the SVG
        const geometry = new THREE.CircleGeometry(this.config.logoSize, 32);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        });

        const highlightMesh = new THREE.Mesh(geometry, material);
        highlightMesh.position.z = -0.5; // Position behind the SVG
        object.add(highlightMesh);
        object.userData.highlightMesh = highlightMesh;

        // Animate the highlight
        gsap.to(material, {
          opacity: 0.3,
          duration: 1,
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      // For regular meshes, use the existing highlight code
      if (!object.userData.highlightMesh) {
        const geometry = new THREE.CircleGeometry(
          this.config.logoSize * 0.8,
          32
        );
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        });

        const highlightMesh = new THREE.Mesh(geometry, material);
        highlightMesh.position.z = -0.1;
        object.add(highlightMesh);
        object.userData.highlightMesh = highlightMesh;

        gsap.to(material, {
          opacity: 0.3,
          duration: 1,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    // Set timer to deselect after hover duration
    this.hoverTimer = setTimeout(() => {
      if (object.userData.isSelected) {
        this.deselectObject(object);
      }
    }, this.config.hoverDuration);

    // Update instructions
    const instructions = document.querySelector(".crypto-3d-instructions");
    if (instructions) {
      instructions.textContent = "Object selected! Click again to deselect.";
      instructions.classList.remove("fade");

      // Fade out instructions after 3 seconds
      setTimeout(() => {
        instructions.classList.add("fade");
      }, 3000);
    }
  }

  /**
   * Handle object hover
   */
  onObjectHover(object) {
    // Don't apply hover effect if already selected
    if (object.userData.isSelected) return;

    // Provide haptic feedback on mobile devices
    if ('vibrate' in navigator && window.innerWidth <= 992) {
      navigator.vibrate(50); // Short vibration for touch feedback
    }

    // Scale up the object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.5,
      y: object.userData.originalScale.y * 1.5,
      z: object.userData.originalScale.z * 1.5,
      duration: 0.3,
      ease: "back.out",
    });

    // Move object slightly forward
    gsap.to(object.position, {
      y: object.position.y + 2,
      duration: 0.3,
      ease: "power2.out",
    });

    // Show crypto info
    const crypto = object.userData.crypto;
    this.showCryptoInfo(crypto);
  }


  /**
   * Add a subtle glow effect to the crypto logo
   */
  addGlowEffect(object, crypto) {
    // Different approach for SVG groups vs. regular meshes
    if (object instanceof THREE.Group) {
      // For SVG groups, add a glow circle behind the group
      const glowGeometry = new THREE.CircleGeometry(this.config.logoSize, 32);

      // Use the crypto's color for the glow
      const color = new THREE.Color(
        this.getColorForCrypto(crypto.symbol, crypto.market_cap_rank || 0)
      );

      // Create a material that will emit light
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.z = -0.5; // Position behind the SVG
      object.add(glowMesh);

      // Store reference to glow mesh
      object.userData.glowMesh = glowMesh;
    } else {
      // For regular meshes, use the existing glow code
      const glowGeometry = new THREE.CircleGeometry(
        (this.config.logoSize / 2) * 1.2,
        32
      );

      const color = new THREE.Color(
        this.getColorForCrypto(crypto.symbol, crypto.market_cap_rank || 0)
      );

      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.z = -0.1;
      object.add(glowMesh);

      object.userData.glowMesh = glowMesh;
    }

    // Add subtle pulsing animation to the glow
    const pulseIntensity = 0.2 + Math.random() * 0.3;
    const pulseDuration = 1.5 + Math.random() * 1.5;

    // Only apply animation if GSAP is available
    if (window.gsap && object.userData.glowMesh) {
      gsap.to(object.userData.glowMesh.material, {
        opacity: pulseIntensity,
        duration: pulseDuration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  /**
   * Create 3D text for SVG objects
   */
  createSVGText(text, color = 0xffffff) {
    // Check if TextGeometry is available
    if (typeof THREE.TextGeometry === "undefined") {
      return null;
    }

    // Create a loader for the font
    const fontLoader = new THREE.FontLoader();

    // Load a font
    return new Promise((resolve, reject) => {
      fontLoader.load(
        // Font URL - use a CDN font or your own
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        (font) => {
          // Create text geometry
          const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false,
          });

          // Center the text
          textGeometry.computeBoundingBox();
          const textWidth =
            textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
          textGeometry.translate(-textWidth / 2, 0, 0);

          // Create material
          const textMaterial = new THREE.MeshBasicMaterial({ color: color });

          // Create mesh
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          resolve(textMesh);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Create text label for a cryptocurrency
   */
  createCryptoLabel(crypto, parentObject) {
    // Create canvas for text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 128;

    // Draw background
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "bold 36px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(crypto.symbol.toUpperCase(), canvas.width / 2, 40);

    // Draw price
    context.font = "24px Arial";
    const price = this.formatPrice(
      crypto.current_price,
      this.config.apiInstance.config.currency
    );
    context.fillText(price, canvas.width / 2, 80);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    // Create sprite
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 1.5, 1); // Larger text labels

    // Position differently based on parent object type
    if (parentObject instanceof THREE.Group) {
      // For SVG groups, position the label below
      sprite.position.y = -3;
    } else {
      // For regular meshes, use the existing position
      sprite.position.y = -2.5;
    }

    // Add to parent object
    parentObject.add(sprite);

    return sprite;
  }

  /**
   * Update the visualizer when prices change
   */
  update() {
    if (this.initialized) {
      // Store selected object ID if any
      let selectedId = null;
      if (this.selectedObject && this.selectedObject.userData.crypto) {
        selectedId = this.selectedObject.userData.crypto.id;
      }

      // Recreate objects
      this.createCryptoObjects();

      // Restore selection if applicable
      if (selectedId) {
        // Wait a bit for objects to be created
        setTimeout(() => {
          const newObject = this.cryptoObjects.find(
            (obj) =>
              obj.userData.crypto && obj.userData.crypto.id === selectedId
          );

          if (newObject) {
            this.selectObject(newObject);
          }
        }, 500);
      }
    }
  }

  /**
   * Setup the SVG directory structure
   */
  setupSVGDirectory() {

    // Create a directory for SVG files if it doesn't exist
    const directoryPath = "assets/crypto-logos";

    // This would typically be done server-side
    // For client-side, we'll just log instructions

    // Return a promise that resolves when directory is ready
    return new Promise((resolve) => {
      // In a real implementation, you might check if the directory exists
      // For now, we'll just assume it's ready
      resolve();
    });
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

    // Apply hover effect
    this.onObjectHover(object);

    // Mark as selected
    object.userData.isSelected = true;
    this.selectedObject = object;

    // Add pulsing effect to the selected object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.8,
      y: object.userData.originalScale.y * 1.8,
      z: object.userData.originalScale.z * 1.8,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
      yoyo: true,
      repeat: 1,
    });

    // Add a highlight effect
    // if (!object.userData.highlightMesh) {
    //     // Create a highlight circle around the object
    //     const geometry = new THREE.CircleGeometry(this.config.logoSize * 0.8, 32);
    //     const material = new THREE.MeshBasicMaterial({
    //         color: 0xffffff,
    //         transparent: true,
    //         opacity: 0.2,
    //         side: THREE.DoubleSide
    //     });

    //     const highlightMesh = new THREE.Mesh(geometry, material);
    //     highlightMesh.position.z = -0.1; // Position slightly behind the logo
    //     object.add(highlightMesh);
    //     object.userData.highlightMesh = highlightMesh;

    //     // Animate the highlight
    //     gsap.to(material, {
    //         opacity: 0.3,
    //         duration: 1,
    //         yoyo: true,
    //         repeat: -1
    //     });
    // }

    // Set timer to deselect after hover duration
    this.hoverTimer = setTimeout(() => {
      if (object.userData.isSelected) {
        this.deselectObject(object);
      }
    }, this.config.hoverDuration);

    // Update instructions
    const instructions = document.querySelector(".crypto-3d-instructions");
    if (instructions) {
      instructions.textContent = "Object selected! Click again to deselect.";
      instructions.classList.remove("fade");

      // Fade out instructions after 3 seconds
      setTimeout(() => {
        instructions.classList.add("fade");
      }, 8000);
    }
  }

  /**
   * Deselect an object and remove hover effect
   */
  deselectObject(object) {
    // Clear hover timer
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // Remove selected state
    object.userData.isSelected = false;
    this.selectedObject = null;

    // Remove hover effect
    this.onObjectLeave(object);

    // Remove highlight effect
    if (object.userData.highlightMesh) {
      object.remove(object.userData.highlightMesh);
      object.userData.highlightMesh = null;
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const container = document.querySelector(this.config.containerSelector);
    
    // Update dimensions
    this.config.width = container.clientWidth;
    this.config.height = container.clientHeight;

    // Update camera aspect ratio
    this.camera.aspect = this.config.width / this.config.height;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(this.config.width, this.config.height);
    
    // Adjust controls sensitivity based on screen size
    if (this.controls) {
      const isMobile = window.innerWidth <= 992;
      
      if (isMobile) {
        // More sensitive controls for mobile
        this.controls.rotateSpeed = 1.5;
        this.controls.panSpeed = 1.2;
        this.controls.autoRotateSpeed = 0.5;
      } else {
        // Standard controls for desktop
        this.controls.rotateSpeed = 1.0;
        this.controls.panSpeed = 0.8;
        this.controls.autoRotateSpeed = 0.3;
      }
    }
  }

  /**
   * Animation loop
   */
  /**
   * Animation loop
   */
  animate() {
    this.animationFrame = requestAnimationFrame(this.animate);

    // Update controls if available
    if (this.controls) {
      this.controls.update();
    }

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections
    const intersects = this.raycaster.intersectObjects(
      this.cryptoObjects,
      true
    ); // true to check descendants

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

    // Handle new hover (only if not already selected)
    if (intersects.length > 0) {
      // Get the root object (group or mesh)
      const rootObject = this.getRootObject(intersects[0].object);

      if (
        this.hoveredObject !== rootObject &&
        !rootObject.userData.isSelected
      ) {
        this.hoveredObject = rootObject;
        this.onObjectHover(rootObject);
      }
    }

    // Animate all objects
    this.cryptoObjects.forEach((obj) => {
      // For SVG groups, make them face the camera
      if (obj instanceof THREE.Group) {
        obj.quaternion.copy(this.camera.quaternion);
      } else {
        // For meshes, use lookAt
        obj.lookAt(this.camera.position);
      }

      // Apply orbital motion if not hovered or selected
      if (obj !== this.hoveredObject && !obj.userData.isSelected) {
        // Update orbit angle
        obj.userData.orbitAngle += obj.userData.orbitSpeed;

        // Calculate new position
        const newX =
          Math.cos(obj.userData.orbitAngle) * obj.userData.orbitRadius;
        const newZ =
          Math.sin(obj.userData.orbitAngle) * obj.userData.orbitRadius;

        // Smoothly move to new position
        obj.position.x = obj.position.x * 0.98 + newX * 0.02;
        obj.position.z = obj.position.z * 0.98 + newZ * 0.02;

        // Smoothly return to original scale if not at original scale
        if (!obj.scale.equals(obj.userData.originalScale)) {
          obj.scale.lerp(obj.userData.originalScale, 0.1);
        }
      }
    });

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the root object (group or mesh) from a child object
   */
  getRootObject(object) {
    // Traverse up the parent hierarchy until we find an object in our cryptoObjects array
    let current = object;
    while (current.parent && !this.cryptoObjects.includes(current)) {
      current = current.parent;
    }
    return current;
  }

  /**
   * Check if an object is part of another object (for group handling)
   */
  isPartOfObject(rootObject, childObject) {
    if (rootObject === childObject) return true;

    // Check if childObject is a descendant of rootObject
    let current = childObject;
    while (current.parent) {
      if (current.parent === rootObject) return true;
      current = current.parent;
    }

    return false;
  }

  /**
   * Handle object hover
   */
  onObjectHover(object) {
    // Don't apply hover effect if already selected
    if (object.userData.isSelected) return;

    // Scale up the object
    gsap.to(object.scale, {
      x: object.userData.originalScale.x * 1.5,
      y: object.userData.originalScale.y * 1.5,
      z: object.userData.originalScale.z * 1.5,
      duration: 0.3,
      ease: "back.out",
    });

    // Move object slightly forward
    gsap.to(object.position, {
      y: object.position.y + 2,
      duration: 0.3,
      ease: "power2.out",
    });

    // Show crypto info
    const crypto = object.userData.crypto;
    this.showCryptoInfo(crypto);
  }

  /**
   * Handle object leave
   */
  onObjectLeave(object) {
    // Don't remove hover effect if selected
    if (object.userData.isSelected) return;

    // Scale back to original size
    gsap.to(object.scale, {
      x: object.userData.originalScale.x,
      y: object.userData.originalScale.y,
      z: object.userData.originalScale.z,
      duration: 0.3,
      ease: "power2.out",
    });

    // Move back to original position
    gsap.to(object.position, {
      y: object.userData.originalPosition.y,
      duration: 0.3,
      ease: "power2.out",
    });

    // Hide crypto info if no object is selected
    if (!this.selectedObject) {
      this.hideCryptoInfo();
    }
  }

  /**
   * Show cryptocurrency information
   */
  showCryptoInfo(crypto) {
    // Find or create info panel
    let infoPanel = document.getElementById("crypto-3d-info");
    if (!infoPanel) {
      infoPanel = document.createElement("div");
      infoPanel.id = "crypto-3d-info";
      infoPanel.className = "crypto-3d-info";
      document
        .querySelector(this.config.containerSelector)
        .appendChild(infoPanel);
    }

    // Check if mobile device
    const isMobile = window.innerWidth <= 992;

    // Update info panel content with responsive design
    const priceChange = crypto.price_change_percentage_24h;
    const priceChangeClass = priceChange >= 0 ? "positive" : "negative";
    const formattedPrice = this.formatPrice(
      crypto.current_price,
      this.config.apiInstance.config.currency
    );

    // Mobile-friendly layout
    if (isMobile) {
      infoPanel.innerHTML = `
        <div class="crypto-3d-info-header">
          <img src="${crypto.image}" alt="${crypto.name}" width="28" height="28">
          <h3>${crypto.name} <span>(${crypto.symbol.toUpperCase()})</span></h3>
        </div>
        <div class="crypto-3d-info-price">
          <div class="price-value">${formattedPrice}</div>
          <div class="price-change ${priceChangeClass}">
            ${priceChange >= 0 ? "↑" : "↓"} ${Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>
        <div class="crypto-3d-info-details">
          <div class="detail-row">
            <span class="detail-label">Market Cap:</span>
            <span class="detail-value">${this.formatMarketCap(crypto.market_cap)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">24h Volume:</span>
            <span class="detail-value">${this.formatMarketCap(crypto.total_volume)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Rank:</span>
            <span class="detail-value">#${crypto.market_cap_rank}</span>
          </div>
        </div>
        <div class="crypto-3d-info-actions">
          <button class="action-button convert-button" data-crypto="${crypto.id}">Convert</button>
          <button class="action-button details-button" data-crypto="${crypto.id}">Details</button>
        </div>
      `;
    } else {
      // Desktop layout (original)
      infoPanel.innerHTML = `
        <div class="crypto-3d-info-header">
          <img src="${crypto.image}" alt="${crypto.name}" width="32" height="32">
          <h3>${crypto.name} <span>(${crypto.symbol.toUpperCase()})</span></h3>
        </div>
        <div class="crypto-3d-info-price">
          <div class="price-value">${formattedPrice}</div>
          <div class="price-change ${priceChangeClass}">
            ${priceChange >= 0 ? "↑" : "↓"} ${Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>
        <div class="crypto-3d-info-details">
          <div class="detail-row">
            <span class="detail-label">Market Cap:</span>
            <span class="detail-value">${this.formatMarketCap(crypto.market_cap)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">24h Volume:</span>
            <span class="detail-value">${this.formatMarketCap(crypto.total_volume)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Rank:</span>
            <span class="detail-value">#${crypto.market_cap_rank}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">24h High:</span>
            <span class="detail-value">${this.formatPrice(crypto.high_24h, this.config.apiInstance.config.currency)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">24h Low:</span>
            <span class="detail-value">${this.formatPrice(crypto.low_24h, this.config.apiInstance.config.currency)}</span>
          </div>
        </div>
        <div class="crypto-3d-info-actions">
          <button class="action-button convert-button" data-crypto="${crypto.id}">Convert</button>
          <button class="action-button details-button" data-crypto="${crypto.id}">Details</button>
        </div>
      `;
    }

    // Show with animation
    gsap.fromTo(
      infoPanel,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", display: "block" }
    );

    // Add event listeners to buttons with touch-friendly handling
    const convertButton = infoPanel.querySelector(".convert-button");
    if (convertButton) {
      const handleConvert = () => {
        // Provide haptic feedback on mobile
        if ('vibrate' in navigator && isMobile) {
          navigator.vibrate(100);
        }
        
        // Scroll to converter and pre-select this crypto
        const converterContainer = document.querySelector("#crypto-converter");
        if (converterContainer) {
          converterContainer.scrollIntoView({ behavior: "smooth" });

          setTimeout(() => {
            const currencyFromSelect = document.getElementById("currency-from");
            if (currencyFromSelect) {
              const cryptoValue = `crypto:${crypto.id}`;
              currencyFromSelect.value = cryptoValue;

              const event = new Event("change");
              currencyFromSelect.dispatchEvent(event);

              if (window.cryptoConverter) {
                window.cryptoConverter.updateCurrencyLogo("from");
                window.cryptoConverter.performConversion();
              }
            }
          }, 500);
        }
      };

      convertButton.addEventListener("click", handleConvert);
      convertButton.addEventListener("touchend", handleConvert);
    }

    // Add event listener for details button
    const detailsButton = infoPanel.querySelector(".details-button");
    if (detailsButton) {
      const handleDetails = () => {
        // Provide haptic feedback on mobile
        if ('vibrate' in navigator && isMobile) {
          navigator.vibrate(100);
        }
        
        const priceTable = document.querySelector(".crypto-table");
        if (priceTable) {
          priceTable.scrollIntoView({ behavior: "smooth" });

          setTimeout(() => {
            const rows = priceTable.querySelectorAll("tbody tr");
            rows.forEach((row) => {
              const nameCell = row.querySelector(".crypto-name");
              if (nameCell && nameCell.textContent.includes(crypto.name)) {
                row.classList.add("highlight-row");
                setTimeout(() => {
                  row.classList.remove("highlight-row");
                }, 3000);
              }
            });
          }, 500);
        }
      };

      detailsButton.addEventListener("click", handleDetails);
      detailsButton.addEventListener("touchend", handleDetails);
    }
  }



  /**
   * Hide cryptocurrency information
   */
  hideCryptoInfo() {
    const infoPanel = document.getElementById("crypto-3d-info");
    if (infoPanel) {
      gsap.to(infoPanel, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          infoPanel.style.display = "none";
        },
      });
    }
  }

  /**
   * Format market cap with appropriate suffix (B, M, K)
   */
  formatMarketCap(marketCap) {
    if (marketCap === null || marketCap === undefined) return "N/A";

    const currency = this.config.apiInstance.config.currency || "usd";
    const currencySymbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      jpy: "¥",
    };

    const symbol = currencySymbols[currency] || "";

    if (marketCap >= 1000000000) {
      return `${symbol}${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `${symbol}${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `${symbol}${(marketCap / 1000).toFixed(2)}K`;
    } else {
      return `${symbol}${marketCap}`;
    }
  }

  /**
   * Update the visualizer when prices change
   */
  update() {
    if (this.initialized) {
      // Store selected object ID if any
      let selectedId = null;
      if (this.selectedObject && this.selectedObject.userData.crypto) {
        selectedId = this.selectedObject.userData.crypto.id;
      }

      // Recreate objects
      this.createCryptoObjects();

      // Restore selection if applicable
      if (selectedId) {
        const newObject = this.cryptoObjects.find(
          (obj) => obj.userData.crypto && obj.userData.crypto.id === selectedId
        );

        if (newObject) {
          this.selectObject(newObject);
        }
      }
    }
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
      container.removeEventListener("mousemove", this.onMouseMove);
      container.removeEventListener("click", this.onClick);

      // Remove wheel handler
      if (this.wheelHandler) {
        container.removeEventListener("wheel", this.wheelHandler);
      }

      // Remove Three.js canvas
      const canvas = container.querySelector("canvas");
      if (canvas) {
        container.removeChild(canvas);
      }

      // Remove info panel
      const infoPanel = document.getElementById("crypto-3d-info");
      if (infoPanel) {
        container.removeChild(infoPanel);
      }
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.cryptoObjects = [];
    this.hoveredObject = null;
    this.selectedObject = null;
    this.initialized = false;
  }
}

// Create and initialize the visualizer when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Add loading indicator
  const container =
    document.querySelector("#crypto-3d-container") || document.body;
  
  // Remove any existing loading indicator first
  const existingIndicator = container.querySelector(".crypto-3d-loading");
  if (existingIndicator) {
    container.removeChild(existingIndicator);
  }
  
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "crypto-3d-loading";
  
  // Device-specific loading message
  const isMobile = window.innerWidth <= 992;
  const loadingMessage = isMobile 
    ? "Loading 3D Visualizer...<br>"
    : "Loading 3D Cryptocurrency Visualizer...";
    
  loadingIndicator.innerHTML = `
    <div class="spinner"></div>
    <div>${loadingMessage}</div>
  `;
  container.appendChild(loadingIndicator);

  // Load required libraries
  const loadScript = (url, callback) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
      callback(); // Continue anyway
    };
    document.head.appendChild(script);
  };

  // Load Three.js first
  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    () => {
      // Load SVGLoader
      loadScript(
        "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/SVGLoader.js",
        () => {
          // Load OrbitControls
          loadScript(
            "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js",
            () => {
              // Then load GSAP for animations
              loadScript(
                "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js",
                () => {
                  // Wait for cryptoApi to be available
                  const waitForCryptoApi = setInterval(() => {
                    if (
                      window.cryptoApi &&
                      window.cryptoApi.prices &&
                      window.cryptoApi.prices.length > 0
                    ) {
                      clearInterval(waitForCryptoApi);

                      // Create and initialize the visualizer with mobile-optimized settings
                      const isMobile = window.innerWidth <= 992;
                      const crypto3DConfig = {
                        containerSelector: "#crypto-3d-container",
                        width: window.innerWidth,
                        height: isMobile ? window.innerHeight * 0.88 : window.innerHeight,
                        backgroundColor: 0x0a0a14,
                        apiInstance: window.cryptoApi,
                        cryptoCount: isMobile ? 15 : 20, // Fewer objects on mobile for better performance
                        logoSize: isMobile ? 2.5 : 3.5, // Smaller logos on mobile
                        hoverDuration: isMobile ? 6000 : 8000, // Shorter hover duration on mobile
                      };

                      const crypto3D = new Crypto3DVisualizer(crypto3DConfig);
                      
                      crypto3D.init().then(() => {
                        // Add mobile-specific instructions
                        if (isMobile) {

                          // Hide mobile instructions after 10 seconds
                          setTimeout(() => {
                            instructions.classList.add("fade");
                          }, 10000);
                        }
                      }).catch((err) => {
                        // Make sure to remove loading spinner even if initialization fails
                        const loadingIndicator = document.querySelector(".crypto-3d-loading");
                        if (loadingIndicator && loadingIndicator.parentNode) {
                          loadingIndicator.parentNode.removeChild(loadingIndicator);
                        }
                        
                        // Show error message
                        const errorMessage = document.createElement("div");
                        errorMessage.className = "crypto-3d-error";
                        errorMessage.innerHTML = `
                        `;
                        container.appendChild(errorMessage);
                      });

                      // Add update listener to cryptoApi
                      if (window.cryptoApi && typeof window.cryptoApi.fetchPrices === 'function') {
                        const originalFetchPrices = window.cryptoApi.fetchPrices;
                        window.cryptoApi.fetchPrices = async function () {
                          const result = await originalFetchPrices.apply(this, arguments);
                          if (crypto3D && crypto3D.initialized) {
                            crypto3D.update();
                          }
                          return result;
                        };
                      }

                      // Export for external use
                      window.crypto3D = crypto3D;

                      // Add orientation change handler for mobile devices
                      if (isMobile) {
                        window.addEventListener('orientationchange', () => {
                          setTimeout(() => {
                            if (crypto3D && crypto3D.initialized) {
                              crypto3D.onWindowResize();
                            }
                          }, 500); // Delay to allow orientation change to complete
                        });
                      }

                      // Add visibility change handler to pause/resume animation
                      document.addEventListener('visibilitychange', () => {
                        if (crypto3D && crypto3D.controls) {
                          if (document.hidden) {
                            // Pause auto-rotation when tab is hidden
                            crypto3D.controls.autoRotate = false;
                          } else {
                            // Resume auto-rotation when tab is visible
                            setTimeout(() => {
                              crypto3D.controls.autoRotate = true;
                            }, 1000);
                          }
                        }
                      });
                    }
                  }, 100);

                  // Add a timeout to remove the loading spinner if initialization takes too long
                  setTimeout(() => {
                    const loadingIndicator = document.querySelector(".crypto-3d-loading");
                    if (loadingIndicator && loadingIndicator.parentNode) {
                      loadingIndicator.parentNode.removeChild(loadingIndicator);
                      
                      // Show timeout message
                      const timeoutMessage = document.createElement("div");
                      timeoutMessage.className = "crypto-3d-timeout";
                      timeoutMessage.innerHTML = `
                        <div>⏱️ Loading timeout</div>
                        <div><small>Please refresh the page to try again</small></div>
                      `;
                      container.appendChild(timeoutMessage);
                    }
                  }, 30000); // 30 seconds timeout
                }
              );
            }
          );
        }
      );
    }
  );

  // Add CSS for mobile-specific styling
  const mobileStyles = document.createElement('style');
  mobileStyles.textContent = `
    @media (max-width: 992px) {
      .crypto-3d-info.mobile {
        position: fixed !important;
        bottom: 20px !important;
        left: 10px !important;
        right: 10px !important;
        top: auto !important;
        max-width: none !important;
        font-size: 14px !important;
        z-index: 1000 !important;
      }
      
      .crypto-3d-info-header.mobile h3 {
        font-size: 14px !important;
        margin: 5px 0 !important;
      }
      
      .crypto-3d-info-price.mobile .price-value {
        font-size: 16px !important;
      }
      
      .crypto-3d-info-details.mobile {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 5px !important;
        margin: 10px 0 !important;
      }
      
      .crypto-3d-info-actions.mobile {
        display: flex !important;
        gap: 10px !important;
        margin-top: 10px !important;
      }
      
      .crypto-3d-info-actions.mobile .action-button {
        flex: 1 !important;
        padding: 12px 8px !important;
        font-size: 14px !important;
        touch-action: manipulation !important;
      }
      
      .crypto-3d-instructions.mobile {
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 15px 20px !important;
        border-radius: 10px !important;
        font-size: 14px !important;
        text-align: center !important;
        z-index: 1000 !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .crypto-3d-instructions.mobile div {
        margin: 5px 0 !important;
      }
      
      .crypto-3d-zoom-level {
        font-size: 14px !important;
        padding: 8px 12px !important;
      }
      
      .crypto-3d-zoom-instruction {
        font-size: 12px !important;
        padding: 8px 12px !important;
      }
      
      .crypto-3d-error,
      .crypto-3d-timeout {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: rgba(255, 0, 0, 0.1) !important;
        border: 2px solid #ff4444 !important;
        color: #ff4444 !important;
        padding: 20px !important;
        border-radius: 10px !important;
        text-align: center !important;
        z-index: 1000 !important;
        backdrop-filter: blur(10px) !important;
      }
      
      /* Prevent text selection on mobile */
      .crypto-3d-info * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Improve touch targets */
      .action-button {
        min-height: 44px !important;
        min-width: 44px !important;
      }
    }
    
    /* Fade animations */
    .crypto-3d-instructions.fade,
    .crypto-3d-zoom-instruction.fade-out {
      opacity: 0 !important;
      transition: opacity 1s ease-out !important;
    }
    
    /* Loading spinner */
    .crypto-3d-loading .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Zoom indicators */
    .crypto-3d-zoom-level,
    .crypto-3d-zoom-indicator {
    height: 40px;
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .crypto-3d-zoom-level.show,
    .crypto-3d-zoom-indicator.show {
      opacity: 1;
    }
  `;
  document.head.appendChild(mobileStyles);
});
