// jsonbin-sync.js - نظام مزامنة مجاني باستخدام JSONBin
class JsonBinSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.lastSyncTime = 0;
        this.apiUrl = 'https://api.jsonbin.io/v3/b';
        this.binId = null; // سيتم إنشاؤه تلقائياً
        this.apiKey = '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ'; // مفتاح API مجاني
        this.init();
    }

    init() {
        console.log('📦 تم تحميل نظام المزامنة JSONBin');

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

    // إنشاء bin جديد
    async createBin() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Name': 'khayata-al-qaisar-data'
                },
                body: JSON.stringify({
                    menImages: [],
                    womenImages: [],
                    siteSettings: {},
                    credentials: {},
                    lastUpdate: new Date().toISOString(),
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.binId = result.metadata.id;
                localStorage.setItem('jsonbin_id', this.binId);
                console.log('✅ تم إنشاء bin جديد:', this.binId);
                return true;
            } else {
                console.error('❌ فشل في إنشاء bin');
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في إنشاء bin:', error);
            return false;
        }
    }

    // الحصول على bin ID
    async getBinId() {
        if (this.binId) return this.binId;

        // محاولة جلب من localStorage
        const savedId = localStorage.getItem('jsonbin_id');
        if (savedId) {
            this.binId = savedId;
            return this.binId;
        }

        // إنشاء bin جديد
        await this.createBin();
        return this.binId;
    }

    // تفعيل/إلغاء المزامنة
    async toggleSync() {
        this.syncEnabled = !this.syncEnabled;
        console.log('🔄 حالة المزامنة:', this.syncEnabled ? 'مفعلة' : 'معطلة');

        if (this.syncEnabled) {
            await this.getBinId(); // تأكد من وجود bin
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

            const binId = await this.getBinId();
            if (!binId) return false;

            // حفظ البيانات في JSONBin
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'jsonbin-sync',
                timestamp: Date.now()
            };

            const response = await fetch(`${this.apiUrl}/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(syncData)
            });

            if (response.ok) {
                console.log('✅ تم رفع البيانات إلى JSONBin');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                console.error('❌ فشل في رفع البيانات');
                return this.fallbackToLocalSync();
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة JSONBin:', error);
            return this.fallbackToLocalSync();
        }
    }

    // جلب البيانات من JSONBin
    async fetchData() {
        try {
            const binId = await this.getBinId();
            if (!binId) return null;

            const response = await fetch(`${this.apiUrl}/${binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ تم جلب البيانات من JSONBin');
                return result.record;
            } else {
                console.error('❌ فشل في جلب البيانات');
                return null;
            }
        } catch (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
            return null;
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
                statusElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> متصل بـ JSONBin';
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
            type: 'jsonbin',
            binId: this.binId
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new JsonBinSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonBinSync;
}
