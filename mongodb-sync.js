// mongodb-sync.js - نظام المزامنة مع MongoDB عبر Vercel
class MongoDBSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.lastSyncTime = 0;
        this.apiUrl = 'https://your-vercel-app.vercel.app/api'; // رابط Vercel API الخاص بك
        this.init();
    }

    init() {
        console.log('🍃 تم تحميل نظام MongoDB للمزامنة');

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

            console.log('🔄 بدء المزامنة مع MongoDB...');

            // حفظ البيانات في MongoDB
            const response = await fetch(`${this.apiUrl}/save-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(localData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('✅ تم رفع البيانات إلى MongoDB');
                    this.lastSyncTime = Date.now();
                    return true;
                } else {
                    console.error('❌ فشل في رفع البيانات:', result.message);
                    return this.fallbackToLocalSync();
                }
            } else {
                console.error('❌ فشل في الاتصال بالخادم');
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

    // جلب البيانات من MongoDB
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من MongoDB...');

            const response = await fetch(`${this.apiUrl}/get-data`);

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    console.log('✅ تم جلب البيانات من MongoDB:', result.data);
                    return result.data;
                } else {
                    console.log('⚠️ لا توجد بيانات في MongoDB');
                    return null;
                }
            } else {
                console.error('❌ فشل في الاتصال بـ MongoDB');
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
                statusElement.innerHTML = '<i class="fas fa-database"></i> متصل بـ MongoDB';
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
            type: 'mongodb-vercel'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new MongoDBSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MongoDBSync;
}
