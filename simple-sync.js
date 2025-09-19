// simple-sync.js - نظام مزامنة بسيط ومضمون
class SimpleSync {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 5000; // مزامنة كل 5 ثوان
        this.lastSyncTime = 0;
        this.init();
    }

    init() {
        console.log('🔄 تم تحميل نظام المزامنة البسيط');

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

    // تنفيذ المزامنة باستخدام خدمة مجانية
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

            console.log('🔄 بدء المزامنة السحابية...');

            // استخدام خدمة JSONBin المجانية
            const result = await this.syncWithJsonBin(localData);
            if (result) {
                return true;
            }

            // استخدام خدمة Pastebin المجانية
            const pastebinResult = await this.syncWithPastebin(localData);
            if (pastebinResult) {
                return true;
            }

            console.log('❌ فشلت جميع طرق المزامنة السحابية');
            return false;

        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
            return false;
        }
    }

    // المزامنة باستخدام JSONBin
    async syncWithJsonBin(localData) {
        try {
            const apiUrl = 'https://api.jsonbin.io/v3/b';
            const binId = '65f8a8c8dc74654018b8c123';
            const apiKey = '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ';

            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'jsonbin',
                timestamp: Date.now()
            };

            const response = await fetch(`${apiUrl}/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify(syncData)
            });

            if (response.ok) {
                console.log('✅ تم المزامنة باستخدام JSONBin');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                console.log('❌ فشل المزامنة باستخدام JSONBin');
                return false;
            }
        } catch (error) {
            console.log('❌ خطأ في المزامنة باستخدام JSONBin:', error);
            return false;
        }
    }

    // المزامنة باستخدام Pastebin
    async syncWithPastebin(localData) {
        try {
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'pastebin',
                timestamp: Date.now()
            };

            // استخدام Pastebin API المجاني
            const response = await fetch('https://pastebin.com/api/api_post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'api_dev_key': 'YOUR_PASTEBIN_API_KEY',
                    'api_option': 'paste',
                    'api_paste_code': JSON.stringify(syncData),
                    'api_paste_name': 'khayata-al-qaisar-data',
                    'api_paste_expire_date': 'N'
                })
            });

            if (response.ok) {
                console.log('✅ تم المزامنة باستخدام Pastebin');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                console.log('❌ فشل المزامنة باستخدام Pastebin');
                return false;
            }
        } catch (error) {
            console.log('❌ خطأ في المزامنة باستخدام Pastebin:', error);
            return false;
        }
    }

    // جلب البيانات من السحابة
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من السحابة...');

            // محاولة جلب البيانات من JSONBin
            const jsonbinData = await this.fetchFromJsonBin();
            if (jsonbinData) {
                return jsonbinData;
            }

            console.log('❌ فشل جلب البيانات من جميع المصادر');
            return null;

        } catch (error) {
            console.error('❌ خطأ في جلب البيانات:', error);
            return null;
        }
    }

    // جلب البيانات من JSONBin
    async fetchFromJsonBin() {
        try {
            const apiUrl = 'https://api.jsonbin.io/v3/b';
            const binId = '65f8a8c8dc74654018b8c123';
            const apiKey = '$2a$10$8K9vQZxJxJxJxJxJxJxJxJ';

            const response = await fetch(`${apiUrl}/${binId}/latest`, {
                headers: {
                    'X-Master-Key': apiKey
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ تم جلب البيانات من JSONBin');
                return result.record;
            } else {
                console.log('❌ فشل جلب البيانات من JSONBin');
                return null;
            }
        } catch (error) {
            console.log('❌ خطأ في جلب البيانات من JSONBin:', error);
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
            type: 'simple-sync'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new SimpleSync();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleSync;
}
