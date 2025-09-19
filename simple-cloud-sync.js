// simple-cloud-sync.js - نظام مزامنة مبسط
class SimpleCloudSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.storageKey = 'khayata_cloud_data';
        this.lastSyncTime = 0;
        this.init();
    }

    init() {
        console.log('🌐 تم تحميل نظام المزامنة المبسط');

        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ تم الاتصال بالإنترنت');
            this.updateStatus(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ تم قطع الاتصال بالإنترنت');
            this.updateStatus(false);
        });

        // بدء المزامنة التلقائية
        this.startAutoSync();

        // تحديث الحالة الأولية
        this.updateStatus(this.isOnline);
    }

    // تفعيل/إلغاء المزامنة
    toggleSync() {
        this.syncEnabled = !this.syncEnabled;
        console.log('🔄 حالة المزامنة:', this.syncEnabled ? 'مفعلة' : 'معطلة');

        if (this.syncEnabled) {
            this.performSync();
        }

        return this.syncEnabled;
    }

    // تنفيذ المزامنة
    async performSync() {
        if (!this.syncEnabled || !this.isOnline) {
            return false;
        }

        try {
            // محاولة المزامنة مع خدمة خارجية بسيطة
            const localData = this.getLocalData();
            if (!localData) return false;

            // استخدام خدمة JSONBin المجانية
            const response = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ',
                    'X-Bin-Name': 'khayata-al-qaisar-sync'
                },
                body: JSON.stringify({
                    ...localData,
                    lastCloudSync: new Date().toISOString(),
                    syncSource: 'admin-panel'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ تم رفع البيانات إلى السحابة بنجاح');
                this.lastSyncTime = Date.now();
                return true;
            } else {
                console.log('⚠️ فشل في رفع البيانات، استخدام المزامنة المحلية');
                return this.performLocalSync();
            }
        } catch (error) {
            console.log('⚠️ خطأ في المزامنة السحابية، استخدام المزامنة المحلية:', error.message);
            return this.performLocalSync();
        }
    }

    // المزامنة المحلية (بديل)
    performLocalSync() {
        try {
            const localData = this.getLocalData();
            if (!localData) return false;

            // حفظ في localStorage مع timestamp
            const syncData = {
                ...localData,
                lastLocalSync: new Date().toISOString(),
                syncSource: 'local-sync'
            };

            localStorage.setItem(this.storageKey, JSON.stringify(syncData));
            console.log('💾 تم حفظ البيانات محلياً');
            this.lastSyncTime = Date.now();
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
    updateStatus(isOnline) {
        const statusElement = document.getElementById('cloudSyncStatus');
        if (statusElement) {
            if (isOnline && this.syncEnabled) {
                statusElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> متصل بالإنترنت';
                statusElement.className = 'status-online';
            } else if (isOnline && !this.syncEnabled) {
                statusElement.innerHTML = '<i class="fas fa-cloud-slash"></i> غير مفعل';
                statusElement.className = 'status-offline';
            } else {
                statusElement.innerHTML = '<i class="fas fa-wifi"></i> غير متصل';
                statusElement.className = 'status-offline';
            }
        }
    }

    // مزامنة فورية (للاستخدام في لوحة التحكم)
    async forceSync() {
        if (!this.syncEnabled) {
            console.log('⚠️ المزامنة السحابية غير مفعلة');
            return false;
        }

        return await this.performSync();
    }

    // الحصول على حالة المزامنة
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            online: this.isOnline,
            lastSync: this.lastSyncTime
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new SimpleCloudSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleCloudSync;
}
