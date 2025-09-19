// Advanced Security System for Admin Panel
class SecuritySystem {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.loginAttempts = this.getLoginAttempts();
        this.sessionStartTime = null;
        this.isLocked = false;
        this.securityKey = this.generateSecurityKey();

        this.init();
    }

    init() {
        this.checkSecurityStatus();
        this.setupEventListeners();
        this.startSessionMonitoring();
        this.setupDataProtection();
    }

    // Generate unique security key
    generateSecurityKey() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return btoa(timestamp + random);
    }

    // Check if admin panel is locked
    checkSecurityStatus() {
        const lockData = localStorage.getItem('adminLockData');
        if (lockData) {
            const lockInfo = JSON.parse(lockData);
            const now = Date.now();

            if (now < lockInfo.unlockTime) {
                this.isLocked = true;
                this.showLockoutMessage(lockInfo.unlockTime - now);
                return true;
            } else {
                localStorage.removeItem('adminLockData');
                localStorage.removeItem('loginAttempts');
            }
        }
        return false;
    }

    // Get login attempts from storage
    getLoginAttempts() {
        const attempts = localStorage.getItem('loginAttempts');
        return attempts ? JSON.parse(attempts) : { count: 0, lastAttempt: 0 };
    }

    // Save login attempts to storage
    saveLoginAttempts() {
        localStorage.setItem('loginAttempts', JSON.stringify(this.loginAttempts));
    }

    // Increment login attempts
    incrementLoginAttempts() {
        this.loginAttempts.count++;
        this.loginAttempts.lastAttempt = Date.now();
        this.saveLoginAttempts();

        if (this.loginAttempts.count >= this.maxLoginAttempts) {
            this.lockAdminPanel();
        }
    }

    // Lock admin panel
    lockAdminPanel() {
        const unlockTime = Date.now() + this.lockoutDuration;
        const lockData = {
            unlockTime: unlockTime,
            reason: 'Too many failed login attempts',
            timestamp: Date.now()
        };

        localStorage.setItem('adminLockData', JSON.stringify(lockData));
        this.isLocked = true;
        this.showLockoutMessage(this.lockoutDuration);

        // Log security event
        this.logSecurityEvent('ADMIN_LOCKED', 'Too many failed login attempts');
    }

    // Show lockout message
    showLockoutMessage(remainingTime) {
        const minutes = Math.ceil(remainingTime / (60 * 1000));
        const message = `
            <div class="security-lockout">
                <div class="security-lockout-content">
                    <h2>🔒 تم قفل لوحة التحكم</h2>
                    <p>تم قفل لوحة التحكم بسبب محاولات تسجيل دخول متعددة فاشلة.</p>
                    <p>سيتم فتح القفل خلال: <strong>${minutes} دقيقة</strong></p>
                    <div class="security-countdown" id="securityCountdown">${minutes}:00</div>
                    <button onclick="location.reload()" class="btn btn-primary">إعادة المحاولة</button>
                </div>
            </div>
        `;

        document.body.innerHTML = message;
        this.startCountdown(remainingTime);
    }

    // Start countdown timer
    startCountdown(remainingTime) {
        const countdownElement = document.getElementById('securityCountdown');
        const interval = setInterval(() => {
            remainingTime -= 1000;
            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

            if (countdownElement) {
                countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            if (remainingTime <= 0) {
                clearInterval(interval);
                location.reload();
            }
        }, 1000);
    }

    // Reset login attempts on successful login
    resetLoginAttempts() {
        this.loginAttempts = { count: 0, lastAttempt: 0 };
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('adminLockData');
        this.isLocked = false;
    }

    // Start session monitoring
    startSessionMonitoring() {
        this.sessionStartTime = Date.now();

        // Check session timeout every minute
        setInterval(() => {
            if (this.sessionStartTime && (Date.now() - this.sessionStartTime) > this.sessionTimeout) {
                this.endSession('Session timeout');
            }
        }, 60000);

        // Monitor user activity
        this.setupActivityMonitoring();
    }

    // Setup activity monitoring
    setupActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, () => {
                this.sessionStartTime = Date.now();
            }, true);
        });
    }

    // End session
    endSession(reason) {
        this.logSecurityEvent('SESSION_ENDED', reason);
        localStorage.removeItem('adminSession');
        alert('انتهت جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = 'admin.html';
    }

    // Setup data protection
    setupDataProtection() {
        // Encrypt sensitive data before saving
        this.originalSaveData = window.saveData;
        window.saveData = (data) => {
            const encryptedData = this.encryptData(data);
            localStorage.setItem('tailoringData', encryptedData);
            this.logSecurityEvent('DATA_SAVED', 'Data encrypted and saved');
        };

        // Decrypt data when loading
        this.originalLoadData = window.loadTailoringData;
        window.loadTailoringData = () => {
            const encryptedData = localStorage.getItem('tailoringData');
            if (encryptedData) {
                const decryptedData = this.decryptData(encryptedData);
                this.logSecurityEvent('DATA_LOADED', 'Data decrypted and loaded');
                return decryptedData;
            }
            return null;
        };
    }

    // Encrypt data
    encryptData(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = btoa(jsonString + this.securityKey);
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return JSON.stringify(data);
        }
    }

    // Decrypt data
    decryptData(encryptedData) {
        try {
            const decrypted = atob(encryptedData);
            const jsonString = decrypted.replace(this.securityKey, '');
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decryption error:', error);
            return JSON.parse(encryptedData);
        }
    }

    // Log security events
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            ip: 'Unknown' // Would be server-side in production
        };

        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(logEntry);

        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }

        localStorage.setItem('securityLogs', JSON.stringify(logs));
    }

    // Setup event listeners
    setupEventListeners() {
        // Prevent right-click context menu (optional)
        // document.addEventListener('contextmenu', (e) => {
        //     e.preventDefault();
        //     this.logSecurityEvent('RIGHT_CLICK_BLOCKED', 'Context menu blocked');
        // });

        // Prevent F12 and other dev tools (optional)
        // document.addEventListener('keydown', (e) => {
        //     if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        //         e.preventDefault();
        //         this.logSecurityEvent('DEV_TOOLS_BLOCKED', 'Developer tools blocked');
        //         alert('غير مسموح بفتح أدوات المطور');
        //     }
        // });

        // Prevent text selection (optional)
        // document.addEventListener('selectstart', (e) => {
        //     e.preventDefault();
        // });

        // Prevent drag and drop (optional)
        // document.addEventListener('dragstart', (e) => {
        //     e.preventDefault();
        // });

        // Monitor for suspicious activity (disabled)
        // this.setupSuspiciousActivityMonitoring();
    }

    // Setup suspicious activity monitoring
    setupSuspiciousActivityMonitoring() {
        let suspiciousActivityCount = 0;

        // Monitor rapid clicks (increased threshold)
        document.addEventListener('click', () => {
            suspiciousActivityCount++;
            if (suspiciousActivityCount > 200) { // Increased from 50 to 200
                this.logSecurityEvent('SUSPICIOUS_ACTIVITY', 'Rapid clicking detected');
                // alert('تم اكتشاف نشاط مشبوه. يرجى التوقف عن النقر المتكرر.');
                suspiciousActivityCount = 0;
            }

            setTimeout(() => {
                suspiciousActivityCount = Math.max(0, suspiciousActivityCount - 1);
            }, 1000);
        });

        // Monitor page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logSecurityEvent('PAGE_HIDDEN', 'User switched tabs or minimized window');
            } else {
                this.logSecurityEvent('PAGE_VISIBLE', 'User returned to page');
            }
        });
    }

    // Validate admin credentials
    validateCredentials(username, password) {
        if (this.isLocked) {
            return { success: false, message: 'لوحة التحكم مقفلة مؤقتاً' };
        }

        // Enhanced credential validation
        const validCredentials = this.getValidCredentials();

        if (username === validCredentials.username && password === validCredentials.password) {
            this.resetLoginAttempts();
            this.startSession();
            this.logSecurityEvent('LOGIN_SUCCESS', `User: ${username}`);
            return { success: true, message: 'تم تسجيل الدخول بنجاح' };
        } else {
            this.incrementLoginAttempts();
            this.logSecurityEvent('LOGIN_FAILED', `Username: ${username}, Attempts: ${this.loginAttempts.count}`);
            return {
                success: false,
                message: `فشل تسجيل الدخول. المحاولات المتبقية: ${this.maxLoginAttempts - this.loginAttempts.count}`
            };
        }
    }

    // Get valid credentials (encrypted)
    getValidCredentials() {
        const encryptedCredentials = localStorage.getItem('adminCredentials');
        if (encryptedCredentials) {
            try {
                return this.decryptData(encryptedCredentials);
            } catch (error) {
                console.error('Error decrypting credentials:', error);
            }
        }

        // Default credentials (should be changed)
        return {
            username: 'admin',
            password: 'admin123'
        };
    }

    // Save encrypted credentials
    saveCredentials(username, password) {
        const credentials = { username, password };
        const encryptedCredentials = this.encryptData(credentials);
        localStorage.setItem('adminCredentials', encryptedCredentials);
        this.logSecurityEvent('CREDENTIALS_UPDATED', 'Admin credentials updated');
    }

    // Start admin session
    startSession() {
        const sessionData = {
            startTime: Date.now(),
            securityKey: this.securityKey,
            userAgent: navigator.userAgent
        };

        localStorage.setItem('adminSession', this.encryptData(sessionData));
        this.sessionStartTime = Date.now();
    }

    // Check if session is valid
    isValidSession() {
        const sessionData = localStorage.getItem('adminSession');
        if (!sessionData) return false;

        try {
            const decryptedSession = this.decryptData(sessionData);
            const now = Date.now();

            // Check if session is expired
            if (now - decryptedSession.startTime > this.sessionTimeout) {
                this.endSession('Session expired');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }

    // Get security logs
    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('securityLogs') || '[]');
    }

    // Clear security logs
    clearSecurityLogs() {
        localStorage.removeItem('securityLogs');
        this.logSecurityEvent('LOGS_CLEARED', 'Security logs cleared');
    }
}

// Initialize security system
let securitySystem;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin page
    if (window.location.pathname.includes('admin.html')) {
        securitySystem = new SecuritySystem();
    }
});

// Export for global access
window.SecuritySystem = SecuritySystem;
