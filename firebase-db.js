// firebase-db.js - نظام قاعدة بيانات Firebase المجاني
class FirebaseDB {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.lastSyncTime = 0;
        this.db = null;
        this.init();
    }

    init() {
        console.log('🔥 تم تحميل نظام قاعدة البيانات Firebase');

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
                apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
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
    async toggleSync() {
        this.syncEnabled = !this.syncEnabled;
        console.log('🔄 حالة المزامنة:', this.syncEnabled ? 'مفعلة' : 'معطلة');

        if (this.syncEnabled) {
            // محاولة مزامنة فورية
            const result = await this.performSync();
            if (result) {
                console.log('✅ تم تفعيل المزامنة بنجاح');
            } else {
                console.log('⚠️ تم تفعيل المزامنة ولكن فشلت المزامنة الأولى');
            }
        }

        this.updateStatus();
        return this.syncEnabled;
    }

    // تنفيذ المزامنة
    async performSync() {
        if (!this.syncEnabled || !this.isOnline) {
            console.log('⚠️ المزامنة معطلة أو غير متصل');
            return false;
        }

        try {
            const localData = this.getLocalData();
            if (!localData) {
                console.log('⚠️ لا توجد بيانات محلية للمزامنة');
                return false;
            }

            console.log('🔄 بدء المزامنة مع قاعدة البيانات...');

            // حفظ البيانات في Firebase
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'firebase',
                timestamp: Date.now()
            };

            if (this.db) {
                await this.db.collection('tailoringData').doc('main').set(syncData);
                console.log('✅ تم رفع البيانات إلى قاعدة البيانات');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                return this.fallbackToLocalSync();
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
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

    // جلب البيانات من قاعدة البيانات
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من قاعدة البيانات...');

            if (this.db) {
                const doc = await this.db.collection('tailoringData').doc('main').get();
                if (doc.exists) {
                    const data = doc.data();
                    console.log('✅ تم جلب البيانات من قاعدة البيانات:', data);
                    return data;
                } else {
                    console.log('⚠️ لا توجد بيانات في قاعدة البيانات');
                    return null;
                }
            } else {
                console.log('❌ قاعدة البيانات غير متاحة');
                return null;
            }
        } catch (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
            return null;
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
        setTimeout(async () => {
            if (this.syncEnabled) {
                await this.performSync();
            }
        }, 2000);

        // مزامنة دورية
        setInterval(async () => {
            if (this.syncEnabled && this.isOnline) {
                await this.performSync();
            }
        }, this.syncInterval);
    }

    // تحديث حالة المزامنة في الواجهة
    updateStatus() {
        const statusElement = document.getElementById('cloudSyncStatus');
        if (statusElement) {
            if (this.syncEnabled && this.isOnline) {
                statusElement.innerHTML = '<i class="fas fa-database"></i> متصل بقاعدة البيانات';
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

        console.log('🔄 مزامنة فورية...');
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
window.cloudSync = new FirebaseDB();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseDB;
}
