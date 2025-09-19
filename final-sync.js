// final-sync.js - نظام المزامنة النهائي والمضمون
class FinalSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 5000; // مزامنة كل 5 ثوان
        this.lastSyncTime = 0;
        this.apiUrl = 'https://api.jsonbin.io/v3/b';
        this.binId = '65f8a8c8dc74654018b8c123'; // معرف ثابت
        this.apiKey = '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ'; // مفتاح API مجاني
        this.init();
    }

    init() {
        console.log('🔄 تم تحميل نظام المزامنة النهائي');

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

            console.log('🔄 بدء رفع البيانات إلى السحابة...');

            // حفظ البيانات في JSONBin
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'final-sync',
                timestamp: Date.now()
            };

            const response = await fetch(`${this.apiUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey
                },
                body: JSON.stringify(syncData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ تم رفع البيانات إلى السحابة بنجاح:', result);
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ فشل في رفع البيانات:', response.status, errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
            return false;
        }
    }

    // جلب البيانات من السحابة
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من السحابة...');

            const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ تم جلب البيانات من السحابة:', result.record);
                return result.record;
            } else {
                const errorText = await response.text();
                console.error('❌ فشل في جلب البيانات:', response.status, errorText);
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
                statusElement.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> متصل بالسحابة';
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
            type: 'final-sync'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new FinalSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinalSync;
}
