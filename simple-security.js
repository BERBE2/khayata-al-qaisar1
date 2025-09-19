// Simple Security System - Lightweight Protection
class SimpleSecurity {
    constructor() {
        this.init();
    }

    init() {
        this.setupBasicProtection();
        this.addCopyrightNotice();
    }

    // Basic security protection
    setupBasicProtection() {
        // Only prevent right-click on images (optional)
        // document.addEventListener('contextmenu', (e) => {
        //     if (e.target.tagName === 'IMG' || e.target.closest('.gallery-item')) {
        //         e.preventDefault();
        //     }
        // });

        // Prevent drag and drop only on images (optional)
        // document.addEventListener('dragstart', (e) => {
        //     if (e.target.tagName === 'IMG') {
        //         e.preventDefault();
        //     }
        // });
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
}

// Initialize simple security
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main site pages (not admin)
    if (!window.location.pathname.includes('admin.html')) {
        new SimpleSecurity();
    }
});

// Export for global access
window.SimpleSecurity = SimpleSecurity;
