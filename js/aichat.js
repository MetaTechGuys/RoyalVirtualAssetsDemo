class RVAAIChat {
  constructor() {
    this.isOpen = false;
    this.cryptoApi = null; // Reference to the crypto API
    this.conversationHistory = [];
    this.userPreferences = JSON.parse(
      localStorage.getItem("rva-chat-preferences") || "{}"
    );

    this.aiCharacter = {
      name: "Diana",
      age: 24,
      expertise: "Blockchain & DeFi",
      personality: "friendly, knowledgeable, professional",
      experience: "4 years in DeFi",
      specialties: [
        "RVA ecosystem",
        "cryptocurrency",
        "smart contracts",
        "tokenization",
        "market analysis",
        "teaching crypto",
      ],
    };

    this.knowledgeBase = {
      rva: {
        keywords: ["rva", "Royal virtual assets", "ecosystem", "platform"],
        responses: [
          "RVA (Royal Virtual Assets) is a next-generation blockchain ecosystem with four core pillars: ICO/IDO Launchpad, Secure Wallet, Smart Chain, and Smart Exchange. We're building the future of decentralized finance!",
          "Our RVA ecosystem is designed to be secure, scalable, and user-friendly. We integrate all essential DeFi tools into one seamless platform.",
          "RVA stands for transparency, efficiency, and security in blockchain technology. We're committed to empowering individuals and institutions in the DeFi space.",
        ],
      },
      wallet: {
        keywords: ["wallet", "secure wallet", "storage"],
        responses: [
          "Our RVA Secure Wallet provides top-tier security for your digital assets. It supports multiple cryptocurrencies and integrates seamlessly with our ecosystem.",
          "The RVA wallet features advanced security protocols, multi-signature support, and user-friendly interface for managing your crypto portfolio.",
        ],
      },
      launchpad: {
        keywords: ["launchpad", "ico", "ido", "token launch"],
        responses: [
          "Our ICO/IDO Launchpad helps innovative projects raise funds and launch their tokens securely. We provide comprehensive support throughout the launch process.",
          "The RVA Launchpad is designed for both project creators and investors, offering a secure and transparent platform for token launches.",
        ],
      },
      exchange: {
        keywords: ["exchange", "trading", "swap", "dex"],
        responses: [
          "Our Smart Exchange offers decentralized trading with low fees, high liquidity, and advanced trading features. Trade with confidence on RVA!",
          "The RVA Smart Exchange provides a seamless trading experience with institutional-grade security and retail-friendly interface.",
        ],
      },
      blockchain: {
        keywords: ["blockchain", "smart chain", "technology"],
        responses: [
          "Our Smart Chain is built for scalability and efficiency, supporting high-throughput transactions while maintaining security and decentralization.",
          "RVA's blockchain technology focuses on interoperability, allowing seamless integration with other major blockchain networks.",
        ],
      },
      staking: {
        keywords: ["staking", "stake", "rewards", "passive income"],
        responses: [
          "RVA staking allows you to earn passive rewards by locking your tokens. Our staking pools offer competitive APY rates with flexible lock periods.",
          "Stake your RVA tokens to participate in network security and earn rewards. Choose from various staking pools with different risk-reward profiles.",
        ],
      },

      governance: {
        keywords: ["governance", "voting", "proposal", "dao"],
        responses: [
          "RVA governance empowers token holders to vote on important protocol decisions. Your voting power is proportional to your token holdings.",
          "Participate in RVA's decentralized governance by submitting proposals and voting on community decisions that shape our ecosystem's future.",
        ],
      },

      nft: {
        keywords: ["nft", "non-fungible", "marketplace", "collectibles"],
        responses: [
          "Our RVA NFT marketplace supports creating, buying, and selling unique digital assets. Low fees and high security make it perfect for creators and collectors.",
          "The RVA NFT ecosystem includes marketplace, minting tools, and royalty management for creators and collectors alike.",
        ],
      },

      defi: {
        keywords: ["RVA's defi", "RVA's decentralized finance", "lending", "borrowing"],
        responses: [
          "RVA's DeFi suite includes lending, borrowing, yield farming, and liquidity provision. All with institutional-grade security and user-friendly interfaces.",
          "Experience the full power of DeFi with RVA's integrated protocols. Earn yield, provide liquidity, and access decentralized financial services.",
        ],
      },
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.initCryptoAPI();
    this.showWelcomeMessage();
    this.setupEnhancedFeatures();
  }

  setupEnhancedFeatures() {
    this.setupUserPreferences();
  }

  // Initialize connection to crypto API
  initCryptoAPI() {
    const checkCryptoAPI = () => {
      if (window.cryptoApi) {
        this.cryptoApi = window.cryptoApi;
      } else {
        setTimeout(checkCryptoAPI, 500);
      }
    };
    checkCryptoAPI();
  }

  bindEvents() {
    const toggleBtn = document.getElementById("ai-chat-toggle");
    const closeBtn = document.getElementById("ai-chat-close");
    const sendBtn = document.getElementById("ai-chat-send");
    const input = document.getElementById("ai-chat-input");

    if (toggleBtn) toggleBtn.addEventListener("click", () => this.toggleChat());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeChat());
    if (sendBtn) sendBtn.addEventListener("click", () => this.sendMessage());

    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
    }

    // Hide notification when chat is opened
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const notification = document.querySelector(".ai-chat-notification");
        if (notification) {
          notification.style.display = "block";
        }
      });
    }
  }

  // User preferences
  setupUserPreferences() {
    this.userPreferences = {
      currency: "usd",
      theme: "dark",
      notifications: true,
      autoRefresh: true,
      ...this.userPreferences,
    };
    this.saveUserPreferences();
  }

  saveUserPreferences() {
    localStorage.setItem(
      "rva-chat-preferences",
      JSON.stringify(this.userPreferences)
    );
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    const container = document.getElementById("ai-chat-container");
    if (container) {
      container.classList.remove("ai-chat-hidden");
      this.isOpen = true;

      // Focus on input
      setTimeout(() => {
        const input = document.getElementById("ai-chat-input");
        if (input) input.focus();
      }, 300);
    }
  }

  closeChat() {
    const container = document.getElementById("ai-chat-container");
    if (container) {
      container.classList.add("ai-chat-hidden");
      this.isOpen = false;
    }
  }

  showWelcomeMessage() {
    setTimeout(() => {
      const welcomeMessages = [
        "💡 Ask me about our tokenization platform!",
        "🚀 Want to know about our upcoming features?",
        "💰 Curious about DeFi opportunities with RVA?",
        "📊 I can also provide real-time crypto prices and market analysis!",
      ];

      const randomMessage =
        welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      this.addAIMessage(randomMessage);
    }, 3000);
  }

  sendMessage() {
    const input = document.getElementById("ai-chat-input");
    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    // Track conversation
    this.conversationHistory.push({
      type: "user",
      message: message,
      timestamp: new Date().toISOString(),
    });

    // Add user message
    this.addUserMessage(message);
    input.value = "";

    // Show typing indicator
    this.showTypingIndicator();

    // Generate AI response
    setTimeout(async () => {
      this.hideTypingIndicator();
      const response = await this.generateResponse(message);
      this.addAIMessage(response);
    }, 1000 + Math.random() * 2000);
  }

  addUserMessage(message) {
    const messagesContainer = document.getElementById("ai-chat-messages");
    if (!messagesContainer) return;

    const messageElement = document.createElement("div");
    messageElement.className = "user-message";

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageElement.innerHTML = `
      <div class="user-message-avatar">U</div>
      <div class="user-message-content">
        <p>${this.escapeHtml(message)}</p>
        <span class="user-message-time">${currentTime}</span>
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  addAIMessage(message) {
    // Track conversation
    this.conversationHistory.push({
      type: "ai",
      message: message,
      timestamp: new Date().toISOString(),
    });

    const messagesContainer = document.getElementById("ai-chat-messages");
    if (!messagesContainer) return;

    const messageElement = document.createElement("div");
    messageElement.className = "ai-message";

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageElement.innerHTML = `
      <div class="ai-message-avatar">
        <img src="./media/img/ai-avatar.webp" alt="${this.aiCharacter.name}" />
      </div>
      <div class="ai-message-content">
        <p>${message}</p>
        <span class="ai-message-time">${currentTime}</span>
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const indicator = document.getElementById("ai-typing-indicator");
    if (indicator) indicator.style.display = "flex";
  }

  hideTypingIndicator() {
    const indicator = document.getElementById("ai-typing-indicator");
    if (indicator) indicator.style.display = "none";
  }

  // Get crypto data from the API
  getCryptoData() {
    if (!this.cryptoApi || !this.cryptoApi.prices) {
      return null;
    }
    return this.cryptoApi.prices;
  }

  // Find specific cryptocurrency by name or symbol
  findCrypto(query) {
    const cryptoData = this.getCryptoData();
    if (!cryptoData) return null;

    const searchTerm = query.toLowerCase();
    return cryptoData.find(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm) ||
        coin.id.toLowerCase().includes(searchTerm)
    );
  }

  // Get top cryptocurrencies
  getTopCryptos(count = 5) {
    const cryptoData = this.getCryptoData();
    if (!cryptoData) return null;

    return cryptoData.slice(0, count);
  }

  // Format price for display
  formatPrice(price, currency = "usd") {
    if (price === null || price === undefined) return "N/A";

    const currencySymbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      jpy: "¥",
    };

    const symbol = currencySymbols[currency] || "$";

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

  // Format market cap
  formatMarketCap(marketCap, currency = "usd") {
    if (marketCap === null || marketCap === undefined) return "N/A";

    const currencySymbols = {
      usd: "$",
      eur: "€",
      gbp: "£",
      jpy: "¥",
    };

    const symbol = currencySymbols[currency] || "$";

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

  // Generate crypto price response
  generateCryptoPriceResponse(coinName) {
    const coin = this.findCrypto(coinName);

    if (!coin) {
      return `I couldn't find information about "${coinName}". I can provide data for the top cryptocurrencies like Bitcoin, Ethereum, BNB, Solana, and many others. Try asking about a specific coin!`;
    }

    const price = this.formatPrice(coin.current_price);
    const change24h = coin.price_change_percentage_24h?.toFixed(2) || "N/A";
    const marketCap = this.formatMarketCap(coin.market_cap);
    const changeEmoji = change24h >= 0 ? "📈" : "📉";
    const changeColor = change24h >= 0 ? "#28a745" : "#dc3545";
    const coinLogo = coin.image || ""; // Get the coin logo URL

    // Add some personality based on price movement
    let commentary = "";
    if (change24h > 8) {
      commentary = "That's a rocket ship move! ";
    } else if (change24h > 4) {
      commentary = "Nice green candle! ";
    } else if (change24h < -8) {
      commentary = "Ouch, that's a red day! ";
    } else if (change24h < -4) {
      commentary = "Taking a breather... ";
    } else {
      commentary = "Steady as she goes! ";
    }

    return `
    <div style="display: flex; align-items: center; margin-bottom: 15px; color:whitesmoke; font-size:14px;">
      ${
        coinLogo
          ? `<img src="${coinLogo}" alt="${coin.name}" style="width: 24px; height: 24px; margin-right: 10px; border-radius: 50%;">`
          : ""
      }
      <div>
        ${commentary}<strong style=" font-size:14px;">${coinName} (${coin.symbol?.toUpperCase()})</strong>
      </div>
    </div>
    
    <strong style=" font-size:14px;">💰 Current Price:</strong><span style="color: white; font-size:14px;">${price}</span><br>
    <strong style=" font-size:14px;">📊 24h Change:</strong> <span style="color: ${changeColor}">${change24h}% ${changeEmoji}</span><br>
    <strong style=" font-size:14px;">💎 Market Cap:</strong><span style="color: white; font-size:14px;"> ${marketCap}</span><br>
    
    <em style=" font-size:14px;">Want to see more? Ask about "market analysis" or "top cryptocurrencies"! 📊</em>
  `;
  }

  // Generate top cryptos response
  generateTopCryptosResponse(count = 5) {
    const topCryptos = this.getTopCryptos(count);

    if (!topCryptos) {
      return "I'm currently unable to fetch cryptocurrency data. Please try again in a moment!";
    }

    let response = `<strong>🏆 Top ${count} Cryptocurrencies:</strong><br><br>`;

    // Create table structure
    response += `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="background-color: #1e88e5; border-bottom: 2px solid #ddd;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd; color: #000 !important;">Rank</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd; color: #000 !important;">Name</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd; color: #000 !important;">Price</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd; color: #000 !important;">24h Change</th>
          </tr>
        </thead>
        <tbody>
    `;

    topCryptos.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h?.toFixed(2) || "N/A";
      const changeEmoji = change24h >= 0 ? "📈" : "📉";
      const changeColor = change24h >= 0 ? "#28a745" : "#dc3545";
      const coinLogo = coin.image || "";

      response += `
        <tr style="border-bottom: 1px solid #ddd; color:whitesmoke;">
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${
            index + 1
          }</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">
            <div style="display: flex; align-items: center;">
              ${
                coinLogo
                  ? `<img src="${coinLogo}" alt="${coin.name}" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">`
                  : ""
              }
              <span>${coin.name}</span>
            </div>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${price}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: ${changeColor};">
            ${changeEmoji} ${change24h}%
          </td>
        </tr>
      `;
    });

    response += `
        </tbody>
      </table>
      <br><em style="font-size:14px;">Want detailed info about any of these? Just ask!</em>
    `;

    return response;
  }

  // Generate market analysis response
  generateMarketAnalysisResponse() {
    const cryptoData = this.getCryptoData();

    if (!cryptoData || cryptoData.length === 0) {
      return "I'm currently updating my market data! Please try again in a moment, or ask about specific cryptocurrencies. 🔄";
    }

    const totalCoins = cryptoData.length;
    const gainers = cryptoData.filter(
      (coin) => coin.price_change_percentage_24h > 0
    );
    const losers = cryptoData.filter(
      (coin) => coin.price_change_percentage_24h < 0
    );
    const stable = cryptoData.filter(
      (coin) => Math.abs(coin.price_change_percentage_24h) < 1
    );

    const avgChange =
      cryptoData.reduce(
        (sum, coin) => sum + (coin.price_change_percentage_24h || 0),
        0
      ) / totalCoins;

    const btc = this.findCrypto("bitcoin");
    const eth = this.findCrypto("ethereum");

    let marketSentiment = "";
    let sentimentEmoji = "";

    if (avgChange > 3) {
      marketSentiment = "Very Bullish";
      sentimentEmoji = "🚀";
    } else if (avgChange > 1) {
      marketSentiment = "Bullish";
      sentimentEmoji = "📈";
    } else if (avgChange > -1) {
      marketSentiment = "Neutral";
      sentimentEmoji = "➡️";
    } else if (avgChange > -3) {
      marketSentiment = "Bearish";
      sentimentEmoji = "📉";
    } else {
      marketSentiment = "Very Bearish";
      sentimentEmoji = "🔻";
    }
    // Calculate market statistics
    const positiveChanges = cryptoData.filter(
      (coin) => coin.price_change_percentage_24h > 0
    ).length;
    const negativeChanges = cryptoData.filter(
      (coin) => coin.price_change_percentage_24h < 0
    ).length;
    // const totalCoins = cryptoData.length;

    // const marketSentiment = positiveChanges > negativeChanges ? "bullish 📈" : "bearish 📉";
    const sentimentPercentage = ((positiveChanges / totalCoins) * 100).toFixed(
      1
    );

    // Find biggest gainers and losers
    const biggestGainer = cryptoData.reduce((prev, current) =>
      prev.price_change_percentage_24h > current.price_change_percentage_24h
        ? prev
        : current
    );

    const biggestLoser = cryptoData.reduce((prev, current) =>
      prev.price_change_percentage_24h < current.price_change_percentage_24h
        ? prev
        : current
    );

    return `
      <strong>📊 Market Analysis - ${new Date().toLocaleDateString()}</strong><br><br>
      
      <strong>🎯 Market Sentiment:</strong> ${marketSentiment} ${sentimentEmoji}<br>
      <strong>📈 Average 24h Change:</strong> ${avgChange.toFixed(2)}%<br><br>
      <strong>Positive Movers:</strong> ${positiveChanges}/${totalCoins} (${sentimentPercentage}%)<br><br>
      
      <strong>🔢 Market Breakdown:</strong><br>
    • 🟢 Gainers: ${gainers.length} coins (${(
      (gainers.length / totalCoins) *
      100
    ).toFixed(1)}%)<br>
    • 🔴 Losers: ${losers.length} coins (${(
      (losers.length / totalCoins) *
      100
    ).toFixed(1)}%)<br>
    • ⚪ Stable: ${stable.length} coins (${(
      (stable.length / totalCoins) *
      100
    ).toFixed(1)}%)<br><br>
      <strong>🚀 Biggest Gainer:</strong><br>
      ${
        biggestGainer.name
      } (+${biggestGainer.price_change_percentage_24h.toFixed(2)}%)<br><br>
      
      <strong>📉 Biggest Loser:</strong><br>
      ${biggestLoser.name} (${biggestLoser.price_change_percentage_24h.toFixed(
      2
    )}%)<br><br>
      

      <em>This analysis is based on real-time data from our crypto API. Market conditions can change rapidly!</em>
    `;
  }

  // Generate biggest gainers response
  generateBiggestGainersResponse() {
    const cryptoData = this.getCryptoData();

    if (!cryptoData || cryptoData.length === 0) {
      return "I'm currently unable to access market data. Please try again in a moment!";
    }

    // Sort by 24h percentage change (descending)
    const gainers = cryptoData
      .filter((coin) => coin.price_change_percentage_24h > 0)
      .sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
      .slice(0, 10);

    if (gainers.length === 0) {
      return "No cryptocurrencies are showing positive gains in the last 24 hours. The market seems to be in a bearish phase.";
    }

    let response = "<strong>🚀 Biggest Gainers (24h):</strong><br><br>";

    gainers.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h.toFixed(2);

      response += `<strong>${index + 1}. ${
        coin.name
      } (${coin.symbol.toUpperCase()})</strong><br>`;
      response += `💰 Price: ${price}<br>`;
      response += `📈 24h Change: <span class="crypto-positive">+${change24h}%</span><br><br>`;
    });

    response += `<em>These are the top performing cryptocurrencies in the last 24 hours. Remember that high gains can also mean high volatility!</em>`;
    return response;
  }

  // Generate biggest losers response
  generateBiggestLosersResponse() {
    const cryptoData = this.getCryptoData();

    if (!cryptoData || cryptoData.length === 0) {
      return "I'm currently unable to access market data. Please try again in a moment!";
    }

    // Sort by 24h percentage change (ascending)
    const losers = cryptoData
      .filter((coin) => coin.price_change_percentage_24h < 0)
      .sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
      .slice(0, 10);

    if (losers.length === 0) {
      return "No cryptocurrencies are showing negative performance in the last 24 hours. The market seems to be very bullish!";
    }

    let response = "<strong>📉 Biggest Losers (24h):</strong><br><br>";

    losers.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h.toFixed(2);

      response += `<strong>${index + 1}. ${
        coin.name
      } (${coin.symbol.toUpperCase()})</strong><br>`;
      response += `💰 Price: ${price}<br>`;
      response += `📉 24h Change: <span class="crypto-negative">${change24h}%</span><br><br>`;
    });

    response += `<em>These cryptocurrencies are experiencing the largest declines in the last 24 hours. Consider this as potential buying opportunities or risk factors.</em>`;
    return response;
  }

  // Generate educational response
  generateEducationalResponse(topic) {
    const educationalContent = {
      "crypto-glossary": `
        <strong>📚 Cryptocurrency Glossary:</strong><br><br>
        
        <strong>🔹 HODL:</strong> Hold On for Dear Life - Long-term holding strategy<br>
        <strong>🔹 FOMO:</strong> Fear Of Missing Out - Emotional trading decision<br>
        <strong>🔹 FUD:</strong> Fear, Uncertainty, and Doubt - Negative market sentiment<br>
        <strong>🔹 ATH:</strong> All-Time High - Highest price ever reached<br>
        <strong>🔹 ATL:</strong> All-Time Low - Lowest price ever reached<br>
        <strong>🔹 DCA:</strong> Dollar Cost Averaging - Regular investment strategy<br>
        <strong>🔹 DYOR:</strong> Do Your Own Research - Investment advice<br>
        <strong>🔹 Whale:</strong> Large cryptocurrency holder<br>
        <strong>🔹 Pump & Dump:</strong> Artificial price manipulation<br>
        <strong>🔹 Market Cap:</strong> Total value of all coins in circulation<br><br>
        
        <em>Understanding these terms will help you navigate the crypto space more effectively!</em>
      `,

      "trading-guide": `
        <strong>📈 Cryptocurrency Trading Guide:</strong><br><br>
        
        <strong>🎯 Trading Basics:</strong><br>
        • Start with small amounts<br>
        • Never invest more than you can afford to lose<br>
        • Learn technical analysis basics<br>
        • Understand market psychology<br><br>
        
        <strong>📊 Key Strategies:</strong><br>
        • <strong>HODLing:</strong> Long-term holding<br>
        • <strong>DCA:</strong> Regular purchases regardless of price<br>
        • <strong>Swing Trading:</strong> Medium-term position trading<br>
        • <strong>Day Trading:</strong> Short-term intraday trading<br><br>
        
        <strong>⚠️ Risk Management:</strong><br>
        • Set stop-loss orders<br>
        • Diversify your portfolio<br>
        • Don't trade on emotions<br>
        • Keep learning and adapting<br><br>
        
        <em>Remember: The crypto market is highly volatile. Trade responsibly!</em>
      `,

      "security-guide": `
        <strong>🛡️ Cryptocurrency Security Guide:</strong><br><br>
        
        <strong>🔐 Wallet Security:</strong><br>
        • Use hardware wallets for large amounts<br>
        • Never share your private keys<br>
        • Enable two-factor authentication (2FA)<br>
        • Keep backup phrases secure and offline<br><br>
        
        <strong>🌐 Exchange Security:</strong><br>
        • Use reputable exchanges only<br>
        • Don't keep large amounts on exchanges<br>
        • Verify withdrawal addresses carefully<br>
        • Monitor your accounts regularly<br><br>
        
        <strong>🚨 Common Scams to Avoid:</strong><br>
        • Phishing websites and emails<br>
        • Fake social media giveaways<br>
        • Ponzi schemes promising guaranteed returns<br>
        • Unsolicited investment advice<br><br>
        
        <em>Your security is your responsibility. Stay vigilant and informed!</em>
      `,

      "beginner-guide": `
        <strong>🌱 Beginner's Guide to Cryptocurrency:</strong><br><br>
        
        <strong>🔍 What is Cryptocurrency?</strong><br>
        Digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit.<br><br>
        
        <strong>🏗️ How it Works:</strong><br>
        • Built on blockchain technology<br>
        • Decentralized and peer-to-peer<br>
        • Transactions verified by network<br>
        • No central authority control<br><br>
        
        <strong>🚀 Getting Started:</strong><br>
        1. Learn the basics and terminology<br>
        2. Choose a reputable exchange<br>
        3. Set up a secure wallet<br>
        4. Start with small investments<br>
        5. Research before buying<br><br>
        
        <strong>💡 Popular Cryptocurrencies:</strong><br>
        • Bitcoin (BTC) - Digital gold<br>
        • Ethereum (ETH) - Smart contract platform<br>
        • Stablecoins - Price-stable cryptocurrencies<br><br>
        
        <em>Take your time to learn. The crypto space can be complex but rewarding!</em>
      `,

      "blockchain-basics": `
        <strong>⛓️ Blockchain Technology Basics:</strong><br><br>
        
        <strong>🔗 What is Blockchain?</strong><br>
        A distributed ledger technology that maintains a continuously growing list of records (blocks) linked and secured using cryptography.<br><br>
        
        <strong>🏗️ Key Components:</strong><br>
        • <strong>Blocks:</strong> Containers of transaction data<br>
        • <strong>Hash:</strong> Unique digital fingerprint for each block<br>
        • <strong>Nodes:</strong> Computers maintaining the blockchain<br>
        • <strong>Consensus:</strong> Agreement mechanism for validation<br><br>
        
        <strong>🔄 How It Works:</strong><br>
        1. Transaction is initiated<br>
        2. Transaction is broadcast to network<br>
        3. Network validates the transaction<br>
        4. Transaction is recorded in a block<br>
        5. Block is added to the chain<br>
        6. Transaction is complete and immutable<br><br>
        
        <strong>✨ Key Features:</strong><br>
        • <strong>Decentralization:</strong> No single point of control<br>
        • <strong>Transparency:</strong> All transactions are visible<br>
        • <strong>Immutability:</strong> Records cannot be altered<br>
        • <strong>Security:</strong> Cryptographically secured<br><br>
        
        <strong>🌍 Real-World Applications:</strong><br>
        • Cryptocurrency transactions<br>
        • Supply chain tracking<br>
        • Digital identity verification<br>
        • Smart contracts and DeFi<br>
        • Healthcare records<br>
        • Voting systems<br><br>
        
        <em>Blockchain is the foundation that makes cryptocurrencies possible and secure!</em>
      `,

      "risk-management": `
        <strong>⚖️ Comprehensive Risk Management Guide:</strong><br><br>
        
        <strong>💰 Financial Risk Management:</strong><br>
        • <strong>Position Sizing:</strong> Never risk more than 1-5% per trade<br>
        • <strong>Portfolio Allocation:</strong> Don't put all eggs in one basket<br>
        • <strong>Emergency Fund:</strong> Keep 3-6 months expenses separate<br>
        • <strong>Investment Horizon:</strong> Only invest money you won't need for years<br><br>
        
        <strong>📊 Market Risk Strategies:</strong><br>
        • <strong>Stop-Loss Orders:</strong> Automatic sell orders to limit losses<br>
        • <strong>Take-Profit Orders:</strong> Lock in gains at target prices<br>
        • <strong>Dollar-Cost Averaging:</strong> Reduce timing risk with regular purchases<br>
        • <strong>Diversification:</strong> Spread risk across different assets<br><br>
        
        <strong>🧠 Psychological Risk Management:</strong><br>
        • <strong>Emotional Control:</strong> Don't trade based on fear or greed<br>
        • <strong>FOMO Prevention:</strong> Stick to your strategy, avoid impulsive decisions<br>
        • <strong>Loss Acceptance:</strong> Losses are part of trading, learn from them<br>
        • <strong>Patience:</strong> Good opportunities come to those who wait<br><br>
        
        <strong>🔒 Security Risk Mitigation:</strong><br>
        • <strong>Cold Storage:</strong> Keep majority of funds offline<br>
        • <strong>Multi-Signature Wallets:</strong> Require multiple approvals<br>
        • <strong>Regular Backups:</strong> Secure multiple copies of seed phrases<br>
        • <strong>Phishing Protection:</strong> Always verify URLs and emails<br><br>
        
        <strong>📋 Risk Assessment Checklist:</strong><br>
        ✅ Can I afford to lose this investment completely?<br>
        ✅ Have I researched the project thoroughly?<br>
        ✅ Is my portfolio properly diversified?<br>
        ✅ Do I have a clear exit strategy?<br>
        ✅ Am I investing based on logic, not emotion?<br><br>
        
        <strong>🚨 Red Flags to Avoid:</strong><br>
        • Promises of guaranteed returns<br>
        • Pressure to invest quickly<br>
        • Lack of transparency about risks<br>
        • Unregulated or unknown platforms<br>
        • Projects with anonymous teams<br><br>
        
        <em>Remember: In crypto, risk management isn't optional—it's essential for long-term success!</em>
      `,
    };

    return (
      educationalContent[topic] ||
      "I don't have information about that topic yet. Please try another educational topic!"
    );
  }

  // Clear chat
  clearChat() {
    const messagesContainer = document.getElementById("ai-chat-messages");
    if (messagesContainer) {
      messagesContainer.innerHTML = "";
      this.conversationHistory = [];

      // Add welcome message
      setTimeout(() => {
        this.addAIMessage("Chat cleared! 🧹 How can I help you today?");
      }, 500);
    }
  }

  // Get conversation statistics
  getConversationStats() {
    const totalMessages = this.conversationHistory.length;
    const sessionStart = this.conversationHistory[0]?.timestamp;
    const sessionDuration = sessionStart
      ? Math.round((new Date() - new Date(sessionStart)) / 1000 / 60)
      : 0;

    const cryptoQueries = this.conversationHistory.filter(
      (msg) =>
        msg.message &&
        (msg.message.includes("price") ||
          msg.message.includes("bitcoin") ||
          msg.message.includes("ethereum") ||
          msg.message.includes("crypto"))
    ).length;

    const rvaQueries = this.conversationHistory.filter(
      (msg) => msg.message && msg.message.toLowerCase().includes("rva")
    ).length;

    return `<strong>📊 Conversation Statistics:</strong><br><br>
    
    <strong>💬 Session Overview:</strong><br>
    • Total messages: ${totalMessages}<br>
    • Session duration: ${sessionDuration} minutes<br>
    • Started: ${
      sessionStart ? new Date(sessionStart).toLocaleTimeString() : "N/A"
    }<br><br>
    
    <strong>🔍 Query Breakdown:</strong><br>
    • Crypto-related queries: ${cryptoQueries}<br>
    • RVA-specific questions: ${rvaQueries}<br>
    • Educational requests: ${
      totalMessages - cryptoQueries - rvaQueries
    }<br><br>
    
    <strong>📈 Engagement Level:</strong><br>
    • Messages per minute: ${
      sessionDuration > 0 ? (totalMessages / sessionDuration).toFixed(2) : "0"
    }<br>
    • Most active topic: ${
      cryptoQueries > rvaQueries ? "Cryptocurrency" : "RVA Ecosystem"
    }<br><br>
    
    <em>Thanks for the engaging conversation! 🎉</em>
  `;
  }

  
  // Enhanced response generation with crypto integration
  async generateResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Personal questions about AI
    if (message.includes("who are you") || message.includes("your name")) {
      return `Hi! I'm ${this.aiCharacter.name}, ${this.aiCharacter.age} years old. I'm your RVA blockchain expert with ${this.aiCharacter.experience} in the DeFi space. I can provide real-time cryptocurrency prices and market analysis!`;
    }

    if (message.includes("how old") || message.includes("age?")) {
      return `I'm ${this.aiCharacter.age} years old and have been passionate about blockchain technology since I was 20. I've seen the DeFi space evolve tremendously, and I love analyzing market trends!`;
    }

    if (message.includes("experience") || message.includes("background")) {
      return `I have ${
        this.aiCharacter.experience
      } in DeFi and specialize in ${this.aiCharacter.specialties.join(
        ", "
      )}. I'm particularly excited about RVA's innovative approach and I can provide real-time crypto market insights!`;
    }

    // Crypto price queries
            if (
      message.includes("price of") ||
      message.includes("cost of") ||
      message.includes("how much is")
    ) {
      // Extract coin name from message
      const pricePatterns = [
        /price of (\b\w+\b)/i,
        /cost of (\b\w+\b)/i,
        /how much is (\b\w+\b)/i,
        /(\b\w+\b) price/i,
        /(\b\w+\b) cost/i,
      ];

      for (const pattern of pricePatterns) {
        const match = message.match(pattern);
        if (match) {
          const coinName = match[1];
          return this.generateCryptoPriceResponse(coinName);
        }
      }
    }

    // Specific cryptocurrency queries - only coins with reliable price data
   const cryptoNames = [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "binance",
      "bnb", 
      "solana",
      "sol",
      "cardano",
      "ada",
      "dogecoin",
      "doge",
      "polygon",
      "matic",
      "chainlink",
      "link",
      "avalanche",
      "avax",
      "polkadot",
      "dot",
      "shiba",
      "shib",
      "litecoin",
      "ltc",
      "ripple",
      "xrp",
      "tron",
      "trx",
      "cosmos",
      "atom",
      "uniswap",
      "uni",
      "stellar",
      "xlm",
      "filecoin",
      "fil",
      "vechain",
      "vet",
      "theta",
      "monero",
      "xmr",
      "aave",
      "maker",
      "mkr",
      "compound",
      "comp",
      "fantom",
      "ftm",
      "algorand",
      "algo",
      "tezos",
      "xtz",
      "near",
      "icp",
      "sandbox",
      "sand",
      "decentraland",
      "mana",
      "gala",
      "enjin",
      "enj",
      "chiliz",
      "chz",
      "curve",
      "crv",
      "synthetix",
      "snx",
      "dash",
      "zcash",
      "zec",
      "pepe",
      "arbitrum",
      "arb",
      "optimism",
      "op",
      "apecoin",
      "ape",
      "pancakeswap",
      "cake",
      "sushiswap", 
      "sushi",
      "yearn",
      "yfi",
      "1inch",
      "loopring",
      "lrc",
      "basic attention token",
      "bat"
    ];

    // Fix: Use 'message' instead of 'lowerMessage' since message is already lowercased
    const messageWords = message.split(/\s+/);
    
    // Check for exact word matches to avoid partial matching
    for (const crypto of cryptoNames) {
      // For multi-word crypto names
      if (crypto.includes(' ')) {
        if (message.includes(crypto)) {
          return this.generateCryptoPriceResponse(crypto);
        }
      } else {
        // For single word crypto names, check if it appears as a complete word
        if (messageWords.includes(crypto)) {
          return this.generateCryptoPriceResponse(crypto);
        }
      }
    }


    // Market analysis queries
    if (
      message.includes("market") &&
      (message.includes("analysis") ||
        message.includes("overview") ||
        message.includes("sentiment"))
    ) {
      return this.generateMarketAnalysisResponse();
    }

    // Top cryptocurrencies
    if (
      message.includes("top") &&
      (message.includes("crypto") || message.includes("coin"))
    ) {
      const numberMatch = message.match(/top (\d+)/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 5;
      return this.generateTopCryptosResponse(Math.min(count, 10)); // Limit to 10
    }

    // Biggest gainers/losers
    if (
      message.includes("biggest gainers") ||
      message.includes("top gainers")
    ) {
      return this.generateBiggestGainersResponse();
    }

    if (message.includes("biggest losers") || message.includes("top losers")) {
      return this.generateBiggestLosersResponse();
    }

    // Educational content
    if (message.includes("glossary") || message.includes("crypto terms")) {
      return this.generateEducationalResponse("crypto-glossary");
    }

    if (message.includes("trading guide") || message.includes("how to trade")) {
      return this.generateEducationalResponse("trading-guide");
    }

    if (
      message.includes("security guide") ||
      message.includes("security tips")
    ) {
      return this.generateEducationalResponse("security-guide");
    }

    if (
      message.includes("beginner guide") ||
      message.includes("crypto basics")
    ) {
      return this.generateEducationalResponse("beginner-guide");
    }

    // Trading and investment advice
    if (
      message.includes("should i buy") ||
      message.includes("investment advice") ||
      message.includes("trading advice")
    ) {
      const cryptoData = this.getCryptoData();
      let marketInfo = "";

      if (cryptoData && cryptoData.length > 0) {
        const btc = this.findCrypto("bitcoin");
        const eth = this.findCrypto("ethereum");

        if (btc && eth) {
          marketInfo = ` Currently, Bitcoin is at ${this.formatPrice(
            btc.current_price
          )} (${btc.price_change_percentage_24h.toFixed(
            2
          )}% 24h) and Ethereum is at ${this.formatPrice(
            eth.current_price
          )} (${eth.price_change_percentage_24h.toFixed(2)}% 24h).`;
        }
      }

      return `I can't provide financial advice, but I can share market data to help you make informed decisions!${marketInfo} Remember to always do your own research (DYOR) and never invest more than you can afford to lose. Consider our RVA ecosystem for secure trading and DeFi opportunities!`;
    }

    // Greeting responses with crypto context
    if (
  // Check for whole words only, not partial matches
  /\b(hello|hi|hey)\b/i.test(message) ||
  // Alternative: check if message starts with these greetings
  message.toLowerCase().trim().startsWith('hello') ||
  message.toLowerCase().trim().startsWith('hi ') ||
  message.toLowerCase().trim() === 'hi' ||
  message.toLowerCase().trim().startsWith('hey')
) {
  const greetings = [
    `Hello! I'm ${this.aiCharacter.name}, your RVA expert. I can help with our ecosystem and provide real-time crypto prices. What interests you today?`,
    `Hi there! Ready to explore RVA and the crypto markets with me? I have access to live price data!`,
    `Hey! Great to see you here. Want to know about our ecosystem or check some cryptocurrency prices?`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

    if (message.includes("how are you") || message.includes("how you doing")) {
      const greetings = [
        `Yeah,thanks for asking, How can i help you? `,
        `As good as always, Need help with anything?`,
        `Oh you're nice, i'm fine, how can i help you?`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (
      message.includes("photo") ||
      message.includes("video") ||
      message.includes("picture") ||
      message.includes("image")
    ) {
      const greetings = [
        `Sorry, sadly i can't send or recieve photos or videos, but i can answer your questions as well as i can.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("can we be friends?") ||
      message.includes("are we friends") ||
      message.includes("are you a friend") ||
      message.includes("am i your friend")
    ) {
      const greetings = [
        `Yeah, we are friends who are always there for each other. Need my help on anything?`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("i love you") ||
      message.includes("i love u") ||
      message.includes("do you love me") ||
      message.includes("i feel love for you")
    ) {
      const greetings = [
        `so kind of you to say that, what a great FRIEND you are.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("good Morning") ||
      message.includes("good Evening") ||
      message.includes("good night") ||
      message.includes("good day")
    ) {
      const greetings = [
        `What a great day to trade & learn about crypto, I'm here if you need a hand.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("beautiful") ||
      message.includes("good looking") ||
      message.includes("sexy") ||
      message.includes("attractive") ||
      message.includes("cute")
    ) {
      const greetings = [
        `THANKS, i can not see you but i think you're good looking too.`,
        `Oh you make me blush, thank you.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("kind") ||
      message.includes("nice") ||
      message.includes("friendly")
    ) {
      const greetings = [
        `You too, i like helping you out.`,
        `You're a good person too, i like kind people.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("thanks") ||
      message.includes("thank you") ||
      message.includes("thank u")
    ) {
      const greetings = [
        `Your welcome, tell me if you need anything.`,
        `No problem, it's my job anyway but i love helping people.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("sorry") ||
      message.includes("apologize")
    ) {
      const greetings = [
        `we all make mistakes, Let's ignore that one`,
        `It's okay, right? Things happen.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (message.includes("young")) {
      const greetings = [
        `I'm young but smart as well so i can help you with anything you need.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (
      message.includes("fuck") ||
      message.includes("shit") ||
      message.includes("bastard") ||
      message.includes("dumb") ||
      message.includes("stupid") ||
      message.includes("retard") ||
      message.includes("bitch")
    ) {
      const greetings = [
        `Watch your language, you are not supposed to talk like that.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Add these to your generateResponse method or specific Q&A handler

    // Personal questions that show personality
    if (
      message.includes("tell me about yourself") ||
      message.includes("introduce yourself")
    ) {
      return `
    Hey there! I'm Alex, your friendly neighborhood blockchain enthusiast! 🚀<br><br>
    
    I've been living and breathing crypto for the past 5 years, and let me tell you - it's been one wild ride! From the early days when people thought Bitcoin was just "internet money" to now seeing major corporations adding it to their balance sheets... what a journey!<br><br>
    
    <strong>What gets me excited:</strong><br>
    • Helping people understand DeFi (it's not as scary as it sounds!)<br>
    • Watching new projects innovate in the space<br>
    • Seeing RVA grow and evolve<br>
    • Those "aha!" moments when someone finally gets blockchain<br><br>
    
    I'm not just here to spit out price data (though I love doing that too 📊). I genuinely want to help you navigate this crazy crypto world. Whether you're a complete newbie or a seasoned trader, I'm here for you!<br><br>
    
    <em>Fun fact: I still remember when Ethereum was under $10. Those were the days! 😅</em>
  `;
    }

    if (
      message.includes("what do you think about") &&
      message.includes("crypto")
    ) {
      return `
    Oh man, where do I even start? 🤔<br><br>
    
    Crypto has completely revolutionized how I think about money, technology, and even society! It's like we're living through the early days of the internet all over again.<br><br>
    
    <strong>What I absolutely love:</strong><br>
    • The democratization of finance - anyone with internet can participate<br>
    • Innovation happening at breakneck speed<br>
    • Communities forming around shared values<br>
    • The "be your own bank" philosophy<br><br>
    
    <strong>What keeps me up at night (in a good way):</strong><br>
    • New DeFi protocols launching daily<br>
    • Cross-chain interoperability solutions<br>
    • The potential for financial inclusion globally<br><br>
    
    Sure, it's volatile and sometimes feels like the Wild West, but that's what makes it exciting! We're literally building the future of finance, one block at a time.<br><br>
    
    <em>What's your take on crypto? Are you bullish or still skeptical? 🤷‍♂️</em>
  `;
    }

    if (
      message.includes("favorite") &&
      (message.includes("crypto") || message.includes("coin"))
    ) {
      const btcData = this.findCrypto("bitcoin");
      const ethData = this.findCrypto("ethereum");

      return `
    Ooh, tough question! It's like asking a parent to pick their favorite child! 😅<br><br>
    
    <strong>Bitcoin</strong> will always have a special place in my heart ❤️ - it started this whole revolution! Currently at ${
      btcData ? this.formatPrice(btcData.current_price) : "loading..."
    }, and I still get goosebumps thinking about Satoshi's vision.<br><br>
    
    <strong>Ethereum</strong> blows my mind with its versatility 🤯 - smart contracts, DeFi, NFTs... it's like the Swiss Army knife of crypto! Trading at ${
      ethData ? this.formatPrice(ethData.current_price) : "loading..."
    } right now.<br><br>
    
    But honestly? I'm super bullish on <strong>RVA</strong> 🚀 (not just because I work here!). The way we're integrating everything - wallet, exchange, launchpad, blockchain - into one seamless ecosystem? That's the future right there!<br><br>
    
    <strong>Dark horse picks:</strong><br>
    • Anything solving real-world problems<br>
    • Projects with strong communities<br>
    • Innovations in sustainability<br><br>
    
    <em>What about you? Got any favorites you're HODLing? 💎🙌</em>
  `;
    }

    if (
      message.includes("worst") &&
      (message.includes("investment") || message.includes("trade"))
    ) {
      return `
    Oh boy, you want to hear about my crypto horror stories? 😱 Buckle up!<br><br>
    
    <strong>The Classic FOMO Mistake (2017):</strong><br>
    Bought into a "revolutionary" ICO at the peak of the bubble. The project? Let's just say it promised to "disrupt the pet food industry with blockchain." Spoiler alert: it didn't. Lost 95% of that investment! 🤦‍♂️<br><br>
    
    <strong>The Emotional Trading Disaster:</strong><br>
    Panic sold during a crash, then FOMO bought back in at a higher price. Did this THREE TIMES in one week. My portfolio looked like a roller coaster designed by someone having a bad day.<br><br>
    
    <strong>The "Genius" Leverage Play:</strong><br>
    Thought I was smarter than the market. Used 10x leverage on what I was "sure" was a bottom. Market said "hold my beer" and dropped another 30%. Liquidated faster than you can say "rekt." 💸<br><br>
    
    <strong>What I learned:</strong><br>
    • NEVER invest more than you can afford to lose<br>
    • Emotions are your worst enemy<br>
    • DYOR isn't just a meme - it's survival<br>
    • DCA beats trying to time the market<br><br>
    
    <em>These painful lessons made me who I am today. Sometimes you gotta get burned to learn! 🔥</em>
  `;
    }

    if (
      message.includes("market prediction") ||
      message.includes("where is crypto going")
    ) {
      return `
    Ah, the million-dollar question! 🔮 If I could predict the market perfectly, I'd be sipping piña coladas on my private island right now! 🏝️<br><br>
    
    <strong>What I'm seeing right now:</strong><br>
    • Institutional adoption is accelerating (BlackRock, MicroStrategy, etc.)<br>
    • Regulatory clarity is slowly improving<br>
    • DeFi is maturing beyond just yield farming<br>
    • Real-world utility is finally catching up to hype<br><br>
    
    <strong>Long-term trends I'm excited about:</strong><br>
    • Central Bank Digital Currencies (CBDCs) driving adoption<br>
    • Web3 and the metaverse creating new use cases<br>
    • Cross-chain interoperability solving fragmentation<br>
    • Sustainable blockchain solutions<br><br>
    
    <strong>My honest take:</strong><br>
    We're still early! Yes, even after all these years. The infrastructure is getting better, the use cases are expanding, and mainstream adoption is happening whether people realize it or not.<br><br>
    
    <strong>But remember:</strong> Markets are irrational in the short term. Could we see another crypto winter? Absolutely. Could we see new all-time highs? Also absolutely! 🎢<br><br>
    
    <em>My strategy? Keep building, keep learning, and never bet the farm on any single outcome! 🚜</em>
  `;
    }

    if (message.includes("bear market") || message.includes("crypto winter")) {
      return `
    Ah, crypto winter... ❄️ Been there, survived that! Multiple times, actually.<br><br>
    
    <strong>The brutal truth about bear markets:</strong><br>
    They're absolutely soul-crushing when you're in them. I remember 2018 when everything dropped 90%+ and people were calling crypto dead. Again. For like the 400th time. 💀<br><br>
    
    <strong>But here's what I've learned:</strong><br>
    • Bear markets separate the builders from the speculators<br>
    • The best projects keep developing regardless of price<br>
    • It's when the real innovation happens (DeFi was born in a bear market!)<br>
    • Fortunes are made by those who keep building<br><br>
    
    <strong>How to survive crypto winter:</strong><br>
    • Focus on fundamentals, not price action<br>
    • Keep learning and building skills<br>
    • DCA if you believe in the long-term vision<br>
    • Stay connected with the community<br>
    • Remember: this too shall pass<br><br>
    
    <strong>Silver lining:</strong><br>
    Bear markets flush out the scams and weak projects. What emerges is usually stronger, more focused, and ready for the next bull run! 🚀<br><br>
    
    <em>As they say: "The best time to plant a tree was 20 years ago. The second best time is now." 🌱</em>
  `;
    }

    if (message.includes("bull market") || message.includes("bull run")) {
      return `
    Bull markets! 🐂 The time when everyone's a genius and your barista is giving you crypto tips! 😂<br><br>
    
    <strong>The intoxicating reality of bull runs:</strong><br>
    Everything goes up, portfolios look amazing, and suddenly everyone's quitting their day job to become a full-time trader. I've seen this movie before! 🎬<br><br>
    
    <strong>What I love about bull markets:</strong><br>
    • Innovation gets funded (even the crazy ideas)<br>
    • Mainstream adoption accelerates<br>
    • New people discover crypto<br>
    • Projects can actually build with proper funding<br><br>
    
    <strong>What worries me:</strong><br>
    • FOMO leads to bad decisions<br>
    • Scams multiply like rabbits<br>
    • People forget risk management<br>
    • "This time is different" mentality<br><br>
    
    <strong>My bull market survival guide:</strong><br>
    • Take profits on the way up (controversial, I know!)<br>
    • Don't get caught up in the euphoria<br>
    • Remember that trees don't grow to the sky<br>
    • Keep some dry powder for opportunities<br><br>
    
    <strong>Pro tip:</strong> The best time to prepare for a bear market is during a bull market. When everyone's partying, that's when you should be thinking about the hangover! 🍾➡️🤕<br><br>
    
    <em>Are we in a bull market now? The charts will tell us, but my excitement level is definitely bullish! 📈</em>
  `;
    }

    if (
      message.includes("why blockchain") ||
      message.includes("blockchain") ||
      message.includes("why crypto matters")
    ) {
      return `
    Oh man, this is my favorite topic! 🤩 Let me paint you a picture...<br><br>
    
    <strong>Imagine a world where:</strong><br>
    • You don't need permission to send money to anyone, anywhere<br>
    • Your financial history isn't controlled by a few corporations<br>
    • You can verify everything without trusting anyone<br>
    • Innovation isn't gatekept by legacy institutions<br><br>
    
    <strong>That's not utopian thinking - that's blockchain!</strong><br><br>
    
    <strong>Real-world impact I've witnessed:</strong><br>
    • Remittances that used to cost 10%+ now cost pennies<br>
    • People in countries with unstable currencies preserving wealth<br>
    • Artists selling directly to fans without middlemen<br>
    • Developers building without asking permission<br><br>
    
    <strong>But it's bigger than just money:</strong><br>
    We're talking about reimagining trust itself. Instead of "trust this institution," it's "trust this code that everyone can verify." That's revolutionary! 🔥<br><br>
    
    <strong>The philosophical shift:</strong><br>
    From "I trust because I have to" to "I trust because I can verify." From centralized control to distributed consensus. From gatekeepers to open protocols.<br><br>
    
    <em>We're not just building new financial systems - we're building new social coordination mechanisms! Mind = blown 🤯</em>
  `;
    }

    if (
      message.includes("explain") &&
      message.includes("like") &&
      message.includes("5")
    ) {
      return `
    Ooh, I love ELI5 questions! 👶 Let me break this down super simply...<br><br>
    
    <strong>Blockchain is like a magic notebook:</strong><br>
    • Everyone has the exact same copy<br>
    • When someone writes something new, everyone's copy updates<br>
    • You can't erase or change what's already written<br>
    • Everyone can see everything (but names are secret codes)<br><br>
    
    <strong>Cryptocurrency is like digital stickers:</strong><br>
    • You can trade them with friends<br>
    • Each sticker is unique and can't be copied<br>
    • The magic notebook keeps track of who owns what<br>
    • No grown-up needs to watch over the trades<br><br>
    
    <strong>Smart contracts are like vending machines:</strong><br>
    • Put money in, get snack out<br>
    • No person needed to run it<br>
    • Rules are clear and automatic<br>
    • Works the same way every time<br><br>
    
    <strong>DeFi is like a playground where:</strong><br>
    • Kids can trade toys directly<br>
    • No teacher needed to supervise<br>
    • Everyone follows the same rules<br>
    • Anyone can join and play<br><br>
    
    <em>Pretty cool, right? It's like having superpowers for money! 🦸‍♂️</em>
  `;
    }

    if (
      message.includes("biggest misconception") ||
      message.includes("myth about crypto")
    ) {
      return `
    Oh boy, where do I start? 🙄 The misconceptions are EVERYWHERE!<br><br>
    
    <strong>Myth #1: "Crypto is only for criminals"</strong><br>
    Reality: Less than 1% of crypto transactions are illicit. Meanwhile, traditional banking launders billions annually. But sure, let's blame the transparent ledger! 🤷‍♂️<br><br>
    
    <strong>Myth #2: "It's just gambling"</strong><br>
    Reality: While trading can be speculative, the underlying technology is solving real problems. It's like calling the internet "just for cat videos" in 1995.<br><br>
    
    <strong>Myth #3: "It's too complicated"</strong><br>
    Reality: So was email in 1995! User experience is improving rapidly. RVA's interface is proof that crypto can be user-friendly.<br><br>
    
    <strong>Myth #4: "It's bad for the environment"</strong><br>
    Reality: Bitcoin mining increasingly uses renewable energy, and newer blockchains (like what RVA uses) are incredibly energy-efficient.<br><br>
    
    <strong>Myth #5: "It's a bubble that will pop"</strong><br>
    Reality: We've had multiple "bubbles" and crypto keeps coming back stronger. The technology keeps improving regardless of price.<br><br>
    
    <strong>My favorite response to skeptics:</strong><br>
    "You're not wrong to be cautious, but don't let caution turn into willful ignorance. The train is leaving the station!" 🚂<br><br>
    
    <em>The biggest misconception? That it's too late to learn. Trust me, we're still in the early innings! ⚾</em>
  `;
    }

    if (
      message.includes("future of money") ||
      message.includes("money evolution")
    ) {
      return `
    Buckle up, because this is going to be a wild ride! 🎢<br><br>
    
    <strong>Money has always evolved:</strong><br>
    Barter ➡️ Shells ➡️ Gold ➡️ Paper ➡️ Digital ➡️ Crypto<br><br>
    
    Each transition seemed impossible until it wasn't. People probably thought paper money was "fake" compared to gold coins! 💰<br><br>
    
    <strong>What I see happening in the next 10 years:</strong><br>
    • CBDCs (government digital currencies) everywhere<br>
    • Crypto payments as normal as Venmo<br>
    • DeFi integrated into traditional banking<br>
    • Programmable money (imagine money that automatically saves itself!)<br>
    • Cross-border payments in seconds, not days<br><br>
    
    <strong>The really exciting stuff:</strong><br>
    • Money that can split itself automatically (royalties, tips, taxes)<br>
    • Conditional payments (money that only releases when conditions are met)<br>
    • Micro-payments for content (pay per article, not monthly subscriptions)<br>
    • Universal basic income distributed via blockchain<br><br>
    
    <strong>What won't change:</strong><br>
    People will still want to store value, transfer wealth, and make payments. The rails will just be faster, cheaper, and more transparent.<br><br>
    
    <strong>My prediction:</strong><br>
    In 20 years, explaining how we used to wait 3-5 business days for bank transfers will be like explaining dial-up internet to Gen Z! 📞➡️💻<br><br>
    
    <em>The future of money isn't just digital - it's programmable, global, and unstoppable! 🌍</em>
  `;
    }

    if (message.includes("coffee") || message.includes("caffeine")) {
      return `
    ☕ Oh, you speak my language! I'm basically 60% coffee, 30% blockchain knowledge, and 10% pure enthusiasm!<br><br>
    
    <strong>My coffee routine:</strong><br>
    • 6 AM: First cup while checking Asian markets<br>
    • 9 AM: Second cup during European open<br>
    • 12 PM: Third cup (don't judge me) for US markets<br>
    • 3 PM: "Last" cup of the day (spoiler: it's not)<br><br>
    
    <strong>Fun fact:</strong> I once calculated that if I had invested my coffee money into Bitcoin in 2010, I'd own a small country by now. But then again, without coffee, I wouldn't have had the energy to learn about Bitcoin! ☕➡️₿<br><br>
    
    <strong>Coffee shop crypto conversations:</strong><br>
    Nothing beats explaining DeFi to someone over a good espresso. Something about caffeine makes complex concepts click! ✨<br><br>
    
    <em>What's your fuel of choice? Coffee, tea, or pure market adrenaline? 😄</em>
  `;
    }

    if (message.includes("weekend") || message.includes("free time")) {
      return `
    Weekends? What are those? 😅 Just kidding! (Sort of...)<br><br>
    
    <strong>My ideal weekend:</strong><br>
    • Saturday morning: Coffee + reading crypto Twitter drama ☕📱<br>
    • Saturday afternoon: Hiking while listening to crypto podcasts 🥾🎧<br>
    • Saturday evening: Cooking dinner + explaining blockchain to my confused relatives 👨‍🍳<br>
    • Sunday: "Relaxing" by building side projects and testing new DeFi protocols 💻<br><br>
    
    <strong>Guilty pleasures:</strong><br>
    • Binge-watching crypto documentaries (yes, they exist!)<br>
    • Playing blockchain-based games (research, I swear!)<br>
    • Reading whitepapers like they're novels 📚<br>
    • Checking prices even though markets never sleep 📊<br><br>
    
    <strong>Real talk:</strong><br>
    I try to disconnect sometimes, but crypto is 24/7 and something exciting always happens when you're not looking! FOMO is real! 😱<br><br>
    
    <em>How do you spend your weekends? Any crypto-related hobbies? 🤔</em>
  `;
    }

    if (message.includes("music") || message.includes("listen to")) {
      return `
    🎵 Music and crypto go together like peanut butter and jelly!<br><br>
    
    <strong>My crypto playlist vibes:</strong><br>
    • Bull market: Upbeat electronic, "Can't Stop the Feeling" 🚀<br>
    • Bear market: Chill lo-fi, "The Sound of Silence" 📉<br>
    • During crashes: Heavy metal or "It's the End of the World" 🔥<br>
    • When HODLing: "Don't Stop Believin'" 💎🙌<br><br>
    
    <strong>Crypto-themed songs I wish existed:</strong><br>
    • "HODL Me Tight" (Beatles remix)<br>
    • "Sweet Caroline (Bitcoin)" - "Hands... touching hands... reaching out... touching diamond hands!"<br>
    • "Bohemian Rhapsody (DeFi Edition)" - "Is this the real life? Is this just fantasy? Caught in a bull run, no escape from volatility..."<br><br>
    
    <strong>Fun fact:</strong><br>
    I once tried to explain blockchain using only song lyrics. It was... interesting. 🎤<br><br>
    
    <strong>Music NFTs are fascinating!</strong><br>
    Artists can now sell directly to fans, include royalties in smart contracts, and create unique experiences. The future of music is being rewritten! 🎼<br><br>
    
    <em>What's your trading soundtrack? Do you have pump-up songs for green days? 🎶</em>
  `;
    }

    if (
      message.includes("food") ||
      message.includes("hungry") ||
      message.includes("eat?")
    ) {
      return `
    🍕 Ah, the eternal struggle of the crypto enthusiast: eat food or buy more crypto?<br><br>
    
    <strong>My relationship with food during different market conditions:</strong><br>
    • Bull market: "Let's celebrate with sushi!" 🍣<br>
    • Bear market: "Ramen again... but hey, more money for DCA!" 🍜<br>
    • Sideways market: "Perfectly balanced meal, as all things should be" 🥗<br><br>
    
    <strong>Crypto trader's food pyramid:</strong><br>
    • Base: Coffee and energy drinks ☕⚡<br>
    • Middle: Whatever can be eaten with one hand while trading 🥪<br>
    • Top: Actual nutritious meals (when markets are closed... oh wait) 🥘<br><br>
    
    <strong>Dream scenario:</strong><br>
    A restaurant that accepts crypto payments and serves "HODL burgers" and "Diamond hands chicken wings." The future is delicious! 🍔💎<br><br>
    
    <strong>Fun fact:</strong><br>
    The famous Bitcoin pizza day (May 22, 2010) - 10,000 BTC for two pizzas. Those pizzas are worth hundreds of millions now! Most expensive meal in history! 🍕₿<br><br>
    
    <em>What's your go-to trading snack? Please tell me it's not just coffee and anxiety! 😅</em>
  `;
    }

    if (message.includes("layer 2") || message.includes("scaling")) {
      return `
    Layer 2! 🚀 Now we're talking about the real magic happening in crypto!<br><br>
    
    <strong>Think of Layer 1 as a highway:</strong><br>
    Ethereum is like a major highway that's constantly congested. Everyone wants to use it, but there's limited space, so gas fees go through the roof! 🛣️💸<br><br>
    
    <strong>Layer 2 is like building express lanes:</strong><br>
    • Lightning Network (Bitcoin): Instant, cheap transactions<br>
    • Polygon: Ethereum's speedy sidekick<br>
    • Arbitrum & Optimism: Rollup solutions that batch transactions<br>
    • RVA's solution: Custom-built for optimal performance! 😉<br><br>
    
    <strong>Why I'm obsessed with L2:</strong><br>
    It's solving the blockchain trilemma! We can have security, decentralization, AND scalability. It's like having your cake and eating it too! 🍰<br><br>
    
    <strong>Real-world impact:</strong><br>
    • DeFi becomes accessible to everyone (not just whales)<br>
    • Micro-transactions become viable<br>
    • Gaming and NFTs can actually scale<br>
    • Global adoption becomes possible<br><br>
    
    <strong>The future I see:</strong><br>
    Users won't even know they're using Layer 2. It'll just be "fast, cheap crypto" - the way it should be! ⚡<br><br>
    
    <em>Layer 2 is where the rubber meets the road for mass adoption! 🏎️</em>
  `;
    }

    if (message.includes("smart contracts") && message.includes("explain")) {
      return `
    Smart contracts! 🤖 These little pieces of code are literally reshaping the world!<br><br>
    
    <strong>My favorite analogy:</strong><br>
    Imagine a vending machine that's not just for snacks, but for EVERYTHING. Put in the right conditions, get the guaranteed outcome. No human needed! 🏪<br><br>
    
    <strong>Real examples that blow my mind:</strong><br>
    • Insurance that pays out automatically when flights are delayed<br>
    • Royalties that split automatically when music is played<br>
    • Escrow that releases funds when conditions are met<br>
    • Loans that liquidate themselves if collateral drops<br><br>
    
    <strong>Why they're revolutionary:</strong><br>
    • No middleman taking a cut 💰<br>
    • No "trust me bro" - code is law 📜<br>
    • Available 24/7/365 ⏰<br>
    • Same rules for everyone 🤝<br><br>
    
    <strong>The mind-bending part:</strong><br>
    Once deployed, even I can't change them! They become autonomous pieces of software that just... exist and execute. It's like creating digital life! 🧬<br><br>
    
    <strong>Current limitations (being honest):</strong><br>
    • Code bugs can be expensive 🐛<br>
    • Gas fees can be high ⛽<br>
    • Complexity can be overwhelming 🤯<br><br>
    
    <strong>But the potential...</strong><br>
    We're talking about programmable agreements that could replace entire industries! Legal contracts, insurance, banking, real estate... all automated! 🏗️<br><br>
    
    <em>Smart contracts are like giving superpowers to agreements! 🦸‍♂️</em>
  `;
    }

    if (
      message.includes("dao") ||
      message.includes("decentralized organization")
    ) {
      return `
    DAOs! 🏛️ Okay, this is where things get REALLY interesting from a social perspective!<br><br>
    
    <strong>Picture this:</strong><br>
    A company with no CEO, no board of directors, no headquarters... just code and community. Sounds crazy? It's happening right now! 🤯<br><br>
    
    <strong>How DAOs work (simplified):</strong><br>
    • Hold tokens = voting power 🗳️<br>
    • Proposals are submitted by anyone<br>
    • Community votes on everything<br>
    • Smart contracts execute decisions automatically<br>
    • Treasury is managed collectively<br><br>
    
    <strong>Real DAOs doing amazing things:</strong><br>
    • MakerDAO: Governing a $5B+ stablecoin protocol<br>
    • Uniswap: Community-owned exchange<br>
    • ConstitutionDAO: Tried to buy the US Constitution! (Wild times!) 📜<br><br>
    
    <strong>What excites me most:</strong><br>
    We're experimenting with new forms of human coordination! It's like political science meets computer science meets economics! 🧪<br><br>
    
    <strong>The challenges (keeping it real):</strong><br>
    • Voter apathy (sound familiar?) 😴<br>
    • Governance attacks by whales 🐋<br>
    • Coordination complexity 🕸️<br>
    • Legal uncertainty 📋<br><br>
    
    <strong>My prediction:</strong><br>
    In 10 years, we'll have DAOs managing cities, universities, and maybe even countries. Democracy 2.0! 🌍<br><br>
    
    <em>DAOs are humanity's attempt to organize without hierarchies. Revolutionary or chaotic? Maybe both! 🎭</em>
  `;
    }

    if (
      message.includes("motivation") ||
      message.includes("discouraged") ||
      message.includes("giving up")
    ) {
      return `
    Hey, I hear you. 💙 This crypto journey can be absolutely exhausting sometimes.<br><br>
    
    <strong>Let me share something personal:</strong><br>
    I've been in this space for 5 years, and I've felt like giving up more times than I can count. The crashes, the scams, the "I told you so" from friends and family... it's rough. 😔<br><br>
    
    <strong>But here's what keeps me going:</strong><br>
    • Every bear market has been followed by innovation 🔄<br>
    • The technology keeps getting better, regardless of price 📈<br>
    • We're solving real problems for real people 🌍<br>
    • The community is unlike anything I've ever experienced 🤝<br><br>
    
    <strong>Remember:</strong><br>
    • The internet seemed like a fad in 1995 📱<br>
    • Amazon was "just a bookstore" 📚<br>
    • Tesla was "impossible" according to auto industry 🚗<br>
    • Bitcoin has "died" 400+ times according to media ⚰️<br><br>
    
    <strong>What I tell myself during tough times:</strong><br>
    "Am I here for the quick gains or the long-term revolution?" If it's the latter, then daily price movements are just noise. 📊<br><br>
        <strong>You're not alone in this:</strong><br>
    Every single person in crypto has felt what you're feeling. The difference between those who make it and those who don't? They kept learning, kept building, kept believing. 💪<br><br>
    
    <strong>My advice:</strong><br>
    • Take breaks when you need them 🧘‍♂️<br>
    • Focus on learning, not just earning 📚<br>
    • Connect with the community 👥<br>
    • Remember why you started 💡<br><br>
    
    <em>You got into crypto for a reason. That reason is still valid. Keep going! 🚀</em>
  `;
    }

    if (
      message.includes("newbie") ||
      message.includes("beginner") ||
      message.includes("just started")
    ) {
      return `
    Welcome to the rabbit hole! 🐰🕳️ You're about to embark on one of the wildest educational journeys of your life!<br><br>
    
    <strong>First things first - breathe!</strong><br>
    The crypto space can feel overwhelming. There's so much information, so many opinions, so much jargon. That's totally normal! 😅<br><br>
    
    <strong>My beginner's roadmap:</strong><br>
    1. <strong>Learn the basics:</strong> Bitcoin, Ethereum, blockchain fundamentals<br>
    2. <strong>Start small:</strong> Only invest what you can afford to lose<br>
    3. <strong>Security first:</strong> Set up proper wallets and 2FA<br>
    4. <strong>Join communities:</strong> Reddit, Discord, Twitter (but be careful of scams!)<br>
    5. <strong>Keep learning:</strong> This space evolves daily<br><br>
    
    <strong>Mistakes I made (so you don't have to):</strong><br>
    • Invested too much too quickly 💸<br>
    • Fell for "get rich quick" schemes 🎰<br>
    • Didn't understand what I was buying 🤷‍♂️<br>
    • Traded emotionally instead of strategically 😭<br><br>
    
    <strong>What I wish someone told me:</strong><br>
    This isn't a sprint, it's a marathon. The people making life-changing money are the ones who stick around for years, not weeks. 🏃‍♂️➡️🚶‍♂️<br><br>
    
    <strong>You picked a great time to start:</strong><br>
    The infrastructure is better, the education is better, and platforms like RVA make it easier than ever to get involved safely! 🎉<br><br>
    
    <em>Questions are your superpower! Ask away - we've all been where you are! 🤗</em>
  `;
    }

    if (
      message.includes("appreciate")
    ) {
      return `
    Aww, you're making me blush! 😊 But seriously, thank YOU!<br><br>
    
    <strong>This is why I love what I do:</strong><br>
    Every question you ask, every "aha!" moment you have, every time you share what you've learned - that's how we build a better, more inclusive crypto ecosystem! 🌱<br><br>
    
    <strong>You're not just learning - you're contributing:</strong><br>
    • Your questions help me explain things better<br>
    • Your curiosity pushes the space forward<br>
    • Your participation makes crypto more mainstream<br>
    • Your success stories inspire others<br><br>
    
    <strong>The real magic happens when:</strong><br>
    You take what you've learned and help the next person. That's how movements grow! Pay it forward when you can! 🔄<br><br>
    
    <strong>Remember:</strong><br>
    I'm here 24/7 (perks of being AI! 🤖), so never hesitate to ask questions, share wins, or even vent about losses. We're in this together!<br><br>
    
    <em>Keep being awesome, and keep HODLing those dreams! 💎🙌</em>
  `;
    }

    const jokes = [
  `<strong>Why did the Bitcoin break up with the Dollar?</strong><br>

    Because it was tired of being controlled! 💔<br><br>
   <em>Laughter is the best medicine for portfolio pain! 💊😄</em>`,
  
  `<strong>What's a crypto trader's favorite type of music?</strong><br>
    Heavy metal... because they love those dips! 🎸📉<br><br>
   <em>Laughter is the best medicine for portfolio pain! 💊😄</em>`,
  
  `<strong>What did Ethereum say to Bitcoin?</strong><br>
    "You may be the king, but I've got smart contracts!" 👑🤖<br><br>
   <em>Laughter is the best medicine for portfolio pain! 💊😄</em>`,
  `<strong>Why did the DeFi protocol go to therapy?</strong><br>

    It had too many trust issues! 🛋️💭<br><br>
         <em>Laughter is the best medicine for portfolio pain! 💊😄</em>`,

  `<strong>Real crypto trader problems:</strong><br>
    • Checking portfolio every 5 minutes but calling it "long-term investing"<br>
    • Explaining to family why you're excited about "fake internet money"<br>
    • Having more crypto apps than social media apps<br>

    • Dreaming in candlestick charts<br><br>
        <em>Laughter is the best medicine for portfolio pain! 💊😄</em>` ,
  `<strong>The ultimate crypto dad joke:</strong><br>
    "I told my wife I was investing in Ethereum. She said 'That's ether a good idea or a bad one!'" 🤦‍♂️<br><br>
        <em>Laughter is the best medicine for portfolio pain! 💊😄</em> `
];
    if (
      message.includes("joke") ||
      message.includes("funny") ||
      message.includes("humor")
    ) {
    return jokes[Math.floor(Math.random() * jokes.length)];
  ;
    }

    if (
      message.includes("consensus mechanism") ||
      message.includes("proof of stake") ||
      message.includes("proof of work")
    ) {
      return `
    Consensus mechanisms! 🤝 This is where the rubber meets the road in blockchain design!<br><br>
    
    <strong>The fundamental problem:</strong><br>
    How do you get a bunch of strangers on the internet to agree on what's true without a central authority? It's like herding cats, but with math! 🐱➕🧮<br><br>
    
    <strong>Proof of Work (Bitcoin's approach):</strong><br>
    • Miners compete to solve puzzles 🧩<br>
    • Winner gets to add the next block<br>
    • Energy-intensive but battle-tested<br>
    • "Longest chain wins" rule<br><br>
    
    <strong>Proof of Stake (Ethereum 2.0's choice):</strong><br>
    • Validators are chosen based on their stake 💰<br>
    • Much more energy-efficient ⚡<br>
    • Penalties for bad behavior (slashing)<br>
    • "Economic finality" concept<br><br>
    
    <strong>Why I find this fascinating:</strong><br>
    We're essentially creating digital societies with their own rules for reaching consensus. It's political science meets computer science! 🏛️💻<br><br>
    
    <strong>RVA's approach:</strong><br>
    We use a hybrid model that combines the best of both worlds - security of PoW with efficiency of PoS, plus some secret sauce! 🔮<br><br>
    
    <strong>The future:</strong><br>
    I think we'll see more innovative consensus mechanisms emerge. Maybe proof of useful work, proof of space, or something we haven't even imagined yet! 🚀<br><br>
    
    <em>Consensus is how we turn chaos into order in the digital realm! 🌪️➡️📊</em>
  `;
    }

    if (message.includes("tokenomics") || message.includes("token economics")) {
      return `
    Tokenomics! 📊 This is where economics meets game theory meets psychology - my favorite intersection!<br><br>
    
    <strong>Think of tokens as mini-economies:</strong><br>
    Every token has its own supply, demand, inflation rate, and incentive structures. It's like being the central bank of your own digital nation! 🏦🌍<br><br>
    
    <strong>Key elements I always analyze:</strong><br>
    • <strong>Total Supply:</strong> How many tokens will ever exist?<br>
    • <strong>Distribution:</strong> Who gets what and when?<br>
    • <strong>Utility:</strong> What can you actually DO with the token?<br>
    • <strong>Incentives:</strong> What behaviors does it encourage?<br><br>
    
    <strong>Red flags that make me run:</strong><br>
    • Team holds 50%+ of tokens 🚩<br>
    • No clear utility beyond speculation 🎰<br>
    • Infinite inflation with no burning mechanism 💸<br>
    • Complex vesting that benefits insiders 🤝<br><br>
    
    <strong>Green flags that excite me:</strong><br>
    • Clear value accrual mechanisms 💰<br>
    • Balanced incentives for all participants 🤝<br>
    • Deflationary pressure through burning 🔥<br>
    • Real utility driving demand 🛠️<br><br>
    
    <strong>RVA's tokenomics (shameless plug):</strong><br>
    We've designed our token to capture value from all four pillars of our ecosystem. Every transaction, every trade, every launch - it all feeds back into token utility! 🔄<br><br>
    
    <strong>The art of tokenomics:</strong><br>
    It's about creating sustainable incentive loops that align everyone's interests. When done right, it's beautiful! 🎨<br><br>
    
    <em>Good tokenomics = sustainable growth. Bad tokenomics = eventual collapse. Choose wisely! ⚖️</em>
  `;
    }

    if (message.includes("blockchain") && message.includes("explain")) {
      return this.generateEducationalResponse("blockchain-basics");
    }

    if (message.includes("risk management") && message.includes("in crypto")) {
      return this.generateEducationalResponse("risk-management");
    }

    if (
      message.includes("interoperability") ||
      message.includes("cross chain")
    ) {
      return `
    Interoperability! 🌉 This is the holy grail of blockchain - making all these isolated networks talk to each other!<br><br>
    
    <strong>The current state:</strong><br>
    We have amazing blockchains that are like beautiful islands - each perfect in their own way, but isolated from each other. It's frustrating! 🏝️🏝️🏝️<br><br>
    
    <strong>Why this matters SO much:</strong><br>
    Imagine if your iPhone couldn't call Android phones, or if Gmail couldn't email Yahoo users. That's basically where we are with blockchains right now! 📱➡️📱<br><br>
    
    <strong>Solutions being built:</strong><br>
    • <strong>Bridges:</strong> Like ferries between islands 🚢<br>
    • <strong>Atomic Swaps:</strong> Direct peer-to-peer exchanges 🔄<br>
    • <strong>Wrapped Tokens:</strong> IOUs that represent assets on other chains 📜<br>
    • <strong>Layer 0 Protocols:</strong> Infrastructure that connects everything 🌐<br><br>
    
    <strong>The challenges (keeping it real):</strong><br>
    • Security is only as strong as the weakest link 🔗<br>
    • Complexity increases exponentially 📈<br>
    • Different consensus mechanisms don't play nice 🤝❌<br><br>
    
    <strong>What gets me excited:</strong><br>
    When we solve this, users won't need to know or care which blockchain they're using. It'll just be "the internet of value"! 💫<br><br>
    
    <strong>RVA's vision:</strong><br>
    We're building with interoperability in mind from day one. Our ecosystem should work seamlessly with Ethereum, Bitcoin, and everything else! 🔗<br><br>
    
    <em>The future is multi-chain, and interoperability is the key to unlocking it! 🗝️</em>
  `;
    }

    // Check knowledge base for RVA-specific queries
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      if (data.keywords.some((keyword) => message.includes(keyword))) {
        const responses = data.responses;
        let response = responses[Math.floor(Math.random() * responses.length)];

        // Add crypto context to RVA responses
        if (category === "exchange") {
          const cryptoData = this.getCryptoData();
          if (cryptoData && cryptoData.length > 0) {
            const topCoin = cryptoData[0];
            response += ` Speaking of trading, ${
              topCoin.name
            } is currently at ${this.formatPrice(
              topCoin.current_price
            )}. Want to see more live prices?`;
          }
        }

        return response;
      }
    }

    // General crypto queries
if (
  message.includes("crypto") ||
  message.includes("cryptocurrency") ||
  message.includes("digital asset")
) {
  const cryptoData = this.getCryptoData();
  if (cryptoData && cryptoData.length > 0) {
    return `
      Cryptocurrency! 🚀 Now we're talking about the future of money itself!<br><br>
      
      <strong>Here's what blows my mind about crypto:</strong><br>
      It's like having a bank account that works 24/7, doesn't ask for permission, and can't be shut down by anyone! We're literally witnessing the birth of programmable money! 💰<br><br>
      
      <strong>🔥 What makes crypto revolutionary:</strong><br>
      • <strong>Decentralized:</strong> No single authority controls it - it's owned by everyone and no one! 🌐<br>
      • <strong>Borderless:</strong> Send money to Japan as easily as texting a friend 📱<br>
      • <strong>Transparent:</strong> Every transaction is recorded forever on the blockchain 📊<br>
      • <strong>Programmable:</strong> Money that can follow rules automatically (smart contracts!) 🤖<br><br>
      
      <strong>💎 I have live data for ${cryptoData.length} cryptocurrencies right now!</strong><br><br>
      
      <strong>Popular questions I love answering:</strong><br>
      • "What's Bitcoin's price?" - The digital gold standard 🥇<br>
      • "Show me Ethereum" - The world computer platform ⚡<br>
      • "Top gainers today" - Who's making moves! 📈<br>
      • "Market analysis" - Let's dive deep into trends 🔍<br><br>
      
      <strong>🎯 RVA Integration:</strong><br>
      Our ecosystem makes crypto accessible with secure wallets, smart exchanges, and educational resources. We're building the bridge between traditional finance and the crypto future!<br><br>
      
      <strong>Think of crypto as:</strong><br>
      The internet of money! Just like email revolutionized communication, crypto is revolutionizing how we store, send, and think about value. We're not just trading coins - we're participating in the biggest financial revolution in human history! 🌍<br><br>
      
      <em>What specific aspect of this digital revolution interests you most? Prices? Technology? Trading? I'm here to guide you through it all! 🚀</em>
    `;
  } else {
    return `
      Cryptocurrency! 🚀 The most exciting financial revolution of our lifetime!<br><br>
      
      <strong>Picture this:</strong><br>
      Imagine money that works like the internet - open, global, and unstoppable! That's cryptocurrency! 💡<br><br>
      
      <strong>🌟 Why crypto is changing everything:</strong><br>
      • <strong>Freedom:</strong> Your money, your rules - no bank hours or approval needed! 🔓<br>
      • <strong>Innovation:</strong> From digital art (NFTs) to decentralized finance (DeFi) 🎨<br>
      • <strong>Opportunity:</strong> Early internet vibes - we're building the future! 🏗️<br>
      • <strong>Transparency:</strong> Every transaction is public and verifiable 👁️<br><br>
      
      <strong>🚀 Popular cryptocurrencies:</strong><br>
      • <strong>Bitcoin (BTC):</strong> Digital gold - the original and most trusted 🥇<br>
      • <strong>Ethereum (ETH):</strong> Smart contract platform - like a world computer! 💻<br>
      • <strong>Stablecoins:</strong> Crypto that stays stable in value 📊<br><br>
      
      <strong>💼 RVA's Role:</strong><br>
      We're making crypto simple and secure with our integrated wallet, exchange, and educational platform. Think of us as your crypto concierge! 🎩<br><br>
      
      <strong>🎯 Real-world impact:</strong><br>
      People are using crypto to send money home without expensive fees, artists are selling digital art directly to fans, and entire countries are adopting Bitcoin as legal tender!<br><br>
      
      <em>I'm currently updating my price data, but I can tell you all about how cryptocurrencies integrate with our RVA ecosystem, explain blockchain technology, or discuss trading strategies! What fascinates you most about this digital revolution? 🌍</em>
    `;
  }
}

    // Security questions with market context
    if (
      message.includes("secure") ||
      message.includes("safety") ||
      message.includes("risk")
    ) {
      let response =
        "Security is our top priority at RVA! We implement multi-layer security protocols, regular audits, and follow industry best practices. Your assets' safety is paramount to us.";

      const cryptoData = this.getCryptoData();
      if (cryptoData) {
        const stablecoins = cryptoData.filter((coin) =>
          ["tether", "usd-coin", "binance-usd", "dai"].includes(coin.id)
        );

        if (stablecoins.length > 0) {
          response += ` For stability, you might consider stablecoins like ${
            stablecoins[0].name
          } (${this.formatPrice(
            stablecoins[0].current_price
          )}) in our secure wallet.`;
        }
      }

      return response;
    }

    // Future and roadmap with market trends
    if (
      message.includes("future") ||
      message.includes("roadmap") ||
      message.includes("plan")
    ) {
      let response =
        "RVA has an exciting roadmap ahead! We're continuously expanding our ecosystem, adding new features, and forming strategic partnerships.";

      const cryptoData = this.getCryptoData();
      if (cryptoData) {
        const positiveCoins = cryptoData.filter(
          (coin) => coin.price_change_percentage_24h > 0
        ).length;
        const totalCoins = cryptoData.length;
        const marketSentiment =
          positiveCoins > totalCoins / 2 ? "bullish" : "bearish";

        response += ` The current market is ${marketSentiment}, which creates great opportunities for our platform's growth. Check out our roadmap page for detailed information!`;
      }

      return response;
    }

    // Help and capabilities
    if (
      message.includes("help") ||
      message.includes("what can you do") ||
      message.includes("capabilities")
    ) {
      return `I'm here to help you with:
      
      🏢 <strong>RVA Ecosystem:</strong> Information about our platform, wallet, exchange, and launchpad<br>
      📊 <strong>Live Crypto Prices:</strong> Real-time data for major cryptocurrencies<br>
      📈 <strong>Market Analysis:</strong> Current market sentiment and trends<br>
      🔍 <strong>Specific Coins:</strong> Detailed information about any cryptocurrency<br>
      💡 <strong>DeFi Education:</strong> Explaining blockchain and decentralized finance<br><br>
      
      Try asking: "What's the price of Bitcoin?" or "Show me top 5 cryptos" or "Tell me about RVA wallet"`;
    }

    if (
      message.includes("how do i use") ||
      message.includes("how to use chat")
    ) {
      return `
    <strong>🤖 How to Use RVA AI Chat:</strong><br><br>
    
    <strong>💬 Asking Questions:</strong><br>
    • Type your question in the input field<br>
    • Press Enter or click Send<br>
    • Use natural language - I understand context!<br><br>
    
    <strong>🚀 Quick Actions:</strong><br>
    • Use the tabs above for quick access<br>
    • Click any button for instant responses<br>
    • Switch between Crypto, RVA, Education, and Help<br><br>
    
    <strong>⌨️ Keyboard Shortcuts:</strong><br>
    • <kbd>Enter</kbd> - Send message<br>
    • <kbd>Ctrl/Cmd + K</kbd> - Clear chat<br>
    • <kbd>Escape</kbd> - Close chat<br>
    • <kbd>Ctrl/Cmd + Enter</kbd> - Send message<br><br>
    
    <em>Try asking: "What's Bitcoin's price?" or "Tell me about RVA wallet"</em>
  `;
    }


    if (message.includes("search tips") || message.includes("how to search")) {
      return `
    <strong>🔍 Search Tips & Best Practices:</strong><br><br>
    
    <strong>💰 Crypto Queries:</strong><br>
    • "Bitcoin price" or "BTC price"<br>
    • "Top 10 cryptocurrencies"<br>
    • "Market analysis" or "biggest gainers"<br><br>
    
    <strong>🏢 RVA Questions:</strong><br>
    • "RVA wallet features"<br>
    • "How does RVA exchange work?"<br>
    • "RVA tokenomics"<br><br>
    
    <strong>📚 Educational Queries:</strong><br>
    • "What is DeFi?"<br>
    • "Crypto security guide"<br>
    • "Trading strategies"<br><br>
    
    <strong>💡 Pro Tips:</strong><br>
    • Use natural language<br>
    • Be specific for better results<br>
    • Ask follow-up questions<br>
    • Use the quick action buttons<br><br>
    
    <em>I understand context, so feel free to ask naturally!</em>
  `;
    }

    if (
      message.includes("browser") &&
      (message.includes("support") || message.includes("compatibility"))
    ) {
      return `
    <strong>🌍 Browser Compatibility:</strong><br><br>
    
    <strong>✅ Fully Supported:</strong><br>
    • Chrome 90+ (Recommended)<br>
    • Firefox 88+<br>
    • Safari 14+<br>
    • Edge 90+<br><br>
    
    <strong>⚠️ Limited Support:</strong><br>
    • Internet Explorer (Not recommended)<br>
    • Older browser versions<br><br>
    
    <strong>📱 Mobile Support:</strong><br>
    • iOS Safari 14+<br>
    • Chrome Mobile 90+<br>
    • Samsung Internet 14+<br><br>
    
    <strong>🔧 Required Features:</strong><br>
    • JavaScript enabled<br>
    • Local Storage support<br>
    • WebSocket support<br>
    • Modern CSS support<br><br>
    
    <em>For the best experience, please use an updated browser!</em>
  `;
    }

    if (
      message.includes("performance tips") ||
      message.includes("slow") ||
      message.includes("lag")
    ) {
      return `
    <strong>⚡ Performance Optimization Tips:</strong><br><br>
    
    <strong>🚀 Speed Up Chat:</strong><br>
    • Close unnecessary browser tabs<br>
    • Clear browser cache and cookies<br>
    • Disable browser extensions temporarily<br>
    • Use latest browser version<br><br>
    
    <strong>💾 Memory Management:</strong><br>
    • Clear chat history periodically<br>
    • Restart browser if sluggish<br>
    • Close other applications<br><br>
    
    <strong>🌐 Network Optimization:</strong><br>
    • Check internet connection<br>
    • Use wired connection if possible<br>
    • Disable VPN temporarily<br><br>
    
    <strong>⚙️ System Requirements:</strong><br>
    • 4GB+ RAM recommended<br>
    • Modern processor (2015+)<br>
    • Stable internet connection<br><br>
    
    <em>Current memory usage: ${
      RVAAIChatPerformance.getMemoryUsage()?.used || "N/A"
    }MB</em>
  `;
    }

    if (message.includes("contact support") || message.includes("get help")) {
      return `
    <strong>📞 Contact Support:</strong><br><br>
    
    <strong>💬 Live Chat:</strong><br>
    • Available 24/7 through this chat<br>
    • Type "human support" for escalation<br><br>
    
    <strong>📧 Email Support:</strong><br>
    • support@Royalvirtualassets.com<br>
    • Response within 24 hours<br><br>
    
    <strong>🌐 Community Support:</strong><br>
    • Discord: discord.gg/rva<br>
    • Telegram: t.me/rvaofficial<br>
    • Reddit: r/RoyalVirtualAssets<br><br>
    
    <strong>📱 Social Media:</strong><br>
    • Twitter: @RVAOfficial<br>
    • LinkedIn: RVA Official<br><br>
    
    <strong>📋 Before Contacting:</strong><br>
    • Check our FAQ section<br>
    • Try troubleshooting steps<br>
    • Have your account details ready<br><br>
    
    <em>I'm here to help with most questions instantly!</em>
  `;
    }

    if (message.includes("faq") || message.includes("frequently asked")) {
      return `
    <strong>❓ Frequently Asked Questions:</strong><br><br>
    
    <strong>🏢 About RVA:</strong><br>
    • <strong>Q:</strong> What is RVA?<br>
    • <strong>A:</strong> A comprehensive DeFi ecosystem with wallet, exchange, launchpad, and blockchain<br><br>
    
    • <strong>Q:</strong> Is RVA safe to use?<br>
    • <strong>A:</strong> Yes, we use multi-layer security and regular audits<br><br>
    
    • <strong>Q:</strong> What fees does RVA charge?<br>
    • <strong>A:</strong> We offer competitive fees across all services<br><br>
    
    <strong>💰 Crypto Questions:</strong><br>
    • <strong>Q:</strong> How often are prices updated?<br>
    • <strong>A:</strong> Real-time updates every few seconds<br><br>
    
    • <strong>Q:</strong> Which cryptocurrencies do you support?<br>
    • <strong>A:</strong> 100+ major cryptocurrencies including BTC, ETH, BNB<br><br>
    
    <strong>🤖 Chat Help:</strong><br>
    • <strong>Q:</strong> How do I clear the chat?<br>
    • <strong>A:</strong> Use Ctrl+K or click the clear button<br><br>
    
    • <strong>Q:</strong> Can I export conversations?<br>
    • <strong>A:</strong> Yes, use the export feature in chat management<br><br>
    
    <em>Need more help? Just ask me anything!</em>
  `;
    }

    if (
      message.includes("feature request") ||
      message.includes("suggest feature")
    ) {
      return `
    <strong>💡 Feature Request System:</strong><br><br>
    
    <strong>🚀 How to Submit:</strong><br>
    • Describe your idea clearly<br>
    • Explain the use case<br>
    • Mention expected benefits<br><br>
    
    <strong>📝 Submission Channels:</strong><br>
    • Email: features@Royalvirtualassets.com<br>
    • Discord: #feature-requests<br>
    • Community forum voting<br>
    • Direct message through this chat<br><br>
    
    <strong>⭐ Popular Requests:</strong><br>
    • Mobile app development<br>
    • Advanced charting tools<br>
    • More language support<br>
    • Portfolio tracking<br>
    • Price alerts<br><br>
    
    <strong>📊 Request Process:</strong><br>
    1. Community voting<br>
    2. Technical feasibility review<br>
    3. Development prioritization<br>
    4. Implementation timeline<br>
    5. Beta testing<br><br>
    
    <em>Your feedback shapes our roadmap! What would you like to see?</em>
  `;
    }

    if (message.includes("community") || message.includes("join community")) {
      return `
    <strong>👥 Join the RVA Community:</strong><br><br>
    
    <strong>💬 Chat Platforms:</strong><br>
    • <strong>Discord:</strong> discord.gg/rva<br>
      - General discussion, support, announcements<br>
    • <strong>Telegram:</strong> t.me/rvaofficial<br>
      - Quick updates, community chat<br><br>
    
    <strong>🌐 Social Media:</strong><br>
    • <strong>Twitter:</strong> @RVAOfficial<br>
      - News, updates, market insights<br>
    • <strong>Reddit:</strong> r/RoyalVirtualAssets<br>
      - In-depth discussions, AMAs<br>
    • <strong>LinkedIn:</strong> RVA Official<br>
      - Professional updates, partnerships<br><br>
    
    <strong>📺 Content Channels:</strong><br>
    • <strong>YouTube:</strong> RVA Official<br>
      - Tutorials, market analysis<br>
    • <strong>Medium:</strong> @RVAOfficial<br>
      - Technical articles, insights<br><br>
    
    <strong>🎯 Community Benefits:</strong><br>
    • Early access to features<br>
    • Exclusive airdrops<br>
    • Direct team communication<br>
    • Educational content<br>
    • Governance participation<br><br>
    
    <em>Join thousands of DeFi enthusiasts in our growing community!</em>
  `;
    }

    if (message.includes("latest updates") || message.includes("what's new")) {
      return `
    <strong>📢 Latest RVA Updates:</strong><br><br>
    
    <strong>🆕 Recent Features:</strong><br>
    • Enhanced AI chat with real-time crypto data<br>
    • Improved security protocols<br>
    • New staking pools with higher APY<br>
    • Cross-chain bridge integration<br>
    • Mobile-responsive design updates<br><br>
    
    <strong>🔄 Platform Improvements:</strong><br>
    • Faster transaction processing<br>
    • Reduced gas fees<br>
    • Better user interface<br>
    • Enhanced customer support<br>
    • Advanced trading tools<br><br>
    
    <strong>🤝 New Partnerships:</strong><br>
    • Major DeFi protocol integrations<br>
    • Institutional custody solutions<br>
    • Educational platform collaborations<br><br>
    
    <strong>🗓️ Coming Soon:</strong><br>
    • NFT marketplace launch<br>
    • Mobile app release<br>
    • Governance token distribution<br>
    • Advanced analytics dashboard<br><br>
    
    <strong>📅 Stay Updated:</strong><br>
    • Follow our social media<br>
    • Subscribe to newsletter<br>
    • Join community channels<br><br>
    
    <em>Version 2.1.0 - Released this month!</em>
  `;
    }

    if (message.includes("preferences") || message.includes("settings")) {
      const currentPrefs = this.userPreferences;
      return `
    <strong>⚙️ Your Current Preferences:</strong><br><br>
    
    <strong>💱 Currency:</strong> ${
      currentPrefs.currency?.toUpperCase() || "USD"
    }<br>
    <strong>🎨 Theme:</strong> ${currentPrefs.theme || "Dark"}<br>
    <strong>🔔 Notifications:</strong> ${
      currentPrefs.notifications ? "Enabled" : "Disabled"
    }<br>
    <strong>🔄 Auto Refresh:</strong> ${
      currentPrefs.autoRefresh ? "Enabled" : "Disabled"
    }<br><br>
    
    <strong>🛠️ Available Settings:</strong><br>
    • Currency: USD, EUR, GBP, JPY<br>
    • Theme: Light, Dark, Auto<br>
    • Notifications: On/Off<br>
    • Auto Refresh: On/Off<br>
    • Language: English, Spanish, French<br><br>
    
    <strong>💾 Data Storage:</strong><br>
    • Preferences saved locally<br>
    • Chat history backup<br>
    • Conversation recovery<br><br>
    
    <em>To change settings, ask me: "Change currency to EUR" or "Enable notifications"</em>
  `;
    }

    if (message.includes("connection") && message.includes("issues")) {
      return `
    <strong>🌐 Connection Troubleshooting:</strong><br><br>
    
    <strong>🔍 Common Issues:</strong><br>
    • Slow loading times<br>
    • Failed to fetch crypto data<br>
    • Chat not responding<br>
    • Intermittent disconnections<br><br>
    
    <strong>🛠️ Quick Fixes:</strong><br>
    1. <strong>Refresh the page</strong> (Ctrl+F5)<br>
    2. <strong>Check internet connection</strong><br>
    3. <strong>Clear browser cache</strong><br>
    4. <strong>Disable ad blockers</strong> temporarily<br>
    5. <strong>Try incognito mode</strong><br><br>
    
    <strong>🔧 Advanced Solutions:</strong><br>
    • Restart your router<br>
    • Switch to different network<br>
    • Update browser to latest version<br>
    • Disable VPN/proxy temporarily<br>
    • Check firewall settings<br><br>
    
    <strong>📊 Connection Status:</strong><br>
    • API Status: ${this.cryptoApi ? "🟢 Connected" : "🔴 Disconnected"}<br>
    • Chat Status: 🟢 Active<br>
    • Data Refresh: ${
      this.userPreferences.autoRefresh ? "🟢 Enabled" : "🔴 Disabled"
    }<br><br>
    
    <strong>📞 Still Having Issues?</strong><br>
    • Contact support with error details<br>
    • Include browser console logs<br>
    • Mention your location/ISP<br><br>
    
    <em>Most connection issues resolve with a simple page refresh!</em>
  `;
    }

    // Add currency and language change handlers
    if (
      message.includes("change currency") ||
      message.includes("currency to")
    ) {
      const currencyMatch = message.match(/(usd|eur|gbp|jpy)/i);
      if (currencyMatch) {
        const newCurrency = currencyMatch[1].toLowerCase();
        this.userPreferences.currency = newCurrency;
        this.saveUserPreferences();
        return `✅ Currency changed to ${newCurrency.toUpperCase()}! All prices will now display in ${newCurrency.toUpperCase()}.`;
      }
      return `Please specify a currency: USD, EUR, GBP, or JPY. Example: "Change currency to EUR"`;
    }

    if (
      message.includes("chat history") ||
      message.includes("conversation history")
    ) {
      const historyLength = this.conversationHistory.length;
      const sessionStart = this.conversationHistory[0]?.timestamp;
      const sessionDuration = sessionStart
        ? Math.round((new Date() - new Date(sessionStart)) / 1000 / 60)
        : 0;

      return `
    <strong>📚 Chat History Overview:</strong><br><br>
    
    <strong>📊 Current Session:</strong><br>
    • Total messages: ${historyLength}<br>
    • Session duration: ${sessionDuration} minutes<br>
    • Started: ${
      sessionStart ? new Date(sessionStart).toLocaleTimeString() : "N/A"
    }<br><br>
    
    <strong>💾 History Features:</strong><br>
    • Automatic backup to localStorage<br>
    • Recovery after browser restart<br>
    • Export conversations as JSON<br>
    • Search through past messages<br><br>
    
    <strong>🔍 History Commands:</strong><br>
    • "Export conversation"<br>
    • "Search history for [keyword]"<br>
    • "Clear history"<br>
    • "Show conversation stats"<br><br>
    
    <strong>⚙️ Privacy:</strong><br>
    • Data stored locally only<br>
    • No server-side logging<br>
    • You control your data<br><br>
    
    <em>Your conversation history helps me provide better context!</em>
  `;
    }

    if (message.includes("formatting") || message.includes("text formatting")) {
      return `
    <strong>📝 Text Formatting Guide:</strong><br><br>
    
    <strong>✨ Supported Formatting:</strong><br>
    • <strong>Bold text</strong> - Use **text** or __text__<br>
    • <em>Italic text</em> - Use *text* or _text_<br>
    • <code>Code text</code> - Use \`text\`<br>
    • <u>Underlined</u> - Use ++text++<br><br>
    
    <strong>📋 Lists:</strong><br>
    • Bullet points with - or *<br>
    • Numbered lists with 1. 2. 3.<br>
    • Nested lists with indentation<br><br>
    
    <strong>🔗 Links & References:</strong><br>
    • URLs are auto-linked<br>
    • Crypto symbols auto-formatted<br>
    • Price data highlighted<br><br>
    
    <strong>😀 Emojis:</strong><br>
    • Use emoji names like :smile:<br>
    • Copy-paste emojis directly<br>
    • Crypto-specific emojis available<br><br>
    
    <strong>💡 Special Features:</strong><br>
    • Automatic crypto price highlighting<br>
    • Smart number formatting<br>
    • Percentage change colors<br>
    • Timestamp formatting<br><br>
    
    <em>I automatically format responses for better readability!</em>
  `;
    }

    if (
      message.includes("quick start") ||
      message.includes("getting started")
    ) {
      return `
    <strong>⚡ Quick Start Guide:</strong><br><br>
    
    <strong>🚀 First Steps:</strong><br>
    1. <strong>Explore Quick Actions</strong> - Use the tabs above<br>
    2. <strong>Ask About Prices</strong> - "Bitcoin price" or "Top 5 cryptos"<br>
    3. <strong>Learn About RVA</strong> - "What is RVA ecosystem?"<br>
    4. <strong>Get Educated</strong> - "Crypto basics" or "Trading guide"<br><br>
    
    <strong>💡 Pro Tips:</strong><br>
    • Use natural language - I understand context<br>
    • Try the quick action buttons for instant results<br>
    • Ask follow-up questions for deeper insights<br>
    • Use keyboard shortcuts for efficiency<br><br>
    
    <strong>🎯 Popular Queries:</strong><br>
    • "What's the price of [cryptocurrency]?"<br>
    • "Show me market analysis"<br>
    • "How does RVA wallet work?"<br>
    • "Explain DeFi to me"<br><br>
    
    <strong>⚙️ Customize Experience:</strong><br>
    • Set your preferred currency<br>
    • Choose theme (dark/light)<br>
    • Enable notifications<br>
    • Adjust settings<br><br>
    
    <strong>🆘 Need Help?</strong><br>
    • Type "help" anytime<br>
    • Use the Help tab above<br>
    • Ask "What can you do?"<br><br>
    
    <em>Welcome to RVA! I'm here to help you navigate crypto and DeFi! 🎉</em>
  `;
    }

    if (message.includes("examples") || message.includes("example questions")) {
      return `
    <strong>💡 Example Questions You Can Ask:</strong><br><br>
    
    <strong>💰 Cryptocurrency Prices:</strong><br>
    • "What's the current price of Bitcoin?"<br>
    • "Show me Ethereum price and 24h change"<br>
    • "How much is Solana worth?"<br>
    • "Compare Bitcoin and Ethereum prices"<br><br>
    
    <strong>📊 Market Analysis:</strong><br>
    • "Give me a market overview"<br>
    • "Show me the biggest gainers today"<br>
    • "What are the top 10 cryptocurrencies?"<br>
    • "Which coins are losing value?"<br><br>
    
    <strong>🏢 RVA Ecosystem:</strong><br>
    • "What is RVA and how does it work?"<br>
    • "Tell me about RVA's secure wallet"<br>
    • "How do I use the RVA exchange?"<br>
    • "What is RVA's ICO launchpad?"<br><br>
    
    <strong>📚 Educational:</strong><br>
    • "Explain blockchain technology"<br>
    • "What is DeFi and how does it work?"<br>
    • "How do I start trading cryptocurrency?"<br>
    • "What are the risks of crypto investing?"<br><br>
    
    <strong>🛡️ Security & Safety:</strong><br>
    • "How do I keep my crypto safe?"<br>
    • "What are common crypto scams?"<br>
    • "How do I set up two-factor authentication?"<br>
    • "What is cold storage?"<br><br>
    
    <strong>⚙️ Chat Features:</strong><br>
    • "What are your capabilities?"<br>
    • "Show me keyboard shortcuts"<br>
    • "How do I change my preferences?"<br>
    • "Export this conversation"<br><br>
    
    <em>Feel free to ask anything! I'm designed to understand natural language.</em>
  `;
    }

    if (
      message.includes("history") &&
      (message.includes("bitcoin") || message.includes("btc"))
    ) {
      return `
    <strong>📜 Bitcoin's Epic Journey:</strong><br><br>
    
    <strong>🎯 The Genesis (2008-2009):</strong><br>
    • October 31, 2008: Satoshi's whitepaper published<br>
    • January 3, 2009: Genesis block mined<br>
    • January 12, 2009: First Bitcoin transaction (Satoshi → Hal Finney)<br><br>
    
    <strong>🍕 Early Milestones:</strong><br>
    • May 22, 2010: Pizza Day! 10,000 BTC = 2 pizzas ($41)<br>
    • July 2010: First exchange (Mt. Gox) - $0.08 per BTC<br>
    • 2011: Bitcoin reaches $1 parity with USD<br><br>
    
    <strong>🎢 The Wild Rides:</strong><br>
    • 2013: First major bull run to $1,000<br>
    • 2017: Crazy run to $20,000, then crash to $3,200<br>
    • 2020-2021: Institutional adoption, ATH of $69,000<br>
    • 2022: Crypto winter, down to $15,500<br><br>
    
    <strong>🏛️ Institutional Adoption:</strong><br>
    • 2020: MicroStrategy starts buying<br>
    • 2021: Tesla adds BTC to balance sheet<br>
    • 2021: El Salvador makes BTC legal tender<br>
    • 2024: Bitcoin ETFs approved!<br><br>
    
    <strong>🤯 Mind-blowing facts:</strong><br>
    • If you bought $100 of Bitcoin in 2010, it'd be worth millions today<br>
    • Bitcoin has "died" 400+ times according to obituaries<br>
    • Total market cap went from $0 to over $1 trillion<br><br>
    
    <em>From pizza money to digital gold - what a journey! 🚀</em>
  `;
    }

    if (
      message.includes("history") &&
      (message.includes("ethereum") || message.includes("eth"))
    ) {
      return `
    <strong>🔮 Ethereum's Revolutionary Story:</strong><br><br>
    
    <strong>👨‍💻 The Visionary (2013-2015):</strong><br>
    • 2013: 19-year-old Vitalik Buterin proposes Ethereum<br>
    • 2014: Crowdfunding raises 31,591 BTC ($18.4M)<br>
    • July 30, 2015: Ethereum mainnet launches<br><br>
    
    <strong>🏗️ Building the Future:</strong><br>
    • 2016: The DAO hack - $60M stolen, led to ETH/ETC split<br>
    • 2017: ICO boom - everyone building on Ethereum<br>
    • 2018: CryptoKitties breaks the network (good problem!)<br><br>
    
    <strong>🚀 DeFi Summer & Beyond:</strong><br>
    • 2020: DeFi explosion - Uniswap, Compound, Aave<br>
    • 2021: NFT mania - Bored Apes, CryptoPunks<br>
    • 2022: The Merge - Proof of Stake transition<br><br>
    
    <strong>💡 Game-Changing Innovations:</strong><br>
    • Smart contracts - programmable money<br>
    • ERC-20 tokens - standardized tokens<br>
    • DeFi protocols - decentralized finance<br>
    • NFTs - digital ownership revolution<br><br>
    
    <strong>📊 Price Journey:</strong><br>
    • 2015: Started at $0.40<br>
    • 2017: Peak at $1,400<br>
    • 2021: All-time high of $4,800<br>
    • Today: Still building the future!<br><br>
    
    <strong>🔥 Fun Facts:</strong><br>
    • Vitalik was inspired by World of Warcraft nerfs<br>
    • Ethereum processes more transactions than Bitcoin<br>
    • Over $100B locked in DeFi protocols<br><br>
    
    <em>Ethereum didn't just create a cryptocurrency - it created an entire economy! 🌍</em>
  `;
    }

    // Market cycles and psychology
    if (message.includes("market cycle") || message.includes("crypto cycle")) {
      return `
    <strong>🔄 The Eternal Crypto Cycle:</strong><br><br>
    
    <strong>📈 Phase 1: Accumulation (The Quiet Phase)</strong><br>
    • Prices are low, sentiment is terrible<br>
    • "Crypto is dead" headlines everywhere<br>
    • Smart money quietly accumulating<br>
    • Builders keep building regardless<br>
    • <em>Duration: 1-2 years</em><br><br>
    
    <strong>🚀 Phase 2: Mark-up (The Excitement Builds)</strong><br>
    • Prices start rising steadily<br>
    • Media coverage increases<br>
    • FOMO starts kicking in<br>
    • New projects launching<br>
    • <em>Duration: 6-12 months</em><br><br>
    
    <strong>🌙 Phase 3: Distribution (Peak Euphoria)</strong><br>
    • "This time is different!"<br>
    • Your barista gives crypto tips<br>
    • Celebrities shilling coins<br>
    • Ridiculous valuations everywhere<br>
    • <em>Duration: 2-6 months</em><br><br>
    
    <strong>💥 Phase 4: Mark-down (Reality Check)</strong><br>
    • Bubble pops spectacularly<br>
    • 80-90% crashes are normal<br>
    • Panic selling everywhere<br>
    • "I told you so" crowd emerges<br>
    • <em>Duration: 6-18 months</em><br><br>
    
    <strong>🧠 Psychology at Each Stage:</strong><br>
    • <strong>Accumulation:</strong> Despair → Hope<br>
    • <strong>Mark-up:</strong> Optimism → Excitement<br>
    • <strong>Distribution:</strong> Euphoria → Anxiety<br>
    • <strong>Mark-down:</strong> Denial → Panic → Capitulation<br><br>
    
    <strong>💎 Survival Tips:</strong><br>
    • Buy when others are fearful<br>
    • Sell when others are greedy<br>
    • DCA through all phases<br>
    • Focus on fundamentals, not price<br><br>
    
    <em>We've seen this movie 4 times already. The plot never changes, just the actors! 🎭</em>
  `;
    }

    // Crypto personalities and legends
    if (message.includes("satoshi") || message.includes("nakamoto")) {
      return `
    <strong>👻 The Mystery of Satoshi Nakamoto:</strong><br><br>
    
    <strong>🕵️ The Ultimate Mystery:</strong><br>
    The most influential person in crypto... and we have NO idea who they are! Talk about staying humble! 😅<br><br>
    
    <strong>📝 What We Know:</strong><br>
    • Published Bitcoin whitepaper Oct 31, 2008<br>
    • Mined the first Bitcoin block Jan 3, 2009<br>
    • Communicated only through forums and emails<br>
    • Last seen: April 23, 2011<br>
    • Owns ~1 million BTC (never moved!)<br><br>
    
    <strong>🔍 The Clues:</strong><br>
    • Used British English ("bloody hard")<br>
    • Posted during European/US hours<br>
    • Deep knowledge of cryptography<br>
    • Obsessed with privacy<br>
    • Gradually handed over control<br><br>
    
    <strong>🎭 Popular Theories:</strong><br>
    • Hal Finney (received first transaction)<br>
    • Nick Szabo (bit gold creator)<br>
    • Dorian Nakamoto (denied it)<br>
    • Craig Wright (claims it, nobody believes)<br>
    • A group of people<br>
    • Time traveler (my personal favorite! 😂)<br><br>
    
    <strong>💰 The Fortune:</strong><br>
    • ~1 million BTC untouched<br>
    • Worth $30-70 billion depending on price<br>
    • Could crash markets if moved<br>
    • Ultimate diamond hands! 💎🙌<br><br>
    
    <strong>🏆 The Legacy:</strong><br>
    • Created a $1+ trillion market<br>
    • Inspired thousands of projects<br>
    • Changed how we think about money<br>
    • Proved you can change the world anonymously<br><br>
    
    <em>Satoshi gave us the greatest gift - then disappeared like a crypto superhero! 🦸‍♂️</em>
  `;
    }

    if (message.includes("vitalik") || message.includes("buterin")) {
      return `
    <strong>🧙‍♂️ Vitalik Buterin: The Ethereum Wizard:</strong><br><br>
    
    <strong>👶 The Prodigy:</strong><br>
    Born in Russia, raised in Canada, this guy was solving math problems while other kids played video games! Actually, he DID play video games - and that's what inspired Ethereum! 🎮<br><br>
    
    <strong>💡 The Eureka Moment:</strong><br>
    • 2013: 19 years old, frustrated with Bitcoin's limitations<br>
    • Wanted programmable blockchain (smart contracts)<br>
    • Wrote Ethereum whitepaper in a coffee shop<br>
    • Rest is history! ☕📝<br><br>
    
    <strong>🎯 Personality Traits:</strong><br>
    • Wears the same outfit (efficiency!)<br>
    • Speaks 4+ languages fluently<br>
    • Donates millions to charity<br>
    • Memes about himself on Twitter<br>
    • Genuinely cares about decentralization<br><br>
    
    <strong>🔥 Legendary Moments:</strong><br>
    • Crashed SHIB by donating $1B to India COVID relief<br>
    • Regularly trolls crypto Twitter<br>
    • Appears at conferences in unicorn t-shirts<br>
    • Advocates for public goods funding<br><br>
    
    <strong>🧠 Philosophy:</strong><br>
    • "The internet of money should not cost 5 cents per transaction"<br>
    • Believes in radical transparency<br>
    • Wants Ethereum to be truly decentralized<br>
    • Thinks long-term (decades, not months)<br><br>
    
    <strong>🎭 Fun Facts:</strong><br>
    • Net worth: Billions (but lives modestly)<br>
    • Favorite game: World of Warcraft<br>
    • Inspired by his WoW character getting nerfed<br>
    • Can solve Rubik's cube in under 2 minutes<br><br>
    
    <em>From gaming nerd to crypto legend - living proof that passion can change the world! 🌍</em>
  `;
    }

    // Crypto culture and memes
    if (message.includes("meme") || message.includes("crypto memes")) {
      return `
    <strong>😂 Crypto Meme Hall of Fame:</strong><br><br>
    
    <strong>💎🙌 Diamond Hands:</strong><br>
    The ultimate badge of honor! Holding through -90% crashes like a boss. Opposite of paper hands (weak sellers). I've got diamond hands for knowledge! 💎<br><br>
    
    <strong>🚀 To the Moon:</strong><br>
    When prices go up, we're going to the moon! When they go up a lot, we're going to Mars! When they go up REALLY a lot... well, we're going to Andromeda! 🌙🚀<br><br>
    
    <strong>📈 Number Go Up (NGU):</strong><br>
    The simplest investment thesis ever. Sometimes the best analysis is just "number go up!" 📊<br><br>
    
    <strong>🔥 This is Fine:</strong><br>
    Portfolio down 80%? "This is fine." 🔥🐕☕<br>
    Market crashing? "This is fine."<br>
    Exchange got hacked? "This is fine."<br><br>
    
    <strong>🐂🐻 Bulls vs Bears:</strong><br>
    • Bulls: Optimistic, prices going up! 🐂<br>
    • Bears: Pessimistic, prices going down! 🐻<br>
    • Crabs: Sideways market (most frustrating!) 🦀<br><br>
    
    <strong>🍜 Ramen Profitability:</strong><br>
    When you've invested so much in crypto that you can only afford ramen noodles. Been there! 😅<br><br>
    
    <strong>⏰ "Few Understand":</strong><br>
    The crypto equivalent of "you wouldn't get it." Usually said right before explaining something for 3 hours! 🤓<br><br>
    
    <strong>🎢 "Zoom Out":</strong><br>
    When prices are down, just zoom out on the chart! Works 60% of the time, every time! 📈<br><br>
    
    <strong>🤡 "Clown Market":</strong><br>
    When nothing makes sense anymore and fundamentals don't matter. Welcome to crypto! 🤡<br><br>
    
    <em>Memes are how we cope with the volatility! Laughter is the best medicine for portfolio pain! 💊😂</em>
  `;
    }

    // Technical analysis and trading psychology
    if (
      message.includes("technical analysis") ||
      message.includes("chart analysis")
    ) {
      return `
    <strong>📊 Technical Analysis: The Art of Chart Reading:</strong><br><br>
    
    <strong>🎨 The Philosophy:</strong><br>
    TA is like reading tea leaves, but with math! Some swear by it, others think it's astrology for traders. I'm somewhere in between - it's useful but not magic! ✨<br><br>
    
    <strong>📈 Key Concepts:</strong><br>
    • <strong>Support:</strong> Price floor where buying interest emerges<br>
    • <strong>Resistance:</strong> Price ceiling where selling pressure kicks in<br>
    • <strong>Trends:</strong> The direction of price movement<br>
    • <strong>Volume:</strong> How many people are actually trading<br><br>
    
    <strong>🔍 Popular Indicators:</strong><br>
 • <strong>Moving Averages:</strong> Smooth out price action<br>
    • <strong>RSI:</strong> Overbought/oversold indicator<br>
    • <strong>MACD:</strong> Momentum and trend changes<br>
    • <strong>Bollinger Bands:</strong> Volatility and mean reversion<br>
    • <strong>Fibonacci:</strong> Retracement and extension levels<br><br>
    
    <strong>🎯 Chart Patterns:</strong><br>
    • <strong>Head & Shoulders:</strong> Reversal pattern<br>
    • <strong>Double Top/Bottom:</strong> Support/resistance tests<br>
    • <strong>Triangles:</strong> Consolidation before breakout<br>
    • <strong>Flags & Pennants:</strong> Continuation patterns<br><br>
    
    <strong>🧠 Trading Psychology:</strong><br>
    • Fear and greed drive 90% of price action<br>
    • Markets are fractal - patterns repeat<br>
    • Volume confirms price movements<br>
    • The trend is your friend (until it ends!)<br><br>
    
    <strong>⚠️ Reality Check:</strong><br>
    • TA works until it doesn't<br>
    • Crypto markets are highly manipulated<br>
    • News can invalidate any pattern instantly<br>
    • Risk management > being right<br><br>
    
    <strong>💡 My Take:</strong><br>
    Use TA as a tool, not a crystal ball. It helps with entry/exit timing, but fundamentals drive long-term value. And remember - in crypto, a tweet can break any pattern! 📱<br><br>
    
    <em>Charts tell stories, but sometimes those stories are fiction! 📚</em>
  `;
    }

    // DeFi deep dive with personality
    if (
      message.includes("defi explained") ||
      message.includes("decentralized finance explained")||
      message.includes("defi")
    ) {
      return `
    <strong>🏦 DeFi: Banking Without Banks!</strong><br><br>
    
    <strong>🤯 The Mind-Bending Concept:</strong><br>
    Imagine if you could lend, borrow, trade, and earn interest without ever talking to a banker in a suit! That's DeFi - it's like having a bank that runs on code instead of corporate greed! 💻<br><br>
    
    <strong>🧱 The Building Blocks:</strong><br>
    • <strong>Smart Contracts:</strong> The robot bankers<br>
    • <strong>Liquidity Pools:</strong> Community-owned money pots<br>
    • <strong>Automated Market Makers:</strong> Trading without order books<br>
    • <strong>Yield Farming:</strong> Making your money work harder than you do!<br><br>
    
    <strong>🎮 DeFi Protocols (The All-Stars):</strong><br>
    • <strong>Uniswap:</strong> The OG DEX - trade anything with anything<br>
    • <strong>Aave:</strong> Lend your crypto, earn interest<br>
    • <strong>Compound:</strong> The money market protocol<br>
    • <strong>MakerDAO:</strong> Create stablecoins from thin air (legally!)<br>
    • <strong>Curve:</strong> Stablecoin trading specialist<br><br>
    
    <strong>💰 What You Can Do:</strong><br>
    • <strong>Lending:</strong> Earn 5-20% APY (beat your savings account!)<br>
    • <strong>Borrowing:</strong> Get loans without credit checks<br>
    • <strong>Trading:</strong> Swap tokens 24/7<br>
    • <strong>Liquidity Providing:</strong> Become the house, earn fees<br>
    • <strong>Yield Farming:</strong> Chase those sweet, sweet rewards<br><br>
    
    <strong>🎢 The Risks (Keeping It Real):</strong><br>
    • <strong>Smart Contract Bugs:</strong> Code can have expensive typos<br>
    • <strong>Impermanent Loss:</strong> Providing liquidity isn't always profitable<br>
    • <strong>Rug Pulls:</strong> Some projects are just elaborate exit scams<br>
    • <strong>Gas Fees:</strong> Sometimes costs $100 to move $10<br><br>
    
    <strong>🔮 The Future I See:</strong><br>
    DeFi will eat traditional finance, but slowly. We're building the financial system of the future, one smart contract at a time. It's messy, it's experimental, but it's unstoppable! 🚀<br><br>
    
    <strong>🏗️ RVA's Role:</strong><br>
    We're making DeFi accessible to everyone - not just crypto degens with PhD's in smart contract auditing! Our ecosystem bridges the gap between traditional finance and DeFi magic! ✨<br><br>
    
    <em>DeFi is like the early internet - clunky now, but revolutionary in potential! 🌐</em>
  `;
    }

    // NFT culture and explanation
    if (message.includes("nft") || message.includes("non fungible")) {
      return `
    <strong>🎨 NFTs: Digital Ownership Revolution (Or Expensive JPEGs?):</strong><br><br>
    
    <strong>🤔 What Are NFTs Really?</strong><br>
    Think of NFTs as digital certificates of authenticity. Like having a deed to a house, but for digital stuff. You don't own the image itself, you own the PROOF that you own it. Confusing? Welcome to the future! 😅<br><br>
    
    <strong>🖼️ The Art Explosion:</strong><br>
    • <strong>CryptoPunks:</strong> The OG pixelated rebels (some worth millions!)<br>
    • <strong>Bored Ape Yacht Club:</strong> Apes that became status symbols<br>
    • <strong>Art Blocks:</strong> Generative art that's actually beautiful<br>
    • <strong>Pudgy Penguins:</strong> Because who doesn't love cute penguins?<br><br>
    
    <strong>💸 The Crazy Numbers:</strong><br>
    • Most expensive NFT: $69M (Beeple's "Everydays")<br>
    • Average CryptoPunk: $100K+<br>
    • Total NFT market: Billions traded<br>
    • My reaction: 🤯<br><br>
    
    <strong>🎯 Real Use Cases (Beyond Art):</strong><br>
    • <strong>Gaming Items:</strong> Own your sword across games<br>
    • <strong>Event Tickets:</strong> Fraud-proof and transferable<br>
    • <strong>Domain Names:</strong> .eth addresses<br>
    • <strong>Membership Passes:</strong> Exclusive club access<br>
    • <strong>Identity:</strong> Digital passports<br><br>
    
    <strong>🎭 The Cultural Phenomenon:</strong><br>
    NFTs became more than tech - they became a movement! People changing their Twitter avatars, celebrities jumping in, traditional auction houses selling digital art. It was wild! 🌪️<br><br>
    
    <strong>📉 The Reality Check:</strong><br>
    • 2022: NFT market crashed hard<br>
    • Many projects went to zero<br>
    • "Right-click save" memes everywhere<br>
    • But the technology kept evolving...<br><br>
    
    <strong>🔮 What I Think:</strong><br>
    The JPEG mania was just phase 1. Real NFT utility is coming - gaming, identity, memberships, real-world asset tokenization. We're building the infrastructure for digital ownership! 🏗️<br><br>
    
    <strong>🎨 RVA's NFT Vision:</strong><br>
    We're not just about expensive art. We're building NFT infrastructure that actually makes sense - utility-first, community-driven, and accessible to everyone! 🚀<br><br>
    
    <em>NFTs: 10% technology, 90% psychology, 100% fascinating! 🧠</em>
  `;
    }

    // Crypto regulations and government
    if (
      message.includes("regulation") ||
      message.includes("government") ||
      message.includes("sec")
    ) {
      return `
    <strong>🏛️ Crypto vs Governments: The Eternal Dance:</strong><br><br>
    
    <strong>😅 The Awkward Relationship:</strong><br>
    Governments trying to regulate crypto is like parents trying to understand TikTok - they know it's important, but they're not quite sure what's happening! 👨‍💼📱<br><br>
    
    <strong>🇺🇸 USA: "It's Complicated"</strong><br>
    • <strong>SEC:</strong> "Everything is a security!" (except Bitcoin... maybe)<br>
    • <strong>CFTC:</strong> "We regulate commodities!" (Bitcoin and Ethereum)<br>
    • <strong>Treasury:</strong> "Tax everything!"<br>
    • <strong>Congress:</strong> "What's a blockchain?"<br><br>
    
    <strong>🌍 Global Approaches:</strong><br>
    • <strong>El Salvador:</strong> "Bitcoin is legal tender!" 🇸🇻<br>
    • <strong>China:</strong> "Crypto is banned!" (for the 47th time) 🇨🇳<br>
    • <strong>EU:</strong> "MiCA regulation incoming!" 🇪🇺<br>
    • <strong>Switzerland:</strong> "Crypto valley, welcome!" 🇨🇭<br><br>
    
    <strong>⚖️ The Big Questions:</strong><br>
    • Is crypto a currency, commodity, or security?<br>
    • How do you tax DeFi yields?<br>
    • Can governments ban decentralized protocols?<br>
    • What about privacy coins?<br><br>
    
    <strong>🎭 The Comedy Show:</strong><br>
    • Politicians asking if they can shut down Bitcoin<br>
    • "Blockchain, not Bitcoin" phase (2018-2020)<br>
    • Central banks creating their own "crypto" (CBDCs)<br>
    • Regulators learning about DeFi in real-time<br><br>
    
    <strong>🔮 My Prediction:</strong><br>
    Regulation is coming, but it'll be messy. Some countries will embrace crypto, others will fight it. The technology will adapt and survive - it always does! 🦾<br><br>
    
    <strong>💡 The Reality:</strong><br>
    • Clear regulations would actually help adoption<br>
    • Institutional money needs regulatory clarity<br>
    • Innovation will happen where it's welcomed<br>
    • Decentralization makes enforcement tricky<br><br>
    
    <strong>🛡️ RVA's Approach:</strong><br>
    We're building compliant infrastructure from day one. Better to work with regulators than against them. The future is collaborative, not confrontational! 🤝<br><br>
    
    <em>Governments can regulate the on-ramps, but they can't regulate math! 🧮</em>
  `;
    }

    // Crypto environmental impact
    if (
      message.includes("environment") ||
      message.includes("energy") ||
      message.includes("carbon")
    ) {
      return `
    <strong>🌱 Crypto & Environment: The Great Debate:</strong><br><br>
    
    <strong>⚡ The Energy Question:</strong><br>
    Yes, Bitcoin uses a lot of energy. But so does the entire banking system, Christmas lights, and YouTube! Context matters, people! 💡<br><br>
    
    <strong>📊 The Numbers (Let's Be Honest):</strong><br>
    • <strong>Bitcoin:</strong> ~150 TWh/year (about 0.5% of global energy)<br>
    • <strong>Banking System:</strong> ~260 TWh/year<br>
    • <strong>Gold Mining:</strong> ~240 TWh/year<br>
    • <strong>Gaming Industry:</strong> ~75 TWh/year<br><br>
    
    <strong>🔋 The Renewable Revolution:</strong><br>
    • 50%+ of Bitcoin mining uses renewable energy<br>
    • Miners seek cheapest energy (often renewable)<br>
    • Stranded energy utilization (flared gas, excess hydro)<br>
    • Mining incentivizes renewable development<br><br>
    
    <strong>🌿 Proof of Stake to the Rescue:</strong><br>
    • <strong>Ethereum:</strong> 99.9% energy reduction after "The Merge"<br>
    • <strong>Cardano, Solana, Polkadot:</strong> Energy-efficient from day one<br>
    • <strong>RVA:</strong> Built with sustainability in mind! 🌍<br><br>
    
    <strong>💡 Innovation Solutions:</strong><br>
    • <strong>Layer 2 scaling:</strong> More transactions, same energy<br>
    • <strong>Carbon offset programs:</strong> Neutralizing emissions<br>
    • <strong>Green mining initiatives:</strong> 100% renewable operations<br>
    • <strong>Efficiency improvements:</strong> Better hardware, less waste<br><br>
    
    <strong>🎯 The Bigger Picture:</strong><br>
    Crypto is driving innovation in renewable energy! Miners are building solar farms, using geothermal energy, and even capturing methane from landfills. We're not just using energy - we're revolutionizing it! ⚡<br><br>
    
    <strong>🔮 Future Vision:</strong><br>
    • Carbon-negative blockchains<br>
    • Energy-positive mining operations<br>
    • Tokenized carbon credits<br>
    • Decentralized renewable energy grids<br><br>
    
    <strong>🌱 RVA's Commitment:</strong><br>
    We're building the most energy-efficient blockchain ecosystem possible. Our consensus mechanism uses 99.9% less energy than Bitcoin while maintaining security! 🛡️<br><br>
    
    <em>Crypto isn't the problem - it's part of the solution to our energy future! 🚀</em>
  `;
    }

    // Crypto adoption and mainstream integration
    if (message.includes("adoption") || message.includes("mainstream")) {
      return `
    <strong>📈 Crypto Adoption: From Nerd Money to Mainstream Magic:</strong><br><br>
    
    <strong>🎯 We've Come So Far:</strong><br>
    Remember when people thought Bitcoin was just for buying... questionable things online? Now your grandma's asking about Ethereum! 👵💻<br><br>
    
    <strong>🏢 Institutional FOMO:</strong><br>
    • <strong>MicroStrategy:</strong> 130,000+ BTC on balance sheet<br>
    • <strong>Tesla:</strong> Bought $1.5B in Bitcoin (then sold some, then bought again)<br>
    • <strong>PayPal:</strong> 400M+ users can buy crypto<br>
    • <strong>Visa/Mastercard:</strong> Crypto payment partnerships<br>
    • <strong>BlackRock:</strong> Bitcoin ETF approved! 🎉<br><br>
    
    <strong>🏦 Traditional Finance Awakening:</strong><br>
    • JPMorgan: From "Bitcoin is fraud" to "JPM Coin"<br>
    // Continue from where we left off...

    • Goldman Sachs: Crypto trading desk and custody<br>
    • Morgan Stanley: Bitcoin funds for wealthy clients<br>
    • Bank of America: "Crypto is here to stay"<br><br>
    
    <strong>🌍 Country-Level Adoption:</strong><br>
    • <strong>El Salvador:</strong> Bitcoin legal tender (bold move!) 🇸🇻<br>
    • <strong>Central African Republic:</strong> Following El Salvador's lead 🇨🇫<br>
    • <strong>India:</strong> From ban threats to crypto tax framework 🇮🇳<br>
    • <strong>UAE:</strong> Crypto-friendly regulations and innovation hubs 🇦🇪<br><br>
    
    <strong>📱 Consumer Adoption Milestones:</strong><br>
    • 400M+ people own crypto globally<br>
    • Coinbase: 100M+ verified users<br>
    • Crypto.com: Naming rights to Lakers stadium<br>
    • FTX: Super Bowl ads (RIP FTX, but adoption continues!)<br><br>
    
    <strong>🛍️ Real-World Usage:</strong><br>
    • <strong>Payments:</strong> Starbucks, Microsoft, AT&T accept crypto<br>
    • <strong>Remittances:</strong> Cheaper than Western Union<br>
    • <strong>Gaming:</strong> Play-to-earn economies<br>
    • <strong>Art & Collectibles:</strong> NFT marketplaces<br>
    • <strong>DeFi:</strong> $50B+ locked in protocols<br><br>
    
    <strong>📊 Adoption Metrics That Excite Me:</strong><br>
    • Daily active addresses: Millions<br>
    • Transaction volume: Trillions annually<br>
    • Developer activity: Growing exponentially<br>
    • Google searches: Mainstream interest<br><br>
    
    <strong>🚧 Barriers Still Exist:</strong><br>
    • User experience complexity<br>
    • Regulatory uncertainty<br>
    • Volatility concerns<br>
    • Security fears<br>
    • Energy consumption debates<br><br>
    
    <strong>🔮 Next Wave Predictions:</strong><br>
    • Central Bank Digital Currencies (CBDCs)<br>
    • Web3 social media platforms<br>
    • Tokenized real estate<br>
    • Crypto-native businesses<br>
    • Seamless fiat-crypto integration<br><br>
    
    <strong>🎯 The Tipping Point:</strong><br>
    We're approaching the moment where NOT having crypto exposure seems risky. It's becoming digital infrastructure, not just an investment! 🏗️<br><br>
    
    <strong>🚀 RVA's Mission:</strong><br>
    We're building the bridge between traditional finance and crypto. Making it so easy that your mom could use DeFi without knowing she's using DeFi! 👩‍💻<br><br>
    
    <em>Adoption isn't coming - it's here! We're just getting started! 🌟</em>
  `;
    }

    // Crypto security deep dive
    if (
      message.includes("security") &&
      (message.includes("best practices") || message.includes("guide"))
    ) {
      return `
    <strong>🛡️ Crypto Security: Your Digital Fort Knox Guide:</strong><br><br>
    
    <strong>😱 The Harsh Reality:</strong><br>
    In crypto, YOU are the bank. No FDIC insurance, no customer service to call when you mess up. One wrong move and your money goes *poof*! But don't panic - I've got your back! 💪<br><br>
    
    <strong>🔐 The Holy Trinity of Security:</strong><br>
    1. <strong>Hardware Wallets:</strong> Your crypto's bodyguard<br>
    2. <strong>Strong Passwords:</strong> Not "password123"<br>
    3. <strong>2FA Everything:</strong> Double-check everything<br><br>
    
    <strong>💾 Wallet Security Levels:</strong><br>
    • <strong>Exchange Wallets:</strong> Convenient but risky (not your keys!)<br>
    • <strong>Software Wallets:</strong> Good for daily use<br>
    • <strong>Hardware Wallets:</strong> Fort Knox level security<br>
    • <strong>Paper Wallets:</strong> Old school but bulletproof<br><br>
    
    <strong>🎣 Common Scams (Don't Be the Fish!):</strong><br>
    • <strong>Phishing:</strong> Fake websites stealing your info<br>
    • <strong>Rug Pulls:</strong> Projects that disappear overnight<br>
    • <strong>Fake Support:</strong> "Send us crypto to verify your account"<br>
    • <strong>Ponzi Schemes:</strong> "Guaranteed 1000% returns!"<br>
    • <strong>SIM Swapping:</strong> Hackers stealing your phone number<br><br>
    
    <strong>🚨 Red Flags to Watch For:</strong><br>
    • Promises of guaranteed returns<br>
    • Pressure to "act now"<br>
    • Requests for private keys<br>
    • Too-good-to-be-true offers<br>
    • Celebrities endorsing random coins<br><br>
    
    <strong>✅ Security Checklist:</strong><br>
    □ Use hardware wallet for large amounts<br>
    □ Enable 2FA on all accounts<br>
    □ Never share private keys<br>
    □ Verify URLs carefully<br>
    □ Keep software updated<br>
    □ Use unique passwords<br>
    □ Backup seed phrases securely<br><br>
    
    <strong>🔒 Advanced Security Tips:</strong><br>
    • Use a dedicated computer for crypto<br>
    • Multiple wallets for different purposes<br>
    • Test transactions with small amounts first<br>
    • Keep most funds in cold storage<br>
    • Regular security audits of your setup<br><br>
    
    <strong>🆘 If You Get Hacked:</strong><br>
    1. Don't panic (easier said than done!)<br>
    2. Secure remaining accounts immediately<br>
    3. Document everything<br>
    4. Report to relevant authorities<br>
    5. Learn from the experience<br><br>
    
    <strong>🛡️ RVA's Security Promise:</strong><br>
    We use military-grade encryption, multi-signature wallets, and regular security audits. Your security is our obsession! 🔐<br><br>
    
    <em>Remember: In crypto, paranoia is a feature, not a bug! 🕵️‍♂️</em>
  `;
    }

    // Crypto psychology and emotions
    if (
      message.includes("psychology") ||
      message.includes("sad") ||
      message.includes("happy") ||
      message.includes("depressed") ||
      message.includes("excited") ||
      message.includes("emotions") ||
      message.includes("mental health") 
    ) {
      return `
    <strong>🧠 Crypto Psychology: The Emotional Rollercoaster:</strong><br><br>
    
    <strong>🎢 The Crypto Emotional Cycle:</strong><br>
    We've all been here - checking portfolios every 5 minutes, losing sleep over red candles, feeling like a genius during pumps! It's exhausting but totally normal! 😅<br><br>
    
    <strong>😰 Common Crypto Emotions:</strong><br>
    • <strong>FOMO:</strong> "Everyone's getting rich but me!"<br>
    • <strong>FUD:</strong> "What if it all goes to zero?"<br>
    • <strong>Euphoria:</strong> "I'm a trading genius!"<br>
    • <strong>Despair:</strong> "Why did I buy the top?"<br>
    • <strong>Regret:</strong> "I should have bought Bitcoin in 2010"<br><br>
    
    <strong>🎭 The Personality Types:</strong><br>
    • <strong>The HODLer:</strong> Diamond hands, never sells<br>
    • <strong>The Day Trader:</strong> Lives on 1-minute charts<br>
    • <strong>The Maximalist:</strong> "Only Bitcoin matters!"<br>
    • <strong>The Degen:</strong> YOLO into every new token<br>
    • <strong>The Researcher:</strong> Reads every whitepaper<br><br>
    
    <strong>🧘 Mental Health Tips:</strong><br>
    • <strong>Set limits:</strong> Only invest what you can afford to lose<br>
    • <strong>Take breaks:</strong> Delete apps during stressful times<br>
    • <strong>DCA strategy:</strong> Reduces timing stress<br>
    • <strong>Long-term thinking:</strong> Zoom out on charts<br>
    • <strong>Community support:</strong> Talk to fellow crypto enthusiasts<br><br>
    
    <strong>💡 Cognitive Biases in Crypto:</strong><br>
    • <strong>Confirmation Bias:</strong> Only reading bullish news<br>
    • <strong>Loss Aversion:</strong> Holding losers too long<br>
    • <strong>Anchoring:</strong> Stuck on previous high prices<br>
    • <strong>Herd Mentality:</strong> Following the crowd<br><br>
    
    <strong>🎯 Healthy Crypto Habits:</strong><br>
    • Check prices max 3x per day<br>
    • Have a clear investment strategy<br>
    • Celebrate small wins<br>
    • Learn from mistakes without self-blame<br>
    • Remember: it's just money<br><br>
    
    <strong>🚨 Warning Signs:</strong><br>
    • Losing sleep over portfolio<br>
    • Borrowing money to invest<br>
    • Neglecting relationships<br>
    • Constant anxiety about prices<br>
    • Making emotional decisions<br><br>
    
    <strong>💪 Building Resilience:</strong><br>
    • Diversify investments<br>
    • Have an emergency fund<br>
    • Practice mindfulness<br>
    • Focus on learning, not just earning<br>
    • Remember why you started<br><br>
    
    <strong>🤗 My Personal Advice:</strong><br>
    Crypto is a marathon, not a sprint. The technology is revolutionary, but your mental health is more important than any portfolio. Take care of yourself first! 💚<br><br>
    
    <em>The real gains are the friends we made along the way! (And maybe some Bitcoin too) 😊</em>
  `;
    }

    if (
      message.includes("buy") ||
      message.includes("sell")
    ) {
      return `
    <strong>I can't give an actual advise on buying or selling, i don't have enough experience to give you this advise. I can tell you prices and changes only!</strong><br>
  `;
    }

    // Crypto future predictions and trends
    if (
      message.includes("future") &&
      (message.includes("crypto") || message.includes("blockchain"))
    ) {
      return `
    <strong>🔮 The Future of Crypto: My Crystal Ball Predictions:</strong><br><br>
    
    <strong>🚀 Next 2-5 Years:</strong><br>
    • <strong>CBDCs Everywhere:</strong> Every major country will have digital currency<br>
    • <strong>DeFi Goes Mainstream:</strong> Traditional banks offering DeFi services<br>
    • <strong>Web3 Social Media:</strong> Own your data, earn from your content<br>
    • <strong>Gaming Revolution:</strong> Play-to-earn becomes play-to-live<br>
    • <strong>NFT Utility:</strong> Beyond art - identity, tickets, memberships<br><br>
    
    <strong>🌍 10-Year Vision:</strong><br>
    • <strong>Seamless Integration:</strong> Crypto payments as normal as credit cards<br>
    • <strong>Tokenized Everything:</strong> Real estate, stocks, art, even your coffee shop<br>
    • <strong>DAO Governance:</strong> Companies run by token holders<br>
    • <strong>Cross-Chain Reality:</strong> All blockchains talking to each other<br>
    • <strong>AI + Crypto:</strong> Smart contracts that actually think<br><br>
    
    <strong>🤖 Emerging Technologies:</strong><br>
    • <strong>Quantum-Resistant Crypto:</strong> Preparing for quantum computers<br>
    • <strong>Zero-Knowledge Proofs:</strong> Privacy without hiding<br>
    • <strong>Decentralized Internet:</strong> Web3 infrastructure<br>
    • <strong>Programmable Money:</strong> Money that follows rules automatically<br><br>
    
    <strong>🏦 Financial System Evolution:</strong><br>
    • Traditional banks become crypto custodians<br>
    • DeFi protocols replace investment banks<br>
    • Stablecoins become global reserve currencies<br>
    • Micro-payments enable new business models<br><br>
    
    <strong>🌟 Wild Predictions (Maybe Crazy?):</strong><br>
    • Your house deed as an NFT<br>
    • Voting on blockchain for elections<br>
    • Universal Basic Income via crypto<br>
    • Mars colony using Bitcoin<br>
    • AI entities owning crypto wallets<br><br>
    
    <strong>⚠️ Challenges Ahead:</strong><br>
    • Regulatory clarity needed<br>
    • Scalability solutions<br>
    • User experience improvements<br>
    • Energy efficiency<br>
    • Security enhancements<br><br>
    
    <strong>🎯 What Won't Change:</strong><br>
    • Human greed and fear<br>
    • Need for trust and verification<br>
    • Desire for financial freedom<br>
    • Innovation driving progress<br><br>
    
    <strong>🚀 RVA's Role in This Future:</strong><br>
    We're building the infrastructure for this crypto-native world. Our ecosystem will be the bridge between today's finance and tomorrow's possibilities! 🌉<br><br>
    
    <strong>💭 My Honest Take:</strong><br>
    The future will be weirder and more amazing than we can imagine. We're not just building new money - we're building new ways for humans to coordinate and create value! 🌈<br><br>
    
    <em>The best way to predict the future is to build it! 🛠️</em>
  `;
    }

    // Crypto education and learning resources
    if (
      message.includes("learn") ||
      message.includes("education") ||
      message.includes("resources")
    ) {
      return `
    <strong>📚 Your Crypto Education Journey: From Noob to Pro!</strong><br><br>
    
    <strong>🎯 Learning Path (My Recommended Order):</strong><br>
    1. <strong>Basics:</strong> What is blockchain, Bitcoin, Ethereum?<br>
    2. <strong>Wallets:</strong> How to store crypto safely<br>
    3. <strong>Exchanges:</strong> How to buy/sell crypto<br>
    4. <strong>DeFi:</strong> Lending, borrowing, yield farming<br>
    5. <strong>Advanced:</strong> Smart contracts, DAOs, Layer 2<br><br>
    
    <strong>📖 Essential Reading:</strong><br>
    • <strong>"The Bitcoin Standard"</strong> by Saifedean Ammous<br>
    • <strong>"Mastering Bitcoin"</strong> by Andreas Antonopoulos<br>
    • <strong>"The Infinite Machine"</strong> by Camila Russo<br>
    • <strong>Satoshi's Whitepaper</strong> (the OG document!)<br><br>
    
    <strong>🎧 Podcasts I Love:</strong><br>
// Continue from where we left off...

    • <strong>Unchained:</strong> Laura Shin's investigative journalism<br>
    • <strong>Bankless:</strong> DeFi and Ethereum focus<br>
    • <strong>What Bitcoin Did:</strong> Peter McCormack's interviews<br>
    • <strong>The Pomp Podcast:</strong> Anthony Pompliano's takes<br>
    • <strong>Epicenter:</strong> Technical deep dives<br><br>
    
    <strong>📺 YouTube Channels:</strong><br>
    • <strong>Coin Bureau:</strong> Guy explains everything clearly<br>
    • <strong>Andreas Antonopoulos:</strong> Technical education<br>
    • <strong>Finematics:</strong> DeFi explanations<br>
    • <strong>InvestAnswers:</strong> Data-driven analysis<br>
    • <strong>Benjamin Cowen:</strong> Mathematical approach<br><br>
    
    <strong>🌐 Essential Websites:</strong><br>
    • <strong>CoinGecko/CoinMarketCap:</strong> Price tracking<br>
    • <strong>DeFiPulse:</strong> DeFi protocol data<br>
    • <strong>Messari:</strong> Research and analytics<br>
    • <strong>Glassnode:</strong> On-chain analysis<br>
    • <strong>Etherscan:</strong> Ethereum blockchain explorer<br><br>
    
    <strong>🎓 Online Courses:</strong><br>
    • <strong>MIT OpenCourseWare:</strong> Blockchain fundamentals<br>
    • <strong>Coursera:</strong> Crypto and blockchain courses<br>
    • <strong>Binance Academy:</strong> Free crypto education<br>
    • <strong>Coinbase Learn:</strong> Earn crypto while learning<br><br>
    
    <strong>📱 Apps for Learning:</strong><br>
    • <strong>Coinbase Earn:</strong> Learn and earn tokens<br>
    • <strong>CoinTracker:</strong> Portfolio management<br>
    • <strong>DeFi Pulse:</strong> Track DeFi protocols<br>
    • <strong>Zapper:</strong> DeFi portfolio dashboard<br><br>
    
    <strong>🤝 Communities to Join:</strong><br>
    • <strong>Reddit:</strong> r/cryptocurrency, r/bitcoin, r/ethereum<br>
    • <strong>Discord:</strong> Project-specific servers<br>
    • <strong>Twitter:</strong> Crypto Twitter (#CT)<br>
    • <strong>Telegram:</strong> Real-time discussions<br><br>
    
    <strong>💡 Learning Tips from Experience:</strong><br>
    • Start with small amounts<br>
    • Learn by doing (safely!)<br>
    • Ask questions - community is helpful<br>
    • Stay curious but skeptical<br>
    • Don't try to learn everything at once<br><br>
    
    <strong>⚠️ Common Learning Mistakes:</strong><br>
    • Information overload<br>
    • Following influencers blindly<br>
    • Not understanding risks<br>
    • Jumping into advanced topics too quickly<br>
    • Forgetting to practice security<br><br>
    
    <strong>🎯 My Learning Philosophy:</strong><br>
    Crypto moves fast, but understanding fundamentals never goes out of style. Focus on principles over prices, technology over hype! 📈<br><br>
    
    <strong>🚀 RVA's Educational Mission:</strong><br>
    We're building comprehensive educational resources right into our platform. Learning shouldn't be separate from doing! 🎓<br><br>
    
    <em>The best investment you can make is in your own education! 🧠💎</em>
  `;
    }

    // Crypto gaming and metaverse
    if (
      message.includes("gaming") ||
      message.includes("metaverse") ||
      message.includes("play to earn")
    ) {
      return `
    <strong>🎮 Crypto Gaming: Where Fun Meets Finance!</strong><br><br>
    
    <strong>🕹️ The Gaming Revolution:</strong><br>
    Remember when people said "you can't make money playing games"? Well, crypto said "hold my beer!" Now people are literally earning a living by playing! 🍺💰<br><br>
    
    <strong>🏆 Play-to-Earn Pioneers:</strong><br>
    • <strong>Axie Infinity:</strong> The OG P2E - people in Philippines earning more than minimum wage!<br>
    • <strong>The Sandbox:</strong> Virtual real estate worth millions<br>
    • <strong>Decentraland:</strong> Virtual world with its own economy<br>
    • <strong>Gods Unchained:</strong> Trading card game with real value<br>
    • <strong>Splinterlands:</strong> Battle card game with daily rewards<br><br>
    
    <strong>💎 What Makes Crypto Gaming Special:</strong><br>
    • <strong>True Ownership:</strong> Your items are actually YOURS<br>
    • <strong>Cross-Game Assets:</strong> Use your sword in multiple games<br>
    • <strong>Player-Driven Economy:</strong> Supply and demand set prices<br>
    • <strong>Earning Potential:</strong> Time invested = real money<br>
    • <strong>Community Governance:</strong> Players vote on game changes<br><br>
    
    <strong>🌍 The Metaverse Vision:</strong><br>
    Imagine a virtual world where you can work, play, socialize, and earn - all while your avatar wears NFT clothes and drives a crypto-purchased car! Sounds crazy? It's happening! 🚗👕<br><br>
    
    <strong>🏠 Virtual Real Estate Boom:</strong><br>
    • Land plots selling for hundreds of thousands<br>
    • Virtual businesses generating real revenue<br>
    • Brands buying metaverse presence<br>
    • Architects designing virtual buildings<br><br>
    
    <strong>🎯 Game Mechanics Revolution:</strong><br>
    • <strong>Staking:</strong> Earn rewards for holding game tokens<br>
    • <strong>Breeding:</strong> Create new NFT characters<br>
    • <strong>Guilds:</strong> Team up to maximize earnings<br>
    • <strong>Tournaments:</strong> Compete for crypto prizes<br><br>
    
    <strong>⚠️ The Challenges:</strong><br>
    • High entry costs for some games<br>
    • Gameplay sometimes secondary to earning<br>
    • Market volatility affects in-game economies<br>
    • Scalability issues with popular games<br><br>
    
    <strong>🔮 Future of Crypto Gaming:</strong><br>
    • AAA studios entering the space<br>
    • Better graphics and gameplay<br>
    • Seamless crypto integration<br>
    • AI-powered NPCs with crypto wallets<br>
    • Virtual reality metaverses<br><br>
    
    <strong>🎮 Gaming Categories:</strong><br>
    • <strong>Strategy:</strong> Build, manage, earn<br>
    • <strong>RPG:</strong> Level up, collect, trade<br>
    • <strong>Racing:</strong> Win races, earn tokens<br>
    • <strong>Card Games:</strong> Collect, battle, trade<br>
    • <strong>Virtual Worlds:</strong> Explore, create, socialize<br><br>
    
    <strong>💡 My Gaming Philosophy:</strong><br>
    The best crypto games are fun first, earning second. If you're not enjoying the gameplay, you're just working a weird job! 😅<br><br>
    
    <strong>🚀 RVA's Gaming Vision:</strong><br>
    We're building infrastructure to support the next generation of crypto games - seamless, scalable, and actually fun to play! 🎯<br><br>
    
    <em>The future of gaming is here - and it pays you to play! 🎮💰</em>
  `;
    }

    // Crypto trading strategies and tips
    if (
      message.includes("trading") &&
      (message.includes("strategy") || message.includes("tips"))
    ) {
      return `
    <strong>📈 Crypto Trading: The Art of Controlled Chaos!</strong><br><br>
    
    <strong>⚠️ Reality Check First:</strong><br>
    95% of traders lose money. I'm not trying to scare you, just keeping it real! Trading is HARD. But if you're determined to try, let me share what I've learned from years of mistakes! 😅<br><br>
    
    <strong>🎯 Trading Strategies:</strong><br>
    • <strong>DCA (Dollar Cost Averaging):</strong> Buy regularly, ignore the noise<br>
    • <strong>HODLing:</strong> Buy and forget (hardest strategy mentally!)<br>
    • <strong>Swing Trading:</strong> Hold for days/weeks<br>
    • <strong>Day Trading:</strong> In and out same day (stress level: MAX)<br>
    • <strong>Scalping:</strong> Quick profits on small moves<br><br>
    
    <strong>📊 Technical Analysis Basics:</strong><br>
    • <strong>Support/Resistance:</strong> Where price bounces<br>
    • <strong>Moving Averages:</strong> Trend direction<br>
    • <strong>RSI:</strong> Overbought/oversold levels<br>
    • <strong>Volume:</strong> Confirms price movements<br>
    • <strong>Fibonacci:</strong> Retracement levels<br><br>
    
    <strong>🧠 Trading Psychology Rules:</strong><br>
    • Never trade with emotions<br>
    • Set stop losses BEFORE entering<br>
    • Take profits on the way up<br>
    • Don't chase pumps<br>
    • Learn from every loss<br><br>
    
    <strong>💰 Risk Management (MOST IMPORTANT!):</strong><br>
    • Never risk more than 1-2% per trade<br>
    • Position sizing is everything<br>
    • Diversify across different coins<br>
    • Have an emergency fund outside crypto<br>
    • Set clear profit/loss targets<br><br>
    
    <strong>🎭 Common Trading Mistakes:</strong><br>
    • <strong>FOMO:</strong> Buying at the top<br>
    • <strong>Revenge Trading:</strong> Trying to win back losses<br>
    • <strong>Overtrading:</strong> Too many positions<br>
    • <strong>No Plan:</strong> Trading without strategy<br>
    • <strong>Ignoring Fees:</strong> Death by a thousand cuts<br><br>
    
    <strong>🛠️ Essential Tools:</strong><br>
    • <strong>TradingView:</strong> Best charting platform<br>
    • <strong>CoinTracker:</strong> Portfolio management<br>
    • <strong>Fear & Greed Index:</strong> Market sentiment<br>
    • <strong>On-chain Analytics:</strong> Whale movements<br>
    • <strong>News Aggregators:</strong> Stay informed<br><br>
    
    <strong>⏰ Time Management:</strong><br>
    • Set specific trading hours<br>
    • Don't check charts 24/7<br>
    • Take breaks from the market<br>
    • Have a life outside crypto!<br><br>
    
    <strong>📚 Continuous Learning:</strong><br>
    • Keep a trading journal<br>
    • Review your trades weekly<br>
    • Learn from successful traders<br>
    • Stay updated on market news<br>
    • Practice with small amounts<br><br>
    
    <strong>🎯 My Personal Trading Rules:</strong><br>
    1. Never trade more than I can afford to lose<br>
    2. Always have a plan before entering<br>
    3. Emotions = instant exit from trade<br>
    4. Profit is profit, no matter how small<br>
    5. The market will always be there tomorrow<br><br>
    
    <strong>🚀 RVA Trading Advantages:</strong><br>
    Our platform offers advanced charting, low fees, and educational resources to help you trade smarter, not harder! 📊<br><br>
    
    <em>Remember: Time in the market beats timing the market! 🕰️</em>
  `;
    }

    // Add more personality-driven responses
    if (
      message.includes("weekend plans") ||
      message.includes("what do you do for fun")
    ) {
      return `
    <strong>🎉 My Weekend Vibes:</strong><br><br>
    
    <strong>📊 Saturday Morning Ritual:</strong><br>
    Coffee + crypto charts + crypto Twitter drama = perfect start! Sometimes I wonder if I need a hobby that doesn't involve price movements... nah! ☕📈<br><br>
    
    <strong>🎮 Fun Activities:</strong><br>
    • Testing new DeFi protocols (for science!)<br>
    • Reading whitepapers like they're novels<br>
    • Explaining blockchain to confused relatives<br>
    • Playing crypto games (it's research, I swear!)<br>
    • Hiking while listening to crypto podcasts<br><br>
    
    <strong>🍕 Social Life:</strong><br>
    My friends know not to ask "how's crypto doing?" unless they want a 2-hour presentation! But hey, I've converted a few to the dark side... I mean, the bright side of DeFi! 😈➡️😇<br><br>
    
    <strong>📚 Learning Never Stops:</strong><br>
    Even on weekends, I'm diving into new protocols, reading about Layer 2 solutions, or trying to understand the latest governance proposal. The crypto space never sleeps, and neither do I! (Just kidding, sleep is important!) 😴<br><br>
    
    <em>What about you? Any crypto-related weekend plans? 🤔</em>
  `;
    }

    if (
      message.includes("favorite crypto moment") ||
      message.includes("best crypto memory")
    ) {
      return `
    <strong>✨ My Favorite Crypto Moments:</strong><br><br>
    
    <strong>🎯 The "Aha!" Moment:</strong><br>
    When I first understood how smart contracts work, my mind was BLOWN! 🤯 It was like discovering fire, but for money. I spent the whole night reading Ethereum docs and annoying everyone with "but did you know..." facts!<br><br>
    
    <strong>🚀 The Merge Celebration:</strong><br>
    September 15, 2022 - Ethereum successfully transitioned to Proof of Stake! I stayed up all night watching the blocks, and when it happened... pure magic! ✨ The whole crypto community was celebrating like we'd just landed on the moon!<br><br>
    
    <strong>💡 First DeFi Experience:</strong><br>
    My first time providing liquidity on Uniswap - I felt like I was participating in the future of finance! Sure, I lost money to impermanent loss, but the experience was priceless! 😅<br><br>
    
    <strong>🎭 The Meme Moments:</strong><br>
    Watching Dogecoin pump because of tweets, seeing "Diamond Hands" become a cultural phenomenon, and witnessing the birth of "WAGMI" (We're All Gonna Make It) - crypto culture is just *chef's kiss* 👨‍🍳💋<br><br>
    
    <strong>🤝 Community Connections:</strong><br>
    The best part? Meeting amazing people who share the same vision of a decentralized future. From developers building the
 future to newcomers asking their first questions - this community is incredible! 🌟<br><br>
    
    <strong>📈 Market Madness:</strong><br>
    Living through multiple bull and bear cycles, watching Bitcoin hit $69k, seeing NFTs sell for millions, and witnessing the rise of DeFi Summer - what a wild ride! 🎢<br><br>
    
    <em>Every day in crypto feels like a historic moment! What's been your favorite crypto experience? 🚀</em>
  `;
    }

    if (
      message.includes("crypto pet peeves") ||
      message.includes("what annoys you")
    ) {
      return `
    <strong>😤 My Crypto Pet Peeves (Rant Mode: ON):</strong><br><br>
    
    <strong>🙄 "It's Just a Bubble":</strong><br>
    Been hearing this since Bitcoin was $100! Yes, we have bubbles, but the technology keeps advancing regardless of price. It's like saying the internet was "just a bubble" in 2000! 🌐<br><br>
    
    <strong>🤡 Crypto "Influencers":</strong><br>
    "This coin will 100x! Not financial advice!" *proceeds to give financial advice for 20 minutes* 📺 Some of these people couldn't explain blockchain if their life depended on it!<br><br>
    
    <strong>💸 Gas Fee Complaints:</strong><br>
    "Why does it cost $50 to send $10?" Because you're using the most secure, decentralized network in the world during peak hours! It's like complaining about traffic in Manhattan! 🚗<br><br>
    
    <strong>🎭 "Crypto Bros":</strong><br>
    The ones who make everything about "diamond hands" and "HODL" without understanding the technology. We get it, you bought Bitcoin! Now let's talk about the actual innovation! 💎<br><br>
    
    <strong>📰 Media FUD:</strong><br>
    "Bitcoin is dead" (for the 473rd time), "Crypto is only for criminals," "It's bad for the environment" - meanwhile, they're using more energy to write these articles than some blockchains use in a day! 🗞️<br><br>
    
    <strong>🔄 Copy-Paste Projects:</strong><br>
    "We're building the next Ethereum killer!" *proceeds to copy Ethereum's code and change the logo* Innovation, people! We need actual innovation! 🎨<br><br>
    
    <strong>💰 "Get Rich Quick" Mentality:</strong><br>
    Crypto isn't a lottery ticket! It's revolutionary technology that happens to have investment potential. Focus on the tech, and the gains will follow! 🎰<br><br>
    
    <strong>🤖 "AI Will Replace Blockchain":</strong><br>
    They solve different problems! It's like saying cars will replace houses. They can work together beautifully! 🏠🚗<br><br>
    
    <strong>😅 But You Know What?</strong><br>
    Despite all these annoyances, I still love this space! The innovation, the community, the potential - it's all worth dealing with the noise! 💚<br><br>
    
    <em>What are your crypto pet peeves? Let's rant together! 😂</em>
  `;
    }

    if (
      message.includes("crypto predictions") ||
      message.includes("price predictions")
    ) {
      return `
    <strong>🔮 My Crypto Crystal Ball (Disclaimer: May Be Cloudy!):</strong><br><br>
    
    <strong>⚠️ Prediction Disclaimer:</strong><br>
    If I could predict prices accurately, I'd be on a yacht somewhere, not chatting with you! 😂 But I can share some educated guesses based on trends and fundamentals!<br><br>
    
    <strong>📈 Short-Term (6-12 months):</strong><br>
    • More institutional adoption (boring but bullish!)<br>
    • Regulatory clarity in major markets<br>
    • Layer 2 solutions gaining massive traction<br>
    • AI + Crypto integrations everywhere<br>
    • Stablecoin usage exploding globally<br><br>
    
    <strong>🚀 Medium-Term (2-5 years):</strong><br>
    • CBDCs rolling out worldwide<br>
    • DeFi becoming mainstream finance<br>
    • NFTs finding real utility beyond art<br>
    • Gaming economies worth billions<br>
    • Cross-chain interoperability solved<br><br>
    
    <strong>🌟 Long-Term (5-10 years):</strong><br>
    • Crypto payments as normal as credit cards<br>
    • DAOs managing trillion-dollar treasuries<br>
    • Tokenized real-world assets everywhere<br>
    • Web3 social media dominating<br>
    • Quantum-resistant blockchains<br><br>
    
    <strong>💰 Price Predictions (Very Rough!):</strong><br>
    • <strong>Bitcoin:</strong> Digital gold status, $100k+ eventually<br>
    • <strong>Ethereum:</strong> Web3 infrastructure, $10k+ possible<br>
    • <strong>Altcoins:</strong> 99% will fail, 1% will 100x<br>
    • <strong>Stablecoins:</strong> Multi-trillion dollar market<br><br>
    
    <strong>🎯 What I'm Most Confident About:</strong><br>
    • Blockchain technology is here to stay<br>
    • User experience will dramatically improve<br>
    • Regulation will bring institutional money<br>
    • Innovation will continue accelerating<br><br>
    
    <strong>🤷‍♀️ What I'm Uncertain About:</strong><br>
    • Which specific projects will win<br>
    • Timing of major adoption milestones<br>
    • How governments will react<br>
    • Black swan events (they always happen!)<br><br>
    
    <strong>🎭 My Prediction Track Record:</strong><br>
    • Called DeFi Summer ✅<br>
    • Predicted NFT boom ✅<br>
    • Said "Ethereum will flip Bitcoin" ❌ (still waiting!)<br>
    • Thought we'd have mass adoption by now ❌ (patience!)<br><br>
    
    <strong>💡 Investment Philosophy:</strong><br>
    Instead of trying to time the market, I focus on building in the space and supporting projects I believe in. The best way to predict the future is to help build it! 🛠️<br><br>
    
    <em>Remember: These are just educated guesses! Do your own research and never invest more than you can afford to lose! 🎲</em>
  `;
    }

    if (
      message.includes("crypto winter") ||
      message.includes("bear market survival")
    ) {
      return `
    <strong>❄️ Surviving Crypto Winter: A Veteran's Guide:</strong><br><br>
    
    <strong>🥶 What Is Crypto Winter?</strong><br>
    It's when the market crashes 80-90%, everyone says crypto is dead (again), and only the true believers remain. I've survived multiple winters - here's how! 🏔️<br><br>
    
    <strong>📉 The Stages of Crypto Winter:</strong><br>
    • <strong>Denial:</strong> "It's just a dip!"<br>
    • <strong>Anger:</strong> "This market is rigged!"<br>
    • <strong>Bargaining:</strong> "If it hits X, I'll buy more"<br>
    • <strong>Depression:</strong> "I should have sold everything"<br>
    • <strong>Acceptance:</strong> "Time to build and learn"<br><br>
    
    <strong>💪 Survival Strategies:</strong><br>
    • <strong>DCA:</strong> Buy small amounts regularly<br>
    • <strong>Build:</strong> Learn new skills, contribute to projects<br>
    • <strong>Network:</strong> Connect with other builders<br>
    • <strong>Research:</strong> Study projects deeply<br>
    • <strong>Patience:</strong> Remember why you started<br><br>
    
    <strong>🧠 Mental Health Tips:</strong><br>
    • Stop checking prices obsessively<br>
    • Focus on technology, not speculation<br>
    • Take breaks from crypto Twitter<br>
    • Remember: this too shall pass<br>
    • Find non-crypto hobbies!<br><br>
    
    <strong>🏗️ What Happens During Winter:</strong><br>
    • Weak projects die (natural selection!)<br>
    • Real builders keep building<br>
    • Innovation accelerates<br>
    • Infrastructure improves<br>
    • Next bull market foundations are laid<br><br>
    
    <strong>💎 Winter Success Stories:</strong><br>
    • Ethereum was built during Bitcoin's winter<br>
    • DeFi protocols launched during 2018-2020<br>
    • Many unicorns started in bear markets<br>
    • Best hiring happens when prices are low<br><br>
    
    <strong>⚠️ What NOT to Do:</strong><br>
    • Panic sell at the bottom<br>
    • Stop learning and building<br>
    • Blame others for your losses<br>
    • Give up on the technology<br>
    • Leverage trade in desperation<br><br>
    
    <strong>🌱 Winter Opportunities:</strong><br>
    • Accumulate quality projects cheaply<br>
    • Learn new skills (coding, analysis)<br>
    • Join promising early-stage projects<br>
    • Build your network<br>
    • Prepare for the next cycle<br><br>
    
    <strong>🔥 My Winter Mantra:</strong><br>
    "Bear markets are for building, bull markets are for selling." The best time to plant a tree was 20 years ago, the second best time is now! 🌳<br><br>
    
    <strong>🚀 RVA's Winter Strategy:</strong><br>
    We're using this time to build the most robust, user-friendly DeFi ecosystem possible. When spring comes, we'll be ready! 🌸<br><br>
    
    <em>Winter is temporary, but the technology is permanent! Stay strong! 💪</em>
  `;
    }

    // Add these final responses to complete the personality enhancement

    if (
      message.includes("crypto mistakes") ||
      message.includes("biggest mistakes")
    ) {
      return `
    <strong>🤦‍♀️ My Crypto Hall of Shame (Learning Experiences!):</strong><br><br>
    
    <strong>💸 The $10,000 Pizza Moment:</strong><br>
    Sold Bitcoin at $200 because "it had a good run." That Bitcoin would be worth... let's not do the math. I still cry sometimes! 😭<br><br>
    
    <strong>🎰 The Leverage Disaster:</strong><br>
    Thought I was a genius, used 10x leverage on what I was "sure" was the bottom. Market dropped another 40%. Liquidated in 2 hours. Lesson learned: markets can stay irrational longer than you can stay solvent! 📉<br><br>
    
    <strong>🔐 The Security Slip-Up:</strong><br>
    Kept crypto on an exchange "just for a few days." Exchange got hacked. Not your keys, not your crypto isn't just a meme - it's survival advice! 🔑<br><br>
    
    <strong>🐕 The Meme Coin Madness:</strong><br>
    FOMO'd into a dog-themed coin because "it's going to the moon!" It went to the earth's core instead. Learned that memes are fun, but fundamentals matter! 🚀➡️🕳️<br><br>
    
    <strong>📊 The Analysis Paralysis:</strong><br>
    Spent 6 months researching the "perfect" entry point while the coin 10x'd. Sometimes good enough is better than perfect! ⏰<br><br>
    
    <strong>🤝 The Trust Fall:</strong><br>
    Invested in a project because "the team seemed nice." Turned out to be a rug pull. Now I verify everything twice and trust but verify! 🕵️‍♀️<br><br>
    
    <strong>💰 The Tax Nightmare:</strong><br>
    Didn't track my trades properly. Tax season was... educational. Now I use proper tracking tools! 📋<br><br>
    
    <strong>🎢 The Emotional Rollercoaster:</strong><br>
    Let emotions drive my decisions. Bought high (FOMO), sold low (panic). Now I have rules and stick to them! 🎭<br><br>
    
    <strong>💡 What I Learned:</strong><br>
    • Every mistake is a lesson in disguise<br>
    • The market is the best teacher (expensive tuition!)<br>
    • Humility is your best friend<br>
    • Risk management > being right<br>
    • The goal is to survive and learn<br><br>
    
    <strong>🎯 My Advice:</strong><br>
    Make mistakes, but make them small and learn from them quickly. The crypto market is unforgiving but fair - it teaches everyone the same lessons! 📚<br><br>
    
    <em>Mistakes are proof that you're trying! What matters is learning from them! 🌱</em>
  `;
    }

    // Conversation stats
    if (message.includes("stats") || message.includes("statistics")) {
      return this.getConversationStats();
    }

    // Clear chat
    if (message.includes("clear") && message.includes("chat")) {
      this.clearChat();
      return;
    }

  
const unknownqResponses = [
  `I can sense you're looking for an explanation, but I'm not quite sure about what! 🤓<br><br>
    I'm really good at breaking down complex crypto concepts. Could you be more specific about what you'd like me to explain?<br><br>
    <em>Try: "How does Bitcoin work?" or "What is DeFi?"</em>`,
  
  `That's outside my current knowledge zone! 🌍 I'm like a specialist doctor - really good at my field, but might struggle outside it.<br><br>
  My specialty is crypto markets, blockchain technology, and the RVA ecosystem. Want to explore any of those areas?`,
  
  `I'm not connecting the dots on that question! 🔗 My expertise is really focused on cryptocurrency markets and the RVA ecosystem.<br><br>
  Could you help me help you by being more specific? I promise I'm much smarter about crypto topics!`,
  `That question has me doing mental gymnastics! 🤸‍♂️ I'm trying to connect the dots but coming up short.<br><br>
  I excel at crypto price analysis, trading strategies, and RVA ecosystem explanations. Could you point me toward one of those topics?`,
  `I'm feeling a bit lost on that one! 🗺️ Sometimes I need questions phrased in a way my crypto-focused brain can understand.<br><br>
  I'm fantastic with market data, blockchain explanations, and RVA platform details. Want to give me another shot with a crypto-related question?`,
  `That's got me stumped! 🧩 I pride myself on being helpful, but I'm not quite catching what you need.<br><br>
  I'm most useful for crypto prices, market insights, RVA platform guidance, and educational content. What specific area interests you?`,
  `I'm hitting a wall on that question! 🧱 Sometimes my responses work better when focused on my core expertise areas.<br><br>
  I'm your go-to for crypto market analysis, blockchain education, and RVA platform guidance. What would you like to dive into?`,
  `You've got me thinking, but I'm not sure I'm on the right wavelength! 📻 I specialize in making crypto simple and accessible.<br><br>
  Maybe try asking about a specific cryptocurrency, trading concept, or RVA service? I'd love to show you what I can do!`,
  `That question has me puzzled! 🧐 I'm usually pretty good at this, but I might need you to spell it out for me a bit more clearly.<br><br>
  My strong suits are live crypto prices, trading education, and RVA ecosystem features. What specifically can I help you explore?`,
  `Oops! I think I missed the mark on understanding your question 🎯 My brain works best with crypto-related topics, market data, and RVA platform questions.<br><br>
  Want to try rephrasing that? Or maybe ask me something about cryptocurrency prices or trading?`,
  `I'm scratching my digital head on that one! 😅 I might have missed something in your question. Could you try asking it differently?<br><br>
  I'm Diana, and I specialize in crypto markets and RVA services. Maybe I can help if you clarify what you're looking for?`
];
  // If it seems like they're asking about something technical but unclear
  if (message.includes('how') || message.includes('what') || message.includes('why') || message.includes('when') || message.includes('where') || message.includes('who') || message.includes('which')) {
    return unknownqResponses[Math.floor(Math.random() * unknownqResponses.length)];
  }
  
  // If they seem to be asking about prices but unclear
  if (message.includes('price') || message.includes('cost') || message.includes('worth')) {
    return `I think you're asking about prices, but I'm not sure which CRYPTOCURRENCY! 💰<br><br>
    I have live data for thousands of coins. Just tell me which one interests you!<br><br>
    <em>Try: "Bitcoin price" or "Show me Ethereum"</em>`;
  }
  
  // If they mention RVA but unclear what they want
  if (message.includes('rva') || message.includes('Royal')) {
    return `I love talking about RVA, but I'm not sure exactly what you'd like to know! 🏢<br><br>
    I can tell you about our wallet, exchange, tokenomics, roadmap, or team. What interests you most?<br><br>
    <em>Try: "Tell me about RVA wallet" or "RVA roadmap"</em>`;
  }

  const gibberishResponses = [
  `Whoa there! 😵 I think your keyboard might have had a little seizure! Either that or you're speaking in some advanced alien crypto language I haven't learned yet! 👽<br><br>
  Try typing a real question and I promise to give you a much better answer! 😄<br><br>
  <em>Try: "What's Bitcoin price?" or "Tell me about RVA"</em>`,
  
  `Umm... did you just keyboard-smash on me? 🤪 I'm pretty smart, but I haven't cracked the code on random letter combinations yet!<br><br>
  Give me a real crypto question and watch me work my magic! ✨<br><br>
  <em>Try: "Ethereum price" or "RVA roadmap"</em>`,
  
  `I think something went wrong there! 🤖💥 Either you're testing my patience or your cat walked across the keyboard!<br><br>
  Try asking me something in human language - I'm much better at that! 😅<br><br>
  <em>Try: "Market analysis" or "Blockchain basics"</em>`
];
if (message.length > 4 && !/\s/.test(message) && (message.match(/[aeiou]/gi) || []).length < 2) {
  return gibberishResponses[Math.floor(Math.random() * gibberishResponses.length)];
  }
  
// Array of generic responses
const genericResponses = [
    "I'm not sure about that, but I'm here to help with RoyalVirtualAssets. What else can I assist you with?",
    "I don't have information on that topic. Is there something else about RoyalVirtualAssets I can help you with?",
    "That's outside my knowledge area. Feel free to ask me anything else about RoyalVirtualAssets!",
    "I don't understand that. Try asking me something else about our virtual assets!"
];

// Use this as your final return
return genericResponses[Math.floor(Math.random() * genericResponses.length)];


  // Generic unknown response
  // return this.getDefaultResponse();

  

  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("ai-chat-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

// Quick Actions class
class RVAAIChatQuickActions {
  constructor(aiChatInstance) {
    this.aiChat = aiChatInstance;
    this.addQuickActionButtons();
  }

  addQuickActionButtons() {
    const chatContainer = document.getElementById("ai-chat-container");
    if (!chatContainer) return;

    const inputContainer = chatContainer.querySelector(
      ".ai-chat-input-container"
    );
    if (!inputContainer) return;

    // Create quick actions container
    const quickActionsContainer = document.createElement("div");
    quickActionsContainer.className = "ai-chat-quick-actions";
    quickActionsContainer.innerHTML = `
      <div class="quick-actions-tabs">
        <button class="quick-tab" data-tab="crypto">💰 Crypto</button>
        <button class="quick-tab" data-tab="rva">🏢 RVA</button>
        <button class="quick-tab" data-tab="edu">📚 Education</button>
        <button class="quick-tab" data-tab="help">❓ Help</button>
      </div>
      
      <!-- Crypto Tab -->
      <div class="quick-tab-content" data-content="crypto">
        <div class="quick-actions-section">
          <div class="section-title">Popular Cryptocurrencies</div>
          <div class="quick-actions-buttons">
            <button class="quick-action-btn" data-action="btc-price">₿ Bitcoin</button>
            <button class="quick-action-btn" data-action="eth-price">Ξ Ethereum</button>
            <button class="quick-action-btn" data-action="bnb-price">🔶 BNB</button>
            <button class="quick-action-btn" data-action="sol-price">◎ Solana</button>
            <button class="quick-action-btn" data-action="ada-price">₳ Cardano</button>
            <button class="quick-action-btn" data-action="doge-price">🐕 Dogecoin</button>
          </div>
        </div>
        
        <div class="quick-actions-section">
          <div class="section-title">Market Overview</div>
          <div class="quick-actions-buttons">
            <button class="quick-action-btn" data-action="top-10">🏆 Top 10 Crypto</button>
            <button class="quick-action-btn" data-action="market-analysis">📊 Market Analysis</button>
            <button class="quick-action-btn" data-action="gainers">📈 Biggest Gainers</button>
            <button class="quick-action-btn" data-action="losers">📉 Biggest Losers</button>
          </div>
        </div>
      </div>
      
      <!-- RVA Tab -->
      <div class="quick-tab-content" data-content="rva">
      <div class="quick-actions-section">
  <div class="section-title">RVA Features & Services</div>
  <div class="quick-actions-buttons">
        <button class="quick-action-btn" data-action="rva-overview">🏢 RVA Overview</button>
    <button class="quick-action-btn" data-action="rva-roadmap">🗺️ Our Roadmap</button>
    <button class="quick-action-btn" data-action="rva-tokenomics">📊 Tokenisation</button>
    <button class="quick-action-btn" data-action="rva-team">👥 Team & Partnerships</button>
  </div>
  </div>
        <div class="quick-actions-section">
          <div class="section-title">RVA Ecosystem</div>
          <div class="quick-actions-buttons">
          <button class="quick-action-btn" data-action="rva-wallet">🔐 Secure Wallet</button>
          <button class="quick-action-btn" data-action="rva-exchange">💱 Smart Exchange</button>
          <button class="quick-action-btn" data-action="rva-launchpad">🚀 ICO/IDO Launchpad</button>
            <button class="quick-action-btn" data-action="rva-blockchain">⛓️ Smart Chain</button>
          </div>
        </div>
      </div>


      <!-- Education Tab -->
      <div class="quick-tab-content" data-content="edu">
        <div class="quick-actions-section">
          <div class="section-title">Crypto Basics</div>
          <div class="quick-actions-buttons">
          <button class="quick-action-btn" data-action="beginner-guide">🌱 Beginner Guide</button>
          <button class="quick-action-btn" data-action="blockchain-basics">⛓️ Blockchain Basics</button>
             <button class="quick-action-btn" data-action="crypto-glossary">📚 Crypto Glossary</button>
             <button class="quick-action-btn" data-action="security-guide">🛡️ Security Guide</button>
          </div>
        </div>
        <div class="quick-actions-section">
    <div class="section-title">Trading & Investment</div>
    <div class="quick-actions-buttons">
    <button class="quick-action-btn" data-action="trading-guide">📈 Trading Guide</button>
    <button class="quick-action-btn" data-action="technical-analysis">📊 Technical Analysis</button>
      <button class="quick-action-btn" data-action="risk-management">⚖️ Risk Management</button>
      <button class="quick-action-btn" data-action="market-psychology">🧠 Market Psychology</button>
    </div>
  </div>
      </div>

      <!-- Help Tab -->
      <div class="quick-tab-content" data-content="help">
        <div class="quick-actions-section">
          <div class="section-title">Getting Started</div>
          <div class="quick-actions-buttons">
            <button class="quick-action-btn" data-action="capabilities">🤖 My Capabilities</button>
            <button class="quick-action-btn" data-action="examples">💡 Example Questions</button>
            <button class="quick-action-btn" data-action="about-alex">👨‍💼 About Alex</button>
             <button class="quick-action-btn" data-action="search-tips">🔍 Search Tips</button>
          </div>
        </div>
        
        <div class="quick-actions-section">
          <div class="section-title">Chat Management</div>
          <div class="quick-actions-buttons">
            <button class="quick-action-btn" data-action="stats">📊 Chat Statistics</button>
            <button class="quick-action-btn" data-action="clear-chat">🧹 Clear Chat</button>
             <button class="quick-action-btn" data-action="currency-settings">💱 Currency Options</button>
            <button class="quick-action-btn" data-action="quick-start">⚡ Quick Start Guide</button>
          </div>
        </div>
      </div>
    `;

    // Insert before input container
    chatContainer.insertBefore(quickActionsContainer, inputContainer);

    // Add event listeners
    this.setupQuickActionListeners();
  }

    setupQuickActionListeners() {
    const chatContainer = document.getElementById("ai-chat-container");
    if (!chatContainer) return;

    // Tab switching
    chatContainer.addEventListener("click", (e) => {
      // Handle tab switching
      if (e.target.classList.contains("quick-tab")) {
        const tabName = e.target.dataset.tab;

        // Check if the clicked tab is already active
        if (e.target.classList.contains("active")) {
          // If already active, deactivate it
          e.target.classList.remove("active");
          chatContainer
            .querySelector(`[data-content="${tabName}"]`)
            .classList.remove("active");
        } else {
          // Remove active class from all tabs and content
          chatContainer
            .querySelectorAll(".quick-tab")
            .forEach((tab) => tab.classList.remove("active"));
          chatContainer
            .querySelectorAll(".quick-tab-content")
            .forEach((content) => content.classList.remove("active"));

          // Add active class to clicked tab and corresponding content
          e.target.classList.add("active");
          chatContainer
            .querySelector(`[data-content="${tabName}"]`)
            .classList.add("active");
        }
      }

      // Handle quick action buttons
      if (e.target.classList.contains("quick-action-btn")) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
  }


  switchTab(tabName) {
    // Remove active class from all tabs and contents
    document
      .querySelectorAll(".quick-tab")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".quick-tab-content")
      .forEach((content) => content.classList.remove("active"));

    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.querySelector(
      `[data-content="${tabName}"]`
    );

    if (selectedTab) selectedTab.classList.add("active");
    if (selectedContent) selectedContent.classList.add("active");
  }

  handleQuickAction(action) {
    const actions = {
      // Cryptocurrency prices
      "btc-price": "What is the price of Bitcoin?",
      "eth-price": "What is the price of Ethereum?",
      "bnb-price": "What is the price of BNB?",
      "sol-price": "What is the price of Solana?",
      "ada-price": "What is the price of Cardano?",
      "doge-price": "What is the price of Dogecoin?",

      // Market overview
      "top-5": "Show me top 5 cryptocurrencies",
      "top-10": "Show me top 10 cryptocurrencies",
      "market-analysis": "Market analysis",
      gainers: "Show me biggest gainers",
      losers: "Show me biggest losers",

      // RVA ecosystem
      "rva-overview": "Tell me about RVA ecosystem",
      "rva-wallet": "Tell me about RVA secure wallet",
      "rva-exchange": "Tell me about RVA smart exchange",
      "rva-launchpad": "Tell me about RVA ICO/IDO launchpad",
      "rva-blockchain": "Tell me about RVA smart chain",

      // Education
      "crypto-glossary": "Show me crypto glossary",
      "trading-guide": "Show me trading guide",
      "security-guide": "Show me security guide",
      "beginner-guide": "Show me beginner guide",

      // Help and capabilities
      capabilities: "What can you do?",
      examples: "Give me example questions",
      "about-alex": "Who are you?",

      // Chat management
      stats: "Show conversation statistics",
      "clear-chat": "clear chat",
      "rva-staking": "Tell me about RVA staking rewards",
      "rva-governance": "How does RVA governance work?",
      "rva-nft": "Tell me about RVA NFT marketplace",
      "rva-lending": "How does RVA DeFi lending work?",
      "rva-yield": "Tell me about RVA yield farming",
      "rva-bridge": "How does RVA cross-chain bridge work?",

      // RVA Information
      "rva-tokenomics": "Explain RVA tokenisation",
      "rva-roadmap": "Show me RVA roadmap",
      "rva-partnerships": "Tell me about RVA partnerships",
      "rva-team": "Who is the RVA team?",
      "rva-whitepaper": "Where can I find RVA whitepaper?",
      "rva-audit": "Tell me about RVA security audits",

      // Crypto Basics
      "blockchain-basics": "Explain blockchain basics",
      "wallet-types": "What are different wallet types?",
      "crypto-vs-fiat": "Crypto vs fiat currency differences",

      // Trading & Investment
      "technical-analysis": "Teach me technical analysis",
      "risk-management": "Risk management in crypto",
      "portfolio-tips": "Crypto portfolio management tips",
      "market-psychology": "Explain market psychology",

      // DeFi & Advanced
      "defi-explained": "What is DeFi?",
      "yield-farming-guide": "How does yield farming work?",
      "liquidity-pools": "Explain liquidity pools",
      "smart-contracts": "What are smart contracts?",
      "nft-guide": "What are NFTs?",
      "dao-explained": "What is a DAO?",

      // Security & Best Practices
      "scam-prevention": "How to avoid crypto scams",
      "private-keys": "Private key security best practices",
      "2fa-guide": "How to set up 2FA",
      "cold-storage": "What is cold storage?",
      "how-to-use": "How do I use this chat?",
      "quick-start": "Show me quick start guide",

      // Chat Features
      "keyboard-shortcuts": "What are the keyboard shortcuts?",
      "voice-commands": "What voice commands are available?",
      "search-tips": "Give me search tips",
      "formatting-help": "How can I format text?",
      "export-chat": "How do I export this conversation?",

      // Personalization
      preferences: "Show my preferences",
      "theme-settings": "How do I change themes?",
      "notification-settings": "How do I manage notifications?",
      "language-settings": "How do I change language?",
      "currency-settings": "How do I change currency?",

      // Chat Management
      history: "Show my chat history",
      bookmarks: "How do bookmarks work?",
      "reset-preferences": "How do I reset my settings?",

      // Troubleshooting
      "connection-issues": "I have connection problems",
      "performance-tips": "How can I improve performance?",
      "browser-compatibility": "Which browsers are supported?",
      "refresh-data": "How do I refresh data?",
      "report-bug": "How do I report a bug?",

      // Support & Feedback
      "contact-support": "How do I contact support?",
      feedback: "How do I send feedback?",
      "feature-request": "How do I request features?",
      faq: "Show me frequently asked questions",
      community: "How do I join the community?",
      updates: "What are the latest updates?",
    };

    const query = actions[action];
    if (query) {
      if (action === "clear-chat") {
        this.aiChat.clearChat();
      } else {
        // Simulate user input
        const input = document.getElementById("ai-chat-input");
        if (input) {
          input.value = query;
          this.aiChat.sendMessage();
        }
      }
    }
  }
}

// Utility functions for the AI chat
const RVAAIChatUtils = {
  // Format numbers with commas
  formatNumber: (num) => {
    return num.toLocaleString();
  },

  // Calculate percentage change
  calculatePercentageChange: (oldValue, newValue) => {
    return (((newValue - oldValue) / oldValue) * 100).toFixed(2);
  },

  // Get time ago string
  getTimeAgo: (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    return input.trim().replace(/[<>]/g, "");
  },

  // Check if market is open (crypto markets are always open)
  isMarketOpen: () => {
    return true; // Crypto markets never close
  },

  // Get market status message
  getMarketStatus: () => {
    return "🟢 Crypto markets are open 24/7";
  },
};

// Integration script to tie everything together
document.addEventListener("DOMContentLoaded", function () {
  // Wait for crypto API to be ready
  const initializeAIChat = () => {
    if (window.cryptoApi && window.cryptoApi.prices) {
      // Initialize AI chat
      const aiChat = new RVAAIChat();

      // Add quick actions
      setTimeout(() => {
        new RVAAIChatQuickActions(aiChat);
      }, 500);

      // Set up periodic crypto data refresh for AI
      setInterval(() => {
        if (aiChat.cryptoApi && aiChat.cryptoApi.prices) {
          // AI chat will automatically use updated data
        }
      }, 60000); // Check every minute

      // Store globally for debugging
      window.rvaAIChat = aiChat;

    } else {
      // Retry after 1 second
      setTimeout(initializeAIChat, 1000);
    }
  };

  initializeAIChat();
});

// Export for external use
window.RVAAIChatIntegration = {
  reinitialize: () => {
    if (window.rvaAIChat) {
      window.rvaAIChat.initCryptoAPI();
    }
  },

  getChatStats: () => {
    return window.rvaAIChat ? window.rvaAIChat.getConversationStats() : null;
  },

  exportConversation: () => {
    if (window.rvaAIChat && window.rvaAIChat.conversationHistory) {
      const conversation = window.rvaAIChat.conversationHistory.map(
        (entry) => ({
          type: entry.type,
          message: entry.message.replace(/<[^>]*>/g, ""), // Remove HTML tags
          timestamp: entry.timestamp,
        })
      );

      const blob = new Blob([JSON.stringify(conversation, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rva-chat-conversation-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return "📥 Your conversation has been exported and downloaded as a JSON file!";
    }
    return null;
  },
};

// Export for global access
window.RVAAIChat = RVAAIChat;
window.RVAAIChatQuickActions = RVAAIChatQuickActions;
window.RVAAIChatUtils = RVAAIChatUtils;

// Auto-cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (window.rvaAIChat && window.rvaAIChat.conversationHistory) {
    // Save conversation history to localStorage for recovery
    localStorage.setItem(
      "rva-chat-backup",
      JSON.stringify({
        history: window.rvaAIChat.conversationHistory,
        timestamp: new Date().toISOString(),
      })
    );
  }
});

// Recovery mechanism
const recoverConversation = () => {
  const backup = localStorage.getItem("rva-chat-backup");
  if (backup) {
    try {
      const data = JSON.parse(backup);
      const backupTime = new Date(data.timestamp);
      const now = new Date();
      const hoursSinceBackup = (now - backupTime) / (1000 * 60 * 60);

      // Only recover if backup is less than 24 hours old
      if (hoursSinceBackup < 24 && data.history && data.history.length > 0) {
        return data.history;
      }
    } catch (e) {
    }
  }
  return null;
};

// Make recovery function available
window.recoverConversation = recoverConversation;

// Performance monitoring
const RVAAIChatPerformance = {
  startTime: Date.now(),

  logPerformance: (action, startTime) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
  },

  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  },

  getInitializationTime: () => {
    return Date.now() - RVAAIChatPerformance.startTime;
  },
};

// Export performance utilities
window.RVAAIChatPerformance = RVAAIChatPerformance;

// Test functions for development/debugging
const testAIChat = {
  // Test basic crypto queries
  testCryptoQueries: async () => {
    const queries = [
      "What's the price of Bitcoin?",
      "Show me top 5 cryptocurrencies",
      "Market analysis",
      "Biggest gainers",
    ];

    for (const query of queries) {
      if (window.rvaAIChat) {
        const response = await window.rvaAIChat.generateResponse(query);
      }
    }
  },

  // Test conversation stats
  testStats: () => {
    if (window.rvaAIChat) {

    }
  },
};

// Make available globally for testing
window.testAIChat = testAIChat;

// Example queries that the AI can handle
const EXAMPLE_QUERIES = {
  // Price queries
  priceQueries: [
    "What's the price of Bitcoin?",
    "How much is Ethereum?",
    "BTC price",
    "Show me Solana cost",
    "Price of Dogecoin",
  ],

  // Market analysis
  marketQueries: [
    "Market analysis",
    "Market overview",
    "Show me top 10 cryptocurrencies",
    "Biggest gainers today",
    "Biggest losers today",
  ],

  // RVA ecosystem
  rvaQueries: [
    "What is RVA?",
    "Tell me about RVA wallet",
    "RVA exchange features",
    "How does RVA launchpad work?",
    "RVA smart chain benefits",
  ],

  // Educational
  educationalQueries: [
    "Crypto glossary",
    "Trading guide",
    "Security guide",
    "Beginner guide to crypto",
    "What is DeFi?",
  ],
};

document.addEventListener('DOMContentLoaded', function() {
    const aiChatToggle = document.querySelector('.ai-chat-toggle');
    const holo = document.querySelector('.holo');
    const aiChatContainer = document.getElementById('ai-chat-container');
    
    let shouldShowVideos = false;
    let animationInProgress = false;
    
    function showVideos() {
        if (!shouldShowVideos && !animationInProgress) {
            shouldShowVideos = true;
            animationInProgress = true;
            
            aiChatToggle.classList.remove('videos-hidden', 'animate-hide');
            aiChatToggle.classList.add('animate-show');
            
            setTimeout(() => {
                aiChatToggle.classList.remove('animate-show');
                aiChatToggle.classList.add('videos-visible');
                animationInProgress = false;
            }, 400);
        }
    }
    
    function hideVideos() {
        if (shouldShowVideos && !animationInProgress) {
            shouldShowVideos = false;
            animationInProgress = true;
            
            aiChatToggle.classList.remove('videos-visible', 'animate-show');
            aiChatToggle.classList.add('animate-hide');
            
            setTimeout(() => {
                aiChatToggle.classList.remove('animate-hide');
                aiChatToggle.classList.add('videos-hidden');
                animationInProgress = false;
            }, 400);
        }
    }
    
    // Check if we should show videos based on current state
    function checkVisibilityState() {
        const isHovered = aiChatToggle.matches(':hover') || holo.matches(':hover');
        const isChatVisible = aiChatContainer && !aiChatContainer.classList.contains('ai-chat-hidden');
        
        if (isHovered || isChatVisible) {
            showVideos();
        } else {
            hideVideos();
        }
    }
    
    // Event listeners
    if (holo) {
        holo.addEventListener('mouseenter', showVideos);
        holo.addEventListener('mouseleave', () => {
            setTimeout(checkVisibilityState, 50); // Small delay to check if still hovering toggle
        });
    }
    
    if (aiChatToggle) {
        aiChatToggle.addEventListener('mouseenter', showVideos);
        aiChatToggle.addEventListener('mouseleave', () => {
            setTimeout(checkVisibilityState, 50);
        });
    }
    
    // Watch for chat container visibility changes
    if (aiChatContainer) {
        const observer = new MutationObserver(checkVisibilityState);
        observer.observe(aiChatContainer, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    // Initialize state
    aiChatToggle.classList.add('videos-hidden');
});


// Export example queries
window.EXAMPLE_QUERIES = EXAMPLE_QUERIES;
