// Admin Panel JavaScript

// Global Variables
let currentUser = null;
let currentSection = 'dashboard';
let menImages = [];
let womenImages = [];
let siteSettings = {
    phoneNumber: '+07769592080',
    whatsappNumber: '+07769592080',
    address: 'حي الأندلس - قرب مودا مول',
    mapLink: 'https://maps.google.com'
};

// Cloud Sync Status
let cloudSyncEnabled = false;

// Default admin credentials
const defaultCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Load saved data
    loadData();

    // Setup event listeners
    setupEventListeners();

    // Update stats
    updateStats();

    // Show login screen
    showLoginScreen();
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', handleQuickAction);
    });

    // Add image buttons
    document.getElementById('addMenImageBtn').addEventListener('click', () => openImageModal('men'));
    document.getElementById('addWomenImageBtn').addEventListener('click', () => openImageModal('women'));

    // Modal events
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    document.getElementById('saveImageBtn').addEventListener('click', saveImage);

    // File input for image preview
    document.getElementById('imageFile').addEventListener('change', previewImage);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);

    // Backup/Restore
    document.getElementById('backupBtn').addEventListener('click', backupData);
    document.getElementById('restoreBtn').addEventListener('click', () => {
        document.getElementById('backupFileInput').click();
    });

    document.getElementById('backupFileInput').addEventListener('change', restoreData);

    // Close modal when clicking outside
    document.getElementById('imageModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Use minimal security system for validation
    if (window.minimalSecuritySystem) {
        const result = window.minimalSecuritySystem.validateCredentials(username, password);

        if (result.success) {
            currentUser = { username, password };
            showAdminDashboard();
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } else {
        // Fallback to original login
        if (username === defaultCredentials.username && password === defaultCredentials.password) {
            currentUser = { username, password };
            showAdminDashboard();
            showMessage('تم تسجيل الدخول بنجاح!', 'success');
        } else {
            showMessage('اسم المستخدم أو كلمة المرور غير صحيحة!', 'error');
        }
    }
}

function handleLogout() {
    currentUser = null;
    showLoginScreen();
    showMessage('تم تسجيل الخروج بنجاح!', 'info');
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showAdminDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadImages();
}

// Navigation Functions
function handleNavigation(e) {
    e.preventDefault();

    const section = e.currentTarget.getAttribute('data-section');
    showSection(section);

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
}

function handleQuickAction(e) {
    const section = e.currentTarget.getAttribute('data-section');
    if (section) {
        e.preventDefault();
        showSection(section);

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    currentSection = sectionName;

    // Load section-specific data
    if (sectionName === 'men-gallery' || sectionName === 'women-gallery') {
        loadImages();
    }
}

// Image Management Functions
function openImageModal(type) {
    document.getElementById('modalTitle').textContent =
        type === 'men' ? 'إضافة صورة رجال جديدة' : 'إضافة صورة نساء جديدة';

    document.getElementById('imageForm').reset();
    document.getElementById('filePreview').innerHTML = '';

    // Store current type
    document.getElementById('imageModal').setAttribute('data-type', type);

    document.getElementById('imageModal').classList.add('active');
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
    document.getElementById('imageForm').reset();
    document.getElementById('filePreview').innerHTML = '';
}

function previewImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('filePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

function saveImage() {
    const form = document.getElementById('imageForm');
    const formData = new FormData(form);

    const file = document.getElementById('imageFile').files[0];
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDescription').value;
    const category = document.getElementById('imageCategory').value;
    const price = document.getElementById('imagePrice').value;
    const type = document.getElementById('imageModal').getAttribute('data-type');

    if (!file || !title) {
        showMessage('يرجى ملء جميع الحقول المطلوبة!', 'error');
        return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = function (e) {
        const imageData = {
            id: Date.now(),
            title: title,
            description: description,
            category: category,
            price: price,
            image: e.target.result,
            dateAdded: new Date().toLocaleDateString('ar-SA'),
            type: type
        };

        if (type === 'men') {
            menImages.push(imageData);
        } else {
            womenImages.push(imageData);
        }

        saveData();
        loadImages();
        updateStats();
        closeModal();
        showMessage('تم حفظ الصورة بنجاح!', 'success');

        // Trigger update for main site
        setTimeout(() => {
            if (window.TailoringData) {
                window.TailoringData.menImages = menImages;
                window.TailoringData.womenImages = womenImages;
                window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
                    detail: {
                        menImages: menImages,
                        womenImages: womenImages,
                        siteSettings: siteSettings
                    }
                }));
            }
        }, 100);
    };
    reader.readAsDataURL(file);
}

function loadImages() {
    loadMenImages();
    loadWomenImages();
}

function loadMenImages() {
    const grid = document.getElementById('menImagesGrid');
    grid.innerHTML = '';

    if (menImages.length === 0) {
        grid.innerHTML = `
            <div class="no-images">
                <i class="fas fa-image"></i>
                <p>لا توجد صور في معرض الرجال</p>
                <button class="btn btn-primary" onclick="openImageModal('men')">
                    <i class="fas fa-plus"></i> إضافة صورة جديدة
                </button>
            </div>
        `;
        return;
    }

    menImages.forEach(image => {
        const imageCard = createImageCard(image);
        grid.appendChild(imageCard);
    });
}

function loadWomenImages() {
    const grid = document.getElementById('womenImagesGrid');
    grid.innerHTML = '';

    if (womenImages.length === 0) {
        grid.innerHTML = `
            <div class="no-images">
                <i class="fas fa-image"></i>
                <p>لا توجد صور في معرض النساء</p>
                <button class="btn btn-primary" onclick="openImageModal('women')">
                    <i class="fas fa-plus"></i> إضافة صورة جديدة
                </button>
            </div>
        `;
        return;
    }

    womenImages.forEach(image => {
        const imageCard = createImageCard(image);
        grid.appendChild(imageCard);
    });
}

function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.innerHTML = `
        <div class="image-preview">
            <img src="${image.image}" alt="${image.title}">
        </div>
        <div class="image-info">
            <span class="image-category">${image.category}</span>
            <h3>${image.title}</h3>
            <p>${image.description}</p>
            ${image.price ? `<div class="image-price">${image.price}</div>` : ''}
            <div class="image-actions">
                <button class="btn btn-secondary" onclick="editImage(${image.id})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger" onclick="deleteImage(${image.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `;
    return card;
}

