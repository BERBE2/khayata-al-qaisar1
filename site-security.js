// Site Security Protection
class SiteSecurity {
    constructor() {
        this.init();
    }

    init() {
        this.setupBasicProtection();
        this.setupContentProtection();
        this.setupAntiBotProtection();
        this.setupDataProtection();
    }

    // Basic security protection
    setupBasicProtection() {
        // Only apply basic protection, remove aggressive blocking
        // Prevent right-click context menu (optional)
        document.addEventListener('contextmenu', (e) => {
            // Only prevent on images and sensitive content
            if (e.target.tagName === 'IMG' || e.target.closest('.gallery-item')) {
                e.preventDefault();
            }
        });

        // Remove F12 blocking to prevent issues
        // document.addEventListener('keydown', (e) => {
        //     if (e.key === 'F12' || 
        //         (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        //         (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        //         (e.ctrlKey && e.shiftKey && e.key === 'J')) {
        //         e.preventDefault();
        //         this.showSecurityWarning();
        //     }
        // });

        // Allow text selection for better user experience
        // document.addEventListener('selectstart', (e) => {
        //     e.preventDefault();
        // });

        // Prevent drag and drop only on images
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    // Content protection
    setupContentProtection() {
        // Add watermark to images (optional)
        // this.addImageWatermark();

        // Protect text content (optional)
        // this.protectTextContent();

        // Add copyright notice
        this.addCopyrightNotice();
    }

    // Add watermark to images
    addImageWatermark() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                this.addWatermarkToImage(img);
            });
        });
    }

    // Add watermark to specific image
    addWatermarkToImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Add watermark text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('خياطة القيصر', canvas.width / 2, canvas.height - 20);

        // Replace original image
        img.src = canvas.toDataURL();
    }

    // Protect text content
    protectTextContent() {
        // Add invisible watermark to text
        const textElements = document.querySelectorAll('h1, h2, h3, p');
        textElements.forEach(element => {
            element.style.userSelect = 'none';
            element.style.webkitUserSelect = 'none';
            element.style.mozUserSelect = 'none';
            element.style.msUserSelect = 'none';
        });
    }

    // Add copyright notice
    addCopyrightNotice() {
        const notice = document.createElement('div');
        notice.innerHTML = '© 2024 خياطة القيصر - جميع الحقوق محفوظة';
        notice.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            text-align: center;
            padding: 5px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(notice);
    }

    // Anti-bot protection
    setupAntiBotProtection() {
        // Detect automated behavior (reduced sensitivity)
        this.detectAutomatedBehavior();

        // Remove CAPTCHA to prevent blocking
        // this.addSimpleCaptcha();

        // Monitor suspicious activity (reduced sensitivity)
        this.monitorSuspiciousActivity();
    }

    // Detect automated behavior
    detectAutomatedBehavior() {
        let clickCount = 0;
        let lastClickTime = 0;

        document.addEventListener('click', (e) => {
            const now = Date.now();

            // Detect rapid clicking (increased threshold)
            if (now - lastClickTime < 50) {
                clickCount++;
                if (clickCount > 50) { // Increased from 10 to 50
                    this.handleSuspiciousActivity('Rapid clicking detected');
                }
            } else {
                clickCount = 0;
            }

            lastClickTime = now;
        });

        // Detect automated scrolling (increased threshold)
        let scrollCount = 0;
        let lastScrollTime = 0;

        window.addEventListener('scroll', () => {
            const now = Date.now();

            if (now - lastScrollTime < 100) { // Increased from 50 to 100
                scrollCount++;
                if (scrollCount > 100) { // Increased from 20 to 100
                    this.handleSuspiciousActivity('Automated scrolling detected');
                }
            } else {
                scrollCount = 0;
            }

            lastScrollTime = now;
        });
    }

    // Add simple CAPTCHA
    addSimpleCaptcha() {
        // This is a simple implementation
        // In production, use a proper CAPTCHA service
        const captchaDiv = document.createElement('div');
        captchaDiv.id = 'simpleCaptcha';
        captchaDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: none;
        `;

        captchaDiv.innerHTML = `
            <h3>تأكيد الأمان</h3>
            <p>يرجى حل هذا السؤال البسيط:</p>
            <div id="captchaQuestion"></div>
            <input type="text" id="captchaAnswer" placeholder="الإجابة">
            <button onclick="verifyCaptcha()">تحقق</button>
        `;

        document.body.appendChild(captchaDiv);
    }

    // Monitor suspicious activity
    monitorSuspiciousActivity() {
        // Monitor page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logActivity('Page hidden');
            } else {
                this.logActivity('Page visible');
            }
        });

        // Monitor focus
        window.addEventListener('focus', () => {
            this.logActivity('Window focused');
        });

        window.addEventListener('blur', () => {
            this.logActivity('Window blurred');
        });
    }

    // Handle suspicious activity
    handleSuspiciousActivity(activity) {
        this.logActivity(`Suspicious activity: ${activity}`);

        // Only show warning for very suspicious activity
        // this.showSecurityWarning();

        // In production, you might want to:
        // - Block the user
        // - Report to server
        // - Add to blacklist
    }

    // Show security warning
    showSecurityWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;

        warning.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2>⚠️ تحذير أمني</h2>
                <p>تم اكتشاف نشاط مشبوه. يرجى التوقف عن هذا النشاط.</p>
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; margin-top: 10px;">
                    فهمت
                </button>
            </div>
        `;

        document.body.appendChild(warning);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 5000);
    }

    // Data protection
    setupDataProtection() {
        // Encrypt sensitive data (optional)
        // this.encryptSensitiveData();

        // Add data integrity checks (optional)
        // this.addDataIntegrityChecks();

        // Protect against XSS (basic)
        this.protectAgainstXSS();
    }

    // Encrypt sensitive data
    encryptSensitiveData() {
        // Simple encryption for sensitive data
        const sensitiveElements = document.querySelectorAll('[data-sensitive]');
        sensitiveElements.forEach(element => {
            const originalText = element.textContent;
            const encrypted = this.simpleEncrypt(originalText);
            element.textContent = encrypted;

            // Decrypt on hover
            element.addEventListener('mouseenter', () => {
                element.textContent = originalText;
            });

            element.addEventListener('mouseleave', () => {
                element.textContent = encrypted;
            });
        });
    }

    // Simple encryption
    simpleEncrypt(text) {
        return btoa(text).split('').reverse().join('');
    }

    // Add data integrity checks
    addDataIntegrityChecks() {
        // Check for data tampering
        const dataElements = document.querySelectorAll('[data-integrity]');
        dataElements.forEach(element => {
            const expectedHash = element.getAttribute('data-integrity');
            const actualHash = this.simpleHash(element.textContent);

            if (expectedHash !== actualHash) {
                this.handleDataTampering(element);
            }
        });
    }

    // Simple hash function
    simpleHash(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Handle data tampering
    handleDataTampering(element) {
        element.style.background = 'red';
        element.style.color = 'white';
        element.textContent = '⚠️ بيانات ممسوخة';

        this.logActivity('Data tampering detected');
    }

    // Protect against XSS
    protectAgainstXSS() {
        // Sanitize user input
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                const sanitized = this.sanitizeInput(value);
                if (value !== sanitized) {
                    e.target.value = sanitized;
                    this.logActivity('XSS attempt blocked');
                }
            });
        });
    }

    // Sanitize input
    sanitizeInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    // Log activity
    logActivity(activity) {
        const log = {
            timestamp: new Date().toISOString(),
            activity: activity,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Store in localStorage (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('siteSecurityLogs') || '[]');
        logs.push(log);

        // Keep only last 50 logs
        if (logs.length > 50) {
            logs.splice(0, logs.length - 50);
        }

        localStorage.setItem('siteSecurityLogs', JSON.stringify(logs));
    }

    // Get security logs
    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('siteSecurityLogs') || '[]');
    }

    // Clear security logs
    clearSecurityLogs() {
        localStorage.removeItem('siteSecurityLogs');
    }
}

// Initialize site security
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main site pages (not admin)
    if (!window.location.pathname.includes('admin.html')) {
        new SiteSecurity();
    }
});

// Export for global access
window.SiteSecurity = SiteSecurity;
