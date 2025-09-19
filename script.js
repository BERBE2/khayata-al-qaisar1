// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#ffffff';
        header.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .service-card, .service-item, .gallery-item, .step, .material-item, .contact-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// WhatsApp click tracking
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
        // You can add analytics tracking here
        console.log('WhatsApp link clicked');
    });
});

// Phone click tracking
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        // You can add analytics tracking here
        console.log('Phone link clicked');
    });
});

// Add hover effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-2px)';
    });

    btn.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
    });
});

// Gallery image lazy loading simulation
document.querySelectorAll('.gallery-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', function () {
        // Simulate image loading
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>جاري التحميل...</p>';

        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-image"></i><p>صورة قريباً</p>';
        }, 2000);
    });
});

// Add ripple effect to cards
document.querySelectorAll('.feature-card, .service-card, .service-item').forEach(card => {
    card.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .feature-card, .service-card, .service-item {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(139, 69, 19, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Form validation (if forms are added later)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#d2b48c';
        }
    });

    return isValid;
}

// Add scroll to top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--gradient);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to scroll to top button
scrollToTopBtn.addEventListener('mouseenter', function () {
    this.style.transform = 'scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', function () {
    this.style.transform = 'scale(1)';
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#ffffff';
        header.style.backdropFilter = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Load images from admin panel
function loadGalleryImages() {
    const savedData = localStorage.getItem('tailoringData');
    console.log('Loading gallery images...', savedData);

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Parsed data:', data);
            updateGalleryImages(data.menImages, data.womenImages);
        } catch (e) {
            console.error('Error loading gallery images:', e);
        }
    } else {
        console.log('No saved data found');
    }
}

function updateGalleryImages(menImages, womenImages) {
    console.log('Updating gallery images:', { menImages, womenImages });

    // Ensure arrays are defined
    menImages = menImages || [];
    womenImages = womenImages || [];

    // Update all gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    console.log('Found gallery items:', galleryItems.length);

    galleryItems.forEach((item, index) => {
        const placeholder = item.querySelector('.gallery-placeholder');
        if (placeholder) {
            // Try men images first, then women images
            let image = menImages[index] || womenImages[index];

            if (image) {
                placeholder.innerHTML = `
                    <img src="${image.image}" alt="${image.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 10px;">
                        <h4 style="margin: 0; font-size: 1rem;">${image.title}</h4>
                        ${image.price ? `<p style="margin: 5px 0 0 0; font-size: 0.9rem;">${image.price}</p>` : ''}
                    </div>
                `;
                placeholder.style.position = 'relative';

                // Add click event to show image details
                item.addEventListener('click', () => {
                    if (window.showImageDetails) {
                        const allImages = [...menImages, ...womenImages];
                        window.showImageDetails(image, allImages);
                    }
                });

                console.log('Updated image:', image.title);
            }
        }
    });
}

// Load gallery images on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, loading gallery images...');
    loadGalleryImages();

    // Initialize enhanced features
    initializeScrollAnimations();
    initializeHeaderEffects();
    initializeLoadingStates();
    initializeLogoEffects();
});

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Add scroll animation to elements
    document.querySelectorAll('.feature-card, .service-card, .contact-item, .gallery-item').forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Header scroll effects
function initializeHeaderEffects() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    });
}

// Loading states for images
function initializeLoadingStates() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.remove('loading');
        });

        if (!img.complete) {
            img.classList.add('loading');
        }
    });
}

// Logo animations
function initializeLogoEffects() {
    const logo = document.querySelector('.logo');
    const logoSvg = document.querySelector('.logo-svg');

    if (logo && logoSvg) {
        // Add pulse animation on page load
        setTimeout(() => {
            logoSvg.style.animation = 'pulse 2s ease-in-out';
        }, 1000);

        // Add hover effects
        logo.addEventListener('mouseenter', () => {
            logoSvg.style.filter = 'drop-shadow(0 8px 16px var(--shadow-gold)) brightness(1.1)';
        });

        logo.addEventListener('mouseleave', () => {
            logoSvg.style.filter = 'drop-shadow(0 4px 8px var(--shadow-gold)) brightness(1)';
        });

        // Add click effect
        logo.addEventListener('click', () => {
            logoSvg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                logoSvg.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    logoSvg.style.transform = 'scale(1)';
                }, 150);
            }, 100);
        });
    }
}

// Listen for storage changes (when admin panel updates data)
window.addEventListener('storage', function (e) {
    if (e.key === 'tailoringData') {
        console.log('Storage changed, reloading images...');
        loadGalleryImages();
    }
});

// Listen for custom data updates
window.addEventListener('tailoringDataUpdated', function (e) {
    console.log('Custom data update received:', e.detail);
    if (e.detail && e.detail.menImages && e.detail.womenImages) {
        updateGalleryImages(e.detail.menImages, e.detail.womenImages);
    }
    if (e.detail && e.detail.siteSettings) {
        updateSiteSettings(e.detail.siteSettings);
    }
});

function updateSiteSettings(settings) {
    if (!settings) return;

    console.log('Updating site settings:', settings);

    // Update phone numbers
    const phoneElements = document.querySelectorAll('a[href^="tel:"]');
    phoneElements.forEach(el => {
        el.href = `tel:${settings.phoneNumber}`;
        const phoneText = el.querySelector('p') || el;
        if (phoneText.textContent.includes('+') || phoneText.textContent.includes('077')) {
            phoneText.textContent = settings.phoneNumber;
        }
    });

    // Update whatsapp links
    const whatsappElements = document.querySelectorAll('a[href*="wa.me"]');
    whatsappElements.forEach(el => {
        el.href = `https://wa.me/${settings.whatsappNumber.replace('+', '')}`;
        const whatsappText = el.querySelector('p') || el;
        if (whatsappText.textContent.includes('+') || whatsappText.textContent.includes('077')) {
            whatsappText.textContent = settings.whatsappNumber;
        }
    });

    // Update address
    const addressElements = document.querySelectorAll('.contact-details p');
    addressElements.forEach(el => {
        if (el.textContent.includes('حي الأندلس') || el.textContent.includes('مول') || el.textContent.includes('العنوان')) {
            el.textContent = settings.address;
        }
    });

    // Update map links
    const mapLinks = document.querySelectorAll('a[href*="maps.google"]');
    mapLinks.forEach(el => {
        el.href = settings.mapLink;
    });

    console.log('Site settings updated successfully');
}

// Also check for changes every 2 seconds (fallback)
setInterval(() => {
    loadGalleryImages();
    // Also check for settings updates
    const savedData = localStorage.getItem('tailoringData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if (data.siteSettings) {
                updateSiteSettings(data.siteSettings);
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}, 2000);