function editImage(imageId) {
    const image = [...menImages, ...womenImages].find(img => img.id === imageId);
    if (!image) return;

    const type = image.type;
    openImageModal(type);

    // Fill form with existing data
    document.getElementById('imageTitle').value = image.title;
    document.getElementById('imageDescription').value = image.description;
    document.getElementById('imageCategory').value = image.category;
    document.getElementById('imagePrice').value = image.price;

    // Show existing image
    document.getElementById('filePreview').innerHTML = `<img src="${image.image}" alt="Preview">`;

    // Store image ID for update
    document.getElementById('imageModal').setAttribute('data-edit-id', imageId);
}

function deleteImage(imageId) {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
        menImages = menImages.filter(img => img.id !== imageId);
        womenImages = womenImages.filter(img => img.id !== imageId);

        saveData();
        loadImages();
        updateStats();
        showMessage('تم حذف الصورة بنجاح!', 'success');
    }
}

// Settings Functions
function saveSettings() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Update contact info
    siteSettings.phoneNumber = document.getElementById('phoneNumber').value;
    siteSettings.whatsappNumber = document.getElementById('whatsappNumber').value;
    siteSettings.address = document.getElementById('address').value;
    siteSettings.mapLink = document.getElementById('mapLink').value;

    // Update credentials if provided
    if (newUsername && newPassword) {
        if (newPassword !== confirmPassword) {
            showMessage('كلمة المرور وتأكيدها غير متطابقتان!', 'error');
            return;
        }

        defaultCredentials.username = newUsername;
        defaultCredentials.password = newPassword;

        // Clear password fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    saveData();

    // Update main site settings
    updateMainSiteSettings();

    showMessage('تم حفظ الإعدادات بنجاح!', 'success');
}

function updateMainSiteSettings() {
    // Update contact info in main site
    const phoneElements = document.querySelectorAll('a[href^="tel:"]');
    const whatsappElements = document.querySelectorAll('a[href*="wa.me"]');
    const addressElements = document.querySelectorAll('.contact-details p');

    // Update phone links
    phoneElements.forEach(el => {
        el.href = `tel:${siteSettings.phoneNumber}`;
        el.textContent = siteSettings.phoneNumber;
    });

    // Update whatsapp links
    whatsappElements.forEach(el => {
        el.href = `https://wa.me/${siteSettings.whatsappNumber.replace('+', '')}`;
    });

    // Update address
    addressElements.forEach(el => {
        if (el.textContent.includes('حي الأندلس') || el.textContent.includes('مول')) {
            el.textContent = siteSettings.address;
        }
    });

    // Update map link
    const mapLinks = document.querySelectorAll('a[href*="maps.google"]');
    mapLinks.forEach(el => {
        el.href = siteSettings.mapLink;
    });

    // Trigger update for other tabs
    setTimeout(() => {
        if (window.TailoringData) {
            window.TailoringData.siteSettings = siteSettings;
            window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
                detail: {
                    menImages: menImages,
                    womenImages: womenImages,
                    siteSettings: siteSettings
                }
            }));
        }
    }, 100);
}

function resetSettings() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
        document.getElementById('phoneNumber').value = '+07769592080';
        document.getElementById('whatsappNumber').value = '+07769592080';
        document.getElementById('address').value = 'حي الأندلس - قرب مودا مول';
        document.getElementById('mapLink').value = 'https://maps.google.com';
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        showMessage('تم إعادة تعيين الإعدادات!', 'info');
    }
}

