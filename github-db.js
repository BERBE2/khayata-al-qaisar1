// github-db.js - نظام قاعدة بيانات GitHub Gist المجاني
class GitHubDB {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 5000; // مزامنة كل 5 ثوان
        this.lastSyncTime = 0;
        this.gistId = null; // سيتم إنشاؤه تلقائياً
        this.githubToken = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // مفتاح GitHub
        this.init();
    }

    init() {
        console.log('🐙 تم تحميل نظام قاعدة البيانات GitHub Gist');

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

    // إنشاء Gist جديد
    async createGist() {
        try {
            const localData = this.getLocalData();
            if (!localData) {
                console.log('⚠️ لا توجد بيانات محلية لإنشاء Gist');
                return false;
            }

            const gistData = {
                description: 'Khayata Al-Qaisar Data',
                public: false,
                files: {
                    'data.json': {
                        content: JSON.stringify(localData)
                    }
                }
            };

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${this.githubToken}`
                },
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                this.gistId = result.id;
                localStorage.setItem('github_gist_id', this.gistId);
                console.log('✅ تم إنشاء Gist جديد:', this.gistId);
                return true;
            } else {
                console.error('❌ فشل في إنشاء Gist');
                return false;
            }
        } catch (error) {
            console.error('❌ خطأ في إنشاء Gist:', error);
            return false;
        }
    }

    // الحصول على Gist ID
    async getGistId() {
        if (this.gistId) return this.gistId;

        // محاولة جلب من localStorage
        const savedId = localStorage.getItem('github_gist_id');
        if (savedId) {
            this.gistId = savedId;
            return this.gistId;
        }

        // إنشاء Gist جديد
        await this.createGist();
        return this.gistId;
    }

    // تفعيل/إلغاء المزامنة
    async toggleSync() {
        this.syncEnabled = !this.syncEnabled;
        console.log('🔄 حالة المزامنة:', this.syncEnabled ? 'مفعلة' : 'معطلة');

        if (this.syncEnabled) {
            // تأكد من وجود Gist
            await this.getGistId();
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

            const gistId = await this.getGistId();
            if (!gistId) {
                console.log('❌ لا يمكن الحصول على Gist ID');
                return false;
            }

            console.log('🔄 بدء المزامنة مع GitHub Gist...');

            // حفظ البيانات في GitHub Gist
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'github-gist',
                timestamp: Date.now()
            };

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${this.githubToken}`
                },
                body: JSON.stringify({
                    files: {
                        'data.json': {
                            content: JSON.stringify(syncData)
                        }
                    }
                })
            });

            if (response.ok) {
                console.log('✅ تم رفع البيانات إلى GitHub Gist');
                this.lastSyncTime = syncData.timestamp;
                return true;
            } else {
                console.error('❌ فشل في رفع البيانات إلى GitHub Gist');
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

    // جلب البيانات من GitHub Gist
    async fetchData() {
        try {
            console.log('🔄 جلب البيانات من GitHub Gist...');

            const gistId = await this.getGistId();
            if (!gistId) {
                console.log('❌ لا يمكن الحصول على Gist ID');
                return null;
            }

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const data = JSON.parse(result.files['data.json'].content);
                console.log('✅ تم جلب البيانات من GitHub Gist:', data);
                return data;
            } else {
                console.error('❌ فشل في جلب البيانات من GitHub Gist');
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
                statusElement.innerHTML = '<i class="fab fa-github"></i> متصل بـ GitHub';
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
            type: 'github-gist',
            gistId: this.gistId
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new GitHubDB();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubDB;
}
