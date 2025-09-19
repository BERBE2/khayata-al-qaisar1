// supabase-db.js - نظام قاعدة بيانات Supabase المجاني
class SupabaseDB {
    constructor() {
        this.syncEnabled = false;
        this.isOnline = navigator.onLine;
        this.syncInterval = 3000; // مزامنة كل 3 ثوان
        this.lastSyncTime = 0;
        this.supabase = null;
        this.init();
    }

    init() {
        console.log('🚀 تم تحميل نظام قاعدة البيانات Supabase');

        // تحميل Supabase SDK
        this.loadSupabase();

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

    // تحميل Supabase SDK
    loadSupabase() {
        // تحميل Supabase من CDN
        const supabaseScript = document.createElement('script');
        supabaseScript.src = 'https://unpkg.com/@supabase/supabase-js@2';
        supabaseScript.onload = () => {
            this.initializeSupabase();
        };
        document.head.appendChild(supabaseScript);
    }

    // تهيئة Supabase
    initializeSupabase() {
        try {
            // إعدادات Supabase المجانية
            const supabaseUrl = 'https://your-project.supabase.co';
            const supabaseKey = 'your-anon-key';

            // تهيئة Supabase
            this.supabase = supabase.createClient(supabaseUrl, supabaseKey);

            console.log('🚀 تم تهيئة Supabase بنجاح');
            this.setupRealtimeListener();
        } catch (error) {
            console.error('❌ خطأ في تهيئة Supabase:', error);
            this.fallbackToLocalSync();
        }
    }

    // إعداد مراقب الوقت الفعلي
    setupRealtimeListener() {
        if (!this.supabase) return;

        // مراقبة التغييرات في قاعدة البيانات
        this.supabase
            .channel('tailoring-data')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tailoring_data' }, (payload) => {
                if (this.syncEnabled) {
                    console.log('📥 تم استقبال تحديث من قاعدة البيانات');
                    this.handleDataUpdate(payload.new);
                }
            })
            .subscribe();
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

            // حفظ البيانات في Supabase
            const syncData = {
                ...localData,
                lastSync: new Date().toISOString(),
                syncSource: 'supabase',
                timestamp: Date.now()
            };

            if (this.supabase) {
                const { error } = await this.supabase
                    .from('tailoring_data')
                    .upsert({ id: 1, data: syncData });

                if (error) {
                    console.error('❌ خطأ في رفع البيانات:', error);
                    return this.fallbackToLocalSync();
                } else {
                    console.log('✅ تم رفع البيانات إلى قاعدة البيانات');
                    this.lastSyncTime = syncData.timestamp;
                    return true;
                }
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

            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('tailoring_data')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (error) {
                    console.error('❌ خطأ في جلب البيانات:', error);
                    return null;
                } else if (data) {
                    console.log('✅ تم جلب البيانات من قاعدة البيانات:', data.data);
                    return data.data;
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
            type: 'supabase'
        };
    }
}

// إنشاء مثيل النظام
window.cloudSync = new SupabaseDB();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseDB;
}
