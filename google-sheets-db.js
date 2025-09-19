// google-sheets-db.js - نظام المزامنة المجاني بدون خادم
class GoogleSheetsDB {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 5000; // مزامنة كل 5 ثوان
        this.lastSyncTime = 0;
        this.sheetId = '101RjeoGYzKHlc9Lqv1_9aDqsKt9l0ZH6bo0LInYQipQ'; // معرف Google Sheet الخاص بك
        this.apiKey = 'AIzaSyAUU4nwHNNqEhCYW1sCJnCOk4I6YHexp2M'; // مفتاح Google API الخاص بك
        this.init();
    }

    init() {
        console.log('📊 تم تحميل نظام Google Sheets للمزامنة');

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

            console.log('🔄 بدء المزامنة مع Google Sheets...');

            // حفظ البيانات في Google Sheets
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'google-sheets',
                timestamp: Date.now()
            };

            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/A1:Z1000?key=${this.apiKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [
                        ['menImages', JSON.stringify(syncData.menImages)],
                        ['womenImages', JSON.stringify(syncData.womenImages)],
                        ['siteSettings', JSON.stringify(syncData.siteSettings)],
                        ['credentials', JSON.stringify(syncData.credentials)],
                        ['lastSync', syncData.lastSync],
                        ['syncSource', syncData.syncSource],
                        ['timestamp', syncData.timestamp.toString()]
                    ]
                })
            });

            if (response.ok) {
                console.log('✅ تم رفع البيانات إلى Google Sheets');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                console.error('❌ فشل في رفع البيانات:', response.statusText);
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

    // جلب البيانات من Google Sheets
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من Google Sheets...');

            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/A1:Z1000?key=${this.apiKey}`);

            if (response.ok) {
                const result = await response.json();
                if (result.values && result.values.length > 0) {
                    // تحويل البيانات من Google Sheets إلى JSON
                    const data = {};
                    result.values.forEach(row => {
                        if (row.length >= 2) {
                            const key = row[0];
                            const value = row[1];

                            if (key === 'menImages' || key === 'womenImages' || key === 'siteSettings' || key === 'credentials') {
                                try {
                                    data[key] = JSON.parse(value);
                                } catch (e) {
                                    data[key] = value;
                                }
                            } else {
                                data[key] = value;
                            }
                        }
                    });

                    console.log('✅ تم جلب البيانات من Google Sheets:', data);
                    return data;
                } else {
                    console.log('⚠️ لا توجد بيانات في Google Sheets');
                    return null;
                }
            } else {
                console.error('❌ فشل في الاتصال بـ Google Sheets');
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
                statusElement.innerHTML = '<i class="fas fa-table"></i> متصل بـ Google Sheets';
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
            type: 'google-sheets'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new GoogleSheetsDB();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsDB;
}
