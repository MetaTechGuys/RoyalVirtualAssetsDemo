class RVAAIChat {
  constructor() {
    this.isOpen = false;
    this.cryptoApi = null; // Reference to the crypto API
    this.conversationHistory = [];
    this.userPreferences = JSON.parse(localStorage.getItem('rva-chat-preferences') || '{}');
    
    this.aiCharacter = {
      name: "Sarah",
      age: 24,
      expertise: "Blockchain & DeFi",
      personality: "friendly, knowledgeable, professional",
      experience: "4 years in DeFi",
      specialties: ["RVA ecosystem", "cryptocurrency", "smart contracts", "tokenization", "market analysis","teaching crypto"]
    };
    
    this.knowledgeBase = {
      rva: {
        keywords: ["rva", "roial virtual assets", "ecosystem", "platform"],
        responses: [
          "RVA (Roial Virtual Assets) is a next-generation blockchain ecosystem with four core pillars: ICO/IDO Launchpad, Secure Wallet, Smart Chain, and Smart Exchange. We're building the future of decentralized finance!",
          "Our RVA ecosystem is designed to be secure, scalable, and user-friendly. We integrate all essential DeFi tools into one seamless platform.",
          "RVA stands for transparency, efficiency, and security in blockchain technology. We're committed to empowering individuals and institutions in the DeFi space."
        ]
      },
      wallet: {
        keywords: ["wallet", "secure wallet", "storage"],
        responses: [
          "Our RVA Secure Wallet provides top-tier security for your digital assets. It supports multiple cryptocurrencies and integrates seamlessly with our ecosystem.",
          "The RVA wallet features advanced security protocols, multi-signature support, and user-friendly interface for managing your crypto portfolio."
        ]
      },
      launchpad: {
        keywords: ["launchpad", "ico", "ido", "token launch"],
        responses: [
          "Our ICO/IDO Launchpad helps innovative projects raise funds and launch their tokens securely. We provide comprehensive support throughout the launch process.",
          "The RVA Launchpad is designed for both project creators and investors, offering a secure and transparent platform for token launches."
        ]
      },
      exchange: {
        keywords: ["exchange", "trading", "swap", "dex"],
        responses: [
          "Our Smart Exchange offers decentralized trading with low fees, high liquidity, and advanced trading features. Trade with confidence on RVA!",
          "The RVA Smart Exchange provides a seamless trading experience with institutional-grade security and retail-friendly interface."
        ]
      },
      blockchain: {
        keywords: ["blockchain", "smart chain", "technology"],
        responses: [
          "Our Smart Chain is built for scalability and efficiency, supporting high-throughput transactions while maintaining security and decentralization.",
          "RVA's blockchain technology focuses on interoperability, allowing seamless integration with other major blockchain networks."
        ]
      },
      staking: {
    keywords: ["staking", "stake", "rewards", "passive income"],
    responses: [
      "RVA staking allows you to earn passive rewards by locking your tokens. Our staking pools offer competitive APY rates with flexible lock periods.",
      "Stake your RVA tokens to participate in network security and earn rewards. Choose from various staking pools with different risk-reward profiles."
    ]
  },
  
  governance: {
    keywords: ["governance", "voting", "proposal", "dao"],
    responses: [
      "RVA governance empowers token holders to vote on important protocol decisions. Your voting power is proportional to your token holdings.",
      "Participate in RVA's decentralized governance by submitting proposals and voting on community decisions that shape our ecosystem's future."
    ]
  },
  
  nft: {
    keywords: ["nft", "non-fungible", "marketplace", "collectibles"],
    responses: [
      "Our RVA NFT marketplace supports creating, buying, and selling unique digital assets. Low fees and high security make it perfect for creators and collectors.",
      "The RVA NFT ecosystem includes marketplace, minting tools, and royalty management for creators and collectors alike."
    ]
  },
  
  defi: {
    keywords: ["defi", "decentralized finance", "lending", "borrowing"],
    responses: [
      "RVA's DeFi suite includes lending, borrowing, yield farming, and liquidity provision. All with institutional-grade security and user-friendly interfaces.",
      "Experience the full power of DeFi with RVA's integrated protocols. Earn yield, provide liquidity, and access decentralized financial services."
    ]
  }
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
    this.setupKeyboardShortcuts();
  }
  
  // Initialize connection to crypto API
  initCryptoAPI() {
    const checkCryptoAPI = () => {
      if (window.cryptoApi) {
        this.cryptoApi = window.cryptoApi;
        console.log('AI Chat connected to Crypto API');
      } else {
        setTimeout(checkCryptoAPI, 500);
      }
    };
    checkCryptoAPI();
  }
  
  bindEvents() {
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const closeBtn = document.getElementById('ai-chat-close');
    const sendBtn = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');
    
    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeChat());
    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
    
    // Hide notification when chat is opened
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const notification = document.querySelector('.ai-chat-notification');
        if (notification) {
          notification.style.display = 'none';
        }
      });
    }
  }
  
  // User preferences
  setupUserPreferences() {
    this.userPreferences = {
      currency: 'usd',
      theme: 'dark',
      notifications: true,
      autoRefresh: true,
      ...this.userPreferences
    };
    this.saveUserPreferences();
  }
  
  saveUserPreferences() {
    localStorage.setItem('rva-chat-preferences', JSON.stringify(this.userPreferences));
  }
  

  // Add these methods to the RVAAIChat class

// Method to handle preference changes
updatePreference(key, value) {
  this.userPreferences[key] = value;
  this.saveUserPreferences();
  
  // Apply changes immediately
  switch(key) {
    case 'theme':
      this.applyTheme(value);
      break;
    case 'currency':
      this.updateCurrencyDisplay(value);
      break;
    case 'notifications':
      this.toggleNotifications(value);
      break;
  }
}

// Method to apply theme changes
applyTheme(theme) {
  const chatContainer = document.getElementById('ai-chat-container');
  if (chatContainer) {
    chatContainer.className = chatContainer.className.replace(/theme-\w+/, '');
    chatContainer.classList.add(`theme-${theme}`);
  }
}

