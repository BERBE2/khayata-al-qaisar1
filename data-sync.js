// Data Synchronization Script
// This script ensures data is properly synced between admin panel and main site

// Global data object
window.TailoringData = {
    menImages: [],
    womenImages: [],
    siteSettings: {
        phoneNumber: '+07769592080',
        whatsappNumber: '+07769592080',
        address: 'حي الأندلس - قرب مودا مول',
        mapLink: 'https://maps.google.com'
    }
};

// Cloud sync status
let cloudSyncActive = false;

// Check cloud sync status
function checkCloudSync() {
    if (window.cloudSync) {
        cloudSyncActive = true;
        console.log('✅ المزامنة السحابية متاحة');
    } else {
        cloudSyncActive = false;
        console.log('⚠️ المزامنة السحابية غير متاحة');
    }
}

// جلب البيانات من السحابة
async function fetchDataFromCloud() {
    if (!window.cloudSync) {
        console.log('⚠️ نظام المزامنة السحابية غير متاح');
        return null;
    }

    try {
        const cloudData = await window.cloudSync.fetchData();
        if (cloudData) {
            console.log('✅ تم جلب البيانات من السحابة:', cloudData);
            return cloudData;
        } else {
            console.log('⚠️ لا توجد بيانات في السحابة');
            return null;
        }
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات من السحابة:', error);
        return null;
    }
}

// Load data from localStorage and cloud
async function loadTailoringData() {
    // محاولة جلب البيانات من السحابة أولاً
    const cloudData = await fetchDataFromCloud();

    if (cloudData) {
        // استخدام البيانات من السحابة
        window.TailoringData = {
            menImages: cloudData.menImages || [],
            womenImages: cloudData.womenImages || [],
            siteSettings: cloudData.siteSettings || window.TailoringData.siteSettings
        };

        // حفظ البيانات محلياً كنسخة احتياطية
        localStorage.setItem('tailoringData', JSON.stringify(cloudData));
        console.log('✅ تم تحميل البيانات من السحابة:', window.TailoringData);
    } else {
        // استخدام البيانات المحلية كاحتياطي
        const savedData = localStorage.getItem('tailoringData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                window.TailoringData = {
                    menImages: data.menImages || [],
                    womenImages: data.womenImages || [],
                    siteSettings: data.siteSettings || window.TailoringData.siteSettings
                };
                console.log('💾 تم تحميل البيانات المحلية:', window.TailoringData);
            } catch (e) {
                console.error('❌ خطأ في تحميل البيانات المحلية:', e);
            }
        }
    }
}

// Save data to localStorage
function saveTailoringData() {
    const data = {
        menImages: window.TailoringData.menImages,
        womenImages: window.TailoringData.womenImages,
        siteSettings: window.TailoringData.siteSettings,
        lastUpdate: new Date().toISOString()
    };

    localStorage.setItem('tailoringData', JSON.stringify(data));

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
        detail: data
    }));

    console.log('Data saved successfully:', data);
}

// Update gallery images
async function updateGalleryImages() {
    // محاولة جلب أحدث البيانات من السحابة
    if (window.cloudSync) {
        try {
            const cloudData = await window.cloudSync.fetchData();
            if (cloudData) {
                window.TailoringData.menImages = cloudData.menImages || [];
                window.TailoringData.womenImages = cloudData.womenImages || [];
                console.log('✅ تم تحديث الصور من السحابة');
            }
        } catch (error) {
            console.log('⚠️ استخدام الصور المحلية');
        }
    }

    const menImages = window.TailoringData.menImages || [];
    const womenImages = window.TailoringData.womenImages || [];

    console.log('Updating gallery images:', { menImages, womenImages });

    // Check if gallery items exist
    const allGalleryItems = document.querySelectorAll('.gallery-item');
    console.log('Total gallery items found:', allGalleryItems.length);

    // Update gallery items based on current page
    const currentPage = getCurrentPageType();
    console.log('Current page type:', currentPage);

    if (currentPage === 'men' || currentPage === 'index') {
        updateMenGallery(menImages);
    }

    if (currentPage === 'women' || currentPage === 'index') {
        updateWomenGallery(womenImages);
    }
}

function getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('men.html')) return 'men';
    if (path.includes('women.html')) return 'women';
    return 'index';
}

function updateMenGallery(menImages) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    console.log('Found men gallery items:', galleryItems.length);
    console.log('Current page URL:', window.location.href);
    console.log('Available men images:', menImages.length);

    if (galleryItems.length === 0) {
        console.log('No gallery items found on this page');
        return;
    }

    galleryItems.forEach((item, index) => {
        const placeholder = item.querySelector('.gallery-placeholder');
        if (placeholder && menImages[index]) {
            const image = menImages[index];
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
                    window.showImageDetails(image, menImages);
                }
            });

            console.log('Updated men image:', image.title);
        } else if (placeholder) {
            console.log(`No image available for gallery item ${index}`);
        }
    });
}

function updateWomenGallery(womenImages) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    console.log('Found women gallery items:', galleryItems.length);
    console.log('Current page URL:', window.location.href);
    console.log('Available women images:', womenImages.length);

    if (galleryItems.length === 0) {
        console.log('No gallery items found on this page');
        return;
    }

    galleryItems.forEach((item, index) => {
        const placeholder = item.querySelector('.gallery-placeholder');
        if (placeholder && womenImages[index]) {
            const image = womenImages[index];
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
                    window.showImageDetails(image, womenImages);
                }
            });

            console.log('Updated women image:', image.title);
        } else if (placeholder) {
            console.log(`No image available for gallery item ${index}`);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Data sync script loaded');
    console.log('Current page:', window.location.pathname);
    console.log('Page type:', getCurrentPageType());

    // Check cloud sync availability
    setTimeout(checkCloudSync, 1000);

    // تحميل البيانات من السحابة أولاً
    await loadTailoringData();
    updateGalleryImages();
    updateSiteSettings();

    // بدء المزامنة التلقائية من السحابة
    startCloudSync();
});

// بدء المزامنة التلقائية من السحابة
function startCloudSync() {
    // مزامنة فورية عند التحميل
    setTimeout(async () => {
        await loadTailoringData();
        updateGalleryImages();
        updateSiteSettings();
    }, 3000);

    // مزامنة دورية كل 10 ثوان
    setInterval(async () => {
        console.log('🔄 مزامنة تلقائية من السحابة...');
        await loadTailoringData();
        updateGalleryImages();
        updateSiteSettings();
    }, 10000);
}

// Listen for data updates
window.addEventListener('tailoringDataUpdated', function (e) {
    console.log('Data updated event received:', e.detail);
    window.TailoringData = {
        menImages: e.detail.menImages || [],
        womenImages: e.detail.womenImages || [],
        siteSettings: e.detail.siteSettings || {}
    };
    updateGalleryImages();
    updateSiteSettings();
});

async function updateSiteSettings() {
    // محاولة جلب أحدث البيانات من السحابة
    if (window.cloudSync) {
        try {
            const cloudData = await window.cloudSync.fetchData();
            if (cloudData && cloudData.siteSettings) {
                window.TailoringData.siteSettings = cloudData.siteSettings;
                console.log('✅ تم تحديث الإعدادات من السحابة');
            }
        } catch (error) {
            console.log('⚠️ استخدام الإعدادات المحلية');
        }
    }

    const settings = window.TailoringData.siteSettings;
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

// Listen for storage changes
window.addEventListener('storage', function (e) {
    if (e.key === 'tailoringData') {
        console.log('Storage changed, reloading data...');
        loadTailoringData();
        updateGalleryImages();
    }
});

// Check for updates every 3 seconds
setInterval(function () {
    loadTailoringData();
    updateGalleryImages();
    updateSiteSettings();
}, 3000);

// Make functions globally available
window.loadTailoringData = loadTailoringData;
window.saveTailoringData = saveTailoringData;
window.updateGalleryImages = updateGalleryImages;
