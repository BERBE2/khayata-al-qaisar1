// Minimal Security - Only Copyright Notice
document.addEventListener('DOMContentLoaded', () => {
    // Only add copyright notice, no other protection
    if (!window.location.pathname.includes('admin.html')) {
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
});
