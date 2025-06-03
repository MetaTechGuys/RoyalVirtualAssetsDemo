/**
 * RoyalVirtualAssets Cryptocurrency Converter
 * Converter with custom dropdowns showing currency logos
 */

class CryptoConverter {
  constructor() {
    this.apiUrl = "https://api.coingecko.com/api/v3";
    this.cryptoData = [];
    this.fiatCurrencies = [
      { id: "usd", name: "US Dollar", symbol: "USD", color: "#85bb65" },
      { id: "eur", name: "Euro", symbol: "EUR", color: "#0052b4" },
      { id: "gbp", name: "British Pound", symbol: "GBP", color: "#00247d" },
      { id: "jpy", name: "Japanese Yen", symbol: "JPY", color: "#bc002d" },
    ];
    this.updateInterval = 60000; // 1 minute
    this.intervalId = null;
  }

  /**
   * Initialize the converter
   */
  async init() {
    // Create converter HTML
    this.createConverterHTML();

    // Fetch initial data
    await this.fetchCryptoData();

    // Set up event listeners
    this.setupEventListeners();

    // Perform initial conversion
    this.performConversion();

    // Start auto-refresh
    this.startAutoRefresh();
  }

  /**
   * Create converter HTML
   */
  createConverterHTML() {
    const container = document.getElementById("crypto-converter");
    if (!container) return;

    container.className = "crypto-converter";
    container.innerHTML = `
            <h3>Cryptocurrency Converter</h3>
            <div class="crypto-input-group clogos" >
                <img src="././media/svg/bitcoin-btc-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 1">
                <img src="././media/svg/bnb-bnb-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 2">
                <img src="././media/svg/cardano-ada-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 3">
                <img src="././media/svg/dogecoin-doge-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 4">
                <img src="././media/svg/ethereum-eth-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 5">
                <img src="././media/svg/shiba-inu-shib-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 6">
                <img src="././media/svg/solana-sol-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 7">
                <img src="././media/svg/sui-sui-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 8">
                <img src="././media/svg/tether-usdt-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 9">
                <img src="././media/svg/tron-trx-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 10">
                <img src="././media/svg/usd-coin-usdc-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 11">
                <img src="././media/svg/aptos-apt-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 12">
                <img src="././media/svg/avalanche-avax-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 13">
                <img src="././media/svg/bitcoin-cash-bch-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 14">
                <img src="././media/svg/bitget-token-new-bgb-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 15">
                <img src="././media/svg/chainlink-link-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 16">
                <img src="././media/svg/cronos-cro-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 17">
                <img src="././media/svg/hedera-hbar-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 18">
                <img src="././media/svg/ethereum-classic-etc-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 19">
                <img src="././media/svg/internet-computer-icp-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 20">
                <img src="././media/svg/kaspa-kas-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 21">
                <img src="././media/svg/litecoin-ltc-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 22">
                <img src="././media/svg/mantra-om-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 23">
                <img src="././media/svg/monero-xmr-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 24">
                <img src="././media/svg/multi-collateral-dai-dai-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 25">
                <img src="././media/svg/ondo-finance-ondo-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 26">
                <img src="././media/svg/pepe-pepe-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 27">
                <img src="././media/svg/polkadot-new-dot-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 28">
                <img src="././media/svg/stellar-xlm-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 29">
                <img src="././media/svg/toncoin-ton-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 30">
                <img src="././media/svg/uniswap-uni-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 31">
                <img src="././media/svg/aave-aave-logo.svg" style="width: 40px; height: 40px; vertical-align: middle;" alt="crypto 32">
            </div>
            <div class="crypto-input-group">
                <label for="crypto-amount">Amount</label>
                <input type="number" id="crypto-amount" value="1" min="0" step="any">
            </div>
            
            <div class="crypto-input-group">
                <label for="currency-from">From</label>
                <!-- Hidden select for form submission -->
                <select id="currency-from" style="display:none;"></select>
                <!-- Custom dropdown with logos -->
                <div class="custom-select" id="from-dropdown">
                    <div class="selected-option" id="from-selected">
                        <div class="currency-logo" id="from-currency-logo"></div>
                        <span id="from-currency-name">Select currency</span>
                    </div>
                    <div class="options-container" id="from-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
            
            <div class="crypto-equals">
                <img src="././media/svg/Arrow 3.svg" style="width: 40px; height: 40px; vertical-align: middle;"  alt="arrow">
            </div>
            
            <div class="crypto-input-group">
                <label for="currency-to">To</label>
                <!-- Hidden select for form submission -->
                <select id="currency-to" style="display:none;"></select>
                <!-- Custom dropdown with logos -->
                <div class="custom-select" id="to-dropdown">
                    <div class="selected-option" id="to-selected">
                        <div class="currency-logo" id="to-currency-logo"></div>
                        <span id="to-currency-name">Select currency</span>
                    </div>
                    <div class="options-container" id="to-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
            
            <div class="crypto-input-group">
                <label>Result</label>
                <input type="text" id="conversion-result" class="crypto-result" readonly placeholder="Converted amount">
            </div>
            
            <div id="crypto-notification" class="crypto-notification"></div>
            <div id="crypto-error" class="crypto-error"></div>
        `;
  }
 

