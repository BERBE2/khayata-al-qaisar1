// Iraqi Robot Assistant - Smart and Friendly
class IraqiRobot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentTyping = false;
        this.responses = {
            greeting: [
                "أهلاً وسهلاً! أنا الروبوت العراقي المساعد لخياطة القيصر 🎉",
                "مرحباً بك! كيف يمكنني مساعدتك اليوم؟ 😊",
                "أهلاً! أنا هنا لخدمتك في خياطة القيصر ✨"
            ],
            services: [
                "نحن نقدم خدمات خياطة فاخرة للرجال والنساء 👔👗",
                "يمكنك اختيار من بين مجموعة واسعة من التصاميم والأقمشة الفاخرة 🎨",
                "نحن متخصصون في الخياطة التقليدية والحديثة 🧵"
            ],
            contact: [
                "يمكنك التواصل معنا عبر الهاتف: +07769592080 📞",
                "أو عبر الواتساب: +07769592080 💬",
                "العنوان: حي الأندلس - قرب مودا مول 📍"
            ],
            pricing: [
                "الأسعار تختلف حسب نوع القماش والتصميم 💰",
                "نحن نقدم أسعار تنافسية وجودة عالية ⭐",
                "يمكنك الحصول على عرض سعر مجاني عند زيارتنا 🎁"
            ],
            hours: [
                "نحن نعمل من السبت إلى الخميس 🗓️",
                "من الساعة 9 صباحاً إلى 9 مساءً ⏰",
                "نحن مغلقون يوم الجمعة 📅"
            ],
            location: [
                "نحن موجودون في حي الأندلس بالقرب من مودا مول 🏢",
                "يمكنك الوصول إلينا بسهولة عبر الخريطة 🗺️",
                "الموقع مريح ويمكن الوصول إليه بالسيارة 🚗"
            ],
            default: [
                "أعتذر، لم أفهم سؤالك تماماً 😅",
                "يمكنك أن تسألني عن خدماتنا أو معلومات الاتصال 💭",
                "أنا هنا لمساعدتك في أي وقت! 🤖"
            ]
        };

        this.init();
    }

    init() {
        this.createRobot();
        this.createChatWindow();
        this.addEventListeners();
        this.showWelcomeMessage();
    }

    createRobot() {
        const robotHTML = `
            <div class="robot-assistant" id="robotAssistant">
                <div class="robot-avatar">
                    <svg class="robot-svg" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="iraqiRed" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#CE1126;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="iraqiWhite" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="iraqiBlack" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#333333;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#E8E8E8;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#D0D0D0;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#B8B8B8;stop-opacity:1" />
                            </linearGradient>
                            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" style="stop-color:#00FF00;stop-opacity:1" />
                                <stop offset="70%" style="stop-color:#00CC00;stop-opacity:0.8" />
                                <stop offset="100%" style="stop-color:#009900;stop-opacity:0.3" />
                            </radialGradient>
                        </defs>
                        
                        <!-- Robot body -->
                        <rect x="60" y="80" width="80" height="100" rx="15" fill="url(#robotBody)"/>
                        
                        <!-- Robot head -->
                        <circle cx="100" cy="70" r="35" fill="url(#robotBody)"/>
                        
                        <!-- Iraqi flag bandana -->
                        <rect x="65" y="35" width="70" height="15" rx="7" fill="url(#iraqiRed)"/>
                        <rect x="65" y="50" width="70" height="15" rx="7" fill="url(#iraqiWhite)"/>
                        <rect x="65" y="65" width="70" height="15" rx="7" fill="url(#iraqiBlack)"/>
                        
                        <!-- Eyes -->
                        <circle cx="90" cy="65" r="8" fill="url(#eyeGlow)"/>
                        <circle cx="110" cy="65" r="8" fill="url(#eyeGlow)"/>
                        
                        <!-- Eye pupils -->
                        <circle cx="90" cy="65" r="4" fill="#000000"/>
                        <circle cx="110" cy="65" r="4" fill="#000000"/>
                        
                        <!-- Eye highlights -->
                        <circle cx="92" cy="63" r="2" fill="#FFFFFF"/>
                        <circle cx="112" cy="63" r="2" fill="#FFFFFF"/>
                        
                        <!-- Mouth -->
                        <rect x="85" y="75" width="30" height="4" rx="2" fill="#666666"/>
                        
                        <!-- Antenna -->
                        <line x1="100" y1="35" x2="100" y2="20" stroke="#666666" stroke-width="3"/>
                        <circle cx="100" cy="18" r="4" fill="#FFD700"/>
                        
                        <!-- Arms -->
                        <rect x="40" y="90" width="20" height="60" rx="10" fill="url(#robotBody)"/>
                        <rect x="140" y="90" width="20" height="60" rx="10" fill="url(#robotBody)"/>
                        
                        <!-- Hands -->
                        <circle cx="50" cy="150" r="8" fill="url(#robotBody)"/>
                        <circle cx="150" cy="150" r="8" fill="url(#robotBody)"/>
                        
                        <!-- Legs -->
                        <rect x="75" y="180" width="20" height="15" rx="10" fill="url(#robotBody)"/>
                        <rect x="105" y="180" width="20" height="15" rx="10" fill="url(#robotBody)"/>
                        
                        <!-- Chest panel -->
                        <rect x="75" y="100" width="50" height="30" rx="5" fill="#4A90E2" opacity="0.7"/>
                        
                        <!-- Chest buttons -->
                        <circle cx="85" cy="110" r="3" fill="#FF6B6B"/>
                        <circle cx="100" cy="110" r="3" fill="#4CAF50"/>
                        <circle cx="115" cy="110" r="3" fill="#FF9800"/>
                        
                        <!-- Heart symbol -->
                        <path d="M 100 125 Q 95 120 90 125 Q 90 130 100 135 Q 110 130 110 125 Q 105 120 100 125" fill="#FF6B6B" opacity="0.8"/>
                    </svg>
                    <div class="robot-status"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', robotHTML);
    }

    createChatWindow() {
        const chatHTML = `
            <div class="robot-chat" id="robotChat">
                <div class="robot-chat-header">
                    <div class="robot-chat-avatar">
                        <svg viewBox="0 0 200 200" width="30" height="30">
                            <rect x="60" y="80" width="80" height="100" rx="15" fill="#E8E8E8"/>
                            <circle cx="100" cy="70" r="35" fill="#E8E8E8"/>
                            <rect x="65" y="35" width="70" height="15" rx="7" fill="#CE1126"/>
                            <rect x="65" y="50" width="70" height="15" rx="7" fill="#FFFFFF"/>
                            <rect x="65" y="65" width="70" height="15" rx="7" fill="#000000"/>
                            <circle cx="90" cy="65" r="8" fill="#00FF00"/>
                            <circle cx="110" cy="65" r="8" fill="#00FF00"/>
                            <circle cx="90" cy="65" r="4" fill="#000000"/>
                            <circle cx="110" cy="65" r="4" fill="#000000"/>
                            <rect x="85" y="75" width="30" height="4" rx="2" fill="#666666"/>
                            <line x1="100" y1="35" x2="100" y2="20" stroke="#666666" stroke-width="3"/>
                            <circle cx="100" cy="18" r="4" fill="#FFD700"/>
                        </svg>
                    </div>
                    <div class="robot-chat-info">
                        <h3>الروبوت العراقي المساعد</h3>
                        <p>متصل الآن</p>
                    </div>
                    <button class="robot-chat-close" id="robotChatClose">&times;</button>
                </div>
                <div class="robot-chat-messages" id="robotMessages">
                    <!-- Messages will be added here -->
                </div>
                <div class="robot-chat-input">
                    <div class="robot-input-container">
                        <input type="text" class="robot-input" id="robotInput" placeholder="اكتب رسالتك هنا...">
                        <button class="robot-send-btn" id="robotSendBtn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="robot-quick-actions">
                        <button class="robot-quick-btn" data-message="ما هي خدماتكم؟">الخدمات</button>
                        <button class="robot-quick-btn" data-message="كيف أتواصل معكم؟">الاتصال</button>
                        <button class="robot-quick-btn" data-message="ما هي أسعاركم؟">الأسعار</button>
                        <button class="robot-quick-btn" data-message="ما هي أوقات العمل؟">أوقات العمل</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    addEventListeners() {
        const robotAssistant = document.getElementById('robotAssistant');
        const robotChat = document.getElementById('robotChat');
        const robotChatClose = document.getElementById('robotChatClose');
        const robotInput = document.getElementById('robotInput');
        const robotSendBtn = document.getElementById('robotSendBtn');
        const quickBtns = document.querySelectorAll('.robot-quick-btn');

        // Open/close chat
        robotAssistant.addEventListener('click', () => {
            this.toggleChat();
        });

        robotChatClose.addEventListener('click', () => {
            this.closeChat();
        });

        // Send message
        robotSendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        robotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.addMessage(message, 'user');
                this.processMessage(message);
            });
        });
    }

    toggleChat() {
        const robotChat = document.getElementById('robotChat');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            robotChat.classList.add('active');
            document.getElementById('robotInput').focus();
        } else {
            robotChat.classList.remove('active');
        }
    }

    closeChat() {
        const robotChat = document.getElementById('robotChat');
        this.isOpen = false;
        robotChat.classList.remove('active');
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage("أهلاً وسهلاً! أنا الروبوت العراقي المساعد لخياطة القيصر 🎉", 'robot');
        }, 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('robotMessages');
        const messageDiv = document.createElement('div');

        if (sender === 'user') {
            messageDiv.className = 'robot-message user-message';
        } else {
            messageDiv.className = 'robot-message';
        }

        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ text, sender, timestamp: new Date() });
    }

    showTyping() {
        if (this.currentTyping) return;

        this.currentTyping = true;
        const messagesContainer = document.getElementById('robotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'robot-typing';
        typingDiv.innerHTML = `
            <div class="robot-typing-dot"></div>
            <div class="robot-typing-dot"></div>
            <div class="robot-typing-dot"></div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingDiv = document.querySelector('.robot-typing');
        if (typingDiv) {
            typingDiv.remove();
        }
        this.currentTyping = false;
    }

    sendMessage() {
        const input = document.getElementById('robotInput');
        const message = input.value.trim();

        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            this.processMessage(message);
        }
    }

    processMessage(message) {
        this.showTyping();

        setTimeout(() => {
            this.hideTyping();
            const response = this.getResponse(message);
            this.addMessage(response, 'robot');
        }, 1000 + Math.random() * 1000);
    }

    getResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Greeting patterns
        if (lowerMessage.includes('أهلا') || lowerMessage.includes('مرحبا') || lowerMessage.includes('سلام') || lowerMessage.includes('هلا')) {
            return this.getRandomResponse('greeting');
        }

        // Services patterns
        if (lowerMessage.includes('خدمات') || lowerMessage.includes('خدمة') || lowerMessage.includes('خياطة') || lowerMessage.includes('بدلة') || lowerMessage.includes('فستان')) {
            return this.getRandomResponse('services');
        }

        // Contact patterns
        if (lowerMessage.includes('اتصال') || lowerMessage.includes('تواصل') || lowerMessage.includes('هاتف') || lowerMessage.includes('واتساب') || lowerMessage.includes('عنوان')) {
            return this.getRandomResponse('contact');
        }

        // Pricing patterns
        if (lowerMessage.includes('سعر') || lowerMessage.includes('أسعار') || lowerMessage.includes('تكلفة') || lowerMessage.includes('كم') || lowerMessage.includes('ثمن')) {
            return this.getRandomResponse('pricing');
        }

        // Hours patterns
        if (lowerMessage.includes('وقت') || lowerMessage.includes('ساعة') || lowerMessage.includes('مفتوح') || lowerMessage.includes('مغلق') || lowerMessage.includes('عمل')) {
            return this.getRandomResponse('hours');
        }

        // Location patterns
        if (lowerMessage.includes('مكان') || lowerMessage.includes('موقع') || lowerMessage.includes('عنوان') || lowerMessage.includes('أين') || lowerMessage.includes('خريطة')) {
            return this.getRandomResponse('location');
        }

        // Default response
        return this.getRandomResponse('default');
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize robot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IraqiRobot();
});
