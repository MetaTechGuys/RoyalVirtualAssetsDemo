/**
 * RoialVirtualAssets Cryptocurrency Price API
 * This module fetches and displays cryptocurrency prices with caching and performance optimizations
 */

class CryptoAPI {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      apiKey: options.apiKey || "",
      baseUrl: "https://api.coingecko.com/api/v3",
      updateInterval: options.updateInterval || 240000, // Default: update every 2 minutes
      containerSelector: options.containerSelector || "#crypto-prices",
      limit: options.limit || 20,
      currency: options.currency || "usd",
      initialDisplay: options.initialDisplay || 8, // Default: initially show 8 items
      maxRetries: options.maxRetries || 8, // Maximum number of retry attempts
      cacheKey: "roial_crypto_cache", // LocalStorage key for caching
      cacheExpiry: options.cacheExpiry || 480000, // Cache expiry: 8 minutes
      eagerLoad: options.eagerLoad !== false, // Enable eager loading by default
    };

    this.prices = [];
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = "";
    this.intervalId = null;
    this.showingAll = false; // Track if we're showing all items
    this.lastSuccessfulFetch = null; // Track last successful API call
    this.isUsingCache = false; // Track if we're showing cached data

    // Add sorting state
    this.sortConfig = {
      key: "market_cap", // Default sort by market cap
      direction: "desc", // Default direction descending
    };

    // Initialize performance optimizations
    this.initPerformanceOptimizations();
  }

  /**
   * Initialize performance optimizations (preconnect, prefetch)
   */
  initPerformanceOptimizations() {
    // Add preconnect for API domain
    this.addPreconnect("https://api.coingecko.com");

    // Add DNS prefetch for image CDN (CoinGecko uses this for coin images)
    this.addDnsPrefetch("https://assets.coingecko.com");

    // Prefetch the API endpoint if eager loading is enabled
    if (this.config.eagerLoad) {
      this.prefetchApiEndpoint();
    }
  }

  /**
   * Add preconnect link to head
   */
  addPreconnect(url) {
    if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }

  /**
   * Add DNS prefetch link to head
   */
  addDnsPrefetch(url) {
    if (!document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = url;
      document.head.appendChild(link);
    }
  }

  /**
   * Prefetch the API endpoint for faster initial load
   */
  prefetchApiEndpoint() {
    const url = `${this.config.baseUrl}/coins/markets?vs_currency=${this.config.currency}&order=market_cap_desc&per_page=${this.config.limit}&page=1&sparkline=false&price_change_percentage=24h`;

    // Use fetch with low priority for prefetching
    if ("fetch" in window && "Request" in window) {
      try {
        const request = new Request(url);
        fetch(request, {
          priority: "low",
          mode: "cors",
        }).catch(() => {
          // Silently fail prefetch attempts
          // console.log('Prefetch failed, will fetch normally when needed');
        });
      } catch (error) {
        // Fallback for browsers that don't support priority
        fetch(url, { mode: "cors" }).catch(() => {});
      }
    }
  }

  /**
   * Save data to cache
   */
  saveToCache(data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        currency: this.config.currency,
      };
      localStorage.setItem(this.config.cacheKey, JSON.stringify(cacheData));
      // console.log('Data cached successfully');
    } catch (error) {
      //console.warn('Failed to save to cache:', error);
    }
  }

  /**
   * Load data from cache
   */
  loadFromCache() {
    try {
      const cached = localStorage.getItem(this.config.cacheKey);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheData.timestamp > this.config.cacheExpiry) {
        console.log("Cache expired, removing old data");
        localStorage.removeItem(this.config.cacheKey);
        return null;
      }

      // Check if currency matches
      if (cacheData.currency !== this.config.currency) {
        //console.log('Currency changed, cache invalid');
        return null;
      }

      //console.log('Loading data from cache');
      return cacheData.data;
    } catch (error) {
      //console.warn('Failed to load from cache:', error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    try {
      localStorage.removeItem(this.config.cacheKey);
      //console.log('Cache cleared');
    } catch (error) {
      //console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Initialize the crypto price tracker
   */
  async init() {
    try {
      // Create container if it doesn't exist
      if (!document.querySelector(this.config.containerSelector)) {
        //console.warn(`Container ${this.config.containerSelector} not found. Creating one.`);
        const container = document.createElement("div");
        container.id = this.config.containerSelector.replace("#", "");
        document.body.appendChild(container);
      }

      // Try to load from cache first for instant display
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        this.prices = cachedData;
        this.isUsingCache = true;
        this.sortPrices();
        this.renderPrices();
        //console.log('Displaying cached data while fetching fresh data');
      }

      // Fetch fresh data
      await this.fetchPrices();
      this.renderPrices();

      // Set up auto-refresh
      this.startAutoRefresh();

      // Add event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * Fetch cryptocurrency prices from the API
   */
  async fetchPrices(retryAttempt = 0) {
    try {
      this.isLoading = true;
      this.updateLoadingState();

      const url = `${this.config.baseUrl}/coins/markets?vs_currency=${this.config.currency}&order=market_cap_desc&per_page=${this.config.limit}&page=1&sparkline=false&price_change_percentage=24h`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // Add cache control for better performance
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check if data is empty or invalid
      if (!data || data.length === 0) {
        if (retryAttempt < this.config.maxRetries) {
          //console.log(`No data received. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
          this.isLoading = false;
          this.updateLoadingState();

          // Wait 2 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.fetchPrices(retryAttempt + 1);
        } else {
          throw new Error(
            "No cryptocurrency data available after multiple attempts"
          );
        }
      }

      // Success! Update data and cache
      this.prices = data;
      this.hasError = false;
      this.isUsingCache = false;
      this.lastSuccessfulFetch = Date.now();

      // Save to cache
      this.saveToCache(data);

      // Apply current sorting
      this.sortPrices();

      return this.prices;
    } catch (error) {
      if (retryAttempt < this.config.maxRetries) {
        //console.log(`Error: ${error.message}. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
        this.isLoading = false;
        this.updateLoadingState();

        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.fetchPrices(retryAttempt + 1);
      } else {
        // All retries failed, try to use cached data
        const cachedData = this.loadFromCache();
        if (cachedData && cachedData.length > 0) {
          //console.log('API failed, using cached data as fallback');
          this.prices = cachedData;
          this.isUsingCache = true;
          this.hasError = false; // Don't show error if we have cached data
          this.sortPrices();
          return this.prices;
        } else {
          // No cached data available, show error
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
   * Sort prices based on current sort configuration
   */
  sortPrices() {
    if (!this.prices || this.prices.length === 0) return;

    const { key, direction } = this.sortConfig;

    this.prices.sort((a, b) => {
      let valueA, valueB;

      // Handle special cases for sorting
      switch (key) {
        case "price":
          valueA = a.current_price;
          valueB = b.current_price;
          break;
        case "change":
          valueA = a.price_change_percentage_24h;
          valueB = b.price_change_percentage_24h;
          break;
        case "market_cap":
          valueA = a.market_cap;
          valueB = b.market_cap;
          break;
        default:
          valueA = a[key];
          valueB = b[key];
      }

      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      // Sort based on direction
      if (direction === "asc") {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  /**
   * Change the sort configuration
   */
  changeSort(key) {
    // If clicking the same column, toggle direction
    if (this.sortConfig.key === key) {
      this.sortConfig.direction =
        this.sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      // New column, set default direction based on column
      this.sortConfig.key = key;
      // Default to descending for most columns
      this.sortConfig.direction = "desc";
    }

    this.sortPrices();
    this.renderPrices();
  }

  /**
   * Render cryptocurrency prices in the container
   */
  renderPrices() {
    const container = document.querySelector(this.config.containerSelector);

    if (!container) {
      //console.error(`Container ${this.config.containerSelector} not found`);
      return;
    }

    // Clear previous content
    container.innerHTML = "";

    // Create header
    const header = document.createElement("div");
    header.className = "crypto-header";

    header.innerHTML = `
            <h2>Live Cryptocurrency Prices</h2>
            <div class="crypto-controls">
                <label for="crypto-currency-select" style="opacity:0">Choose:</label>
                <select  id="crypto-currency-select">
                    <option value="usd" ${
                      this.config.currency === "usd" ? "selected" : ""
                    }>USD</option>
                    <option value="eur" ${
                      this.config.currency === "eur" ? "selected" : ""
                    }>EUR</option>
                    <option value="gbp" ${
                      this.config.currency === "gbp" ? "selected" : ""
                    }>GBP</option>
                    <option value="jpy" ${
                      this.config.currency === "jpy" ? "selected" : ""
                    }>JPY</option>
                </select>
                <div class="crypto-sort-dropdown">
                    <button  name="crypto" id="crypto-sort-btn">Sort By</button>
                    <div class="crypto-sort-menu">
                        <div class="crypto-sort-option" data-sort="price" data-direction="desc">Price (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="price" data-direction="asc">Price (Low-High)</div>
                        <div class="crypto-sort-option" data-sort="change" data-direction="desc">24h Change (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="change" data-direction="asc">24h Change (Low-High)</div>
                        <div class="crypto-sort-option" data-sort="market_cap" data-direction="desc">Market Cap (High-Low)</div>
                        <div class="crypto-sort-option" data-sort="market_cap" data-direction="asc">Market Cap (Low-High)</div>
                    </div>
                </div>
                <button  name="crypto button" id="crypto-refresh-btn">Refresh</button>
            </div>
        `;
    container.appendChild(header);

    // Create table
    const table = document.createElement("table");
    table.className = "crypto-table";

    // Table header with sort indicators
    const thead = document.createElement("thead");
    thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Coin</th>
                <th class="sortable" data-sort="price">
                    Price
                    ${this.getSortIndicator("price")}
                <th class="sortable" data-sort="change">
                    24h Change
                    ${this.getSortIndicator("change")}
                </th>
                <th class="sortable" data-sort="market_cap">
                    Market Cap
                    ${this.getSortIndicator("market_cap")}
                </th>
            </tr>
        `;
    table.appendChild(thead);
    // Table body
    const tbody = document.createElement("tbody");

    if (this.isLoading && !this.isUsingCache) {
      // Show loading message only if not using cache
      const loadingRow = document.createElement("tr");
      loadingRow.innerHTML = `
                <td colspan="5" class="crypto-loading-message">
                    Loading cryptocurrency data...
                </td>
            `;
      tbody.appendChild(loadingRow);
    } else if (this.hasError && this.prices.length === 0) {
      // Show error message with retry button only if no data available
      const errorRow = document.createElement("tr");
      errorRow.innerHTML = `
                <td colspan="5" class="crypto-error">
                    Error: ${this.errorMessage}
                    <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
                </td>
            `;
      tbody.appendChild(errorRow);
    } else if (this.prices.length === 0) {
      // Show no data message with retry button
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `
                <td colspan="5" class="crypto-no-data">
                    No cryptocurrency data available
                    <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
                </td>
            `;
      tbody.appendChild(noDataRow);
    } else {
      // Determine how many coins to display
      const displayCount = this.showingAll
        ? this.prices.length
        : Math.min(this.config.initialDisplay, this.prices.length);

      // Render each cryptocurrency (limited by displayCount)
      for (let i = 0; i < displayCount; i++) {
        const coin = this.prices[i];
        const row = document.createElement("tr");

        // Determine price change class
        const priceChangeClass =
          coin.price_change_percentage_24h >= 0
            ? "crypto-positive"
            : "crypto-negative";

        // Format price based on value
        const formattedPrice = this.formatPrice(
          coin.current_price,
          this.config.currency
        );

        // Format market cap
        const formattedMarketCap = this.formatMarketCap(
          coin.market_cap,
          this.config.currency
        );

        row.innerHTML = `
                    <td>${i + 1}</td>
                    <td class="crypto-name">
                        <img src="${coin.image}" alt="${
          coin.name
        }" width="24" height="24" loading="lazy">
                        <span>${coin.name}</span>
                        <small>${coin.symbol.toUpperCase()}</small>
                    </td>
                    <td>${formattedPrice}</td>
                    <td class="${priceChangeClass}">
                        ${coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td>${formattedMarketCap}</td>
                `;

        tbody.appendChild(row);
      }
    }

    table.appendChild(tbody);
    container.appendChild(table);

    // Add toggle button container
    const toggleContainer = document.createElement("div");
    toggleContainer.className = "crypto-toggle-container";

    // Add appropriate button based on current state
    if (this.prices.length > this.config.initialDisplay) {
      const toggleButton = document.createElement("button");
      toggleButton.className = "crypto-toggle-btn";

      if (this.showingAll) {
        toggleButton.id = "crypto-show-less-btn";
        toggleButton.textContent = "Show Less";
      } else {
        toggleButton.id = "crypto-show-more-btn";
        toggleButton.textContent = "Show More";
      }

      toggleContainer.appendChild(toggleButton);
      container.appendChild(toggleContainer);
    }

    // Add last updated info
    const footer = document.createElement("div");
    footer.className = "crypto-footer";

    footer.innerHTML = `
            <span>Last updated: ${new Date().toLocaleTimeString()}</span>
            <span>Data refreshed automatically every 2 minutes</span>
        `;
    container.appendChild(footer);

    // Add CSS for sortable columns and sort dropdown
    this.addSortStyles();

    // Add retry button styles
    this.addRetryButtonStyles();

    // Add cache indicator styles
    this.addCacheStyles();
  }

  /**
   * Get sort indicator arrow based on current sort config
   */
  getSortIndicator(column) {
    if (this.sortConfig.key !== column) {
      return '<span class="sort-indicator"></span>';
    }

    return this.sortConfig.direction === "asc"
      ? '<span class="sort-indicator">↑</span>'
      : '<span class="sort-indicator">↓</span>';
  }

  /**
   * Add CSS styles for sortable columns
   */
  addSortStyles() {
    // Check if styles already exist
    if (!document.getElementById("crypto-sort-styles")) {
      const style = document.createElement("style");
      style.id = "crypto-sort-styles";
      style.textContent = `
                .crypto-table th.sortable {
                    cursor: pointer;
                    position: relative;
                    padding-right: 18px;
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
                
                /* Sort dropdown styles */
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
                    z-index: 1;
                    border-radius: 4px;
                    top: 100%;
                    right: 0;
                }
                
                .crypto-sort-dropdown.active .crypto-sort-menu {
                    display: block;
                }
                
                .crypto-sort-option {
                    padding: 10px 15px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-size: 12px;
                }
                
                .crypto-sort-option:hover {
                    background-color: #1e88e5;
                    color: white;
                }
                
                .crypto-sort-option.active {
                    background-color: #e6f7ff;
                    font-weight: bold;
                }
                
                #crypto-sort-btn {
                    padding: 8px 12px;
                    background-color: #2a2b41;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
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
            `;
      document.head.appendChild(style);
    }
  }

  /**
   * Add styles for retry button and loading state
   */
  addRetryButtonStyles() {
    if (!document.getElementById("crypto-retry-styles")) {
      const style = document.createElement("style");
      style.id = "crypto-retry-styles";
      style.textContent = `
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
                
                .crypto-error, .crypto-no-data {
                    text-align: center;
                    padding: 20px;
                    color: #d32f2f;
                }
                
                .crypto-loading-message {
                    text-align: center;
                    padding: 20px;
                    color: #1e88e5;
                }
            `;
      document.head.appendChild(style);
    }
  }

  /**
   * Add styles for cache indicator
   */
  addCacheStyles() {
    if (!document.getElementById("crypto-cache-styles")) {
      const style = document.createElement("style");
      style.id = "crypto-cache-styles";
      style.textContent = `
                .crypto-table img {
                    border-radius: 50%;
                    margin-right: 8px;
                }
            `;
      document.head.appendChild(style);
    }
  }

  /**
   * Format price based on currency and value
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

    // Format based on price magnitude
    if (price < 0.01) {
      return `${symbol}${price.toFixed(6)}`;
    } else if (price < 1) {
      return `${symbol}${price.toFixed(4)}`;
    } else if (price < 1000) {
      return `${symbol}${price.toFixed(2)}`;
    } else {
      return `${symbol}${price.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`;
    }
  }

  /**
   * Format market cap with appropriate suffix (B, M, K)
   */
  formatMarketCap(marketCap, currency) {
    if (marketCap === null || marketCap === undefined) return "N/A";

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
   * Handle API errors
   */
  handleError(error) {
    //console.error('Crypto API Error:', error);
    this.hasError = true;
    this.errorMessage = error.message || "Failed to fetch cryptocurrency data";
    this.renderPrices();
  }

  /**
   * Update loading state in the UI
   */
  updateLoadingState() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;

    if (this.isLoading) {
      container.classList.add("crypto-loading");
    } else {
      container.classList.remove("crypto-loading");
    }
  }

  /**
   * Start auto-refresh of cryptocurrency data
   */
  startAutoRefresh() {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Set up new interval
    this.intervalId = setInterval(async () => {
      await this.fetchPrices();
      this.renderPrices();
    }, this.config.updateInterval);
  }

  /**
   * Stop auto-refresh of cryptocurrency data
   */
  stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Toggle between showing all items and initial items
   */
  toggleItemsDisplay() {
    this.showingAll = !this.showingAll;
    this.renderPrices();
  }

  /**
   * Set up event listeners for user interaction
   */
  setupEventListeners() {
    document.addEventListener("click", (event) => {
      // Refresh button
      if (event.target.id === "crypto-refresh-btn") {
        this.fetchPrices().then(() => this.renderPrices());
      }

      // Retry button
      if (event.target.id === "crypto-retry-btn") {
        this.fetchPrices().then(() => this.renderPrices());
      }

      // Show More button
      if (event.target.id === "crypto-show-more-btn") {
        this.toggleItemsDisplay();
      }

      // Show Less button
      if (event.target.id === "crypto-show-less-btn") {
        this.toggleItemsDisplay();
      }

      // Sort dropdown toggle
      if (event.target.id === "crypto-sort-btn") {
        const dropdown = event.target.closest(".crypto-sort-dropdown");
        dropdown.classList.toggle("active");
      }

      // Sort option selection
      if (event.target.classList.contains("crypto-sort-option")) {
        const sortKey = event.target.dataset.sort;
        const sortDirection = event.target.dataset.direction;

        // Update sort config
        this.sortConfig.key = sortKey;
        this.sortConfig.direction = sortDirection;

        // Apply sorting and update UI
        this.sortPrices();
        this.renderPrices();

        // Close dropdown
        const dropdown = event.target.closest(".crypto-sort-dropdown");
        dropdown.classList.remove("active");
      }

      // Close dropdown when clicking outside
      if (!event.target.closest(".crypto-sort-dropdown")) {
        const dropdowns = document.querySelectorAll(".crypto-sort-dropdown");
        dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
      }
    });

    document.addEventListener("change", (event) => {
      // Currency select
      if (event.target.id === "crypto-currency-select") {
        this.config.currency = event.target.value;
        // Clear cache when currency changes since cached data won't match
        this.clearCache();
        this.fetchPrices().then(() => this.renderPrices());
      }
    });
  }

  /**
   * Get cache status information
   */
  getCacheStatus() {
    const cached = localStorage.getItem(this.config.cacheKey);
    if (!cached) return { hasCache: false };
    try {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;
      const isExpired = age > this.config.cacheExpiry;

      return {
        hasCache: true,
        timestamp: cacheData.timestamp,
        age: age,
        isExpired: isExpired,
        currency: cacheData.currency,
        itemCount: cacheData.data ? cacheData.data.length : 0,
      };
    } catch (error) {
      return { hasCache: false, error: error.message };
    }
  }

  /**
   * Force refresh data (bypass cache)
   */
  async forceRefresh() {
    this.isUsingCache = false;
    await this.fetchPrices();
    this.renderPrices();
  }

  /**
   * Destroy the instance and clean up
   */
  destroy() {
    // Stop auto-refresh
    this.stopAutoRefresh();

    // Clear cache if needed
    this.clearCache();

    // Remove event listeners would need more specific cleanup
    // For now, just stop the interval
    //console.log('CryptoAPI instance destroyed');
  }
}

// Create and export the API instance
const cryptoApi = new CryptoAPI();

// Auto-initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  cryptoApi.init();
});

// Export for external use
window.cryptoApi = cryptoApi;

// Add service worker registration for better caching (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Create service worker as a blob URL instead of separate file
    const swCode = `
            const CACHE_NAME = 'roial-crypto-cache-v1';
            const API_CACHE_NAME = 'roial-crypto-api-cache-v1';
            
            // Install event - cache static resources
            self.addEventListener('install', (event) => {
                //console.log('Service Worker installing...');
                self.skipWaiting();
            });
            
            // Activate event - clean up old caches
            self.addEventListener('activate', (event) => {
                //console.log('Service Worker activating...');
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                                    //console.log('Deleting old cache:', cacheName);
                                    return caches.delete(cacheName);
                                }
                            })
                        );
                    }).then(() => self.clients.claim())
                );
            });
            
            // Fetch event - handle API requests with cache-first strategy
            self.addEventListener('fetch', (event) => {
                const url = event.request.url;
                
                // Only handle CoinGecko API requests
                if (url.includes('api.coingecko.com')) {
                    event.respondWith(
                        caches.open(API_CACHE_NAME).then(cache => {
                            return cache.match(event.request).then(cachedResponse => {
                                // If we have a cached response, return it
                                if (cachedResponse) {
                                    // Fetch fresh data in background for next time
                                    fetch(event.request).then(response => {
                                        if (response.ok) {
                                            cache.put(event.request, response.clone());
                                        }
                                    }).catch(() => {
                                        // Silently fail background fetch
                                    });
                                    return cachedResponse;
                                }
                                
                                // No cached response, fetch from network
                                return fetch(event.request).then(response => {
                                    if (response.ok) {
                                        // Cache the response for future use
                                        cache.put(event.request, response.clone());
                                    }
                                    return response;
                                }).catch(error => {
                                    //console.log('Network request failed:', error);
                                    // Return a basic error response
                                    return new Response(JSON.stringify({
                                        error: 'Network unavailable',
                                        cached: false
                                    }), {
                                        status: 503,
                                        headers: { 'Content-Type': 'application/json' }
                                    });
                                });
                            });
                        })
                    );
                }
                
                // For non-API requests, just pass through
                return fetch(event.request);
            });
        `;

    // Create blob URL for the service worker
    const swBlob = new Blob([swCode], { type: "application/javascript" });
    const swUrl = URL.createObjectURL(swBlob);

    // Register the service worker
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        //console.log('Service Worker registered successfully:', registration);

        // Clean up the blob URL after registration
        URL.revokeObjectURL(swUrl);
      })
      .catch((error) => {
        //console.log('Service Worker registration failed:', error);
        // Clean up the blob URL on error too
        URL.revokeObjectURL(swUrl);
      });
  });
}