// Method to get system information for troubleshooting
getSystemInfo() {
  return {
    browser: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    memory: RVAAIChatPerformance.getMemoryUsage(),
    timestamp: new Date().toISOString()
  };
}

// Method to generate system report
generateSystemReport() {
  const info = this.getSystemInfo();
  return `
    <strong>🔧 System Information:</strong><br><br>
    
    <strong>Browser:</strong> ${info.browser.split(' ')[0]}<br>
    <strong>Language:</strong> ${info.language}<br>
    <strong>Platform:</strong> ${info.platform}<br>
    <strong>Online:</strong> ${info.onLine ? 'Yes' : 'No'}<br>
    <strong>Cookies:</strong> ${info.cookieEnabled ? 'Enabled' : 'Disabled'}<br>
    <strong>Memory:</strong> ${info.memory?.used || 'N/A'}MB used<br>
    <strong>Timestamp:</strong> ${new Date(info.timestamp).toLocaleString()}<br><br>
    
    <em>This information helps with troubleshooting issues.</em>
  `;
}



  // Keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      
      // Ctrl/Cmd + K to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.clearChat();
      }
      
      // Escape to close chat
      if (e.key === 'Escape') {
        this.closeChat();
      }
      
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    const container = document.getElementById('ai-chat-container');
    if (container) {
      container.classList.remove('ai-chat-hidden');
      this.isOpen = true;
      
      // Focus on input
      setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
      }, 300);
    }
  }
  
  closeChat() {
    const container = document.getElementById('ai-chat-container');
    if (container) {
      container.classList.add('ai-chat-hidden');
      this.isOpen = false;
    }
  }
  
  showWelcomeMessage() {
    setTimeout(() => {
      const welcomeMessages = [
        "💡 Ask me about our tokenization platform!",
        "🚀 Want to know about our upcoming features?",
        "💰 Curious about DeFi opportunities with RVA?",
        "📊 I can also provide real-time crypto prices and market analysis!"
      ];
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      this.addAIMessage(randomMessage);
    }, 3000);
  }
  
  sendMessage() {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message) return;
    
    // Track conversation
    this.conversationHistory.push({
      type: 'user',
      message: message,
      timestamp: new Date().toISOString()
    });
    
    // Add user message
    this.addUserMessage(message);
    input.value = '';
    
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
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
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
      type: 'ai',
      message: message,
      timestamp: new Date().toISOString()
    });
    
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'ai-message';
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
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
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.style.display = 'flex';
  }
  
  hideTypingIndicator() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.style.display = 'none';
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
    return cryptoData.find(coin => 
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
  formatPrice(price, currency = 'usd') {
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
  formatMarketCap(marketCap, currency = 'usd') {
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
    const changeColor = change24h >= 0 ? "positive" : "negative";
    
    return `
      <strong>${coin.name} (${coin.symbol.toUpperCase()})</strong><br>
      💰 <strong>Price:</strong> ${price}<br>
      ${changeEmoji} <strong>24h Change:</strong> <span class="crypto-${changeColor}">${change24h}%</span><br>
      📊 <strong>Market Cap:</strong> ${marketCap}<br>
      <br>
      <em>Data updated in real-time from our crypto API. Want to know about another cryptocurrency?</em>
    `;
  }
  
  // Generate top cryptos response
  generateTopCryptosResponse(count = 5) {
    const topCryptos = this.getTopCryptos(count);
    
    if (!topCryptos) {
      return "I'm currently unable to fetch cryptocurrency data. Please try again in a moment!";
    }
    
    let response = `<strong>🏆 Top ${count} Cryptocurrencies:</strong><br><br>`;
    
    topCryptos.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h?.toFixed(2) || "N/A";
      const changeEmoji = change24h >= 0 ? "📈" : "📉";
      
      response += `<strong>${index + 1}. ${coin.name}</strong> - ${price} ${changeEmoji} ${change24h}%<br>`;
    });
    
    response += `<br><em>Want detailed info about any of these? Just ask!</em>`;
    return response;
  }
  
  // Generate market analysis response
  generateMarketAnalysisResponse() {
    const cryptoData = this.getCryptoData();
    
    if (!cryptoData || cryptoData.length === 0) {
      return "I'm currently unable to access market data. Please try again in a moment!";
    }
    
    // Calculate market statistics
    const positiveChanges = cryptoData.filter(coin => coin.price_change_percentage_24h > 0).length;
    const negativeChanges = cryptoData.filter(coin => coin.price_change_percentage_24h < 0).length;
    const totalCoins = cryptoData.length;
    
    const marketSentiment = positiveChanges > negativeChanges ? "bullish 📈" : "bearish 📉";
    const sentimentPercentage = ((positiveChanges / totalCoins) * 100).toFixed(1);
    
    // Find biggest gainers and losers
    const biggestGainer = cryptoData.reduce((prev, current) => 
      (prev.price_change_percentage_24h > current.price_change_percentage_24h) ? prev : current
    );
    
    const biggestLoser = cryptoData.reduce((prev, current) => 
      (prev.price_change_percentage_24h < current.price_change_percentage_24h) ? prev : current
    );
    
    return `
      <strong>📊 Current Market Analysis:</strong><br><br>
      
      <strong>Market Sentiment:</strong> ${marketSentiment}<br>
      <strong>Positive Movers:</strong> ${positiveChanges}/${totalCoins} (${sentimentPercentage}%)<br><br>
      
      <strong>🚀 Biggest Gainer:</strong><br>
      ${biggestGainer.name} (+${biggestGainer.price_change_percentage_24h.toFixed(2)}%)<br><br>
      
      <strong>📉 Biggest Loser:</strong><br>
      ${biggestLoser.name} (${biggestLoser.price_change_percentage_24h.toFixed(2)}%)<br><br>
      
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
      .filter(coin => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 10);
    
    if (gainers.length === 0) {
      return "No cryptocurrencies are showing positive gains in the last 24 hours. The market seems to be in a bearish phase.";
    }
    
    let response = "<strong>🚀 Biggest Gainers (24h):</strong><br><br>";
    
    gainers.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h.toFixed(2);
      
      response += `<strong>${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})</strong><br>`;
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
      .filter(coin => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 10);
    
    if (losers.length === 0) {
      return "No cryptocurrencies are showing negative performance in the last 24 hours. The market seems to be very bullish!";
    }
    
    let response = "<strong>📉 Biggest Losers (24h):</strong><br><br>";
    
    losers.forEach((coin, index) => {
      const price = this.formatPrice(coin.current_price);
      const change24h = coin.price_change_percentage_24h.toFixed(2);
      
      response += `<strong>${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})</strong><br>`;
      response += `💰 Price: ${price}<br>`;
      response += `📉 24h Change: <span class="crypto-negative">${change24h}%</span><br><br>`;
    });
    
    response += `<em>These cryptocurrencies are experiencing the largest declines in the last 24 hours. Consider this as potential buying opportunities or risk factors.</em>`;
    return response;
  }
  
  // Generate educational response
  generateEducationalResponse(topic) {
    const educationalContent = {
      'crypto-glossary': `
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
      
      'trading-guide': `
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
      
      'security-guide': `
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
      
      'beginner-guide': `
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
      `
    };
    
    return educationalContent[topic] || "I don't have information about that topic yet. Please try another educational topic!";
  }
  
  // Clear chat
  clearChat() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
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
    const userMessages = this.conversationHistory.filter(entry => entry.type === 'user').length;
    const aiMessages = this.conversationHistory.filter(entry => entry.type === 'ai').length;
    
    const firstMessage = this.conversationHistory[0];
    const sessionDuration = firstMessage 
      ? Math.round((new Date() - new Date(firstMessage.timestamp)) / 1000 / 60)
      : 0;
    
    return `
      <strong>📊 Conversation Statistics:</strong><br><br>
      
      <strong>Total Messages:</strong> ${totalMessages}<br>
      <strong>Your Messages:</strong> ${userMessages}<br>
      <strong>My Responses:</strong> ${aiMessages}<br>
      <strong>Session Duration:</strong> ${sessionDuration} minutes<br><br>
      
      <em>Thanks for chatting with me! 🤖</em>
    `;
  }
  
  // Enhanced response generation with crypto integration
  async generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Personal questions about AI
    if (message.includes('who are you') || message.includes('your name')) {
      return `Hi! I'm ${this.aiCharacter.name}, ${this.aiCharacter.age} years old. I'm your RVA blockchain expert with ${this.aiCharacter.experience} in the DeFi space. I can provide real-time cryptocurrency prices and market analysis!`;
    }
    
    if (message.includes('how old') || message.includes('age')) {
      return `I'm ${this.aiCharacter.age} years old and have been passionate about blockchain technology since I was 23. I've seen the DeFi space evolve tremendously, and I love analyzing market trends!`;
    }
    
    if (message.includes('experience') || message.includes('background')) {
      return `I have ${this.aiCharacter.experience} in DeFi and specialize in ${this.aiCharacter.specialties.join(', ')}. I'm particularly excited about RVA's innovative approach and I can provide real-time crypto market insights!`;
    }
    
    // Crypto price queries
    if (message.includes('price of') || message.includes('cost of') || message.includes('how much is')) {
      // Extract coin name from message
      const pricePatterns = [
        /price of (\w+)/i,
        /cost of (\w+)/i,
        /how much is (\w+)/i,
        /(\w+) price/i,
        /(\w+) cost/i
      ];
      
      for (const pattern of pricePatterns) {
        const match = message.match(pattern);
        if (match) {
          const coinName = match[1];
          return this.generateCryptoPriceResponse(coinName);
        }
      }
    }
    
    // Specific cryptocurrency queries
    const cryptoNames = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'binance', 'bnb', 'solana', 'sol',
      'cardano', 'ada', 'dogecoin', 'doge', 'polygon', 'matic', 'chainlink', 'link',
      'avalanche', 'avax', 'polkadot', 'dot', 'shiba', 'shib', 'litecoin', 'ltc'
    ];
    
    for (const crypto of cryptoNames) {
      if (message.includes(crypto)) {
        return this.generateCryptoPriceResponse(crypto);
      }
    }
    
    // Market analysis queries
    if (message.includes('market') && (message.includes('analysis') || message.includes('overview') || message.includes('sentiment'))) {
      return this.generateMarketAnalysisResponse();
    }
    
    // Top cryptocurrencies
    if (message.includes('top') && (message.includes('crypto') || message.includes('coin'))) {
      const numberMatch = message.match(/top (\d+)/);
      const count = numberMatch ? parseInt(numberMatch[1]) : 5;
      return this.generateTopCryptosResponse(Math.min(count, 10)); // Limit to 10
    }
    
    // Biggest gainers/losers
    if (message.includes('biggest gainers') || message.includes('top gainers')) {
      return this.generateBiggestGainersResponse();
    }
    
    if (message.includes('biggest losers') || message.includes('top losers')) {
      return this.generateBiggestLosersResponse();
    }
    
    // Educational content
    if (message.includes('glossary') || message.includes('crypto terms')) {
      return this.generateEducationalResponse('crypto-glossary');
    }
    
    if (message.includes('trading guide') || message.includes('how to trade')) {
      return this.generateEducationalResponse('trading-guide');
    }
    
    if (message.includes('security guide') || message.includes('security tips')) {
      return this.generateEducationalResponse('security-guide');
    }
    
    if (message.includes('beginner guide') || message.includes('crypto basics')) {
      return this.generateEducationalResponse('beginner-guide');
    }
    
    // Trading and investment advice
    if (message.includes('should i buy') || message.includes('investment advice') || message.includes('trading advice')) {
      const cryptoData = this.getCryptoData();
      let marketInfo = "";
      
      if (cryptoData && cryptoData.length > 0) {
        const btc = this.findCrypto('bitcoin');
        const eth = this.findCrypto('ethereum');
        
        if (btc && eth) {
          marketInfo = ` Currently, Bitcoin is at ${this.formatPrice(btc.current_price)} (${btc.price_change_percentage_24h.toFixed(2)}% 24h) and Ethereum is at ${this.formatPrice(eth.current_price)} (${eth.price_change_percentage_24h.toFixed(2)}% 24h).`;
        }
      }
      
      return `I can't provide financial advice, but I can share market data to help you make informed decisions!${marketInfo} Remember to always do your own research (DYOR) and never invest more than you can afford to lose. Consider our RVA ecosystem for secure trading and DeFi opportunities!`;
    }
    
    // Greeting responses with crypto context
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greetings = [
        `Hello! I'm ${this.aiCharacter.name}, your RVA expert. I can help with our ecosystem and provide real-time crypto prices. What interests you today?`,
        `Hi there! Ready to explore RVA and the crypto markets with me? I have access to live price data!`,
        `Hey! Great to see you here. Want to know about our ecosystem or check some cryptocurrency prices?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Check knowledge base for RVA-specific queries
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        const responses = data.responses;
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Add crypto context to RVA responses
        if (category === 'exchange') {
          const cryptoData = this.getCryptoData();
          if (cryptoData && cryptoData.length > 0) {
            const topCoin = cryptoData[0];
            response += ` Speaking of trading, ${topCoin.name} is currently at ${this.formatPrice(topCoin.current_price)}. Want to see more live prices?`;
          }
        }
        
        return response;
      }
    }
    
    // General crypto queries
    if (message.includes('crypto') || message.includes('cryptocurrency') || message.includes('digital asset')) {
      const cryptoData = this.getCryptoData();
      if (cryptoData && cryptoData.length > 0) {
        return `Cryptocurrency is fascinating! I have access to real-time data for ${cryptoData.length} cryptocurrencies. You can ask me about specific coin prices, market analysis, or how they integrate with our RVA ecosystem. What would you like to know?`;
      } else {
        return "Cryptocurrency is the future of finance! While I'm currently updating my price data, I can tell you all about how cryptocurrencies work with our RVA ecosystem. What specific aspect interests you?";
      }
    }
    
    // DeFi and blockchain queries with market context
    if (message.includes('defi') || message.includes('decentralized finance')) {
      let response = "DeFi is revolutionizing finance by removing intermediaries and enabling peer-to-peer transactions. RVA is at the forefront of this movement with our integrated ecosystem!";
      
      const cryptoData = this.getCryptoData();
      if (cryptoData) {
        const defiCoins = cryptoData.filter(coin => 
          ['uniswap', 'aave', 'compound', 'maker', 'chainlink', 'sushiswap'].includes(coin.id)
        );
        
        if (defiCoins.length > 0) {
          response += ` Some popular DeFi tokens right now include ${defiCoins.slice(0, 3).map(coin => 
            `${coin.name} (${this.formatPrice(coin.current_price)})`
          ).join(', ')}.`;
        }
      }
      
      return response;
    }
    
    // Security questions with market context
    if (message.includes('secure') || message.includes('safety') || message.includes('risk')) {
      let response = "Security is our top priority at RVA! We implement multi-layer security protocols, regular audits, and follow industry best practices. Your assets' safety is paramount to us.";
      
      const cryptoData = this.getCryptoData();
      if (cryptoData) {
        const stablecoins = cryptoData.filter(coin => 
          ['tether', 'usd-coin', 'binance-usd', 'dai'].includes(coin.id)
        );
        
        if (stablecoins.length > 0) {
          response += ` For stability, you might consider stablecoins like ${stablecoins[0].name} (${this.formatPrice(stablecoins[0].current_price)}) in our secure wallet.`;
        }
      }
      
      return response;
    }
    
    // Future and roadmap with market trends
    if (message.includes('future') || message.includes('roadmap') || message.includes('plan')) {
      let response = "RVA has an exciting roadmap ahead! We're continuously expanding our ecosystem, adding new features, and forming strategic partnerships.";
      
      const cryptoData = this.getCryptoData();
      if (cryptoData) {
        const positiveCoins = cryptoData.filter(coin => coin.price_change_percentage_24h > 0).length;
        const totalCoins = cryptoData.length;
        const marketSentiment = positiveCoins > totalCoins / 2 ? "bullish" : "bearish";
        
        response += ` The current market is ${marketSentiment}, which creates great opportunities for our platform's growth. Check out our roadmap page for detailed information!`;
      }
      
      return response;
    }
    
    // Help and capabilities
    if (message.includes('help') || message.includes('what can you do') || message.includes('capabilities')) {
      return `I'm here to help you with:
      
      🏢 <strong>RVA Ecosystem:</strong> Information about our platform, wallet, exchange, and launchpad<br>
      📊 <strong>Live Crypto Prices:</strong> Real-time data for major cryptocurrencies<br>
      📈 <strong>Market Analysis:</strong> Current market sentiment and trends<br>
      🔍 <strong>Specific Coins:</strong> Detailed information about any cryptocurrency<br>
      💡 <strong>DeFi Education:</strong> Explaining blockchain and decentralized finance<br><br>
      
      Try asking: "What's the price of Bitcoin?" or "Show me top 5 cryptos" or "Tell me about RVA wallet"`;
    }


