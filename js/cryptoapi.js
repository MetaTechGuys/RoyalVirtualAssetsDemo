/**
 * RoialVirtualAssets Cryptocurrency Price API
 * This module fetches and displays cryptocurrency prices
 */

class CryptoAPI {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            apiKey: options.apiKey || '',
            baseUrl: 'https://api.coingecko.com/api/v3',
            updateInterval: options.updateInterval || 240000, // Default: update every 2 minutes
            containerSelector: options.containerSelector || '#crypto-prices',
            limit: options.limit || 20,
            currency: options.currency || 'usd',
            initialDisplay: options.initialDisplay || 8, // Default: initially show 10 items
            maxRetries: options.maxRetries || 8 // Maximum number of retry attempts
        };
        
        this.prices = [];
        this.isLoading = false;
        this.hasError = false;
        this.errorMessage = '';
        this.intervalId = null;
        this.showingAll = false; // Track if we're showing all items
        
        // Add sorting state
        this.sortConfig = {
            key: 'market_cap', // Default sort by market cap
            direction: 'desc'  // Default direction descending
        };
    }
    
    /**
     * Initialize the crypto price tracker
     */
    async init() {
        try {
            // Create container if it doesn't exist
            if (!document.querySelector(this.config.containerSelector)) {
                console.warn(`Container ${this.config.containerSelector} not found. Creating one.`);
                const container = document.createElement('div');
                container.id = this.config.containerSelector.replace('#', '');
                document.body.appendChild(container);
            }
            
            // Initial data fetch
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
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if data is empty or invalid
            if (!data || data.length === 0) {
                if (retryAttempt < this.config.maxRetries) {
                    console.log(`No data received. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
                    this.isLoading = false;
                    this.updateLoadingState();
                    
                    // Wait 2 seconds before retrying
                    await new Promise(resolve => setTimeout(resolve, 200));
                    return this.fetchPrices(retryAttempt + 1);
                } else {
                    throw new Error('No cryptocurrency data available after multiple attempts');
                }
            }
            
            this.prices = data;
            this.hasError = false;
            
            // Apply current sorting
            this.sortPrices();
            
            return this.prices;
        } catch (error) {
            if (retryAttempt < this.config.maxRetries) {
                console.log(`Error: ${error.message}. Retry attempt ${retryAttempt + 1}/${this.config.maxRetries}`);
                this.isLoading = false;
                this.updateLoadingState();
                
                // Wait 2 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.fetchPrices(retryAttempt + 1);
            } else {
                this.handleError(error);
                return [];
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
            
            // Handle null/undefined values
            if (valueA === null || valueA === undefined) return 1;
            if (valueB === null || valueB === undefined) return -1;
            
            // Sort based on direction
            if (direction === 'asc') {
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
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, set default direction based on column
            this.sortConfig.key = key;
            // Default to descending for most columns
            this.sortConfig.direction = 'desc';
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
            console.error(`Container ${this.config.containerSelector} not found`);
            return;
        }
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'crypto-header';
        header.innerHTML = `
            <h2>Live Cryptocurrency Prices</h2>
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
            </div>
        `;
        container.appendChild(header);
        
        // Create table
        const table = document.createElement('table');
        table.className = 'crypto-table';
        
        // Table header with sort indicators
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Coin</th>
                <th class="sortable" data-sort="price">
                    Price
                    ${this.getSortIndicator('price')}
                </th>
                <th class="sortable" data-sort="change">
                    24h Change
                    ${this.getSortIndicator('change')}
                </th>
                <th class="sortable" data-sort="market_cap">
                    Market Cap
                    ${this.getSortIndicator('market_cap')}
                </th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        
        if (this.isLoading) {
            // Show loading message
            const loadingRow = document.createElement('tr');
            loadingRow.innerHTML = `
                <td colspan="5" class="crypto-loading-message">
                    Loading cryptocurrency data...
                </td>
            `;
            tbody.appendChild(loadingRow);
        } else if (this.hasError) {
            // Show error message with retry button
            const errorRow = document.createElement('tr');
            errorRow.innerHTML = `
                <td colspan="5" class="crypto-error">
                    Error: ${this.errorMessage}
                    <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
                </td>
            `;
            tbody.appendChild(errorRow);
        } else if (this.prices.length === 0) {
            // Show no data message with retry button
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="5" class="crypto-no-data">
                    No cryptocurrency data available
                    <button id="crypto-retry-btn" class="crypto-retry-btn">Try Again</button>
                </td>
            `;
            tbody.appendChild(noDataRow);
        } else {
            // Determine how many coins to display
            const displayCount = this.showingAll ? this.prices.length : Math.min(this.config.initialDisplay, this.prices.length);
            
            // Render each cryptocurrency (limited by displayCount)
            for (let i = 0; i < displayCount; i++) {
                const coin = this.prices[i];
                const row = document.createElement('tr');
                
                // Determine price change class
                const priceChangeClass = coin.price_change_percentage_24h >= 0 
                    ? 'crypto-positive' 
                    : 'crypto-negative';
                
                // Format price based on value
                const formattedPrice = this.formatPrice(coin.current_price, this.config.currency);
                
                // Format market cap
                const formattedMarketCap = this.formatMarketCap(coin.market_cap, this.config.currency);
                
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td class="crypto-name">
                        <img src="${coin.image}" alt="${coin.name}" width="24" height="24">
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
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'crypto-toggle-container';
        
        // Add appropriate button based on current state
        if (this.prices.length > this.config.initialDisplay) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'crypto-toggle-btn';
            
            if (this.showingAll) {
                toggleButton.id = 'crypto-show-less-btn';
                toggleButton.textContent = 'Show Less';
            } else {
                toggleButton.id = 'crypto-show-more-btn';
                toggleButton.textContent = 'Show More';
            }
            
            toggleContainer.appendChild(toggleButton);
            container.appendChild(toggleContainer);
        }
        
        // Add last updated info
        const footer = document.createElement('div');
        footer.className = 'crypto-footer';
        footer.innerHTML = `
            <span>Last updated: ${new Date().toLocaleTimeString()}</span>
            <span>Data refreshed automatically every 2 minutes</span>
        `;
        container.appendChild(footer);
        

        // Add CSS for sortable columns and sort dropdown
        this.addSortStyles();
        
        // Add retry button styles
        this.addRetryButtonStyles();
    }
    
    /**
     * Add styles for retry button and loading state
     */
    addRetryButtonStyles() {
        if (!document.getElementById('crypto-retry-styles')) {
            const style = document.createElement('style');
            style.id = 'crypto-retry-styles';
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
     * Get sort indicator arrow based on current sort config
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
     * Add CSS styles for sortable columns
     */
    addSortStyles() {
        // Check if styles already exist
        if (!document.getElementById('crypto-sort-styles')) {
            const style = document.createElement('style');
            style.id = 'crypto-sort-styles';
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
                }
                
                .crypto-sort-option.active {
                    // background-color: #e6f7ff;
                    // font-weight: bold;
                }
                
                #crypto-sort-btn {
                    // padding: 8px 12px;
                    // background-color: #f0f0f0;
                    // border: 1px solid #ddd;
                    // border-radius: 4px;
                    // cursor: pointer;
                    // display: flex;
                    // align-items: center;
                }
                
                #crypto-sort-btn:hover {
                    // background-color: #e0e0e0;
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
     * Format price based on currency and value
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
        
        // Format based on price magnitude
        if (price < 0.01) {
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
     * Format market cap with appropriate suffix (B, M, K)
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
        console.error('Crypto API Error:', error);
        this.hasError = true;
        this.errorMessage = error.message || 'Failed to fetch cryptocurrency data';
        this.renderPrices();
    }
    
    /**
     * Update loading state in the UI
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
        document.addEventListener('click', (event) => {
            // Refresh button
            if (event.target.id === 'crypto-refresh-btn') {
                this.fetchPrices().then(() => this.renderPrices());
            }
            
            // Retry button
            if (event.target.id === 'crypto-retry-btn') {
                this.fetchPrices().then(() => this.renderPrices());
            }
            
            // Show More button
            if (event.target.id === 'crypto-show-more-btn') {
                this.toggleItemsDisplay();
            }
            
            // Show Less button
            if (event.target.id === 'crypto-show-less-btn') {
                this.toggleItemsDisplay();
            }
            
            // Sort dropdown toggle
            if (event.target.id === 'crypto-sort-btn') {
                const dropdown = event.target.closest('.crypto-sort-dropdown');
                dropdown.classList.toggle('active');
            }
            
            // Sort option selection
            if (event.target.classList.contains('crypto-sort-option')) {
                const sortKey = event.target.dataset.sort;
                const sortDirection = event.target.dataset.direction;
                
                // Update sort config
                this.sortConfig.key = sortKey;
                this.sortConfig.direction = sortDirection;
                
                // Apply sorting and update UI
                this.sortPrices();
                this.renderPrices();
                
                // Close dropdown
                const dropdown = event.target.closest('.crypto-sort-dropdown');
                dropdown.classList.remove('active');
            }
            
            // Close dropdown when clicking outside
            if (!event.target.closest('.crypto-sort-dropdown')) {
                const dropdowns = document.querySelectorAll('.crypto-sort-dropdown');
                dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            }
        });
        
        document.addEventListener('change', (event) => {
            // Currency select
            if (event.target.id === 'crypto-currency-select') {
                this.config.currency = event.target.value;
                this.fetchPrices().then(() => this.renderPrices());
            }
        });
    }
}

// Create and export the API instance
const cryptoApi = new CryptoAPI();

// Auto-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    cryptoApi.init();
});

// Export for external use
window.cryptoApi = cryptoApi;

