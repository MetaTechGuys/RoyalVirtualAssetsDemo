/**
 * RoyalVirtualAssets Cryptocurrency Price API
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
      limit: options.limit || 40,
      currency: options.currency || "usd",
      initialDisplay: options.initialDisplay || 8, // Default: initially show 8 items
      maxRetries: options.maxRetries || 8, // Maximum number of retry attempts
      cacheKey: "Royal_crypto_cache", // LocalStorage key for caching
      cacheExpiry: options.cacheExpiry || 480000, // Cache expiry: 8 minutes
      eagerLoad: options.eagerLoad !== true, // Enable eager loading by default
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
    } catch (error) {
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
        localStorage.removeItem(this.config.cacheKey);
        return null;
      }

      // Check if currency matches
      if (cacheData.currency !== this.config.currency) {
        return null;
      }

      return cacheData.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    try {
      localStorage.removeItem(this.config.cacheKey);
    } catch (error) {
    }
  }

  /**
   * Calculate market analysis data
   */
  calculateMarketAnalysis() {
    if (!this.prices || this.prices.length === 0) {
      return {
        totalMarketCap: 0,
        totalVolume: 0,
        gainers: [],
        losers: [],
        averageChange: 0,
        bullishCount: 0,
        bearishCount: 0,
        topPerformers: [],
        worstPerformers: [],
        marketSentiment: 'neutral'
      };
    }

    const totalMarketCap = this.prices.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const totalVolume = this.prices.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
    
    // Filter valid price changes
    const validChanges = this.prices
      .filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined)
      .map(coin => coin.price_change_percentage_24h);
    
    const averageChange = validChanges.length > 0 
      ? validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length 
      : 0;

    const bullishCount = this.prices.filter(coin => (coin.price_change_percentage_24h || 0) > 0).length;
    const bearishCount = this.prices.filter(coin => (coin.price_change_percentage_24h || 0) < 0).length;

    // Top gainers and losers
    const sortedByChange = [...this.prices]
      .filter(coin => coin.price_change_percentage_24h !== null)
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));

    const gainers = sortedByChange.slice(0, 3);
    const losers = sortedByChange.slice(-3).reverse();

    // Market sentiment
    let marketSentiment = 'neutral';
    if (averageChange > 2) marketSentiment = 'very bullish';
    else if (averageChange > 0.5) marketSentiment = 'bullish';
    else if (averageChange < -2) marketSentiment = 'very bearish';
    else if (averageChange < -0.5) marketSentiment = 'bearish';

    return {
      totalMarketCap,
      totalVolume,
      gainers,
      losers,
      averageChange,
      bullishCount,
      bearishCount,
      topPerformers: gainers,
      worstPerformers: losers,
      marketSentiment
    };
  }

  /**
   * Calculate price range analysis
   */
  calculatePriceRangeAnalysis() {
    if (!this.prices || this.prices.length === 0) return {};

    const prices = this.prices.map(coin => coin.current_price).filter(price => price > 0);
    
    return {
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      priceRanges: {
        under1: this.prices.filter(coin => coin.current_price < 1).length,
        range1to10: this.prices.filter(coin => coin.current_price >= 1 && coin.current_price < 10).length,
        range10to100: this.prices.filter(coin => coin.current_price >= 10 && coin.current_price < 100).length,
        range100to1000: this.prices.filter(coin => coin.current_price >= 100 && coin.current_price < 1000).length,
        over1000: this.prices.filter(coin => coin.current_price >= 1000).length
      }
    };
  }

  /**
   * Render market overview with dropdown containing all analysis sections
   */
  renderMarketOverview(analysis, priceAnalysis) {
    const overviewDiv = document.createElement("div");
    overviewDiv.className = "crypto-analysis-section crypto-market-overview";
    overviewDiv.innerHTML = `
      <div class="crypto-overview-header">
        <h3>📊 Market Overview</h3>
        <button class="crypto-dropdown-toggle" id="crypto-analysis-toggle">
          <span>View Detailed Analysis</span>
          <span class="dropdown-arrow">▼</span>
        </button>
      </div>
      <div class="crypto-overview-grid">
        <div class="crypto-stat-card">
          <div class="stat-label">Total Market Cap</div>
          <div class="stat-value">${this.formatMarketCap(analysis.totalMarketCap, this.config.currency)}</div>
        </div>
        <div class="crypto-stat-card">
          <div class="stat-label">24h Volume</div>
          <div class="stat-value">${this.formatMarketCap(analysis.totalVolume, this.config.currency)}</div>
        </div>
        <div class="crypto-stat-card">
          <div class="stat-label">Average Change</div>
          <div class="stat-value ${analysis.averageChange >= 0 ? 'crypto-positive' : 'crypto-negative'}">
            ${analysis.averageChange.toFixed(2)}%
          </div>
        </div>
        <div class="crypto-stat-card">
          <div class="stat-label">Market Sentiment</div>
          <div class="stat-value sentiment-${analysis.marketSentiment.replace(' ', '-')}">${analysis.marketSentiment.toUpperCase()}</div>
        </div>
      </div>
      <div class="crypto-dropdown-content" id="crypto-analysis-dropdown">
        <div class="crypto-dropdown-inner">
          ${this.renderTopPerformersContent(analysis)}
          ${this.renderMarketSentimentContent(analysis)}
          ${this.renderPriceRangeAnalysisContent(priceAnalysis)}
          ${this.renderMarketCapAnalysisContent()}
        </div>
      </div>
    `;
    return overviewDiv;
  }

  /**
   * Render top performers content (for dropdown)
   */
  renderTopPerformersContent(analysis) {
    const gainersHtml = analysis.gainers.map((coin, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="crypto-name">
          <img src="${coin.image}" alt="${coin.name}" width="20" height="20" loading="lazy">
          ${coin.symbol.toUpperCase()}
        </td>
        <td class="crypto-positive" style="color: #27ae60;">+${coin.price_change_percentage_24h.toFixed(2)}%</td>
        <td>${this.formatPrice(coin.current_price, this.config.currency)}</td>
      </tr>
    `).join('');

    const losersHtml = analysis.losers.map((coin, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="crypto-name">
          <img src="${coin.image}" alt="${coin.name}" width="20" height="20" loading="lazy">
          ${coin.symbol.toUpperCase()}
        </td>
        <td class="crypto-negative" style="color: #c0392b;">${coin.price_change_percentage_24h.toFixed(2)}%</td>
        <td>${this.formatPrice(coin.current_price, this.config.currency)}</td>
      </tr>
    `).join('');

    return `
      <div class="crypto-dropdown-section">
        <h4>🚀 Top Performers & Losers</h4>
        <div class="crypto-performers-grid">
          <div class="crypto-performers-table">
            <h5>Top Gainers (24h)</h5>
            <table class="crypto-mini-table">
              <thead>
                <tr><th>#</th><th>Coin</th><th>Change</th><th>Price</th></tr>
              </thead>
              <tbody>${gainersHtml}</tbody>
            </table>
          </div>
          <div class="crypto-performers-table">
            <h5>Top Losers (24h)</h5>
            <table class="crypto-mini-table">
              <thead>
                <tr><th>#</th><th>Coin</th><th>Change</th><th>Price</th></tr>
              </thead>
              <tbody>${losersHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render market sentiment content (for dropdown)
   */
  renderMarketSentimentContent(analysis) {
    const bullishPercentage = ((analysis.bullishCount / this.prices.length) * 100).toFixed(1);
    const bearishPercentage = ((analysis.bearishCount / this.prices.length) * 100).toFixed(1);
    
    return `
      <div class="crypto-dropdown-section">
        <h4>📈 Market Sentiment Analysis</h4>
        <div class="crypto-sentiment-grid">
          <div class="crypto-sentiment-card bullish">
            <div class="sentiment-icon">📈</div>
            <div class="sentiment-data">
              <div class="sentiment-count">${analysis.bullishCount}</div>
              <div class="sentiment-label">Bullish Coins</div>
              <div class="sentiment-percentage">${bullishPercentage}%</div>
            </div>
          </div>
          <div class="crypto-sentiment-card bearish">
            <div class="sentiment-icon">📉</div>
            <div class="sentiment-data">
              <div class="sentiment-count">${analysis.bearishCount}</div>
              <div class="sentiment-label">Bearish Coins</div>
              <div class="sentiment-percentage">${bearishPercentage}%</div>
            </div>
          </div>
          <div class="crypto-sentiment-card neutral">
            <div class="sentiment-icon">⚖️</div>
            <div class="sentiment-data">
              <div class="sentiment-count">${this.prices.length - analysis.bullishCount - analysis.bearishCount}</div>
              <div class="sentiment-label">Neutral Coins</div>
              <div class="sentiment-percentage">${(100 - parseFloat(bullishPercentage) - parseFloat(bearishPercentage)).toFixed(1)}%</div>
            </div>
          </div>
        </div>
        <div class="crypto-sentiment-bar">
          <div class="sentiment-bar-fill bullish" style="width: ${bullishPercentage}%"></div>
          <div class="sentiment-bar-fill bearish" style="width: ${bearishPercentage}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render price range distribution analysis content (for dropdown)
   */
  renderPriceRangeAnalysisContent(priceAnalysis) {
    const currencySymbol = this.getCurrencySymbol();
    
    return `
      <div class="crypto-dropdown-section">
        <h4>💰 Price Range Distribution</h4>
        <div class="crypto-price-range-grid">
          <div class="price-range-item">
            <div class="range-label">Under ${currencySymbol}1</div>
            <div class="range-count">${priceAnalysis.priceRanges.under1}</div>
            <div class="range-bar">
              <div class="range-fill" style="width: ${(priceAnalysis.priceRanges.under1 / this.prices.length) * 100}%"></div>
            </div>
          </div>
          <div class="price-range-item">
            <div class="range-label">${currencySymbol}1 - ${currencySymbol}10</div>
            <div class="range-count">${priceAnalysis.priceRanges.range1to10}</div>
            <div class="range-bar">
              <div class="range-fill" style="width: ${(priceAnalysis.priceRanges.range1to10 / this.prices.length) * 100}%"></div>
            </div>
          </div>
          <div class="price-range-item">
            <div class="range-label">${currencySymbol}10 - ${currencySymbol}100</div>
            <div class="range-count">${priceAnalysis.priceRanges.range10to100}</div>
            <div class="range-bar">
              <div class="range-fill" style="width: ${(priceAnalysis.priceRanges.range10to100 / this.prices.length) * 100}%"></div>
            </div>
          </div>
          <div class="price-range-item">
            <div class="range-label">${currencySymbol}100 - ${currencySymbol}1K</div>
            <div class="range-count">${priceAnalysis.priceRanges.range100to1000}</div>
            <div class="range-bar">
              <div class="range-fill" style="width: ${(priceAnalysis.priceRanges.range100to1000 / this.prices.length) * 100}%"></div>
            </div>
          </div>
          <div class="price-range-item">
            <div class="range-label">Over ${currencySymbol}1K</div>
            <div class="range-count">${priceAnalysis.priceRanges.over1000}</div>
            <div class="range-bar">
              <div class="range-fill" style="width: ${(priceAnalysis.priceRanges.over1000 / this.prices.length) * 100}%"></div>
            </div>
          </div>
        </div>
        <div class="crypto-price-stats">
          <div class="price-stat">
            <span class="stat-label">Highest:</span>
            <span class="stat-value">${this.formatPrice(priceAnalysis.highestPrice, this.config.currency)}</span>
          </div>
          <div class="price-stat">
            <span class="stat-label">Lowest:</span>
            <span class="stat-value">${this.formatPrice(priceAnalysis.lowestPrice, this.config.currency)}</span>
          </div>
          <div class="price-stat">
            <span class="stat-label">Average:</span>
            <span class="stat-value">${this.formatPrice(priceAnalysis.averagePrice, this.config.currency)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render market cap analysis content (for dropdown)
   */
  renderMarketCapAnalysisContent() {
    // Calculate market cap distribution
    const totalMarketCap = this.prices.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const top5MarketCap = this.prices.slice(0, 5).reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const top10MarketCap = this.prices.slice(0, 10).reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    
    const dominanceData = this.prices.slice(0, 5).map(coin => ({
      name: coin.symbol.toUpperCase(),
      marketCap: coin.market_cap || 0,
      dominance: ((coin.market_cap || 0) / totalMarketCap * 100).toFixed(2)
    }));

    const dominanceHtml = dominanceData.map((coin, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${coin.name}</td>
        <td>${this.formatMarketCap(coin.marketCap, this.config.currency)}</td>
        <td>${coin.dominance}%</td>
        <td>
          <div class="dominance-bar">
            <div class="dominance-fill" style="width: ${coin.dominance}%"></div>
          </div>
        </td>
      </tr>
    `).join('');

    return `
      <div class="crypto-dropdown-section">
        <h4>🏆 Market Cap Analysis</h4>
        <div class="crypto-marketcap-overview">
          <div class="marketcap-stat">
            <div class="stat-label">Total Market Cap</div>
            <div class="stat-value">${this.formatMarketCap(totalMarketCap, this.config.currency)}</div>
          </div>
          <div class="marketcap-stat">
            <div class="stat-label">Top 5 Dominance</div>
            <div class="stat-value">${((top5MarketCap / totalMarketCap) * 100).toFixed(1)}%</div>
          </div>
          <div class="marketcap-stat">
            <div class="stat-label">Top 10 Dominance</div>
            <div class="stat-value">${((top10MarketCap / totalMarketCap) * 100).toFixed(1)}%</div>
          </div>
        </div>
        <table class="crypto-dominance-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Coin</th>
              <th>Market Cap</th>
              <th>Dominance</th>
              <th>Visual</th>
            </tr>
          </thead>
          <tbody>${dominanceHtml}</tbody>
        </table>
      </div>
    `;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol() {
    const symbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      jpy: "¥"
    };
    return symbols[this.config.currency] || "$";
  }

  /**
   * Add analysis styles
   */
  addAnalysisStyles() {
    if (!document.getElementById("crypto-analysis-styles")) {
      const style = document.createElement("style");
      style.id = "crypto-analysis-styles";
      style.textContent = `
        .crypto-analysis-section {
          margin-bottom: 30px;
          background: #2a2b41;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .crypto-analysis-section h3 {
          margin: 0 0 20px 0;
          color: whitesmoke;
          font-size: 18px;
          font-weight: 600;
        }

        /* Market Overview with Dropdown Styles */
        .crypto-market-overview {
          position: relative;
        }

        .crypto-overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .crypto-dropdown-toggle {
          background: rgba(30, 136, 229, 0.8);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .crypto-dropdown-toggle:hover {
          background: rgba(30, 136, 229, 1);
          transform: translateY(-1px);
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
          font-size: 12px;
        }

        .crypto-dropdown-toggle.active .dropdown-arrow {
          transform: rotate(180deg);
        }

        .crypto-dropdown-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
          background: rgba(42, 43, 65, 0.95);
          border-radius: 8px;
          margin-top: 15px;
        }

        .crypto-dropdown-content.active {
          max-height: 2000px;
          transition: max-height 0.5s ease-in;
        }

        .crypto-dropdown-inner {
          padding: 20px;
        }

        .crypto-dropdown-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .crypto-dropdown-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .crypto-dropdown-section h4 {
          margin: 0 0 15px 0;
          color: whitesmoke;
          font-size: 16px;
          font-weight: 600;
        }

        .crypto-dropdown-section h5 {
          margin: 0 0 10px 0;
          color: whitesmoke;
          font-size: 14px;
          font-weight: 500;
        }

        /* Market Overview Grid */
        .crypto-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .crypto-stat-card {
          background: rgba(30, 136, 229, 0.48);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: whitesmoke;
        }

        .stat-label {
          font-size: 12px;
          color: whitesmoke;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: whitesmoke;
        }

        .sentiment-very-bullish { color: #27ae60; }
        .sentiment-bullish { color: #2ecc71; }
        .sentiment-neutral { color: #95a5a6; }
        .sentiment-bearish { color: #e74c3c; }
        .sentiment-very-bearish { color: #c0392b; }

        /* Performers Styles */
        .crypto-performers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .crypto-performers-table h5 {
          margin: 0 0 10px 0;
          color: whitesmoke;
          font-size: 14px;
        }

        .crypto-mini-table {
          width: 100%;
          border-collapse: collapse;
          background: whitesmoke;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .crypto-mini-table th {
          background: rgba(30, 136, 229, 0.88);
          color: white;
          padding: 8px;
          font-size: 12px;
          text-align: left;
        }

        .crypto-mini-table td {
          padding: 8px;
          border-bottom: 0px solid #1e88e5;
          font-size: 12px;
          color: #333;
        }

        .crypto-mini-table .crypto-name {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .crypto-mini-table img {
          border-radius: 50%;
        }

        /* Sentiment Styles */
        .crypto-sentiment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .crypto-sentiment-card {
          background: rgba(30, 136, 229, 0.48);
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .sentiment-icon {
          font-size: 24px;
        }

        .sentiment-count {
          font-size: 20px;
          font-weight: bold;
          color: whitesmoke;
        }

        .sentiment-label {
          font-size: 12px;
          color: whitesmoke;
          margin: 2px 0;
        }

        .sentiment-percentage {
          font-size: 14px;
          font-weight: 600;
        }

        .crypto-sentiment-card.bullish .sentiment-percentage { color: #27ae60; }
        .crypto-sentiment-card.bearish .sentiment-percentage { color: #e74c3c; }
        .crypto-sentiment-card.neutral .sentiment-percentage { color: #95a5a6; }

        .crypto-sentiment-bar {
          height: 8px;
          background: #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
        }

        .sentiment-bar-fill.bullish { background: #27ae60; }
        .sentiment-bar-fill.bearish { background: #e74c3c; }

        /* Price Range Styles */
        .crypto-price-range-grid {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }

        .price-range-item {
          background: #2a2b41;
          padding: 12px;
          border-radius: 6px;
          display: grid;
          grid-template-columns: 1fr auto 2fr;
          align-items: center;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .range-label {
          font-size: 13px;
          color: whitesmoke;
          font-weight: 500;
        }

        .range-count {
          font-size: 14px;
          font-weight: bold;
          color: #3498db;
          min-width: 30px;
          text-align: center;
        }

        .range-bar {
          height: 6px;
          background: gray;
          border-radius: 0px;
          overflow: hidden;
        }

        .range-fill {
          height: 100%;
          background: linear-gradient(90deg, #2a2b41, #2980b9);
          transition: width 0.3s ease;
        }

        .crypto-price-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          background: #2a2b41;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .price-stat {
          text-align: center;
        }

        .price-stat .stat-label {
          display: block;
          font-size: 11px;
          color: whitesmoke;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .price-stat .stat-value {
          font-size: 14px;
          font-weight: bold;
          color: #1e88e5;
        }

        /* Market Cap Analysis Styles */
        .crypto-marketcap-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .marketcap-stat {
          background: #2a2b41;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .crypto-dominance-table {
          width: 100%;
          border-collapse: collapse;
          background: #2a2b41;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .crypto-dominance-table th {
          background: rgba(30, 136, 229, 0.88);
          color: white;
          padding: 12px;
          font-size: 13px;
          text-align: left;
        }

        .crypto-dominance-table td {
          padding: 12px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 13px;
          color: whitesmoke;
        }

        .dominance-bar {
          height: 6px;
          background: gray;
          border-radius: 3px;
          overflow: hidden;
          min-width: 100px;
        }

        .dominance-fill {
          height: 100%;
          background: linear-gradient(90deg, #2a2b41, #1e88e5);
          transition: width 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .crypto-performers-grid {
            grid-template-columns: 1fr;
          }
          
          .crypto-sentiment-grid {
            grid-template-columns: 1fr;
          }
          
          .crypto-overview-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .crypto-marketcap-overview {
            grid-template-columns: 1fr;
          }
          
          .price-range-item {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 5px;
          }
          
          .crypto-price-stats {
            grid-template-columns: 1fr;
          }

          .crypto-overview-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .crypto-dropdown-toggle {
            justify-content: center;
          }
        }

        /* Animation for loading */
        .crypto-analysis-section.loading {
          opacity: 0.7;
          pointer-events: none;
        }

        .crypto-analysis-section.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Initialize the crypto price tracker
   */
  async init() {
    try {
      // Create container if it doesn't exist
      if (!document.querySelector(this.config.containerSelector)) {
        const container = document.createElement("div");
        container.id = this.config.containerSelector.replace("#", "");
        document.body.appendChild(container);
      }

      // Add analysis styles
      this.addAnalysisStyles();

      // Try to load from cache first for instant display
      const cachedData = this.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        this.prices = cachedData;
        this.isUsingCache = true;
        this.sortPrices();
        this.renderAnalysisAndPrices();
      }

      // Fetch fresh data
      await this.fetchPrices();
      this.renderAnalysisAndPrices();

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
        this.isLoading = false;
        this.updateLoadingState();

        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.fetchPrices(retryAttempt + 1);
      } else {
        // All retries failed, try to use cached data
        const cachedData = this.loadFromCache();
        if (cachedData && cachedData.length > 0) {
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
    this.renderAnalysisAndPrices();
  }

  /**
   * Render both analysis tables and price table
   */
  renderAnalysisAndPrices() {
    if (this.prices && this.prices.length > 0) {
      // Calculate analysis data
      const marketAnalysis = this.calculateMarketAnalysis();
      const priceAnalysis = this.calculatePriceRangeAnalysis();

      // Render analysis tables first
      this.renderAnalysisTables(marketAnalysis, priceAnalysis);
    }
    
    // Then render the main price table
    this.renderPrices();
  }

  /**
   * Render all analysis tables (now just the market overview with dropdown)
   */
  renderAnalysisTables(marketAnalysis, priceAnalysis) {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;

    // Remove existing analysis sections
    const existingAnalysis = container.querySelectorAll('.crypto-analysis-section');
    existingAnalysis.forEach(section => section.remove());

    // Create analysis container
    const analysisContainer = document.createElement('div');
    analysisContainer.className = 'crypto-analysis-container';

    // Add only the market overview with dropdown containing all other analysis
    analysisContainer.appendChild(this.renderMarketOverview(marketAnalysis, priceAnalysis));

    // Insert at the beginning of the container
    container.insertBefore(analysisContainer, container.firstChild);
  }

  /**
   * Render cryptocurrency prices in the container
   */
  renderPrices() {
    const container = document.querySelector(this.config.containerSelector);

    if (!container) {
      return;
    }

    // Remove existing price content (but keep analysis)
    const existingPriceContent = container.querySelectorAll('.crypto-header, .crypto-table, .crypto-toggle-container, .crypto-footer');
    existingPriceContent.forEach(element => element.remove());

    // Create header
    const header = document.createElement("div");
    header.className = "crypto-header";

    header.innerHTML = `
            <h2>Live Cryptocurrency Prices</h2>
    <div class="crypto-controls">
        <label for="crypto-currency-select" style="opacity:0">Choose:</label>
        <select id="crypto-currency-select">
            <option value="usd" ${this.config.currency === "usd" ? "selected" : ""}>USD</option>
            <option value="eur" ${this.config.currency === "eur" ? "selected" : ""}>EUR</option>
            <option value="gbp" ${this.config.currency === "gbp" ? "selected" : ""}>GBP</option>
            <option value="jpy" ${this.config.currency === "jpy" ? "selected" : ""}>JPY</option>
        </select>
        <div class="crypto-sort-dropdown">
            <button type="button" name="crypto" id="crypto-sort-btn">Sort By</button>
            <div class="crypto-sort-menu">
                <div class="crypto-sort-option" data-sort="price" data-direction="desc">Price (High-Low)</div>
                <div class="crypto-sort-option" data-sort="price" data-direction="asc">Price (Low-High)</div>
                <div class="crypto-sort-option" data-sort="change" data-direction="desc">24h Change (High-Low)</div>
                <div class="crypto-sort-option" data-sort="change" data-direction="asc">24h Change (Low-High)</div>
                <div class="crypto-sort-option" data-sort="market_cap" data-direction="desc">Market Cap (High-Low)</div>
                <div class="crypto-sort-option" data-sort="market_cap" data-direction="asc">Market Cap (Low-High)</div>
            </div>
        </div>
        <button type="button" name="crypto button" id="crypto-refresh-btn">Refresh</button>
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
            ${this.isUsingCache ? '<span style="color: #f39c12;">📦 Showing cached data</span>' : ''}
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
                    background-color: #1e88e5;
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
    this.hasError = true;
    this.errorMessage = error.message || "Failed to fetch cryptocurrency data";
    this.renderAnalysisAndPrices();
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
      this.renderAnalysisAndPrices();
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
    this.renderAnalysisAndPrices();
  }

  /**
   * Set up event listeners for user interaction
   */
  setupEventListeners() {
    document.addEventListener("click", (event) => {
      // Refresh button
      if (event.target.id === "crypto-refresh-btn") {
        this.fetchPrices().then(() => this.renderAnalysisAndPrices());
      }

      // Retry button
      if (event.target.id === "crypto-retry-btn") {
        this.fetchPrices().then(() => this.renderAnalysisAndPrices());
      }

      // Show More button
      if (event.target.id === "crypto-show-more-btn") {
        this.toggleItemsDisplay();
      }

      // Show Less button
      if (event.target.id === "crypto-show-less-btn") {
        this.toggleItemsDisplay();
      }

      // Analysis dropdown toggle
      if (event.target.id === "crypto-analysis-toggle" || event.target.closest("#crypto-analysis-toggle")) {
        const toggle = document.getElementById("crypto-analysis-toggle");
        const dropdown = document.getElementById("crypto-analysis-dropdown");
        
        if (toggle && dropdown) {
          toggle.classList.toggle("active");
          dropdown.classList.toggle("active");
        }
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
        this.renderAnalysisAndPrices();

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
        this.fetchPrices().then(() => this.renderAnalysisAndPrices());
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
    this.renderAnalysisAndPrices();
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
            const CACHE_NAME = 'Royal-crypto-cache-v1';
            const API_CACHE_NAME = 'Royal-crypto-api-cache-v1';
            
            // Install event - cache static resources
            self.addEventListener('install', (event) => {
                self.skipWaiting();
            });
            
            // Activate event - clean up old caches
            self.addEventListener('activate', (event) => {
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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

        // Clean up the blob URL after registration
        URL.revokeObjectURL(swUrl);
      })
      .catch((error) => {
        // Clean up the blob URL on error too
        URL.revokeObjectURL(swUrl);
      });
  });
}