  /**
   * Fetch cryptocurrency data
   */
  async fetchCryptoData() {
    try {
      const response = await fetch(
        `${this.apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      this.cryptoData = await response.json();

      // Update dropdowns
      this.updateCurrencyDropdowns();

      return true;
    } catch (error) {
      document.getElementById("crypto-error").textContent =
        "Failed to load cryptocurrency data";
      document.getElementById("crypto-error").style.display = "block";
      return false;
    }
  }

  /**
   * Update currency dropdowns with both crypto and fiat
   */
  updateCurrencyDropdowns() {
    // Update hidden selects for form submission
    const fromSelect = document.getElementById("currency-from");
    const toSelect = document.getElementById("currency-to");

    if (fromSelect && toSelect) {
      // Create options HTML for hidden selects
      let optionsHTML = `
                ${this.fiatCurrencies
                  .map(
                    (fiat) =>
                      `<option value="fiat:${fiat.id}" data-type="fiat" data-symbol="${fiat.symbol}">${fiat.name} (${fiat.symbol})</option>`
                  )
                  .join("")}
                ${this.cryptoData
                  .map(
                    (coin) =>
                      `<option value="crypto:${
                        coin.id
                      }" data-type="crypto" data-price="${
                        coin.current_price
                      }" data-symbol="${coin.symbol}" data-image="${
                        coin.image
                      }">${coin.name} (${coin.symbol.toUpperCase()})</option>`
                  )
                  .join("")}
            `;

      fromSelect.innerHTML = optionsHTML;
      toSelect.innerHTML = optionsHTML;
    }

    // Update custom dropdowns
    this.updateCustomDropdown("from");
    this.updateCustomDropdown("to");

    // Set default selections
    this.selectCurrency("from", "crypto:bitcoin");
    this.selectCurrency("to", "fiat:usd");
  }

  /**
   * Update a custom dropdown with currency options
   */
  updateCustomDropdown(type) {
    const optionsContainer = document.getElementById(`${type}-options`);
    if (!optionsContainer) return;

    // Clear previous options
    optionsContainer.innerHTML = "";

    // Add fiat currency group
    const fiatGroup = document.createElement("div");
    fiatGroup.className = "option-group";
    fiatGroup.textContent = "Fiat Currencies";
    optionsContainer.appendChild(fiatGroup);

    // Add fiat currency options
    this.fiatCurrencies.forEach((fiat) => {
      const option = document.createElement("div");
      option.className = "option";
      option.dataset.value = `fiat:${fiat.id}`;
      option.dataset.type = "fiat";
      option.dataset.symbol = fiat.symbol;

      const logo = document.createElement("div");
      logo.className = "currency-logo";
      logo.style.backgroundColor = fiat.color;

      const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
      };

      logo.textContent = currencySymbols[fiat.symbol] || fiat.symbol.charAt(0);

      const name = document.createElement("span");
      name.textContent = `${fiat.name} (${fiat.symbol})`;

      option.appendChild(logo);
      option.appendChild(name);
      optionsContainer.appendChild(option);
    });

    // Add crypto currency group
    const cryptoGroup = document.createElement("div");
    cryptoGroup.className = "option-group";
    cryptoGroup.textContent = "Cryptocurrencies";
    optionsContainer.appendChild(cryptoGroup);

    // Add crypto currency options
    this.cryptoData.forEach((coin) => {
      const option = document.createElement("div");
      option.className = "option";
      option.dataset.value = `crypto:${coin.id}`;
      option.dataset.type = "crypto";
      option.dataset.symbol = coin.symbol;
      option.dataset.price = coin.current_price;
      option.dataset.image = coin.image || "";

      const logo = document.createElement("div");
      logo.className = "currency-logo";

      if (coin.image) {
        const img = document.createElement("img");
        img.src = coin.image;
        img.alt = coin.symbol;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        logo.appendChild(img);
      } else {
        logo.textContent = coin.symbol.charAt(0).toUpperCase();
      }

      const name = document.createElement("span");
      name.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;

      option.appendChild(logo);
      option.appendChild(name);
      optionsContainer.appendChild(option);
    });
  }

  /**
    /**
     * Select a currency in the custom dropdown
     */
  selectCurrency(type, value) {
    // Update hidden select
    const select = document.getElementById(`currency-${type}`);
    if (select) {
      select.value = value;
    }

    // Update custom dropdown display
    const selectedElement = document.getElementById(`${type}-selected`);
    const optionsContainer = document.getElementById(`${type}-options`);
    const options = optionsContainer.querySelectorAll(".option");

    // Find the selected option
    let selectedOption = null;
    options.forEach((option) => {
      if (option.dataset.value === value) {
        selectedOption = option;
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

    if (selectedOption) {
      // Update the selected display
      const logoElement = document.getElementById(`${type}-currency-logo`);
      const nameElement = document.getElementById(`${type}-currency-name`);

      // Clone the logo from the option
      const optionLogo = selectedOption.querySelector(".currency-logo");
      logoElement.innerHTML = optionLogo.innerHTML;
      logoElement.style.backgroundColor = optionLogo.style.backgroundColor;

      // Update the name
      nameElement.textContent =
        selectedOption.querySelector("span").textContent;
    }

    // Close the dropdown
    optionsContainer.classList.remove("show");

    // Perform conversion
    this.performConversion();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Amount input
    const amountInput = document.getElementById("crypto-amount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.performConversion());
    }

    // Custom dropdowns
    ["from", "to"].forEach((type) => {
      // Toggle dropdown on click
      const selectedOption = document.getElementById(`${type}-selected`);
      const optionsContainer = document.getElementById(`${type}-options`);

      if (selectedOption && optionsContainer) {
        selectedOption.addEventListener("click", () => {
          // Close other dropdown
          const otherType = type === "from" ? "to" : "from";
          const otherContainer = document.getElementById(
            `${otherType}-options`
          );
          if (otherContainer) {
            otherContainer.classList.remove("show");
          }

          // Toggle this dropdown
          optionsContainer.classList.toggle("show");
        });

        // Handle option selection
        optionsContainer.addEventListener("click", (e) => {
          const option = e.target.closest(".option");
          if (option) {
            const value = option.dataset.value;
            this.selectCurrency(type, value);
          }
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".custom-select")) {
        const dropdowns = document.querySelectorAll(".options-container");
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove("show");
        });
      }
    });
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.getElementById("crypto-notification");
    if (notification) {
      notification.textContent = message;
      notification.style.display = "block";

      // Hide after 3 seconds
      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    }
  }

  /**
   * Perform the conversion
   */
  performConversion() {
    try {
      // Hide any previous errors
      const errorElement = document.getElementById("crypto-error");
      if (errorElement) {
        errorElement.style.display = "none";
      }

      // Get input values
      const amount =
        parseFloat(document.getElementById("crypto-amount").value) || 0;
      const fromValue = document.getElementById("currency-from").value;
      const toValue = document.getElementById("currency-to").value;
      const resultInput = document.getElementById("conversion-result");

      // Skip if amount is zero
      if (amount === 0) {
        resultInput.value = "0";
        return;
      }

      // Parse the from/to values
      const [fromType, fromId] = fromValue.split(":");
      const [toType, toId] = toValue.split(":");

      // Get selected options
      const fromSelect = document.getElementById("currency-from");
      const toSelect = document.getElementById("currency-to");
      const fromOption = Array.from(fromSelect.options).find(
        (opt) => opt.value === fromValue
      );
      const toOption = Array.from(toSelect.options).find(
        (opt) => opt.value === toValue
      );

      if (!fromOption || !toOption) return;

      // Get symbols
      const fromSymbol = fromOption.dataset.symbol.toUpperCase();
      const toSymbol = toOption.dataset.symbol.toUpperCase();

      let result = 0;

      // Crypto to Fiat
      if (fromType === "crypto" && toType === "fiat") {
        const cryptoPrice = parseFloat(fromOption.dataset.price) || 0;
        result = amount * cryptoPrice;

        // Apply exchange rate if not USD
        if (toId !== "usd") {
          const exchangeRates = {
            eur: 0.91, // 1 USD = 0.91 EUR
            gbp: 0.77, // 1 USD = 0.77 GBP
            jpy: 111.0, // 1 USD = 111 JPY
          };

          result = result * (exchangeRates[toId] || 1);
        }

        // Format with currency symbol
        const currencySymbols = {
          usd: "$",
          eur: "€",
          gbp: "£",
          jpy: "¥",
        };

        const symbol = currencySymbols[toId] || "";
        resultInput.value = `${symbol}${this.formatNumber(result)}`;
      }
      // Fiat to Crypto
      else if (fromType === "fiat" && toType === "crypto") {
        const cryptoPrice = parseFloat(toOption.dataset.price) || 0;

        // Convert fiat to USD first if not USD
        let amountInUsd = amount;
        if (fromId !== "usd") {
          const exchangeRates = {
            eur: 1.1, // 1 EUR = 1.1 USD
            gbp: 1.3, // 1 GBP = 1.3 USD
            jpy: 0.009, // 1 JPY = 0.009 USD
          };

          amountInUsd = amount * (exchangeRates[fromId] || 1);
        }

        result = amountInUsd / cryptoPrice;
        resultInput.value = `${this.formatNumber(result, true)} ${toSymbol}`;
      }
      // Crypto to Crypto
      else if (fromType === "crypto" && toType === "crypto") {
        const fromPrice = parseFloat(fromOption.dataset.price) || 0;
        const toPrice = parseFloat(toOption.dataset.price) || 0;

        if (fromId === toId) {
          result = amount; // Same crypto
        } else if (toPrice === 0) {
          throw new Error("Target cryptocurrency price is not available");
        } else {
          // Convert through USD
          const valueInUsd = amount * fromPrice;
          result = valueInUsd / toPrice;
        }

        resultInput.value = `${this.formatNumber(result, true)} ${toSymbol}`;
      }
      // Fiat to Fiat
      else if (fromType === "fiat" && toType === "fiat") {
        // Exchange rates with USD as base
        const usdRates = {
          usd: 1,
          eur: 0.91,
          gbp: 0.77,
          jpy: 111.0,
        };

        // Convert from source to USD, then to target
        const amountInUsd = amount / usdRates[fromId];
        result = amountInUsd * usdRates[toId];

        // Format with currency symbol
        const currencySymbols = {
          usd: "$",
          eur: "€",
          gbp: "£",
          jpy: "¥",
        };

        const symbol = currencySymbols[toId] || "";
        resultInput.value = `${symbol}${this.formatNumber(result)}`;
      }

      // Add highlight animation to result
      resultInput.classList.remove("highlight");
      void resultInput.offsetWidth; // Trigger reflow
      resultInput.classList.add("highlight");
    } catch (error) {
      const errorElement = document.getElementById("crypto-error");
      if (errorElement) {
        errorElement.textContent =
          error.message || "Error performing conversion";
        errorElement.style.display = "block";
      }
      const resultInput = document.getElementById("conversion-result");
      if (resultInput) {
        resultInput.value = "";
      }
    }
  }

  /**
   * Format number based on type
   */
  formatNumber(value, isCrypto = false) {
    if (isCrypto) {
      // For crypto values
      if (value < 0.00001) {
        return value.toExponential(4);
      } else if (value < 0.001) {
        return value.toFixed(8);
      } else if (value < 1) {
        return value.toFixed(6);
      } else if (value < 1000) {
        return value.toFixed(4);
      } else {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
    } else {
      // For fiat values
      if (value < 0.01) {
        return value.toFixed(4);
      } else if (value < 1000) {
        return value.toFixed(2);
      } else {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    this.intervalId = setInterval(async () => {
      await this.fetchCryptoData();
      this.performConversion();
    }, this.updateInterval);
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
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("crypto-converter")) {
    const converter = new CryptoConverter();
    converter.init();

    // Make it globally accessible
    window.cryptoConverter = converter;
  }
});
