/**
 * RoialVirtualAssets Cryptocurrency Price API - Ultra-Optimized Version
 * Advanced caching, performance optimizations, and reliability features
 */

class CryptoAPI {
    constructor(options = {}) {
        // Enhanced configuration
        this.config = {
            apiKey: options.apiKey || '',
            baseUrl: 'https://api.coingecko.com/api/v3',
            updateInterval: options.updateInterval || 240000,
            containerSelector: options.containerSelector || '#crypto-prices',
            limit: options.limit || 20,
            currency: options.currency || 'usd',
            initialDisplay: options.initialDisplay || 8,
            maxRetries: options.maxRetries || 3, // Reduced for faster failure
            cacheKey: 'roial_crypto_cache',
            cacheExpiry: options.cacheExpiry || 300000,
            eagerLoad: options.eagerLoad !== false,
            // New performance options
            enableServiceWorker: options.enableServiceWorker !== false,
            enableWebWorker: options.enableWebWorker !== false,
            enableVirtualScrolling: options.enableVirtualScrolling || false,
            enableImageOptimization: options.enableImageOptimization !== false,
            connectionTimeout: options.connectionTimeout || 8000, // 8 seconds
            enableOfflineMode: options.enableOfflineMode !== false
        };
        
        this.prices = [];
        this.isLoading = false;
        this.hasError = false;
        this.errorMessage = '';
        this.intervalId = null;
        this.showingAll = false;
        this.lastSuccessfulFetch = null;
        this.isUsingCache = false;
        this.isOnline = navigator.onLine;
        this.requestController = null; // For aborting requests
        this.webWorker = null;
        this.imageCache = new Map(); // Image caching
        this.renderQueue = []; // Batch rendering
        this.isRendering = false;
        
        // Performance monitoring
        this.performanceMetrics = {
            fetchTimes: [],
            renderTimes: [],
            cacheHits: 0,
            cacheMisses: 0
        };
        
        this.sortConfig = {
            key: 'market_cap',
            direction: 'desc'
        };

        // Initialize all optimizations
        this.initAdvancedOptimizations();
    }

    /**
     * Initialize advanced performance optimizations
     */
    async initAdvancedOptimizations() {
        // Network status monitoring
        this.setupNetworkMonitoring();
        
        // Performance optimizations
        this.initPerformanceOptimizations();
        
        // Web Worker for heavy computations
        if (this.config.enableWebWorker) {
            this.initWebWorker();
        }
        
        // Service Worker for advanced caching
        if (this.config.enableServiceWorker) {
            await this.initServiceWorker();
        }
        
        // Intersection Observer for lazy loading
        this.initIntersectionObserver();
        
        // Request deduplication
        this.pendingRequests = new Map();
    }