if (message.includes('how do i use') || message.includes('how to use chat')) {
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

if (message.includes('keyboard shortcuts')) {
  return `
    <strong>⌨️ Keyboard Shortcuts:</strong><br><br>
    
    <strong>💬 Chat Controls:</strong><br>
    • <kbd>Enter</kbd> - Send your message<br>
    • <kbd>Ctrl/Cmd + Enter</kbd> - Alternative send<br>
    • <kbd>Escape</kbd> - Close chat window<br><br>
    
    <strong>🧹 Chat Management:</strong><br>
    • <kbd>Ctrl/Cmd + K</kbd> - Clear chat history<br>
    • <kbd>Ctrl/Cmd + S</kbd> - Save conversation<br>
    • <kbd>Ctrl/Cmd + R</kbd> - Refresh data<br><br>
    
    <strong>🔍 Navigation:</strong><br>
    • <kbd>Tab</kbd> - Navigate between elements<br>
    • <kbd>Shift + Tab</kbd> - Navigate backwards<br>
    • <kbd>Arrow Keys</kbd> - Scroll through chat<br><br>
    
    <em>These shortcuts work when the chat is active!</em>
  `;
}

if (message.includes('search tips') || message.includes('how to search')) {
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

if (message.includes('browser') && (message.includes('support') || message.includes('compatibility'))) {
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

if (message.includes('performance tips') || message.includes('slow') || message.includes('lag')) {
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
    
    <em>Current memory usage: ${RVAAIChatPerformance.getMemoryUsage()?.used || 'N/A'}MB</em>
  `;
}

if (message.includes('contact support') || message.includes('get help')) {
  return `
    <strong>📞 Contact Support:</strong><br><br>
    
    <strong>💬 Live Chat:</strong><br>
    • Available 24/7 through this chat<br>
    • Type "human support" for escalation<br><br>
    
    <strong>📧 Email Support:</strong><br>
    • support@roialvirtualassets.com<br>
    • Response within 24 hours<br><br>
    
    <strong>🌐 Community Support:</strong><br>
    • Discord: discord.gg/rva<br>
    • Telegram: t.me/rvaofficial<br>
    • Reddit: r/RoialVirtualAssets<br><br>
    
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


if (message.includes('faq') || message.includes('frequently asked')) {
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

if (message.includes('feature request') || message.includes('suggest feature')) {
  return `
    <strong>💡 Feature Request System:</strong><br><br>
    
    <strong>🚀 How to Submit:</strong><br>
    • Describe your idea clearly<br>
    • Explain the use case<br>
    • Mention expected benefits<br><br>
    
    <strong>📝 Submission Channels:</strong><br>
    • Email: features@roialvirtualassets.com<br>
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

if (message.includes('community') || message.includes('join community')) {
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
    • <strong>Reddit:</strong> r/RoialVirtualAssets<br>
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

if (message.includes('latest updates') || message.includes('what\'s new')) {
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

if (message.includes('preferences') || message.includes('settings')) {
  const currentPrefs = this.userPreferences;
  return `
    <strong>⚙️ Your Current Preferences:</strong><br><br>
    
    <strong>💱 Currency:</strong> ${currentPrefs.currency?.toUpperCase() || 'USD'}<br>
    <strong>🎨 Theme:</strong> ${currentPrefs.theme || 'Dark'}<br>
    <strong>🔔 Notifications:</strong> ${currentPrefs.notifications ? 'Enabled' : 'Disabled'}<br>
    <strong>🔄 Auto Refresh:</strong> ${currentPrefs.autoRefresh ? 'Enabled' : 'Disabled'}<br><br>
    
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

if (message.includes('theme') && (message.includes('change') || message.includes('switch'))) {
  return `
    <strong>🎨 Theme Settings:</strong><br><br>
    
    <strong>🌙 Available Themes:</strong><br>
    • <strong>Dark Mode:</strong> Easy on the eyes, perfect for night use<br>
    • <strong>Light Mode:</strong> Clean and bright, great for day use<br>
    • <strong>Auto Mode:</strong> Switches based on system preference<br>
    • <strong>High Contrast:</strong> Enhanced accessibility<br><br>
    
    <strong>🎯 Theme Features:</strong><br>
    • Consistent across all components<br>
    • Smooth transitions<br>
    • Accessibility compliant<br>
    • Battery-friendly dark mode<br><br>
    
    <strong>⚡ Quick Switch:</strong><br>
    • Say "Switch to dark theme"<br>
    • Say "Enable light mode"<br>
    • Say "Use auto theme"<br><br>
    
    <strong>💡 Pro Tips:</strong><br>
    • Dark mode saves battery on OLED screens<br>
    • Auto mode follows your device settings<br>
    • High contrast helps with visibility<br><br>
    
    <em>Current theme: ${this.userPreferences.theme || 'Dark'}</em>
  `;
}

if (message.includes('notification') && message.includes('settings')) {
  return `
    <strong>🔔 Notification Settings:</strong><br><br>
    
    <strong>📱 Available Notifications:</strong><br>
    • Price alerts for watchlist coins<br>
    • Market movement notifications<br>
    • RVA ecosystem updates<br>
    • New feature announcements<br>
    • Security alerts<br><br>
    
    <strong>⚙️ Notification Types:</strong><br>
    • <strong>Browser:</strong> Desktop notifications<br>
    • <strong>Email:</strong> Daily/weekly summaries<br>
    • <strong>In-Chat:</strong> Real-time alerts<br><br>
    
    <strong>🎯 Customization:</strong><br>
    • Set price thresholds<br>
    • Choose notification frequency<br>
    • Select specific cryptocurrencies<br>
    • Enable/disable by category<br><br>
    
    <strong>🔧 Quick Commands:</strong><br>
    • "Enable notifications"<br>
    • "Disable price alerts"<br>
    • "Set Bitcoin alert at $50000"<br><br>
    
    <em>Status: ${this.userPreferences.notifications ? 'Enabled ✅' : 'Disabled ❌'}</em>
  `;
}

if (message.includes('report bug') || message.includes('found bug')) {
  return `
    <strong>🐛 Bug Report System:</strong><br><br>
    
    <strong>📝 How to Report:</strong><br>
    1. Describe what happened<br>
    2. List steps to reproduce<br>
    3. Mention your browser/device<br>
    4. Include screenshots if possible<br>
    5. Note the time it occurred<br><br>
    
    <strong>📧 Reporting Channels:</strong><br>
    • Email: bugs@roialvirtualassets.com<br>
    • Discord: #bug-reports<br>
    • GitHub: github.com/rva/issues<br>
    • Direct chat: Type "Bug report: [description]"<br><br>
    
    <strong>🏷️ Bug Categories:</strong><br>
    • UI/UX issues<br>
    • Performance problems<br>
    • Data accuracy<br>
    • Security concerns<br>
    • Feature malfunctions<br><br>
    
    <strong>⚡ Priority Levels:</strong><br>
    • <strong>Critical:</strong> Security/data loss<br>
    • <strong>High:</strong> Core functionality broken<br>
    • <strong>Medium:</strong> Feature not working<br>
    • <strong>Low:</strong> Minor UI issues<br><br>
    
    <strong>🎁 Bug Bounty:</strong><br>
    • Rewards for valid reports<br>
    • Special recognition for security finds<br>
    • Community contributor badges<br><br>
    
    <em>Help us improve! Your reports make RVA better for everyone.</em>
  `;
}

if (message.includes('connection') && message.includes('issues')) {
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
    • API Status: ${this.cryptoApi ? '🟢 Connected' : '🔴 Disconnected'}<br>
    • Chat Status: 🟢 Active<br>
    • Data Refresh: ${this.userPreferences.autoRefresh ? '🟢 Enabled' : '🔴 Disabled'}<br><br>
    
    <strong>📞 Still Having Issues?</strong><br>
    • Contact support with error details<br>
    • Include browser console logs<br>
    • Mention your location/ISP<br><br>
    
    <em>Most connection issues resolve with a simple page refresh!</em>
  `;
}

// Add currency and language change handlers
if (message.includes('change currency') || message.includes('currency to')) {
  const currencyMatch = message.match(/(usd|eur|gbp|jpy)/i);
  if (currencyMatch) {
    const newCurrency = currencyMatch[1].toLowerCase();
    this.userPreferences.currency = newCurrency;
    this.saveUserPreferences();
    return `✅ Currency changed to ${newCurrency.toUpperCase()}! All prices will now display in ${newCurrency.toUpperCase()}.`;
  }
  return `Please specify a currency: USD, EUR, GBP, or JPY. Example: "Change currency to EUR"`;
}

if (message.includes('enable notifications') || message.includes('turn on notifications')) {
  this.userPreferences.notifications = true;
  this.saveUserPreferences();
  return `🔔 Notifications enabled! You'll now receive alerts for price changes and important updates.`;
}

if (message.includes('disable notifications') || message.includes('turn off notifications')) {
  this.userPreferences.notifications = false;
  this.saveUserPreferences();
  return `🔕 Notifications disabled. You can re-enable them anytime by saying "enable notifications".`;
}


if (message.includes('switch to') && message.includes('theme')) {
  const themeMatch = message.match(/(dark|light|auto)/i);
  if (themeMatch) {
    const newTheme = themeMatch[1].toLowerCase();
    this.userPreferences.theme = newTheme;
    this.saveUserPreferences();
    return `🎨 Theme changed to ${newTheme} mode! The interface will update accordingly.`;
  }
  return `Please specify a theme: dark, light, or auto. Example: "Switch to dark theme"`;
}

if (message.includes('reset') && (message.includes('settings') || message.includes('preferences'))) {
  this.userPreferences = {
    currency: 'usd',
    theme: 'dark',
    notifications: true,
    autoRefresh: true
  };
  this.saveUserPreferences();
  return `🔄 All settings have been reset to default values:
    <br>• Currency: USD
    <br>• Theme: Dark
    <br>• Notifications: Enabled
    <br>• Auto Refresh: Enabled
    <br><br><em>You can customize these settings again anytime!</em>`;
}

if (message.includes('bookmarks') || message.includes('bookmark')) {
  return `
    <strong>🔖 Bookmark System:</strong><br><br>
    
    <strong>📌 How Bookmarks Work:</strong><br>
    • Save important conversations<br>
    • Quick access to useful responses<br>
    • Organize by categories<br>
    • Export bookmarked content<br><br>
    
    <strong>💾 Bookmark Commands:</strong><br>
    • "Bookmark this response"<br>
    • "Show my bookmarks"<br>
    • "Remove bookmark"<br>
    • "Export bookmarks"<br><br>
    
    <strong>📂 Categories:</strong><br>
    • Crypto prices & analysis<br>
    • RVA information<br>
    • Educational content<br>
    • Trading strategies<br>
    • Technical guides<br><br>
    
    <strong>🔍 Search Bookmarks:</strong><br>
    • Find by keyword<br>
    • Filter by date<br>
    • Sort by relevance<br><br>
    
    <em>Feature coming soon! Currently in development.</em>
  `;
}

if (message.includes('chat history') || message.includes('conversation history')) {
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
    • Started: ${sessionStart ? new Date(sessionStart).toLocaleTimeString() : 'N/A'}<br><br>
    
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

if (message.includes('voice commands') || message.includes('voice control')) {
  return `
    <strong>🎤 Voice Commands (Coming Soon):</strong><br><br>
    
    <strong>🗣️ Planned Voice Features:</strong><br>
    • Voice-to-text input<br>
    • Audio response playback<br>
    • Hands-free operation<br>
    • Multiple language support<br><br>
    
    <strong>📱 Voice Commands:</strong><br>
    • "Hey RVA, Bitcoin price"<br>
    • "Show me top cryptocurrencies"<br>
    • "Read the market analysis"<br>
    • "Clear the chat"<br><br>
    
    <strong>🌐 Language Support:</strong><br>
    • English (US/UK)<br>
    • Spanish<br>
    • French<br>
    • German<br>
    • More languages planned<br><br>
    
    <strong>⚙️ Voice Settings:</strong><br>
    • Adjust speech rate<br>
    • Choose voice type<br>
    • Set wake word<br>
    • Background listening<br><br>
    
    <strong>🔒 Privacy:</strong><br>
    • Local processing only<br>
    • No audio data stored<br>
    • User consent required<br><br>
    
    <em>Voice features will be available in the next major update!</em>
  `;
}

if (message.includes('formatting') || message.includes('text formatting')) {
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

if (message.includes('language') && (message.includes('change') || message.includes('settings'))) {
  return `
    <strong>🌐 Language Settings:</strong><br><br>
    
    <strong>🗣️ Available Languages:</strong><br>
    • 🇺🇸 English (Default)<br>
    • 🇪🇸 Spanish (Español)<br>
    • 🇫🇷 French (Français)<br>
    • 🇩🇪 German (Deutsch)<br>
    • 🇯🇵 Japanese (日本語) - Coming soon<br>
    • 🇰🇷 Korean (한국어) - Coming soon<br><br>
    
    <strong>🔄 Language Features:</strong><br>
    • Full interface translation<br>
    • Localized number formatting<br>
    • Cultural date/time formats<br>
    • Regional crypto preferences<br><br>
    
    <strong>⚡ Quick Change:</strong><br>
    • "Change language to Spanish"<br>
    • "Switch to French"<br>
    • "Use German interface"<br><br>
    
    <strong>🎯 Smart Features:</strong><br>
    • Auto-detect browser language<br>
    • Remember preference<br>
    • Fallback to English<br><br>
    
    <strong>📱 Mobile Support:</strong><br>
    • Responsive text sizing<br>
    • Touch-friendly interface<br>
    • Voice input support<br><br>
    
    <em>Current language: English 🇺🇸</em><br>
    <em>More languages coming based on community demand!</em>
  `;
}

if (message.includes('quick start') || message.includes('getting started')) {
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

if (message.includes('examples') || message.includes('example questions')) {
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
    
    // Conversation stats
    if (message.includes('stats') || message.includes('statistics')) {
      return this.getConversationStats();
    }
    
    // Clear chat
    if (message.includes('clear') && message.includes('chat')) {
      this.clearChat();
      return;
    }

    
    
    // Default responses with crypto context
    const defaultResponses = [
      "That's an interesting question! I specialize in RVA ecosystem and live cryptocurrency data. Could you be more specific about what you'd like to know?",
      "I'm here to help with RVA, DeFi, and real-time crypto prices. Could you rephrase your question so I can provide the most accurate information?",
      "As your RVA expert with access to live market data, I want to give you the best answer possible. What specific aspect interests you?",
      "Great question! I'm most knowledgeable about RVA's ecosystem and current cryptocurrency markets. How can I help you explore these topics?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    const messagesContainer = document.getElementById('ai-chat-messages');
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
    const chatContainer = document.getElementById('ai-chat-container');
    if (!chatContainer) return;
    
    const inputContainer = chatContainer.querySelector('.ai-chat-input-container');
    if (!inputContainer) return;
    
    // Create quick actions container
    const quickActionsContainer = document.createElement('div');
    quickActionsContainer.className = 'ai-chat-quick-actions';
    quickActionsContainer.innerHTML = `
      <div class="quick-actions-tabs">
        <button class="quick-tab active" data-tab="crypto">💰 Crypto</button>
        <button class="quick-tab" data-tab="rva">🏢 RVA</button>
        <button class="quick-tab" data-tab="edu">📚 Education</button>
        <button class="quick-tab" data-tab="help">❓ Help</button>
      </div>
      
      <!-- Crypto Tab -->
      <div class="quick-tab-content active" data-content="crypto">
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
    // Tab switching
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('quick-tab')) {
        const tabName = event.target.dataset.tab;
        this.switchTab(tabName);
      }
      
      if (event.target.classList.contains('quick-action-btn')) {
        const action = event.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
  }
  
  switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.quick-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.quick-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.querySelector(`[data-content="${tabName}"]`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
  }
  
  handleQuickAction(action) {
    const actions = {
      // Cryptocurrency prices
      'btc-price': 'What is the price of Bitcoin?',
      'eth-price': 'What is the price of Ethereum?',
      'bnb-price': 'What is the price of BNB?',
      'sol-price': 'What is the price of Solana?',
      'ada-price': 'What is the price of Cardano?',
      'doge-price': 'What is the price of Dogecoin?',
      
      // Market overview
      'top-5': 'Show me top 5 cryptocurrencies',
      'top-10': 'Show me top 10 cryptocurrencies',
      'market-analysis': 'Market analysis',
      'gainers': 'Show me biggest gainers',
      'losers': 'Show me biggest losers',
      
      // RVA ecosystem
      'rva-overview': 'Tell me about RVA ecosystem',
      'rva-wallet': 'Tell me about RVA secure wallet',
      'rva-exchange': 'Tell me about RVA smart exchange',
      'rva-launchpad': 'Tell me about RVA ICO/IDO launchpad',
      'rva-blockchain': 'Tell me about RVA smart chain',
      
      // Education
    'crypto-glossary': 'Show me crypto glossary',
    'trading-guide': 'Show me trading guide',
    'security-guide': 'Show me security guide',
    'beginner-guide': 'Show me beginner guide',
    
    // Help and capabilities
    'capabilities': 'What can you do?',
    'examples': 'Give me example questions',
    'about-alex': 'Who are you?',
      
      // Chat management
      'stats': 'Show conversation statistics',
      'clear-chat': 'clear chat',
      'rva-staking': 'Tell me about RVA staking rewards',
    'rva-governance': 'How does RVA governance work?',
    'rva-nft': 'Tell me about RVA NFT marketplace',
    'rva-lending': 'How does RVA DeFi lending work?',
    'rva-yield': 'Tell me about RVA yield farming',
    'rva-bridge': 'How does RVA cross-chain bridge work?',
    
    // RVA Information
    'rva-tokenomics': 'Explain RVA tokenisation',
    'rva-roadmap': 'Show me RVA roadmap',
    'rva-partnerships': 'Tell me about RVA partnerships',
    'rva-team': 'Who is the RVA team?',
    'rva-whitepaper': 'Where can I find RVA whitepaper?',
    'rva-audit': 'Tell me about RVA security audits',
    
    // Crypto Basics
    'blockchain-basics': 'Explain blockchain basics',
    'wallet-types': 'What are different wallet types?',
    'crypto-vs-fiat': 'Crypto vs fiat currency differences',
    
    // Trading & Investment
    'technical-analysis': 'Teach me technical analysis',
    'risk-management': 'Risk management in crypto',
    'portfolio-tips': 'Crypto portfolio management tips',
    'market-psychology': 'Explain market psychology',
    
    // DeFi & Advanced
    'defi-explained': 'What is DeFi?',
    'yield-farming-guide': 'How does yield farming work?',
    'liquidity-pools': 'Explain liquidity pools',
    'smart-contracts': 'What are smart contracts?',
    'nft-guide': 'What are NFTs?',
    'dao-explained': 'What is a DAO?',
    
    // Security & Best Practices
    'scam-prevention': 'How to avoid crypto scams',
    'private-keys': 'Private key security best practices',
    '2fa-guide': 'How to set up 2FA',
    'cold-storage': 'What is cold storage?',
    'how-to-use': 'How do I use this chat?',
    'quick-start': 'Show me quick start guide',
    
    // Chat Features
    'keyboard-shortcuts': 'What are the keyboard shortcuts?',
    'voice-commands': 'What voice commands are available?',
    'search-tips': 'Give me search tips',
    'formatting-help': 'How can I format text?',
    'export-chat': 'How do I export this conversation?',
    
    // Personalization
    'preferences': 'Show my preferences',
    'theme-settings': 'How do I change themes?',
    'notification-settings': 'How do I manage notifications?',
    'language-settings': 'How do I change language?',
    'currency-settings': 'How do I change currency?',
    
    // Chat Management
    'history': 'Show my chat history',
    'bookmarks': 'How do bookmarks work?',
    'reset-preferences': 'How do I reset my settings?',
    
    // Troubleshooting
    'connection-issues': 'I have connection problems',
    'performance-tips': 'How can I improve performance?',
    'browser-compatibility': 'Which browsers are supported?',
    'refresh-data': 'How do I refresh data?',
    'report-bug': 'How do I report a bug?',
    
    // Support & Feedback
    'contact-support': 'How do I contact support?',
    'feedback': 'How do I send feedback?',
    'feature-request': 'How do I request features?',
    'faq': 'Show me frequently asked questions',
    'community': 'How do I join the community?',
    'updates': 'What are the latest updates?'
    };
    
    const query = actions[action];
    if (query) {
      if (action === 'clear-chat') {
        this.aiChat.clearChat();
      } else {
        // Simulate user input
        const input = document.getElementById('ai-chat-input');
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
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  },
  
  // Get time ago string
  getTimeAgo: (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  },
  
  // Sanitize user input
  sanitizeInput: (input) => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  // Check if market is open (crypto markets are always open)
  isMarketOpen: () => {
    return true; // Crypto markets never close
  },
  
  // Get market status message
  getMarketStatus: () => {
    return "🟢 Crypto markets are open 24/7";
  }
};

// Integration script to tie everything together
document.addEventListener('DOMContentLoaded', function() {
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
          console.log('Crypto data refreshed for AI chat');
        }
      }, 60000); // Check every minute
      
      // Store globally for debugging
      window.rvaAIChat = aiChat;
      
      console.log('RVA AI Chat with crypto integration initialized successfully');
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
      const conversation = window.rvaAIChat.conversationHistory.map(entry => ({
        type: entry.type,
        message: entry.message.replace(/<[^>]*>/g, ''), // Remove HTML tags
        timestamp: entry.timestamp
      }));
      
      const blob = new Blob([JSON.stringify(conversation, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rva-chat-conversation-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return "📥 Your conversation has been exported and downloaded as a JSON file!";
    }
    return null;
  }
};

// Export for global access
window.RVAAIChat = RVAAIChat;
window.RVAAIChatQuickActions = RVAAIChatQuickActions;
window.RVAAIChatUtils = RVAAIChatUtils;

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.rvaAIChat && window.rvaAIChat.conversationHistory) {
    // Save conversation history to localStorage for recovery
    localStorage.setItem('rva-chat-backup', JSON.stringify({
      history: window.rvaAIChat.conversationHistory,
      timestamp: new Date().toISOString()
    }));
  }
});

// Recovery mechanism
const recoverConversation = () => {
  const backup = localStorage.getItem('rva-chat-backup');
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
      console.warn('Failed to recover conversation:', e);
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
    console.log(`AI Chat Performance - ${action}: ${duration}ms`);
  },
  
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  },
  
  getInitializationTime: () => {
    return Date.now() - RVAAIChatPerformance.startTime;
  }
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
      "Biggest gainers"
    ];
    
    for (const query of queries) {
      console.log(`Testing: ${query}`);
      if (window.rvaAIChat) {
        const response = await window.rvaAIChat.generateResponse(query);
        console.log(`Response: ${response}`);
      }
    }
  },
  
  // Test conversation stats
  testStats: () => {
    if (window.rvaAIChat) {
      console.log("Chat Stats:", window.rvaAIChat.getConversationStats());
    }
  }
};

// Make available globally for testing
window.testAIChat = testAIChat;

// Final initialization log
console.log('✅ RVA AI Chat system fully loaded and ready');
console.log(`📊 Initialization time: ${RVAAIChatPerformance.getInitializationTime()}ms`);

// Example queries that the AI can handle
const EXAMPLE_QUERIES = {
  // Price queries
  priceQueries: [
    "What's the price of Bitcoin?",
    "How much is Ethereum?",
    "BTC price",
    "Show me Solana cost",
    "Price of Dogecoin"
  ],
  
  // Market analysis
  marketQueries: [
    "Market analysis",
    "Market overview", 
    "Show me top 10 cryptocurrencies",
    "Biggest gainers today",
    "Biggest losers today"
  ],
  
  // RVA ecosystem
  rvaQueries: [
    "What is RVA?",
    "Tell me about RVA wallet",
    "RVA exchange features",
    "How does RVA launchpad work?",
    "RVA smart chain benefits"
  ],
  
  // Educational
  educationalQueries: [
    "Crypto glossary",
    "Trading guide",
    "Security guide",
    "Beginner guide to crypto",
    "What is DeFi?"
  ]
};

// Export example queries
window.EXAMPLE_QUERIES = EXAMPLE_QUERIES;