// Stats Functions
function updateStats() {
    document.getElementById('menImagesCount').textContent = menImages.length;
    document.getElementById('womenImagesCount').textContent = womenImages.length;
    document.getElementById('totalImagesCount').textContent = menImages.length + womenImages.length;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('ar-SA');
}

// Data Management Functions
async function saveData() {
    const data = {
        menImages: menImages,
        womenImages: womenImages,
        siteSettings: siteSettings,
        credentials: defaultCredentials,
        lastUpdate: new Date().toISOString()
    };

    // حفظ محلي
    localStorage.setItem('tailoringData', JSON.stringify(data));

    // مزامنة سحابية
    if (window.cloudSync && cloudSyncEnabled) {
        try {
            const syncResult = await window.cloudSync.forceSync();
            if (syncResult) {
                showMessage('✅ تم حفظ البيانات ومزامنتها عبر الإنترنت', 'success');
                updateCloudSyncStatus(true);
            } else {
                showMessage('⚠️ تم حفظ البيانات محلياً فقط (لا يوجد اتصال)', 'warning');
                updateCloudSyncStatus(false);
            }
        } catch (error) {
            console.error('خطأ في المزامنة السحابية:', error);
            showMessage('⚠️ تم حفظ البيانات محلياً فقط', 'warning');
            updateCloudSyncStatus(false);
        }
    } else {
        showMessage('💾 تم حفظ البيانات محلياً', 'info');
        updateCloudSyncStatus(false);
    }

    // Update global data object if available
    if (window.TailoringData) {
        window.TailoringData.menImages = menImages;
        window.TailoringData.womenImages = womenImages;
        window.TailoringData.siteSettings = siteSettings;
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
        detail: data
    }));

    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'tailoringData',
        newValue: JSON.stringify(data),
        url: window.location.href
    }));

    console.log('Data saved successfully:', data);
}

// تحديث حالة المزامنة السحابية
function updateCloudSyncStatus(isOnline) {
    const statusElement = document.getElementById('cloudSyncStatus');
    if (statusElement) {
        if (isOnline) {
            statusElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> متصل بالإنترنت';
            statusElement.className = 'status-online';
        } else {
            statusElement.innerHTML = '<i class="fas fa-cloud-slash"></i> غير متصل';
            statusElement.className = 'status-offline';
        }
    }
}

// تفعيل/إلغاء المزامنة السحابية
function toggleCloudSync() {
    cloudSyncEnabled = !cloudSyncEnabled;
    const toggleBtn = document.getElementById('cloudSyncToggle');
    if (toggleBtn) {
        toggleBtn.textContent = cloudSyncEnabled ? 'إيقاف المزامنة' : 'تفعيل المزامنة';
        toggleBtn.className = cloudSyncEnabled ? 'btn btn-success' : 'btn btn-secondary';
    }

    if (cloudSyncEnabled) {
        showMessage('✅ تم تفعيل المزامنة السحابية', 'success');
        // محاولة مزامنة فورية
        if (window.cloudSync) {
            window.cloudSync.forceSync();
        }
    } else {
        showMessage('⚠️ تم إيقاف المزامنة السحابية', 'warning');
    }
}

function loadData() {
    const savedData = localStorage.getItem('tailoringData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            menImages = data.menImages || [];
            womenImages = data.womenImages || [];
            siteSettings = data.siteSettings || siteSettings;
            defaultCredentials.username = data.credentials?.username || defaultCredentials.username;
            defaultCredentials.password = data.credentials?.password || defaultCredentials.password;
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

function backupData() {
    const data = {
        menImages: menImages,
        womenImages: womenImages,
        siteSettings: siteSettings,
        credentials: defaultCredentials,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `tailoring-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('تم إنشاء النسخة الاحتياطية بنجاح!', 'success');
}

function restoreData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm('هل أنت متأكد من استيراد البيانات؟ سيتم استبدال جميع البيانات الحالية.')) {
                menImages = data.menImages || [];
                womenImages = data.womenImages || [];
                siteSettings = data.siteSettings || siteSettings;

                if (data.credentials) {
                    defaultCredentials.username = data.credentials.username;
                    defaultCredentials.password = data.credentials.password;
                }

                saveData();
                loadImages();
                updateStats();
                showMessage('تم استيراد البيانات بنجاح!', 'success');
            }
        } catch (error) {
            showMessage('خطأ في قراءة الملف! تأكد من أن الملف صحيح.', 'error');
        }
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
}

// Utility Functions
function showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    // Add to admin main
    const adminMain = document.querySelector('.admin-main');
    adminMain.insertBefore(message, adminMain.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Export data for main website
function exportDataForWebsite() {
    return {
        menImages: menImages,
        womenImages: womenImages,
        siteSettings: siteSettings
    };
}

// Make functions globally available
window.openImageModal = openImageModal;
window.editImage = editImage;
window.deleteImage = deleteImage;
window.exportDataForWebsite = exportDataForWebsite;

// Security Functions (Simplified)
// All complex security functions removed to prevent issues
