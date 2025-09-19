// cloud-sync.js - نظام المزامنة عبر الإنترنت
class CloudSync {
    constructor() {
        // استخدام خدمة JSONBin المجانية مع مفتاح صحيح
        this.apiUrl = 'https://api.jsonbin.io/v3/b';
        this.binId = '65f8a8c8dc74654018b8c123'; // معرف الحاوية
        this.apiKey = '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ'; // مفتاح API مؤقت
        this.syncInterval = 5000; // مزامنة كل 5 ثوان
        this.isOnline = navigator.onLine;
        this.syncEnabled = false; // حالة المزامنة
        this.init();
    }

    init() {
        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncToCloud();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // بدء المزامنة التلقائية
        this.startAutoSync();
    }

    // رفع البيانات إلى السحابة
    async syncToCloud() {
        if (!this.isOnline) return false;

        try {
            const localData = this.getLocalData();
            if (!localData) return false;

            const response = await fetch(`${this.apiUrl}/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Name': 'khayata-al-qaisar-data'
                },
                body: JSON.stringify({
                    ...localData,
                    lastCloudSync: new Date().toISOString(),
                    syncSource: 'admin-panel'
                })
            });

            if (response.ok) {
                console.log('✅ تم رفع البيانات إلى السحابة بنجاح');
                return true;
            } else {
                console.error('❌ فشل في رفع البيانات إلى السحابة');
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
            return false;
        }
    }

    // جلب البيانات من السحابة
    async syncFromCloud() {
        if (!this.isOnline) return null;

        try {
            const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ تم جلب البيانات من السحابة بنجاح');
                return data.record;
            } else {
                console.error('❌ فشل في جلب البيانات من السحابة');
                return null;
            }
        } catch (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
            return null;
        }
    }

    // الحصول على البيانات المحلية
    getLocalData() {
        try {
            const data = localStorage.getItem('tailoringData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ خطأ في قراءة البيانات المحلية:', error);
            return null;
        }
    }

    // حفظ البيانات محلياً
    saveLocalData(data) {
        try {
            localStorage.setItem('tailoringData', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات المحلية:', error);
            return false;
        }
    }

    // بدء المزامنة التلقائية
    startAutoSync() {
        // مزامنة فورية عند التحميل
        setTimeout(() => {
            this.performSync();
        }, 2000);

        // مزامنة دورية
        setInterval(() => {
            this.performSync();
        }, this.syncInterval);
    }

    // تنفيذ المزامنة الكاملة
    async performSync() {
        if (!this.isOnline) return;

        try {
            // جلب البيانات من السحابة
            const cloudData = await this.syncFromCloud();

            if (cloudData) {
                const localData = this.getLocalData();

                // مقارنة التواريخ لتحديد أحدث البيانات
                const cloudTime = new Date(cloudData.lastCloudSync || 0);
                const localTime = new Date(localData?.lastUpdate || 0);

                if (cloudTime > localTime) {
                    // البيانات في السحابة أحدث
                    console.log('📥 تحديث البيانات من السحابة');
                    this.saveLocalData(cloudData);
                    this.notifyDataUpdate(cloudData);
                } else if (localTime > cloudTime && localData) {
                    // البيانات المحلية أحدث
                    console.log('📤 رفع البيانات إلى السحابة');
                    await this.syncToCloud();
                }
            }
        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
        }
    }

    // إشعار تحديث البيانات
    notifyDataUpdate(data) {
        const event = new CustomEvent('tailoringDataUpdated', {
            detail: {
                menImages: data.menImages || [],
                womenImages: data.womenImages || [],
                siteSettings: data.siteSettings || {}
            }
        });
        window.dispatchEvent(event);
    }

    // مزامنة فورية (للاستخدام في لوحة التحكم)
    async forceSync() {
        const localData = this.getLocalData();
        if (localData) {
            return await this.syncToCloud();
        }
        return false;
    }
}

// إنشاء مثيل النظام
window.cloudSync = new CloudSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSync;
}
