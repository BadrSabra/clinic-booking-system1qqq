
/**
 * نظام ClinicPro - نظام الإعداد والتهيئة التلقائية
 * مسؤول عن إعداد النظام للمرة الأولى والترقيات والتحديثات
 * @version 1.0.0
 * @author ClinicPro Team
 */

class ClinicSetup {
    constructor() {
        this.version = '1.0.0';
        this.buildDate = '2025-12-05';
        this.requiredStorage = 10; // 10MB كحد أدنى
        this.db = window.clinicDB || null;
        this.config = window.configManager || null;
        this.setupStatus = {
            initialized: false,
            database: false,
            settings: false,
            users: false,
            sampleData: false
        };
        
        this.init();
    }

    /**
     * تهيئة النظام
     */
    async init() {
        try {
            console.log('🚀 بدء إعداد نظام ClinicPro...');
            
            // عرض شاشة التحميل
            this.showSetupScreen();
            
            // التحقق من المتطلبات
            const requirements = await this.checkRequirements();
            if (!requirements.met) {
                this.showError('لا يستوفي متطلبات النظام', requirements.errors);
                return;
            }
            
            // تسلسل خطوات الإعداد
            await this.setupSequence();
            
            // إخفاء شاشة الإعداد
            setTimeout(() => {
                this.hideSetupScreen();
                this.showSuccess('تم إعداد النظام بنجاح!');
            }, 1500);
            
        } catch (error) {
            console.error('❌ فشل في إعداد النظام:', error);
            this.showError('فشل في إعداد النظام', error.message);
        }
    }

    /**
     * التحقق من متطلبات النظام
     */
    async checkRequirements() {
        const errors = [];
        const warnings = [];
        
        console.log('🔍 التحقق من متطلبات النظام...');
        
        // 1. التحقق من دعم المتصفح
        if (!this.checkBrowserSupport()) {
            errors.push('المتصفح غير مدعوم. يرجى استخدام أحدث إصدار من Chrome, Firefox, Safari, أو Edge.');
        }
        
        // 2. التحقق من دعم JavaScript
        if (!this.checkJavaScriptSupport()) {
            errors.push('JavaScript غير مفعل. يرجى تفعيل JavaScript للمتابعة.');
        }
        
        // 3. التحقق من دعم LocalStorage
        if (!this.checkLocalStorageSupport()) {
            errors.push('المتصفح لا يدعم LocalStorage. هذا النظام يتطلب LocalStorage لتخزين البيانات.');
        }
        
        // 4. التحقق من حجم التخزين المتاح
        const storageAvailable = await this.checkStorageAvailability();
        if (!storageAvailable.available) {
            errors.push(`مساحة تخزين غير كافية. المتاح: ${storageAvailable.availableMB.toFixed(2)}MB, المطلوب: ${this.requiredStorage}MB`);
        }
        
        // 5. التحقق من الاتصال بالإنترنت (اختياري)
        const online = navigator.onLine;
        if (!online) {
            warnings.push('أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.');
        }
        
        // 6. التحقق من دعم Web Workers (للميزات المتقدمة)
        if (!this.checkWebWorkerSupport()) {
            warnings.push('Web Workers غير مدعوم. بعض الميزات المتقدمة قد لا تعمل.');
        }
        
        // تحديث شاشة التحميل
        this.updateProgress(20, 'تم التحقق من متطلبات النظام');
        
        return {
            met: errors.length === 0,
            errors: errors,
            warnings: warnings,
            storage: storageAvailable,
            online: online
        };
    }

    /**
     * تسلسل خطوات الإعداد
     */
    async setupSequence() {
        try {
            // الخطوة 1: التحقق من الإصدار وترقية البيانات
            await this.checkVersionAndUpgrade();
            this.updateProgress(30, 'فحص الإصدار والترقية');
            
            // الخطوة 2: تهيئة قاعدة البيانات
            await this.initializeDatabase();
            this.updateProgress(40, 'تهيئة قاعدة البيانات');
            
            // الخطوة 3: تهيئة الإعدادات
            await this.initializeSettings();
            this.updateProgress(50, 'تهيئة الإعدادات');
            
            // الخطوة 4: إنشاء المستخدمين الافتراضيين
            await this.createDefaultUsers();
            this.updateProgress(60, 'إنشاء المستخدمين');
            
            // الخطوة 5: إنشاء البيانات النموذجية
            await this.createSampleData();
            this.updateProgress(70, 'إنشاء بيانات نموذجية');
            
            // الخطوة 6: إعداد النسخ الاحتياطي
            await this.setupBackupSystem();
            this.updateProgress(80, 'إعداد النسخ الاحتياطي');
            
            // الخطوة 7: التحقق من صحة النظام
            await this.validateSystem();
            this.updateProgress(90, 'التحقق من صحة النظام');
            
            // الخطوة 8: تحديث حالة النظام
            await this.updateSystemStatus();
            this.updateProgress(100, 'اكتمال الإعداد');
            
            // تعليم النظام بأنه تم تهيئته
            localStorage.setItem('clinicpro_setup_completed', 'true');
            localStorage.setItem('clinicpro_setup_date', new Date().toISOString());
            
            this.setupStatus.initialized = true;
            
        } catch (error) {
            throw new Error(`فشل في تسلسل الإعداد: ${error.message}`);
        }
    }

