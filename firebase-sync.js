// firebase-sync.js - نظام مزامنة مجاني باستخدام Firebase
class FirebaseSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.lastSyncTime = 0;
        this.db = null;
        this.init();
    }

    init() {
        console.log('🔥 تم تحميل نظام المزامنة Firebase');

        // تحميل Firebase SDK
        this.loadFirebase();

        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ تم الاتصال بالإنترنت');
            this.updateStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ تم قطع الاتصال بالإنترنت');
            this.updateStatus();
        });

        // بدء المزامنة التلقائية
        this.startAutoSync();

        // تحديث الحالة الأولية
        this.updateStatus();
    }

    // تحميل Firebase SDK
    loadFirebase() {
        // تحميل Firebase من CDN
        const firebaseScript = document.createElement('script');
        firebaseScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
        firebaseScript.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
            firestoreScript.onload = () => {
                this.initializeFirebase();
            };
            document.head.appendChild(firestoreScript);
        };
        document.head.appendChild(firebaseScript);
    }

    // تهيئة Firebase
    initializeFirebase() {
        try {
            // إعدادات Firebase المجانية
            const firebaseConfig = {
                apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // مفتاح API مجاني
                authDomain: "khayata-al-qaisar.firebaseapp.com",
                projectId: "khayata-al-qaisar",
                storageBucket: "khayata-al-qaisar.appspot.com",
                messagingSenderId: "123456789012",
                appId: "1:123456789012:web:abcdef1234567890abcdef"
            };

            // تهيئة Firebase
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();

            console.log('🔥 تم تهيئة Firebase بنجاح');
            this.setupRealtimeListener();
        } catch (error) {
            console.error('❌ خطأ في تهيئة Firebase:', error);
            this.fallbackToLocalSync();
        }
    }

    // إعداد مراقب الوقت الفعلي
    setupRealtimeListener() {
        if (!this.db) return;

        // مراقبة التغييرات في قاعدة البيانات
        this.db.collection('tailoringData').doc('main').onSnapshot((doc) => {
            if (doc.exists && this.syncEnabled) {
                const data = doc.data();
                if (data.timestamp > this.lastSyncTime) {
                    console.log('📥 تم استقبال تحديث من قاعدة البيانات');
                    this.handleDataUpdate(data);
                }
            }
        }, (error) => {
            console.error('❌ خطأ في مراقب قاعدة البيانات:', error);
            this.fallbackToLocalSync();
        });
    }

    // تفعيل/إلغاء المزامنة
    toggleSync() {
        this.syncEnabled = !this.syncEnabled;
        console.log('🔄 حالة المزامنة:', this.syncEnabled ? 'مفعلة' : 'معطلة');

        if (this.syncEnabled) {
            this.performSync();
        }

        this.updateStatus();
        return this.syncEnabled;
    }

    // تنفيذ المزامنة
    async performSync() {
        if (!this.syncEnabled || !this.isOnline) {
            return false;
        }

        try {
            const localData = this.getLocalData();
            if (!localData) return false;

            // حفظ البيانات في Firebase
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'firebase-sync',
                timestamp: Date.now()
            };

            if (this.db) {
                await this.db.collection('tailoringData').doc('main').set(syncData);
                console.log('✅ تم رفع البيانات إلى Firebase');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                return this.fallbackToLocalSync();
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة Firebase:', error);
            return this.fallbackToLocalSync();
        }
    }

    // المزامنة المحلية الاحتياطية
    fallbackToLocalSync() {
        try {
            const localData = this.getLocalData();
            if (!localData) return false;

            // حفظ في localStorage مع timestamp
            const syncData = {
                ...localData,
                lastLocalSync: new Date().toISOString(),
                syncSource: 'local-fallback',
                timestamp: Date.now()
            };

            localStorage.setItem('khayata_sync_data', JSON.stringify(syncData));
            console.log('💾 تم حفظ البيانات محلياً (احتياطي)');
            this.lastSyncTime = syncData.timestamp;
            return true;
        } catch (error) {
            console.error('❌ خطأ في المزامنة المحلية:', error);
            return false;
        }
    }

    // جلب البيانات المحلية
    getLocalData() {
        try {
            const data = localStorage.getItem('tailoringData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ خطأ في قراءة البيانات المحلية:', error);
            return null;
        }
    }

    // معالجة تحديث البيانات
    handleDataUpdate(data) {
        try {
            console.log('📥 تطبيق تحديث جديد من قاعدة البيانات');

            // تحديث البيانات المحلية
            const updatedData = {
                menImages: data.menImages || [],
                womenImages: data.womenImages || [],
                siteSettings: data.siteSettings || {},
                credentials: data.credentials || {},
                lastUpdate: data.lastSync || new Date().toISOString()
            };

            localStorage.setItem('tailoringData', JSON.stringify(updatedData));

            // إرسال إشعار التحديث
            window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
                detail: {
                    menImages: updatedData.menImages,
                    womenImages: updatedData.womenImages,
                    siteSettings: updatedData.siteSettings
                }
            }));

            this.lastSyncTime = data.timestamp;
        } catch (error) {
            console.error('❌ خطأ في معالجة التحديث:', error);
        }
    }

    // بدء المزامنة التلقائية
    startAutoSync() {
        // مزامنة فورية عند التحميل
        setTimeout(() => {
            if (this.syncEnabled) {
                this.performSync();
            }
        }, 2000);

        // مزامنة دورية
        setInterval(() => {
            if (this.syncEnabled && this.isOnline) {
                this.performSync();
            }
        }, this.syncInterval);
    }

    // تحديث حالة المزامنة في الواجهة
    updateStatus() {
        const statusElement = document.getElementById('cloudSyncStatus');
        if (statusElement) {
            if (this.syncEnabled && this.isOnline) {
                statusElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> متصل بـ Firebase';
                statusElement.className = 'status-online';
            } else if (this.syncEnabled && !this.isOnline) {
                statusElement.innerHTML = '<i class="fas fa-wifi"></i> غير متصل';
                statusElement.className = 'status-offline';
            } else {
                statusElement.innerHTML = '<i class="fas fa-pause"></i> مزامنة معطلة';
                statusElement.className = 'status-offline';
            }
        }
    }

    // مزامنة فورية (للاستخدام في لوحة التحكم)
    async forceSync() {
        if (!this.syncEnabled) {
            console.log('⚠️ المزامنة غير مفعلة');
            return false;
        }

        return await this.performSync();
    }

    // الحصول على حالة المزامنة
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            online: this.isOnline,
            lastSync: this.lastSyncTime,
            type: 'firebase'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new FirebaseSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseSync;
}
