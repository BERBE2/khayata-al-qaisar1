// local-sync.js - نظام مزامنة محلي فعال
class LocalSync {
    constructor() {
        this.syncEnabled = false;
        this.syncInterval = 2000; // مزامنة كل ثانيتين
        this.storageKey = 'khayata_sync_data';
        this.lastUpdateTime = 0;
        this.init();
    }

    init() {
        console.log('🔄 تم تحميل نظام المزامنة المحلي');

        // مراقبة تغييرات localStorage
        this.setupStorageListener();

        // بدء المزامنة التلقائية
        this.startAutoSync();

        // تحديث الحالة الأولية
        this.updateStatus();
    }

    // إعداد مراقب localStorage
    setupStorageListener() {
        // مراقبة تغييرات localStorage من التبويبات الأخرى
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                console.log('📥 تم استقبال تحديث من تبويب آخر');
                this.handleDataUpdate(e.newValue);
            }
        });

        // مراقبة تغييرات localStorage من نفس التبويب
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key, value) {
            originalSetItem.apply(this, arguments);
            if (key === 'tailoringData') {
                // إرسال إشعار للتحديث
                window.dispatchEvent(new CustomEvent('localDataChanged', {
                    detail: { key, value }
                }));
            }
        };
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
    performSync() {
        if (!this.syncEnabled) return false;

        try {
            const localData = this.getLocalData();
            if (!localData) return false;

            // حفظ البيانات مع timestamp
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'local-sync',
                timestamp: Date.now()
            };

            // حفظ في localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(syncData));

            // إرسال إشعار للتحديث
            this.broadcastUpdate(syncData);

            console.log('✅ تم مزامنة البيانات محلياً');
            this.lastUpdateTime = Date.now();
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

    // بث التحديث لجميع التبويبات
    broadcastUpdate(data) {
        // إرسال إشعار مخصص
        window.dispatchEvent(new CustomEvent('tailoringDataUpdated', {
            detail: {
                menImages: data.menImages || [],
                womenImages: data.womenImages || [],
                siteSettings: data.siteSettings || {}
            }
        }));

        // إرسال إشعار storage
        window.dispatchEvent(new StorageEvent('storage', {
            key: this.storageKey,
            newValue: JSON.stringify(data),
            url: window.location.href
        }));
    }

    // معالجة تحديث البيانات
    handleDataUpdate(newValue) {
        try {
            const data = JSON.parse(newValue);
            if (data.timestamp > this.lastUpdateTime) {
                console.log('📥 تطبيق تحديث جديد');

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

                this.lastUpdateTime = data.timestamp;
            }
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
        }, 1000);

        // مزامنة دورية
        setInterval(() => {
            if (this.syncEnabled) {
                this.performSync();
            }
        }, this.syncInterval);
    }

    // تحديث حالة المزامنة في الواجهة
    updateStatus() {
        const statusElement = document.getElementById('cloudSyncStatus');
        if (statusElement) {
            if (this.syncEnabled) {
                statusElement.innerHTML = '<i class="fas fa-sync-alt"></i> مزامنة محلية نشطة';
                statusElement.className = 'status-online';
            } else {
                statusElement.innerHTML = '<i class="fas fa-pause"></i> مزامنة معطلة';
                statusElement.className = 'status-offline';
            }
        }
    }

    // مزامنة فورية (للاستخدام في لوحة التحكم)
    async forceSync() {
        if (!this.syncEnabled) {
            console.log('⚠️ المزامنة المحلية غير مفعلة');
            return false;
        }

        return this.performSync();
    }

    // الحصول على حالة المزامنة
    getSyncStatus() {
        return {
            enabled: this.syncEnabled,
            lastSync: this.lastUpdateTime,
            type: 'local'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new LocalSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalSync;
}