    // ===========================================
    // متطلبات النظام
    // ===========================================

    /**
     * التحقق من دعم المتصفح
     */
    checkBrowserSupport() {
        try {
            // التحقق من المتصفحات الحديثة
            const userAgent = navigator.userAgent;
            const isModernBrowser = 
                /Chrome\/[89-9]/.test(userAgent) ||
                /Firefox\/[89-9]/.test(userAgent) ||
                /Safari\/[14-9]/.test(userAgent) ||
                /Edg\/[89-9]/.test(userAgent);
            
            // التحقق من دعم ES6
            const supportsES6 = (() => {
                try {
                    eval('let x = (a) => a; class Test {}');
                    return true;
                } catch (e) {
                    return false;
                }
            })();
            
            return isModernBrowser && supportsES6;
        } catch (error) {
            console.warn('خطأ في التحقق من دعم المتصفح:', error);
            return false;
        }
    }

    /**
     * التحقق من دعم JavaScript
     */
    checkJavaScriptSupport() {
        return typeof window !== 'undefined' && 
               'JSON' in window && 
               'localStorage' in window;
    }

    /**
     * التحقق من دعم LocalStorage
     */
    checkLocalStorageSupport() {
        try {
            const testKey = '__clinicpro_test__';
            localStorage.setItem(testKey, testKey);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return retrieved === testKey;
        } catch (error) {
            return false;
        }
    }

    /**
     * التحقق من توفر مساحة التخزين
     */
    async checkStorageAvailability() {
        try {
            // تقدير المساحة المطلوبة
            const testData = '0'.repeat(1024 * 1024); // 1MB
            const chunks = [];
            
            // محاولة تخزين حتى 10MB
            for (let i = 0; i < this.requiredStorage; i++) {
                try {
                    const testKey = `__clinicpro_storage_test_${i}__`;
                    localStorage.setItem(testKey, testData);
                    chunks.push(testKey);
                } catch (e) {
                    // تنظيف البيانات الاختبارية
                    chunks.forEach(key => localStorage.removeItem(key));
                    return {
                        available: false,
                        availableMB: i,
                        totalTested: this.requiredStorage
                    };
                }
            }
            
            // تنظيف البيانات الاختبارية
            chunks.forEach(key => localStorage.removeItem(key));
            
            return {
                available: true,
                availableMB: this.requiredStorage,
                totalTested: this.requiredStorage
            };
        } catch (error) {
            return {
                available: false,
                availableMB: 0,
                totalTested: 0,
                error: error.message
            };
        }
    }

    /**
     * التحقق من دعم Web Workers
     */
    checkWebWorkerSupport() {
        return typeof Worker !== 'undefined';
    }

    // ===========================================
    // خطوات الإعداد
    // ===========================================

    /**
     * التحقق من الإصدار والترقية
     */
    async checkVersionAndUpgrade() {
        try {
            const lastVersion = localStorage.getItem('clinicpro_version');
            const currentVersion = this.version;
            
            console.log(`📊 الإصدار السابق: ${lastVersion || 'غير موجود'}`);
            console.log(`📊 الإصدار الحالي: ${currentVersion}`);
            
            if (!lastVersion) {
                // أول مرة يتم فيها تثبيت النظام
                console.log('🆕 تثبيت جديد للنظام');
                localStorage.setItem('clinicpro_install_date', new Date().toISOString());
            } else if (lastVersion !== currentVersion) {
                // ترقية من إصدار قديم
                console.log('🔄 ترقية النظام من إصدار قديم');
                await this.performUpgrade(lastVersion, currentVersion);
            }
            
            // تحديث الإصدار الحالي
            localStorage.setItem('clinicpro_version', currentVersion);
            localStorage.setItem('clinicpro_last_update', new Date().toISOString());
            
        } catch (error) {
            console.error('خطأ في التحقق من الإصدار:', error);
            throw error;
        }
    }

    /**
     * تنفيذ ترقية النظام
     */
    async performUpgrade(fromVersion, toVersion) {
        const upgradeSteps = [];
        
        // تحديد خطوات الترقية بناءً على الإصدارات
        if (fromVersion === '0.9.0') {
            upgradeSteps.push({
                version: '1.0.0',
                description: 'ترقية هيكل قاعدة البيانات',
                execute: async () => {
                    await this.upgradeDatabaseStructure();
                }
            });
        }
        
        // تنفيذ خطوات الترقية
        for (const step of upgradeSteps) {
            console.log(`🔄 تنفيذ ترقية: ${step.description}`);
            try {
                await step.execute();
                console.log(`✅ تمت ترقية ${step.version}`);
            } catch (error) {
                console.error(`❌ فشل ترقية ${step.version}:`, error);
                throw error;
            }
        }
        
        // حفظ سجل الترقية
        const upgradeLog = {
            from: fromVersion,
            to: toVersion,
            date: new Date().toISOString(),
            steps: upgradeSteps.map(s => s.description),
            success: true
        };
        
        const upgradeLogs = JSON.parse(localStorage.getItem('clinicpro_upgrade_logs') || '[]');
        upgradeLogs.push(upgradeLog);
        localStorage.setItem('clinicpro_upgrade_logs', JSON.stringify(upgradeLogs));
    }

