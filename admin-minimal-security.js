// Minimal Admin Security - Only Basic Login Protection
class MinimalAdminSecurity {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.loginAttempts = this.getLoginAttempts();
        this.sessionStartTime = null;
        this.isLocked = false;

        this.init();
    }

    init() {
        this.checkSecurityStatus();
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

    // Validate admin credentials
    validateCredentials(username, password) {
        if (this.isLocked) {
            return { success: false, message: 'لوحة التحكم مقفلة مؤقتاً' };
        }

        // Simple credential validation
        const validCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        if (username === validCredentials.username && password === validCredentials.password) {
            this.resetLoginAttempts();
            return { success: true, message: 'تم تسجيل الدخول بنجاح' };
        } else {
            this.incrementLoginAttempts();
            return {
                success: false,
                message: `فشل تسجيل الدخول. المحاولات المتبقية: ${this.maxLoginAttempts - this.loginAttempts.count}`
            };
        }
    }
}

// Initialize minimal security system
let minimalSecuritySystem;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on admin page
    if (window.location.pathname.includes('admin.html')) {
        minimalSecuritySystem = new MinimalAdminSecurity();
    }
});

// Export for global access
window.MinimalAdminSecurity = MinimalAdminSecurity;