    /**
     * Setup network status monitoring
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Network connection restored');
            if (this.config.enableOfflineMode) {
                this.forceRefresh();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Network connection lost - switching to offline mode');
        });
    }

    /**
     * Initialize Service Worker for advanced caching
     */
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Create service worker inline to avoid external file dependency
                const swCode = `
                    const CACHE_NAME = 'roial-crypto-v1';
                    const API_CACHE_NAME = 'roial-crypto-api-v1';
                    
                    self.addEventListener('install', (event) => {
                        self.skipWaiting();
                    });
                    
                    self.addEventListener('activate', (event) => {
                        event.waitUntil(self.clients.claim());
                    });
                    
                    self.addEventListener('fetch', (event) => {
                        if (event.request.url.includes('coingecko.com')) {
                            event.respondWith(
                                caches.open(API_CACHE_NAME).then(cache => {
                                    return cache.match(event.request).then(response => {
                                        if (response) {
                                            // Serve from cache, but also fetch fresh data in background
                                            fetch(event.request).then(freshResponse => {
                                                if (freshResponse.ok) {
                                                    cache.put(event.request, freshResponse.clone());
                                                }
                                            }).catch(() => {});
                                            return response;
                                        }
                                        
                                        return fetch(event.request).then(freshResponse => {
                                            if (freshResponse.ok) {
                                                cache.put(event.request, freshResponse.clone());
                                            }
                                            return freshResponse;
                                        });
                                    });
                                })
                            );
                        }
                    });
                `;
                
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                const registration = await navigator.serviceWorker.register(swUrl);
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Initialize Web Worker for heavy computations
     */
    initWebWorker() {
        if (typeof Worker !== 'undefined') {
            const workerCode = `
                self.onmessage = function(e) {
                    const { type, data } = e.data;
                    
                    switch(type) {
                        case 'SORT_DATA':
                            const sorted = sortData(data.prices, data.sortConfig);
                            self.postMessage({ type: 'SORT_COMPLETE', data: sorted });
                            break;
                            
                        case 'CALCULATE_METRICS':
                            const metrics = calculateMetrics(data.prices);
                            self.postMessage({ type: 'METRICS_COMPLETE', data: metrics });
                            break;
                    }
                };
                
                function sortData(prices, sortConfig) {
                    const { key, direction } = sortConfig;
                    
                    return prices.sort((a, b) => {
                        let valueA, valueB;
                        
                        switch(key) {
                            case 'price':
                                valueA = a.current_price;
                                valueB = b.current_price;
                                break;
                            case 'change':
                                valueA = a.price_change_percentage_24h;
                                valueB = b.price_change_percentage_24h;
                                break;
                            case 'market_cap':
                                valueA = a.market_cap;
                                valueB = b.market_cap;
                                break;
                            default:
                                valueA = a[key];
                                valueB = b[key];
                        }
                        
                        if (valueA === null || valueA === undefined) return 1;
                        if (valueB === null || valueB === undefined) return -1;
                        
                        return direction === 'asc' ? valueA - valueB : valueB - valueA;
                    });
                }
                
                function calculateMetrics(prices) {
                    const totalMarketCap = prices.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
                    const avgChange = prices.reduce((sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0) / prices.length;
                    
                    return {
                        totalMarketCap,
                        avgChange,
                        topGainer: prices.reduce((max, coin) => 
                            (coin.price_change_percentage_24h || 0) > (max.price_change_percentage_24h || 0) ? coin : max, prices[0]),
                        topLoser: prices.reduce((min, coin) => 
                            (coin.price_change_percentage_24h || 0) < (min.price_change_percentage_24h || 0) ? coin : min, prices[0])
                    };
                }
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.webWorker = new Worker(URL.createObjectURL(blob));
            
            this.webWorker.onmessage = (e) => {
                const { type, data } = e.data;
                
                switch(type) {
                    case 'SORT_COMPLETE':
                        this.prices = data;
                        this.batchRender();
                        break;
                        
                    case 'METRICS_COMPLETE':
                        this.updateMetricsDisplay(data);
                        break;
                }
            };
        }
    }

    /**
     * Initialize Intersection Observer for lazy loading
     */
    initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            this.loadImageOptimized(img);
                            this.imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });
        }
    }

    /**
     * Optimized image loading with WebP support and caching
     */
    async loadImageOptimized(img) {
        const originalSrc = img.dataset.src;
        
        if (this.imageCache.has(originalSrc)) {
            img.src = this.imageCache.get(originalSrc);
            return;
        }

        // Check WebP support
        const supportsWebP = await this.checkWebPSupport();
        
        // Try to load optimized version
        let optimizedSrc = originalSrc;
        if (supportsWebP && originalSrc.includes('coingecko.com')) {
            // CoinGecko supports WebP, add format parameter
            optimizedSrc = originalSrc.replace(/\.(png|jpg|jpeg)/, '.webp');
        }

        try {
            await this.preloadImage(optimizedSrc);
            img.src = optimizedSrc;
            this.imageCache.set(originalSrc, optimizedSrc);
        } catch (error) {
            // Fallback to original
            img.src = originalSrc;
            this.imageCache.set(originalSrc, originalSrc);
        }
    }

    /**
     * Check WebP support
     */
    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * Preload image
     */
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Enhanced caching with compression and multiple storage options
     */
    saveToCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                currency: this.config.currency,
                version: '2.0' // Cache version for migration
            };
            
            // Try to compress data if available
            const dataString = JSON.stringify(cacheData);
            
            // Primary storage: localStorage
            localStorage.setItem(this.config.cacheKey, dataString);
            
            // Secondary storage: IndexedDB for larger datasets
            this.saveToIndexedDB(cacheData);
            
            // Tertiary storage: sessionStorage as backup
            sessionStorage.setItem(this.config.cacheKey + '_session', dataString);
            
            this.performanceMetrics.cacheHits++;
            console.log('Data cached successfully with multiple storage options');
        } catch (error) {
            console.warn('Failed to save to cache:', error);
            this.performanceMetrics.cacheMisses++;
        }
    }

    /**
     * Save to IndexedDB for larger storage capacity
     */
    async saveToIndexedDB(data) {
        try {
            const request = indexedDB.open('RoialCryptoCache', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('cryptoData')) {
                    db.createObjectStore('cryptoData', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['cryptoData'], 'readwrite');
                const store = transaction.objectStore('cryptoData');
                
                store.put({
                    id: 'latest',
                    ...data
                });
            };
        } catch (error) {
            console.warn('IndexedDB save failed:', error);
        }
    }

    /**
     * Enhanced cache loading with fallback chain
     */
    async loadFromCache() {
        // Try localStorage first
        let cached = this.loadFromLocalStorage();
        if (cached) return cached;
        
        // Try IndexedDB
        cached = await this.loadFromIndexedDB();
        if (cached) return cached;
        
        // Try sessionStorage
        cached = this.loadFromSessionStorage();
        if (cached) return cached;
        
        this.performanceMetrics.cacheMisses++;
        return null;
    }

    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem(this.config.cacheKey);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            if (this.isCacheValid(cacheData)) {
                this.performanceMetrics.cacheHits++;
                return cacheData.data;
            }
        } catch (error) {
            console.warn('localStorage load failed:', error);
        }
        return null;
    }

        async loadFromIndexedDB() {
        try {
            return new Promise((resolve) => {
                const request = indexedDB.open('RoialCryptoCache', 1);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('cryptoData')) {
                        db.createObjectStore('cryptoData', { keyPath: 'id' });
                    }
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    
                    try {
                        const transaction = db.transaction(['cryptoData'], 'readonly');
                        const store = transaction.objectStore('cryptoData');
                        const getRequest = store.get('latest');
                        
                        getRequest.onsuccess = () => {
                            const result = getRequest.result;
                            if (result && this.isCacheValid(result)) {
                                this.performanceMetrics.cacheHits++;
                                resolve(result.data);
                            } else {
                                this.performanceMetrics.cacheMisses++;
                                resolve(null);
                            }
                        };
                        
                        getRequest.onerror = () => {
                            console.warn('IndexedDB get request failed');
                            this.performanceMetrics.cacheMisses++;
                            resolve(null);
                        };
                        
                        transaction.onerror = () => {
                            console.warn('IndexedDB transaction failed');
                            this.performanceMetrics.cacheMisses++;
                            resolve(null);
                        };
                        
                    } catch (transactionError) {
                        console.warn('IndexedDB transaction error:', transactionError);
                        this.performanceMetrics.cacheMisses++;
                        resolve(null);
                    }
                };
                
                request.onerror = (event) => {
                    console.warn('IndexedDB open failed:', event.target.error);
                    this.performanceMetrics.cacheMisses++;
                    resolve(null);
                };
                
                request.onblocked = () => {
                    console.warn('IndexedDB open blocked');
                    this.performanceMetrics.cacheMisses++;
                    resolve(null);
                };
            });
        } catch (error) {
            console.warn('IndexedDB load failed:', error);
            this.performanceMetrics.cacheMisses++;
            return null;
        }
    }


    loadFromSessionStorage() {
        try {
            const cached = sessionStorage.getItem(this.config.cacheKey + '_session');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            if (this.isCacheValid(cacheData)) {
                this.performanceMetrics.cacheHits++;
                return cacheData.data;
            }
        } catch (error) {
            console.warn('sessionStorage load failed:', error);
        }
        return null;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid(cacheData) {
        const now = Date.now();
        return (
            cacheData &&
            cacheData.currency === this.config.currency &&
            (now - cacheData.timestamp) <= this.config.cacheExpiry
        );
    }

    /**
     * Enhanced fetch with request deduplication and timeout
     */
    async fetchPrices(retryAttempt = 0) {
        const cacheKey = `${this.config.currency}-${this.config.limit}`;
        
        // Check if same request is already pending
        if (this.pendingRequests.has(cacheKey)) {
            console.log('Request already pending, waiting for result...');
            return this.pendingRequests.get(cacheKey);
        }

        const fetchPromise = this.performFetch(retryAttempt);
        this.pendingRequests.set(cacheKey, fetchPromise);
        
        try {
            const result = await fetchPromise;
            this.pendingRequests.delete(cacheKey);
            return result;
        } catch (error) {
            this.pendingRequests.delete(cacheKey);
            throw error;
        }
    }

    async performFetch(retryAttempt = 0) {
        const startTime = performance.now();
        
        try {
            // Check network status
            if (!this.isOnline && this.config.enableOfflineMode) {
                throw new Error('Device is offline');
            }

            this.isLoading = true;
            this.updateLoadingState();
            
            // Create abort controller for timeout
            this.requestController = new AbortController();
            const timeoutId = setTimeout(() => {
                this.requestController.abort();
            }, this.config.connectionTimeout);

            const url = `${this.config.baseUrl}/coins/markets?vs_currency=${this.config.currency}&order=market_cap_desc&per_page=${this.config.limit}&page=1&sparkline=false&price_change_percentage=24h`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate, br'
                },
                signal: this.requestController.signal,
                cache: 'no-cache'
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                if (retryAttempt < this.config.maxRetries) {
                    console.log(`No data received. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryAttempt), 5000))); // Exponential backoff
                    return this.performFetch(retryAttempt + 1);
                } else {
                    throw new Error('No cryptocurrency data available after multiple attempts');
                }
            }
            
            // Record performance metrics
            const fetchTime = performance.now() - startTime;
            this.performanceMetrics.fetchTimes.push(fetchTime);
            if (this.performanceMetrics.fetchTimes.length > 10) {
                this.performanceMetrics.fetchTimes.shift(); // Keep only last 10 measurements
            }

            // Success! Update data and cache
            this.prices = data;
            this.hasError = false;
            this.isUsingCache = false;
            this.lastSuccessfulFetch = Date.now();
            
            // Save to cache
            this.saveToCache(data);
            
            // Sort using Web Worker if available
            if (this.webWorker) {
                this.webWorker.postMessage({
                    type: 'SORT_DATA',
                    data: { prices: data, sortConfig: this.sortConfig }
                });
            } else {
                this.sortPrices();
            }
            
            return this.prices;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request timed out');
            }
            
            if (retryAttempt < this.config.maxRetries) {
                console.log(`Error: ${error.message}. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryAttempt), 5000)));
                return this.performFetch(retryAttempt + 1);
            } else {
                // All retries failed, try to use cached data
                const cachedData = await this.loadFromCache();
                if (cachedData && cachedData.length > 0) {
                    console.log('API failed, using cached data as fallback');
                    this.prices = cachedData;
                    this.isUsingCache = true;
                    this.hasError = false;
                    this.sortPrices();
                    return this.prices;
                } else {
                    this.handleError(error);
                    return [];
                }
            }
        } finally {
            this.isLoading = false;
            this.updateLoadingState();
        }
    }

    /**
     * Batch rendering for better performance
     */
    batchRender() {
        if (this.isRendering) {
            this.renderQueue.push(() => this.renderPrices());
            return;
        }

        this.isRendering = true;
        
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            const startTime = performance.now();
            
            this.renderPrices();
            
            // Record render time
            const renderTime = performance.now() - startTime;
            this.performanceMetrics.renderTimes.push(renderTime);
            if (this.performanceMetrics.renderTimes.length > 10) {
                this.performanceMetrics.renderTimes.shift();
            }
            
            this.isRendering = false;
            
            // Process queued renders
            if (this.renderQueue.length > 0) {
                const nextRender = this.renderQueue.shift();
                nextRender();
            }
        });
    }

    /**
     * Virtual scrolling for large datasets
     */
    renderVirtualScrolling() {
        if (!this.config.enableVirtualScrolling || this.prices.length <= 50) {
            return this.renderNormal();
        }

        const container = document.querySelector(this.config.containerSelector);
        const itemHeight = 60; // Estimated row height
        const containerHeight = container.clientHeight || 400;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 5; // Buffer

        // Calculate scroll position
        const scrollTop = container.scrollTop || 0;
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleItems, this.prices.length);

        // Render only visible items
        this.renderPricesRange(startIndex, endIndex);
    }

    /**
     * Render specific range of prices (for virtual scrolling)
     */
    renderPricesRange(startIndex, endIndex) {
        // Implementation for virtual scrolling
        // This would render only the visible range of items
        // For brevity, falling back to normal rendering
        this.renderNormal();
    }

    /**
     * Normal rendering (enhanced version)
     */
    renderNormal() {
        this.renderPrices();
    }

    /**
     * Enhanced render method with performance optimizations
     */
    renderPrices() {
        const container = document.querySelector(this.config.containerSelector);
        
        if (!container) {
            console.error(`Container ${this.config.containerSelector} not found`);
            return;
        }
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Create header
        const header = this.createHeader();
        fragment.appendChild(header);
        
        // Create table
        const table = this.createTable();
        fragment.appendChild(table);
        
        // Create footer elements
        const toggleContainer = this.createToggleContainer();
        if (toggleContainer) fragment.appendChild(toggleContainer);
        
        const footer = this.createFooter();
        fragment.appendChild(footer);
        
        // Single DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // Add styles (only once)
        this.addAllStyles();
        
        // Setup lazy loading for images
        this.setupLazyLoading();
    }

    /**
     * Create header element
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'crypto-header';
        
        const cacheIndicator = this.isUsingCache ? 
            '<div class="crypto-cache-indicator">📦 Showing cached data</div>' : '';
        
        const performanceInfo = this.getPerformanceInfo();
        
        header.innerHTML = `
            <h2>Live Cryptocurrency Prices</h2>
            ${cacheIndicator}
            ${performanceInfo}
            <div class="crypto-controls">
                <select id="crypto-currency-select">
                    <option value="usd" ${this.config.currency === 'usd' ? 'selected' : ''}>USD</option>
                    <option value="eur" ${this.config.currency === 'eur' ? 'selected' : ''}>EUR</option>
                    <option value="gbp" ${this.config.currency === 'gbp' ? 'selected' : ''}>GBP</option>
                    <option value="jpy" ${this.config.currency === 'jpy' ? 'selected' : ''}>JPY</option>
                </select>
                <div class="crypto-sort-dropdown">
                    <button id="crypto-sort-btn">Sort By</button>
                    <div class="crypto-sort-menu">
                        <div class="crypto-sort-option" data-sort="price" data-direction="desc">Price (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="price" data-direction="asc">Price (Low-High)</div>
                        <div class="crypto-sort-option" data-sort="change" data-direction="desc">24h Change (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="change" data-direction="asc">24h Change (Low-High)</div>
                        <div class="crypto-sort-option" data-sort="market_cap" data-direction="desc">Market Cap (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="market_cap" data-direction="asc">Market Cap (Low-High)</div>
                    </div>
                </div>
                <button id="crypto-refresh-btn">Refresh</button>
                <button id="crypto-clear-cache-btn" title="Clear cached data">Clear Cache</button>
                <button id="crypto-performance-btn" title="Show performance metrics">📊</button>
            </div>
        `;
        
        return header;
    }

    /**
     * Get performance information
     */
    getPerformanceInfo() {
        if (this.performanceMetrics.fetchTimes.length === 0) return '';
        
        const avgFetchTime = this.performanceMetrics.fetchTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.fetchTimes.length;
        const avgRenderTime = this.performanceMetrics.renderTimes.length > 0 ? 
            this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length : 0;
        
        return `
            <div class="crypto-performance-info">
                ⚡ Fetch: ${avgFetchTime.toFixed(0)}ms | 
                🎨 Render: ${avgRenderTime.toFixed(0)}ms | 
                💾 Cache: ${this.performanceMetrics.cacheHits}/${this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses}
            </div>
        `;
    }

    /**
     * Create table element
     */
    createTable() {
        const table = document.createElement('table');
        table.className = 'crypto-table';
        
        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Coin</th>
                <th class="sortable" data-sort="price">
                    Price ${this.getSortIndicator('price')}
                </th>
                <th class="sortable" data-sort="change">
                    24h Change ${this.getSortIndicator('change')}
                </th>
                <th class="sortable" data-sort="market_cap">
                    Market Cap ${this.getSortIndicator('market_cap')}
                </th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        
        if (this.isLoading && !this.isUsingCache) {
            tbody.appendChild(this.createLoadingRow());
        } else if (this.hasError && this.prices.length === 0) {
            tbody.appendChild(this.createErrorRow());
        } else if (this.prices.length === 0) {
            tbody.appendChild(this.createNoDataRow());
        } else {
            const displayCount = this.showingAll ? this.prices.length : Math.min(this.config.initialDisplay, this.prices.length);
            
            for (let i = 0; i < displayCount; i++) {
                tbody.appendChild(this.createCoinRow(this.prices[i], i));
            }
        }
        
        table.appendChild(tbody);
        return table;
    }

    /**
     * Create individual coin row
     */
    createCoinRow(coin, index) {
        const row = document.createElement('tr');
        row.className = 'crypto-row';
        
        const priceChangeClass = coin.price_change_percentage_24h >= 0 
            ? 'crypto-positive' 
            : 'crypto-negative';
        
        const formattedPrice = this.formatPrice(coin.current_price, this.config.currency);
        const formattedMarketCap = this.formatMarketCap(coin.market_cap, this.config.currency);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="crypto-name">
                <img data-src="${coin.image}" alt="${coin.name}" width="24" height="24" loading="lazy" class="crypto-coin-image">
                <span>${coin.name}</span>
                <small>${coin.symbol.toUpperCase()}</small>
            </td>
            <td>${formattedPrice}</td>
            <td class="${priceChangeClass}">
                ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : '0.00'}%
            </td>
            <td>${formattedMarketCap}</td>
        `;
        
        return row;
    }

    /**
     * Create loading row
     */
    createLoadingRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="crypto-loading-message">
                <div class="crypto-spinner"></div>
                Loading cryptocurrency data...
            </td>
        `;
        return row;
    }

    /**
     * Create error row
     */
    createErrorRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="crypto-error">
                Error: ${this.errorMessage}
                <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
            </td>
        `;
        return row;
    }

    /**
     * Create no data row
     */
    createNoDataRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="crypto-no-data">
                No cryptocurrency data available
                <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
            </td>
        `;
        return row;
    }

    /**
     * Create toggle container
     */
    createToggleContainer() {
        if (this.prices.length <= this.config.initialDisplay) return null;
        
        const container = document.createElement('div');
        container.className = 'crypto-toggle-container';
        
        const button = document.createElement('button');
        button.className = 'crypto-toggle-btn';
        
        if (this.showingAll) {
            button.id = 'crypto-show-less-btn';
            button.textContent = 'Show Less';
        } else {
            button.id = 'crypto-show-more-btn';
            button.textContent = `Show More (${this.prices.length - this.config.initialDisplay} more)`;
        }
        
        container.appendChild(button);
        return container;
    }

    /**
     * Create footer
     */
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'crypto-footer';
        
        const lastUpdateText = this.isUsingCache ? 
            `Last updated: ${this.getLastUpdateTime()} (cached)` : 
            `Last updated: ${new Date().toLocaleTimeString()}`;
        
        const networkStatus = this.isOnline ? '🟢 Online' : '🔴 Offline';
        
        footer.innerHTML = `
            <span>${lastUpdateText}</span>
            <span>Data refreshed automatically every 2 minutes</span>
            <span>${networkStatus}</span>
        `;
        
        return footer;
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if (this.imageObserver) {
            const images = document.querySelectorAll('.crypto-coin-image[data-src]');
            images.forEach(img => {
                this.imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without Intersection Observer
            const images = document.querySelectorAll('.crypto-coin-image[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    /**
     * Add all styles at once
     */
    addAllStyles() {
        if (!document.getElementById('crypto-all-styles')) {
            const style = document.createElement('style');
            style.id = 'crypto-all-styles';
            style.textContent = `
                /* Performance optimized styles */
                .crypto-table {
                    will-change: transform;
                    contain: layout style paint;
                }
                
                .crypto-row {
                    contain: layout style paint;
                }
                
                .crypto-coin-image {
                    border-radius: 50%;
                    margin-right: 8px;
                    transition: opacity 0.3s ease;
                    background-color: #f0f0f0;
                }
                
                .crypto-coin-image[data-src] {
                    opacity: 0.7;
                }
                
                /* Spinner animation */
                .crypto-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #1e88e5;
                    border-radius: 50%;
                    animation: crypto-spin 1s linear infinite;
                    margin-right: 10px;
                }
                
                @keyframes crypto-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Performance info styles */
                .crypto-performance-info {
                    font-size: 11px;
                    color: #666;
                    margin: 5px 0;
                    font-family: monospace;
                }
                
                /* Cache indicator */
                .crypto-cache-indicator {
                    background-color: #fff3cd;
                    color: #856404;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin: 10px 0;
                    border: 1px solid #ffeaa7;
                    display: inline-block;
                }
                
                /* Button styles */
                #crypto-clear-cache-btn {
                    margin-left: 10px;
                    padding: 8px 12px;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                #crypto-performance-btn {
                    margin-left: 10px;
                    padding: 8px 12px;
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                /* Retry button */
                .crypto-retry-btn {
                    margin-left: 10px;
                    padding: 5px 10px;
                    background-color: #1e88e5;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .crypto-retry-btn:hover {
                    background-color: #1565c0;
                }
                
                /* Error and loading states */
                .crypto-error, .crypto-no-data {
                    text-align: center;
                    padding: 20px;
                    color: #d32f2f;
                }
                
                .crypto-loading-message {
                    text-align: center;
                    padding: 20px;
                    color: #1e88e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Sort styles */
                .crypto-table th.sortable {
                    cursor: pointer;
                    position: relative;
                    padding-right: 18px;
                    user-select: none;
                }
                
                .crypto-table th.sortable:hover {
                    background-color: rgba(0,0,0,0.05);
                }
                
                .sort-indicator {
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                }
                
                /* Sort dropdown */
                .crypto-sort-dropdown {
                    position: relative;
                    display: inline-block;
                    margin: 0 10px;
                }
                
                .crypto-sort-menu {
                    display: none;
                    position: absolute;
                    background-color: #fff;
                    min-width: 200px;
                    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                    z-index: 1000;
                    border-radius: 4px;
                    top: 100%;
                    right: 0;
                    border: 1px solid #ddd;
                }
                
                .crypto-sort-dropdown.active .crypto-sort-menu {
                    display: block;
                }
                
                .crypto-sort-option {
                    padding: 10px 15px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-size: 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .crypto-sort-option:last-child {
                    border-bottom: none;
                }
                
                .crypto-sort-option:hover {
                    background-color: #1e88e5;
                    color: white;
                }
                
                #crypto-sort-btn {
                    padding: 8px 12px;
                    background-color: #f0f0f0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                }
                
                #crypto-sort-btn:hover {
                    background-color: #e0e0e0;
                }
                
                #crypto-sort-btn::after {
                    content: "▼";
                    font-size: 8px;
                    margin-left: 8px;
                }
                
                /* Responsive optimizations */
                @media (max-width: 768px) {
                    .crypto-controls {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .crypto-table {
                        font-size: 14px;
                    }
                    
                    .crypto-coin-image {
                        width: 20px;
                        height: 20px;
                    }
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .crypto-sort-menu {
                        background-color: #333;
                        color: white;
                        border-color: #555;
                    }
                    
                    .crypto-sort-option {
                        border-color: #555;
                    }
                    
                    .crypto-sort-option:hover {
                        background-color: #1e88e5;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Enhanced sort with Web Worker support
     */
    sortPrices() {
        if (!this.prices || this.prices.length === 0) return;
        
        if (this.webWorker) {
            this.webWorker.postMessage({
                type: 'SORT_DATA',
                data: { prices: this.prices, sortConfig: this.sortConfig }
            });
        } else {
            // Fallback to main thread sorting
            this.performSort();
        }
    }

    /**
     * Perform sorting on main thread
     */
    performSort() {
        const { key, direction } = this.sortConfig;
        
        this.prices.sort((a, b) => {
            let valueA, valueB;
            
            switch(key) {
                case 'price':
                    valueA = a.current_price;
                    valueB = b.current_price;
                    break;
                case 'change':
                    valueA = a.price_change_percentage_24h;
                    valueB = b.price_change_percentage_24h;
                    break;
                case 'market_cap':
                    valueA = a.market_cap;
                    valueB = b.market_cap;
                    break;
                default:
                    valueA = a[key];
                    valueB = b[key];
            }
            
            if (valueA === null || valueA === undefined) return 1;
            if (valueB === null || valueB === undefined) return -1;
            
            return direction === 'asc' ? valueA - valueB : valueB - valueA;
        });
    }

    /**
     * Get sort indicator
     */
    getSortIndicator(column) {
        if (this.sortConfig.key !== column) {
            return '<span class="sort-indicator"></span>';
        }
        
        return this.sortConfig.direction === 'asc' 
            ? '<span class="sort-indicator">↑</span>' 
            : '<span class="sort-indicator">↓</span>';
    }

    /**
     * Enhanced initialization
     */
    async init() {
        try {
            // Create container if needed
            if (!document.querySelector(this.config.containerSelector)) {
                console.warn(`Container ${this.config.containerSelector} not found. Creating one.`);
                const container = document.createElement('div');
                container.id = this.config.containerSelector.replace('#', '');
                document.body.appendChild(container);
            }
            
            // Load from cache immediately for instant display
            const cachedData = await this.loadFromCache();
            if (cachedData && cachedData.length > 0) {
                this.prices = cachedData;
                this.isUsingCache = true;
                this.sortPrices();
                this.batchRender();
                console.log('Displaying cached data while fetching fresh data');
            }

            // Fetch fresh data in background
            this.fetchPrices().then(() => this.batchRender());
            
            // Setup auto-refresh
            this.startAutoRefresh();
            
            // Setup event listeners
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    /**
     * Enhanced event listeners
     */
    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Handle click events
    /**
     * Handle click events
     */
    handleClick(event) {
        const { target } = event;
        
        switch(target.id) {
            case 'crypto-refresh-btn':
                this.forceRefresh();
                break;
                
            case 'crypto-clear-cache-btn':
                this.clearAllCaches();
                break;
                
            case 'crypto-performance-btn':
                this.showPerformanceModal();
                break;
                
            case 'crypto-retry-btn':
                this.fetchPrices().then(() => this.batchRender());
                break;
                
            case 'crypto-show-more-btn':
                this.toggleItemsDisplay();
                break;
                
            case 'crypto-show-less-btn':
                this.toggleItemsDisplay();
                break;
                
            case 'crypto-sort-btn':
                const dropdown = target.closest('.crypto-sort-dropdown');
                dropdown.classList.toggle('active');
                break;
        }
        
        // Sort option selection
        if (target.classList.contains('crypto-sort-option')) {
            const sortKey = target.dataset.sort;
            const sortDirection = target.dataset.direction;
            
            this.sortConfig.key = sortKey;
            this.sortConfig.direction = sortDirection;
            
            this.sortPrices();
            this.batchRender();
            
            const dropdown = target.closest('.crypto-sort-dropdown');
            dropdown.classList.remove('active');
        }
        
        // Close dropdown when clicking outside
        if (!target.closest('.crypto-sort-dropdown')) {
            const dropdowns = document.querySelectorAll('.crypto-sort-dropdown');
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
        
        // Sortable column headers
        if (target.classList.contains('sortable')) {
            const sortKey = target.dataset.sort;
            this.changeSort(sortKey);
        }
    }

    /**
     * Handle change events
     */
    handleChange(event) {
        if (event.target.id === 'crypto-currency-select') {
            this.config.currency = event.target.value;
            this.clearAllCaches(); // Clear cache when currency changes
            this.fetchPrices().then(() => this.batchRender());
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(event) {
        // Only handle if crypto container is visible
        const container = document.querySelector(this.config.containerSelector);
        if (!container || !container.offsetParent) return;
        
        switch(event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.forceRefresh();
                }
                break;
                
            case 'c':
            case 'C':
                if (event.ctrlKey || event.metaKey && event.shiftKey) {
                    event.preventDefault();
                    this.clearAllCaches();
                }
                break;
        }
    }

    /**
     * Clear all caches
     */
    clearAllCaches() {
        try {
            // Clear localStorage
            localStorage.removeItem(this.config.cacheKey);
            
            // Clear sessionStorage
            sessionStorage.removeItem(this.config.cacheKey + '_session');
            
            // Clear IndexedDB
            this.clearIndexedDB();
            
            // Clear image cache
            this.imageCache.clear();
            
            // Reset cache metrics
            this.performanceMetrics.cacheHits = 0;
            this.performanceMetrics.cacheMisses = 0;
            
            this.isUsingCache = false;
            console.log('All caches cleared');
            
            // Force refresh
            this.forceRefresh();
        } catch (error) {
            console.warn('Failed to clear some caches:', error);
        }
    }

    /**
     * Clear IndexedDB
     */
    async clearIndexedDB() {
        try {
            const request = indexedDB.open('RoialCryptoCache', 1);
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['cryptoData'], 'readwrite');
                const store = transaction.objectStore('cryptoData');
                store.clear();
            };
        } catch (error) {
            console.warn('Failed to clear IndexedDB:', error);
        }
    }

    /**
     * Show performance modal
     */
    showPerformanceModal() {
        const modal = this.createPerformanceModal();
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 10000);
    }

    /**
     * Create performance modal
     */
    createPerformanceModal() {
        const modal = document.createElement('div');
        modal.className = 'crypto-performance-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const avgFetch = this.performanceMetrics.fetchTimes.length > 0 ?
            this.performanceMetrics.fetchTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.fetchTimes.length : 0;
        
        const avgRender = this.performanceMetrics.renderTimes.length > 0 ?
            this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length : 0;
        
        const cacheHitRate = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses > 0 ?
            (this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100).toFixed(1) : 0;
        
        modal.innerHTML = `
            <h3>📊 Performance Metrics</h3>
            <div style="font-family: monospace; line-height: 1.6;">
                <p><strong>Fetch Performance:</strong></p>
                <ul>
                    <li>Average fetch time: ${avgFetch.toFixed(0)}ms</li>
                    <li>Last fetch: ${this.performanceMetrics.fetchTimes[this.performanceMetrics.fetchTimes.length - 1]?.toFixed(0) || 'N/A'}ms</li>
                    <li>Total fetches: ${this.performanceMetrics.fetchTimes.length}</li>
                </ul>
                
                <p><strong>Render Performance:</strong></p>
                <ul>
                    <li>Average render time: ${avgRender.toFixed(0)}ms</li>
                    <li>Last render: ${this.performanceMetrics.renderTimes[this.performanceMetrics.renderTimes.length - 1]?.toFixed(0) || 'N/A'}ms</li>
                    <li>Total renders: ${this.performanceMetrics.renderTimes.length}</li>
                </ul>
                
                <p><strong>Cache Performance:</strong></p>
                <ul>
                    <li>Cache hit rate: ${cacheHitRate}%</li>
                    <li>Cache hits: ${this.performanceMetrics.cacheHits}</li>
                    <li>Cache misses: ${this.performanceMetrics.cacheMisses}</li>
                    <li>Currently using cache: ${this.isUsingCache ? 'Yes' : 'No'}</li>
                </ul>
                
                <p><strong>System Info:</strong></p>
                <ul>
                    <li>Network status: ${this.isOnline ? 'Online' : 'Offline'}</li>
                    <li>Web Worker: ${this.webWorker ? 'Enabled' : 'Disabled'}</li>
                    <li>Service Worker: ${navigator.serviceWorker ? 'Supported' : 'Not supported'}</li>
                    <li>Image cache size: ${this.imageCache.size} images</li>
                </ul>
                
                <p><strong>Data Info:</strong></p>
                <ul>
                    <li>Total coins: ${this.prices.length}</li>
                    <li>Displayed coins: ${this.showingAll ? this.prices.length : Math.min(this.config.initialDisplay, this.prices.length)}</li>
                    <li>Last successful fetch: ${this.lastSuccessfulFetch ? new Date(this.lastSuccessfulFetch).toLocaleString() : 'Never'}</li>
                </ul>
            </div>
            <button onclick="this.parentNode.remove()" style="margin-top: 15px; padding: 8px 16px; background: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        `;
        
        return modal;
    }

    /**
     * Change sort configuration
     */
    changeSort(key) {
        if (this.sortConfig.key === key) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.key = key;
            this.sortConfig.direction = 'desc';
        }
        
        this.sortPrices();
        this.batchRender();
    }

    /**
     * Format price with enhanced formatting
     */
    formatPrice(price, currency) {
        if (price === null || price === undefined) return 'N/A';
        
        const currencySymbols = {
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'jpy': '¥'
        };
        
        const symbol = currencySymbols[currency] || '';
        
        if (price < 0.000001) {
            return `${symbol}${price.toExponential(2)}`;
        } else if (price < 0.01) {
            return `${symbol}${price.toFixed(6)}`;
        } else if (price < 1) {
            return `${symbol}${price.toFixed(4)}`;
        } else if (price < 1000) {
            return `${symbol}${price.toFixed(2)}`;
        } else {
            return `${symbol}${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
    }

    /**
     * Format market cap with enhanced formatting
     */
    formatMarketCap(marketCap, currency) {
        if (marketCap === null || marketCap === undefined) return 'N/A';
        
        const currencySymbols = {
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'jpy': '¥'
        };
        
        const symbol = currencySymbols[currency] || '';
        
        if (marketCap >= 1000000000000) {
            return `${symbol}${(marketCap / 1000000000000).toFixed(2)}T`;
        } else if (marketCap >= 1000000000) {
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
     * Get last update time from cache
     */
    getLastUpdateTime() {
        try {
            const cached = localStorage.getItem(this.config.cacheKey);
            if (cached) {
                const cacheData = JSON.parse(cached);
                return new Date(cacheData.timestamp).toLocaleTimeString();
            }
        } catch (error) {
            console.warn('Failed to get cache timestamp:', error);
        }
        return 'Unknown';
    }

    /**
     * Handle errors with enhanced error reporting
     */
    handleError(error) {
        console.error('Crypto API Error:', error);
        this.hasError = true;
        this.errorMessage = error.message || 'Failed to fetch cryptocurrency data';
        
        // Try to provide more specific error messages
        if (error.name === 'AbortError') {
            this.errorMessage = 'Request timed out. Please check your connection.';
        } else if (!this.isOnline) {
            this.errorMessage = 'No internet connection. Showing cached data if available.';
        } else if (error.message.includes('429')) {
            this.errorMessage = 'Rate limit exceeded. Please wait before refreshing.';
        }
        
        this.batchRender();
    }

    /**
     * Update loading state
     */
    updateLoadingState() {
        const container = document.querySelector(this.config.containerSelector);
        if (!container) return;
        
        if (this.isLoading) {
            container.classList.add('crypto-loading');
        } else {
            container.classList.remove('crypto-loading');
        }
    }

    /**
     * Enhanced auto-refresh with adaptive intervals
     */
    startAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Adaptive refresh interval based on network conditions
        let refreshInterval = this.config.updateInterval;
        
        if (!this.isOnline) {
            refreshInterval *= 3; // Slower refresh when offline
        } else if (this.performanceMetrics.fetchTimes.length > 0) {
            const avgFetchTime = this.performanceMetrics.fetchTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.fetchTimes.length;
            if (avgFetchTime > 5000) {
                refreshInterval *= 1.5; // Slower refresh for slow connections
            }
        }
        
        this.intervalId = setInterval(async () => {
            if (document.visibilityState === 'visible') {
                await this.fetchPrices();
                this.batchRender();
            }
        }, refreshInterval);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Toggle items display
     */
    toggleItemsDisplay() {
        this.showingAll = !this.showingAll;
        this.batchRender();
    }


    /**
     * Force refresh (bypass cache)
     */
    async forceRefresh() {
        this.isUsingCache = false;
        this.hasError = false;
        await this.fetchPrices();
        this.batchRender();
    }

    /**
     * Update metrics display
     */
    updateMetricsDisplay(metrics) {
        // This could be used to show additional metrics in the UI
        console.log('Market metrics calculated:', metrics);
        
        // You could add a metrics display section to the UI here
        const container = document.querySelector(this.config.containerSelector);
        if (container) {
            let metricsDiv = container.querySelector('.crypto-metrics');
            if (!metricsDiv) {
                metricsDiv = document.createElement('div');
                metricsDiv.className = 'crypto-metrics';
                container.appendChild(metricsDiv);
            }
            
            metricsDiv.innerHTML = `
                <div class="crypto-metrics-content">
                    <span>📈 Avg Change: ${metrics.avgChange.toFixed(2)}%</span>
                    <span>🚀 Top Gainer: ${metrics.topGainer.symbol.toUpperCase()}</span>
                    <span>📉 Top Loser: ${metrics.topLoser.symbol.toUpperCase()}</span>
                </div>
            `;
        }
    }

    /**
     * Initialize performance optimizations
     */
    initPerformanceOptimizations() {
        // Preconnect to API domain
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = 'https://api.coingecko.com';
        document.head.appendChild(preconnectLink);
        
        // DNS prefetch for image CDN
        const dnsPrefetchLink = document.createElement('link');
        dnsPrefetchLink.rel = 'dns-prefetch';
        dnsPrefetchLink.href = 'https://assets.coingecko.com';
        document.head.appendChild(dnsPrefetchLink);
        
        // Optimize rendering with CSS containment
        const optimizationStyle = document.createElement('style');
        optimizationStyle.textContent = `
            ${this.config.containerSelector} {
                contain: layout style paint;
                will-change: contents;
            }
            
            .crypto-metrics {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px;
                border-radius: 6px;
                margin: 10px 0;
                font-size: 12px;
            }
            
            .crypto-metrics-content {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .crypto-metrics-content span {
                background: rgba(255,255,255,0.2);
                padding: 5px 10px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            
            /* Enhanced responsive design */
            @media (max-width: 480px) {
                .crypto-metrics-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .crypto-controls {
                    flex-wrap: wrap;
                }
                
                .crypto-table th,
                .crypto-table td {
                    padding: 8px 4px;
                    font-size: 12px;
                }
            }
            
            /* Print styles */
            @media print {
                .crypto-controls,
                .crypto-toggle-container {
                    display: none !important;
                }
                
                .crypto-table {
                    border-collapse: collapse;
                }
                
                .crypto-table th,
                .crypto-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
            }
            
            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .crypto-table {
                    border: 2px solid;
                }
                
                .crypto-positive {
                    background-color: #00ff00;
                    color: #000;
                }
                
                .crypto-negative {
                    background-color: #ff0000;
                    color: #fff;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .crypto-spinner {
                    animation: none;
                }
                
                .crypto-coin-image {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(optimizationStyle);
        
        // Page visibility API for performance
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // Pause updates when tab is not visible
                this.stopAutoRefresh();
            } else {
                // Resume updates when tab becomes visible
                this.startAutoRefresh();
                // Refresh data if it's been a while
                if (this.lastSuccessfulFetch && Date.now() - this.lastSuccessfulFetch > this.config.updateInterval) {
                    this.fetchPrices().then(() => this.batchRender());
                }
            }
        });
    }

    /**
     * Get cache status for debugging
     */
    getCacheStatus() {
        const status = {
            localStorage: !!localStorage.getItem(this.config.cacheKey),
            sessionStorage: !!sessionStorage.getItem(this.config.cacheKey + '_session'),
            imageCache: this.imageCache.size,
            isUsingCache: this.isUsingCache,
            lastSuccessfulFetch: this.lastSuccessfulFetch,
            cacheHits: this.performanceMetrics.cacheHits,
            cacheMisses: this.performanceMetrics.cacheMisses
        };
        
        return status;
    }

    /**
     * Export data for external use
     */
    exportData(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.prices, null, 2);
                
            case 'csv':
                if (this.prices.length === 0) return '';
                
                const headers = ['Rank', 'Name', 'Symbol', 'Price', '24h Change %', 'Market Cap'];
                const csvData = this.prices.map((coin, index) => [
                    index + 1,
                    coin.name,
                    coin.symbol.toUpperCase(),
                    coin.current_price,
                    coin.price_change_percentage_24h,
                    coin.market_cap
                ]);
                
                return [headers, ...csvData]
                    .map(row => row.map(cell => `"${cell}"`).join(','))
                    .join('\n');
                
            default:
                return this.prices;
        }
    }

    /**
     * Destroy instance and cleanup
     */
    destroy() {
        // Stop auto-refresh
        this.stopAutoRefresh();
        
        // Abort any pending requests
        if (this.requestController) {
            this.requestController.abort();
        }
        
        // Terminate web worker
        if (this.webWorker) {
            this.webWorker.terminate();
            this.webWorker = null;
        }
        
        // Disconnect observers
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        // Clear caches if needed
        // this.clearAllCaches();
        
        // Remove event listeners (would need more specific cleanup in production)
        console.log('CryptoAPI instance destroyed and cleaned up');
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const avgFetch = this.performanceMetrics.fetchTimes.length > 0 ?
            this.performanceMetrics.fetchTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.fetchTimes.length : 0;
        
        const avgRender = this.performanceMetrics.renderTimes.length > 0 ?
            this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.renderTimes.length : 0;
        
        return {
            averageFetchTime: Math.round(avgFetch),
            averageRenderTime: Math.round(avgRender),
            totalFetches: this.performanceMetrics.fetchTimes.length,
            totalRenders: this.performanceMetrics.renderTimes.length,
            cacheHitRate: this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses > 0 ?
                Math.round((this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)) * 100) : 0,
            isOptimized: !!(this.webWorker && this.imageObserver && navigator.serviceWorker)
        };
    }
}

// Create and export the API instance with enhanced configuration
const cryptoApi = new CryptoAPI({
    updateInterval: 120000, // 2 minutes
    cacheExpiry: 300000,    // 5 minutes
    enableWebWorker: true,
    enableServiceWorker: true,
    enableImageOptimization: true,
    enableOfflineMode: true,
    connectionTimeout: 8000,
    maxRetries: 3
});

// Enhanced auto-initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing RoialVirtualAssets Crypto API...');
    
    const success = await cryptoApi.init();
    
    if (success) {
        console.log('✅ Crypto API initialized successfully');
        
        // Log performance info after 5 seconds
        setTimeout(() => {
            const perf = cryptoApi.getPerformanceSummary();
            console.log('📊 Performance Summary:', perf);
        }, 5000);
    } else {
        console.error('❌ Failed to initialize Crypto API');
    }
});

// Export for external use
window.cryptoApi = cryptoApi;

// Add global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('crypto')) {
        console.warn('Unhandled crypto API error:', event.reason);
        event.preventDefault(); // Prevent the error from being logged to console
    }
});

// Performance monitoring
if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('coingecko')) {
                console.log(`🌐 Network timing for ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            }
        }
    });
    
    try {
        observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
        console.warn('Performance observer not supported:', error);
    }
}

// Export utility functions for advanced users
window.CryptoAPIUtils = {
    formatPrice: (price, currency) => cryptoApi.formatPrice(price, currency),
    formatMarketCap: (marketCap, currency) => cryptoApi.formatMarketCap(marketCap, currency),
    exportData: (format) => cryptoApi.exportData(format),
    getPerformance: () => cryptoApi.getPerformanceSummary(),
    getCacheStatus: () => cryptoApi.getCacheStatus(),
    clearCache: () => cryptoApi.clearAllCaches(),
    forceRefresh: () => cryptoApi.forceRefresh()
};

console.log('🎯 RoialVirtualAssets Crypto API loaded with ultra-optimizations enabled!');