    /**
     * ترقية هيكل قاعدة البيانات
     */
    async upgradeDatabaseStructure() {
        try {
            // 1. إعادة تسمية الجداول القديمة
            const oldTables = [
                'users',
                'patients', 
                'appointments',
                'doctors'
            ];
            
            oldTables.forEach(oldTable => {
                const oldData = localStorage.getItem(oldTable);
                if (oldData) {
                    localStorage.setItem(`clinicpro_${oldTable}_backup`, oldData);
                    localStorage.removeItem(oldTable);
                }
            });
            
            // 2. إنشاء الجداول الجديدة
            if (this.db) {
                this.db.initializeTables();
            }
            
            // 3. استعادة البيانات من النسخ الاحتياطية
            oldTables.forEach(oldTable => {
                const backupData = localStorage.getItem(`clinicpro_${oldTable}_backup`);
                if (backupData && this.db) {
                    try {
                        const data = JSON.parse(backupData);
                        data.forEach(item => {
                            this.db.create(oldTable, item);
                        });
                        
                        // حذف النسخة الاحتياطية بعد الاستعادة
                        localStorage.removeItem(`clinicpro_${oldTable}_backup`);
                    } catch (error) {
                        console.warn(`فشل في استعادة ${oldTable}:`, error);
                    }
                }
            });
            
            return true;
        } catch (error) {
            throw new Error(`فشل ترقية قاعدة البيانات: ${error.message}`);
        }
    }

    /**
     * تهيئة قاعدة البيانات
     */
    async initializeDatabase() {
        try {
            if (!this.db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // التحقق مما إذا كانت قاعدة البيانات مهيأة بالفعل
            const isInitialized = localStorage.getItem('clinicpro_initialized');
            
            if (isInitialized === 'true') {
                console.log('✅ قاعدة البيانات مهيأة بالفعل');
                this.setupStatus.database = true;
                return;
            }
            
            // تهيئة الجداول
            this.db.initializeTables();
            
            // التحقق من التهيئة
            const validation = this.db.validateDatabase();
            if (!validation.valid) {
                throw new Error(`قاعدة البيانات غير صالحة: ${validation.issues.join(', ')}`);
            }
            
            this.setupStatus.database = true;
            console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
            
        } catch (error) {
            throw new Error(`فشل تهيئة قاعدة البيانات: ${error.message}`);
        }
    }

    /**
     * تهيئة الإعدادات
     */
    async initializeSettings() {
        try {
            if (!this.db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // التحقق مما إذا كانت الإعدادات موجودة
            const settings = this.db.getAll('settings');
            
            if (settings.length > 0) {
                console.log('✅ الإعدادات موجودة بالفعل');
                this.setupStatus.settings = true;
                return;
            }
            
            // إنشاء الإعدادات الافتراضية
            const defaultSettings = [
                {
                    key: 'system_info',
                    value: {
                        version: this.version,
                        buildDate: this.buildDate,
                        setupDate: new Date().toISOString(),
                        lastUpdate: new Date().toISOString()
                    },
                    category: 'system',
                    description: 'معلومات النظام'
                },
                {
                    key: 'clinic_config',
                    value: {
                        name: 'عيادة الدكتور أحمد',
                        type: 'خاصة',
                        specialty: 'عام',
                        established: new Date().getFullYear()
                    },
                    category: 'clinic',
                    description: 'إعدادات العيادة'
                },
                {
                    key: 'contact_info',
                    value: {
                        address: 'شارع المستشفى الرئيسي - القاهرة',
                        phone: '0223456789',
                        mobile: '01234567890',
                        email: 'info@clinicpro.com',
                        website: 'www.clinicpro.com'
                    },
                    category: 'contact',
                    description: 'معلومات الاتصال'
                },
                {
                    key: 'business_hours',
                    value: {
                        sunday: { open: '08:00', close: '20:00' },
                        monday: { open: '08:00', close: '20:00' },
                        tuesday: { open: '08:00', close: '20:00' },
                        wednesday: { open: '08:00', close: '20:00' },
                        thursday: { open: '08:00', close: '20:00' },
                        friday: { open: '08:00', close: '14:00' },
                        saturday: { open: '09:00', close: '14:00' }
                    },
                    category: 'schedule',
                    description: 'ساعات العمل'
                },
                {
                    key: 'appointment_settings',
                    value: {
                        duration: 30,
                        bufferTime: 10,
                        maxPerDay: 40,
                        cancellationNotice: 24,
                        reminderHours: [24, 2]
                    },
                    category: 'appointments',
                    description: 'إعدادات المواعيد'
                },
                {
                    key: 'notification_settings',
                    value: {
                        email: {
                            enabled: true,
                            appointmentReminders: true,
                            paymentReminders: true
                        },
                        sms: {
                            enabled: false,
                            appointmentReminders: false,
                            paymentReminders: false
                        },
                        push: {
                            enabled: true
                        }
                    },
                    category: 'notifications',
                    description: 'إعدادات الإشعارات'
                },
                {
                    key: 'financial_settings',
                    value: {
                        currency: 'ج.م',
                        currencySymbol: '£',
                        taxRate: 14,
                        defaultPaymentMethod: 'نقدي'
                    },
                    category: 'financial',
                    description: 'الإعدادات المالية'
                }
            ];
            
            // حفظ الإعدادات
            defaultSettings.forEach(setting => {
                this.db.create('settings', {
                    id: this.db.generateId('setting'),
                    ...setting,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });
            
            this.setupStatus.settings = true;
            console.log('✅ تم تهيئة الإعدادات بنجاح');
            
        } catch (error) {
            throw new Error(`فشل تهيئة الإعدادات: ${error.message}`);
        }
    }

    /**
     * إنشاء المستخدمين الافتراضيين
     */
    async createDefaultUsers() {
        try {
            if (!this.db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // التحقق مما إذا كان هناك مستخدمون بالفعل
            const existingUsers = this.db.getAll('users');
            
            if (existingUsers.length > 0) {
                console.log('✅ المستخدمون موجودون بالفعل');
                this.setupStatus.users = true;
                return;
            }
            
            // إنشاء المستخدمين الافتراضيين
            const defaultUsers = [
                {
                    username: 'admin',
                    email: 'admin@clinicpro.com',
                    password: this.db.hashPassword('Admin@123'),
                    fullName: 'مدير النظام',
                    role: 'admin',
                    phone: '01234567890',
                    specialty: 'إدارة',
                    status: 'active',
                    permissions: ['*'],
                    mustChangePassword: true,
                    lastPasswordChange: new Date().toISOString()
                },
                {
                    username: 'doctor1',
                    email: 'doctor@clinicpro.com',
                    password: this.db.hashPassword('Doctor@123'),
                    fullName: 'د. أحمد محمد',
                    role: 'doctor',
                    phone: '01234567891',
                    specialty: 'أسنان',
                    status: 'active',
                    permissions: this.config?.getRolePermissions('doctor') || [],
                    mustChangePassword: false
                },
                {
                    username: 'reception',
                    email: 'reception@clinicpro.com',
                    password: this.db.hashPassword('Reception@123'),
                    fullName: 'موظف الاستقبال',
                    role: 'receptionist',
                    phone: '01234567892',
                    specialty: 'إدارة',
                    status: 'active',
                    permissions: this.config?.getRolePermissions('receptionist') || [],
                    mustChangePassword: false
                }
            ];
            
            // حفظ المستخدمين
            defaultUsers.forEach(userData => {
                this.db.create('users', {
                    id: this.db.generateId('user'),
                    ...userData,
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                });
            });
            
            this.setupStatus.users = true;
            console.log('✅ تم إنشاء المستخدمين الافتراضيين بنجاح');
            
        } catch (error) {
            throw new Error(`فشل إنشاء المستخدمين: ${error.message}`);
        }
    }

    /**
     * إنشاء البيانات النموذجية
     */
    async createSampleData() {
        try {
            if (!this.db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // التحقق مما إذا كان هناك بيانات بالفعل
            const existingPatients = this.db.getAll('patients');
            const existingDoctors = this.db.getAll('doctors');
            
            if (existingPatients.length > 5 || existingDoctors.length > 2) {
                console.log('✅ البيانات موجودة بالفعل');
                this.setupStatus.sampleData = true;
                return;
            }
            
            console.log('📝 إنشاء بيانات نموذجية...');
            
            // 1. إنشاء أطباء إضافيين
            const sampleDoctors = [
                {
                    code: 'DOC003',
                    name: 'د. محمد علي',
                    specialty: 'جلدية',
                    qualification: 'دكتوراه الأمراض الجلدية',
                    experience: '12 سنة',
                    phone: '01234567893',
                    email: 'mohamed@clinicpro.com',
                    schedule: [
                        { day: 'الأحد', from: '10:00', to: '18:00', isAvailable: true },
                        { day: 'الثلاثاء', from: '10:00', to: '18:00', isAvailable: true },
                        { day: 'الخميس', from: '10:00', to: '18:00', isAvailable: true }
                    ],
                    consultationFee: 300,
                    status: 'active'
                },
                {
                    code: 'DOC004',
                    name: 'د. فاطمة حسن',
                    specialty: 'أطفال',
                    qualification: 'ماجستير طب الأطفال',
                    experience: '8 سنوات',
                    phone: '01234567894',
                    email: 'fatima@clinicpro.com',
                    schedule: [
                        { day: 'الأحد', from: '09:00', to: '16:00', isAvailable: true },
                        { day: 'الاثنين', from: '09:00', to: '16:00', isAvailable: true },
                        { day: 'الأربعاء', from: '09:00', to: '16:00', isAvailable: true }
                    ],
                    consultationFee: 250,
                    status: 'active'
                }
            ];
            
            sampleDoctors.forEach(doctor => {
                this.db.create('doctors', {
                    id: this.db.generateId('doctor'),
                    ...doctor,
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                });
            });
            
            // 2. إنشاء مرضى نموذجيين
            const samplePatients = [
                {
                    code: 'PAT001',
                    fullName: 'أحمد محمود',
                    gender: 'ذكر',
                    birthDate: '1985-05-15',
                    age: 38,
                    phone: '01012345678',
                    email: 'ahmed@example.com',
                    address: 'المهندسين، الجيزة',
                    bloodType: 'O+',
                    allergies: 'لا يوجد',
                    chronicDiseases: 'لا يوجد',
                    emergencyContact: '01123456789',
                    notes: 'مريض منتظم'
                },
                {
                    code: 'PAT002',
                    fullName: 'سارة أحمد',
                    gender: 'أنثى',
                    birthDate: '1990-08-22',
                    age: 33,
                    phone: '01023456789',
                    email: 'sara@example.com',
                    address: 'المعادي، القاهرة',
                    bloodType: 'A+',
                    allergies: 'البنسلين',
                    chronicDiseases: 'ضغط دم مرتفع',
                    emergencyContact: '01234567890',
                    notes: 'تحتاج متابعة منتظمة'
                },
                {
                    code: 'PAT003',
                    fullName: 'محمد السيد',
                    gender: 'ذكر',
                    birthDate: '1978-12-10',
                    age: 46,
                    phone: '01034567890',
                    email: 'mohamed@example.com',
                    address: 'مدينة نصر، القاهرة',
                    bloodType: 'B+',
                    allergies: 'لا يوجد',
                    chronicDiseases: 'سكري',
                    emergencyContact: '01134567890',
                    notes: 'مريض سكري'
                }
            ];
            
            samplePatients.forEach(patient => {
                this.db.create('patients', {
                    id: this.db.generateId('patient'),
                    ...patient,
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                });
            });
            
            // 3. إنشاء مواعيد نموذجية
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const sampleAppointments = [
                {
                    patientId: this.db.getAll('patients')[0]?.id,
                    doctorId: this.db.getAll('doctors')[0]?.id,
                    date: today.toISOString().split('T')[0],
                    time: '10:00',
                    type: 'كشف جديد',
                    status: 'مكتمل',
                    reason: 'ألم في الأسنان',
                    fee: 200,
                    paymentStatus: 'مدفوع'
                },
                {
                    patientId: this.db.getAll('patients')[1]?.id,
                    doctorId: this.db.getAll('doctors')[1]?.id,
                    date: tomorrow.toISOString().split('T')[0],
                    time: '11:30',
                    type: 'متابعة',
                    status: 'مجدول',
                    reason: 'متابعة علاج الجلد',
                    fee: 150,
                    paymentStatus: 'غير مدفوع'
                }
            ];
            
            sampleAppointments.forEach(appointment => {
                this.db.create('appointments', {
                    id: this.db.generateId('appointment'),
                    code: `APT${Date.now().toString().slice(-6)}`,
                    ...appointment,
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                });
            });
            
            // 4. إنشاء دفعات نموذجية
            const samplePayments = [
                {
                    appointmentId: this.db.getAll('appointments')[0]?.id,
                    patientId: this.db.getAll('patients')[0]?.id,
                    amount: 200,
                    paymentMethod: 'نقدي',
                    status: 'مكتمل',
                    notes: 'دفع كامل'
                }
            ];
            
            samplePayments.forEach(payment => {
                this.db.create('payments', {
                    id: this.db.generateId('payment'),
                    ...payment,
                    date: new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                });
            });
            
            this.setupStatus.sampleData = true;
            console.log('✅ تم إنشاء البيانات النموذجية بنجاح');
            
        } catch (error) {
            console.warn('تحذير: فشل إنشاء بيانات نموذجية:', error.message);
            // لا نوقف العملية لأن البيانات النموذجية ليست ضرورية
        }
    }

    /**
     * إعداد نظام النسخ الاحتياطي
     */
    async setupBackupSystem() {
        try {
            if (!this.db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // إنشاء النسخة الاحتياطية الأولى
            await this.db.createBackup();
            
            // إعداد النسخ الاحتياطي الدوري
            const backupSettings = this.db.getSetting('backup_settings');
            if (!backupSettings) {
                this.db.updateSetting('backup_settings', {
                    autoBackup: true,
                    backupInterval: 24, // ساعات
                    keepBackups: 30,
                    lastBackup: new Date().toISOString(),
                    nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });
            }
            
            console.log('✅ تم إعداد نظام النسخ الاحتياطي');
            
        } catch (error) {
            console.warn('تحذير: فشل إعداد النسخ الاحتياطي:', error.message);
        }
    }

    /**
     * التحقق من صحة النظام
     */
    async validateSystem() {
        try {
            const validationResults = {
                database: false,
                settings: false,
                users: false,
                permissions: false,
                storage: false
            };
            
            // التحقق من قاعدة البيانات
            if (this.db) {
                const dbValidation = this.db.validateDatabase();
                validationResults.database = dbValidation.valid;
                
                if (!dbValidation.valid) {
                    console.warn('تحذيرات قاعدة البيانات:', dbValidation.issues);
                }
            }
            
            // التحقق من الإعدادات
            const settings = this.db?.getAll('settings') || [];
            validationResults.settings = settings.length > 0;
            
            // التحقق من المستخدمين
            const users = this.db?.getAll('users') || [];
            validationResults.users = users.length > 0;
            
            // التحقق من صلاحيات المستخدمين
            const adminUsers = users.filter(u => u.role === 'admin');
            validationResults.permissions = adminUsers.length > 0;
            
            // التحقق من التخزين
            const storageCheck = await this.checkStorageAvailability();
            validationResults.storage = storageCheck.available;
            
            // حفظ نتائج التحقق
            localStorage.setItem('clinicpro_validation_results', JSON.stringify({
                date: new Date().toISOString(),
                results: validationResults,
                systemVersion: this.version
            }));
            
            // التحقق من النتائج
            const allValid = Object.values(validationResults).every(v => v === true);
            
            if (!allValid) {
                console.warn('بعض اختبارات التحقق فشلت:', validationResults);
            }
            
            console.log('✅ تم التحقق من صحة النظام');
            
        } catch (error) {
            console.warn('تحذير: فشل التحقق من صحة النظام:', error.message);
        }
    }

    /**
     * تحديث حالة النظام
     */
    async updateSystemStatus() {
        try {
            const systemStatus = {
                version: this.version,
                setupDate: new Date().toISOString(),
                lastMaintenance: new Date().toISOString(),
                uptime: Date.now(),
                setupStatus: this.setupStatus,
                statistics: this.db?.getStatistics() || {}
            };
            
            localStorage.setItem('clinicpro_system_status', JSON.stringify(systemStatus));
            
            // إرسال حدث تحديث النظام
            const event = new CustomEvent('system_initialized', { detail: systemStatus });
            window.dispatchEvent(event);
            
            console.log('✅ تم تحديث حالة النظام');
            
        } catch (error) {
            console.warn('تحذير: فشل تحديث حالة النظام:', error.message);
        }
    }

    // ===========================================
    // واجهة المستخدم للإعداد
    // ===========================================

    /**
     * عرض شاشة الإعداد
     */
    showSetupScreen() {
        // إنشاء عنصر شاشة الإعداد إذا لم يكن موجوداً
        if (!document.getElementById('setup-screen')) {
            const setupScreen = document.createElement('div');
            setupScreen.id = 'setup-screen';
            setupScreen.className = 'setup-screen';
            setupScreen.innerHTML = `
                <div class="setup-container">
                    <div class="setup-header">
                        <div class="setup-logo">
                            <i class="fas fa-stethoscope"></i>
                            <h1>Clinic<span>Pro</span></h1>
                        </div>
                        <p class="setup-subtitle">نظام إدارة العيادات الطبية</p>
                    </div>
                    
                    <div class="setup-content">
                        <div class="setup-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="setup-progress-fill"></div>
                            </div>
                            <div class="progress-text" id="setup-progress-text">جاري التحقق من متطلبات النظام...</div>
                        </div>
                        
                        <div class="setup-steps" id="setup-steps">
                            <div class="step active">
                                <span class="step-icon">🔍</span>
                                <span class="step-text">التحقق من المتطلبات</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">🔄</span>
                                <span class="step-text">فحص الإصدار والترقية</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">🗄️</span>
                                <span class="step-text">تهيئة قاعدة البيانات</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">⚙️</span>
                                <span class="step-text">تهيئة الإعدادات</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">👥</span>
                                <span class="step-text">إنشاء المستخدمين</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">📊</span>
                                <span class="step-text">إنشاء بيانات نموذجية</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">💾</span>
                                <span class="step-text">إعداد النسخ الاحتياطي</span>
                            </div>
                            <div class="step">
                                <span class="step-icon">✅</span>
                                <span class="step-text">التحقق من صحة النظام</span>
                            </div>
                        </div>
                        
                        <div class="setup-details" id="setup-details">
                            <!-- سيتم ملء التفاصيل هنا -->
                        </div>
                    </div>
                    
                    <div class="setup-footer">
                        <p class="version">الإصدار ${this.version}</p>
                        <p class="hint">يرجى الانتظار حتى اكتمال الإعداد...</p>
                    </div>
                </div>
            `;
            
            // إضافة الأنماط
            this.addSetupStyles();
            
            // إضافة الشاشة إلى body
            document.body.appendChild(setupScreen);
        }
        
        // عرض الشاشة
        document.getElementById('setup-screen').style.display = 'flex';
    }

    /**
     * إضافة أنماط شاشة الإعداد
     */
    addSetupStyles() {
        if (!document.getElementById('setup-styles')) {
            const style = document.createElement('style');
            style.id = 'setup-styles';
            style.textContent = `
                .setup-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    font-family: 'Tajawal', sans-serif;
                    direction: rtl;
                }
                
                .setup-container {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .setup-header {
                    background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .setup-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                
                .setup-logo i {
                    font-size: 3rem;
                }
                
                .setup-logo h1 {
                    font-size: 2.5rem;
                    margin: 0;
                }
                
                .setup-logo span {
                    color: #e74c3c;
                }
                
                .setup-subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin: 0;
                }
                
                .setup-content {
                    padding: 30px;
                    flex: 1;
                    overflow-y: auto;
                }
                
                .setup-progress {
                    margin-bottom: 30px;
                }
                
                .progress-bar {
                    height: 10px;
                    background: #ecf0f1;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(to right, #2ecc71, #3498db);
                    width: 0%;
                    transition: width 0.5s ease;
                    border-radius: 5px;
                }
                
                .progress-text {
                    text-align: center;
                    color: #7f8c8d;
                    font-size: 1.1rem;
                    font-weight: 500;
                }
                
                .setup-steps {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                    opacity: 0.5;
                }
                
                .step.active {
                    background: #e3f2fd;
                    opacity: 1;
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
                }
                
                .step.completed {
                    background: #e8f5e9;
                }
                
                .step-icon {
                    font-size: 2rem;
                    margin-bottom: 10px;
                }
                
                .step-text {
                    font-size: 0.9rem;
                    text-align: center;
                    font-weight: 500;
                }
                
                .setup-details {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    min-height: 100px;
                }
                
                .setup-footer {
                    padding: 20px;
                    text-align: center;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                }
                
                .version {
                    color: #6c757d;
                    margin: 0 0 10px 0;
                    font-weight: 500;
                }
                
                .hint {
                    color: #3498db;
                    margin: 0;
                    font-size: 0.9rem;
                }
                
                @media (max-width: 768px) {
                    .setup-container {
                        width: 95%;
                        margin: 10px;
                    }
                    
                    .setup-steps {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .setup-header {
                        padding: 20px;
                    }
                    
                    .setup-content {
                        padding: 20px;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    /**
     * تحديث تقدم الإعداد
     */
    updateProgress(percentage, message) {
        const progressFill = document.getElementById('setup-progress-fill');
        const progressText = document.getElementById('setup-progress-text');
        const steps = document.querySelectorAll('.step');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        // تحديث الخطوات النشطة
        const stepIndex = Math.floor(percentage / 12.5); // 8 خطوات
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < stepIndex) {
                step.classList.add('completed');
            } else if (index === stepIndex) {
                step.classList.add('active');
            }
        });
        
        // تحديث التفاصيل
        this.updateSetupDetails(message);
    }

    /**
     * تحديث تفاصيل الإعداد
     */
    updateSetupDetails(message) {
        const details = document.getElementById('setup-details');
        if (details) {
            const timestamp = new Date().toLocaleTimeString();
            details.innerHTML = `
                <div class="detail-item">
                    <span class="detail-time">${timestamp}</span>
                    <span class="detail-message">${message}</span>
                </div>
            `;
        }
    }

    /**
     * إخفاء شاشة الإعداد
     */
    hideSetupScreen() {
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) {
            // تأثير اختفاء
            setupScreen.style.opacity = '0';
            setupScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                setupScreen.style.display = 'none';
                // إزالة الشاشة بعد الاختفاء
                setTimeout(() => {
                    if (setupScreen.parentNode) {
                        setupScreen.parentNode.removeChild(setupScreen);
                    }
                }, 500);
            }, 500);
        }
    }

    /**
     * عرض رسالة نجاح
     */
    showSuccess(message) {
        // إنشاء إشعار نجاح
        const toast = document.createElement('div');
        toast.className = 'setup-toast success';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // إضافة الأنماط
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .setup-toast {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-100px);
                    background: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    transition: transform 0.5s ease;
                }
                
                .setup-toast.success {
                    border-right: 5px solid #2ecc71;
                }
                
                .setup-toast.error {
                    border-right: 5px solid #e74c3c;
                }
                
                .setup-toast i {
                    font-size: 1.5rem;
                }
                
                .setup-toast.success i {
                    color: #2ecc71;
                }
                
                .setup-toast.error i {
                    color: #e74c3c;
                }
                
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // عرض الإشعار
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // إخفاء الإشعار بعد 5 ثواني
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 5000);
    }

    /**
     * عرض رسالة خطأ
     */
    showError(title, message) {
        // إخفاء شاشة الإعداد أولاً
        this.hideSetupScreen();
        
        // إنشاء شاشة الخطأ
        const errorScreen = document.createElement('div');
        errorScreen.id = 'error-screen';
        errorScreen.className = 'setup-screen';
        errorScreen.innerHTML = `
            <div class="setup-container" style="max-width: 500px;">
                <div class="setup-header" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">
                    <div class="setup-logo">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h1>خطأ في الإعداد</h1>
                    </div>
                </div>
                
                <div class="setup-content">
                    <div class="error-content">
                        <h3 style="color: #e74c3c; margin-bottom: 15px;">${title}</h3>
                        <p style="color: #7f8c8d; margin-bottom: 20px;">${message}</p>
                        
                        <div class="error-actions">
                            <button id="retry-setup" class="btn btn-primary">
                                <i class="fas fa-redo"></i> إعادة المحاولة
                            </button>
                            <button id="skip-setup" class="btn btn-outline">
                                <i class="fas fa-forward"></i> تخطي الإعداد
                            </button>
                        </div>
                        
                        <div class="error-help" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                            <h4>نصائح للمساعدة:</h4>
                            <ul style="text-align: right; padding-right: 20px;">
                                <li>تأكد من استخدام متصفح حديث (Chrome, Firefox, Safari, Edge)</li>
                                <li>تفعيل JavaScript في المتصفح</li>
                                <li>تفعيل LocalStorage وملفات تعريف الارتباط</li>
                                <li>تأكد من وجود مساحة تخزين كافية</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorScreen);
        
        // إضافة أزرار الإجراءات
        document.getElementById('retry-setup').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('skip-setup').addEventListener('click', () => {
            localStorage.setItem('clinicpro_setup_skipped', 'true');
            errorScreen.remove();
            
            // محاولة تحميل النظام بدون إعداد كامل
            this.showWarning('تم تخطي الإعداد. قد لا تعمل بعض الميزات بشكل صحيح.');
        });
    }

    /**
     * عرض تحذير
     */
    showWarning(message) {
        console.warn('⚠️ ' + message);
        
        // يمكن إضافة إشعار للمستخدم هنا
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'warning');
        }
    }

    /**
     * إعادة تعيين النظام
     */
    async resetSystem() {
        if (confirm('⚠️ تحذير: هذا الإجراء سيمسح جميع البيانات ويعيد النظام إلى حالته الأصلية. هل أنت متأكد؟')) {
            try {
                // 1. مسح جميع البيانات
                if (this.db) {
                    await this.db.clearAllData();
                }
                
                // 2. مسح جميع الإعدادات المحلية
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('clinicpro_')) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // 3. إعادة تحميل الصفحة
                location.reload();
                
            } catch (error) {
                this.showError('فشل إعادة التعيين', error.message);
            }
        }
    }

    /**
     * تصدير بيانات الإعداد
     */
    exportSetupData() {
        const setupData = {
            version: this.version,
            setupDate: localStorage.getItem('clinicpro_setup_date'),
            status: this.setupStatus,
            requirements: {
                browser: this.checkBrowserSupport(),
                javascript: this.checkJavaScriptSupport(),
                localStorage: this.checkLocalStorageSupport(),
                storage: this.checkStorageAvailability()
            }
        };
        
        const dataStr = JSON.stringify(setupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `clinicpro-setup-${new Date().toISOString().split('T')[0]}.json`);
        linkElement.click();
    }
}

// ===========================================
// تهيئة النظام عند تحميل الصفحة
// ===========================================

// الانتظار حتى تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', async () => {
    // التحقق مما إذا كان النظام مهيأ بالفعل
    const isSetupCompleted = localStorage.getItem('clinicpro_setup_completed') === 'true';
    const isSetupSkipped = localStorage.getItem('clinicpro_setup_skipped') === 'true';
    
    // إذا لم يكتمل الإعداد ولم يتم تخطيه، قم بالإعداد
    if (!isSetupCompleted && !isSetupSkipped) {
        // انتظر تحميل الملفات الأساسية
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // بدء الإعداد
        window.clinicSetup = new ClinicSetup();
    } else if (isSetupSkipped) {
        console.log('⚠️ تم تخطي الإعداد مسبقاً');
    } else {
        console.log('✅ النظام مهيأ وجاهز للعمل');
        
        // تحديث حالة النظام بانتظام
        setInterval(() => {
            if (window.clinicDB) {
                const stats = window.clinicDB.getStatistics();
                localStorage.setItem('clinicpro_last_activity', new Date().toISOString());
                
                // التحقق من النسخ الاحتياطي التلقائي
                const lastBackup = localStorage.getItem('clinicpro_last_backup');
                const backupInterval = 24 * 60 * 60 * 1000; // 24 ساعة
                
                if (!lastBackup || (Date.now() - parseInt(lastBackup)) > backupInterval) {
                    window.clinicDB.createBackup();
                }
            }
        }, 5 * 60 * 1000); // كل 5 دقائق
    }
});

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClinicSetup;
}

console.log('✅ تم تحميل نظام الإعداد بنجاح');
