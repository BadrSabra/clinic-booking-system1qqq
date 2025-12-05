
/**
 * نظام ClinicPro - قاعدة البيانات المحلية
 * نظام تخزين محلي متكامل باستخدام localStorage مع دعم النسخ الاحتياطي والاستعادة
 * @version 1.0.0
 * @author ClinicPro Team
 */

class ClinicDatabase {
    constructor() {
        this.config = window.configManager || {
            get: (key, defaultValue) => defaultValue,
            getThemeColors: () => ({ primary: '#3498db' })
        };
        
        this.tables = {
            users: 'clinicpro_users',
            patients: 'clinicpro_patients',
            doctors: 'clinicpro_doctors',
            appointments: 'clinicpro_appointments',
            payments: 'clinicpro_payments',
            inventory: 'clinicpro_inventory',
            settings: 'clinicpro_settings',
            notifications: 'clinicpro_notifications',
            prescriptions: 'clinicpro_prescriptions',
            medical_records: 'clinicpro_medical_records',
            expenses: 'clinicpro_expenses',
            backup: 'clinicpro_backup'
        };
        
        this.initialize();
    }

    /**
     * تهيئة قاعدة البيانات
     */
    initialize() {
        try {
            // التحقق من دعم localStorage
            if (!this.isLocalStorageSupported()) {
                throw new Error('المتصفح لا يدعم localStorage');
            }

            // تهيئة الجداول إذا كانت غير موجودة
            this.initializeTables();

            // إنشاء البيانات الأولية إذا كانت قاعدة البيانات فارغة
            if (this.isDatabaseEmpty()) {
                this.createInitialData();
            }

            // إعداد النسخ الاحتياطي التلقائي
            this.setupAutoBackup();

            console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
            this.showError('فشل في تهيئة قاعدة البيانات: ' + error.message);
        }
    }

    /**
     * التحقق من دعم localStorage
     */
    isLocalStorageSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * تهيئة جميع الجداول
     */
    initializeTables() {
        Object.values(this.tables).forEach(table => {
            if (!localStorage.getItem(table)) {
                localStorage.setItem(table, JSON.stringify([]));
            }
        });

        // تهيئة الإعدادات الافتراضية
        if (!localStorage.getItem(this.tables.settings) || 
            JSON.parse(localStorage.getItem(this.tables.settings)).length === 0) {
            this.initializeDefaultSettings();
        }

        // علامة تهيئة قاعدة البيانات
        localStorage.setItem('clinicpro_initialized', 'true');
        localStorage.setItem('clinicpro_init_date', new Date().toISOString());
    }

    /**
     * التحقق مما إذا كانت قاعدة البيانات فارغة
     */
    isDatabaseEmpty() {
        const essentialTables = [
            this.tables.users,
            this.tables.doctors,
            this.tables.settings
        ];

        return essentialTables.some(table => {
            const data = JSON.parse(localStorage.getItem(table) || '[]');
            return data.length === 0;
        });
    }

    /**
     * إنشاء البيانات الأولية
     */
    createInitialData() {
        console.log('إنشاء البيانات الأولية...');

        // 1. إنشاء المستخدم المسؤول
        const adminUser = {
            id: this.generateId('user'),
            username: 'admin',
            email: 'admin@clinicpro.com',
            password: this.hashPassword('Admin@123'),
            fullName: 'مدير النظام',
            role: 'admin',
            phone: '01234567890',
            specialty: 'إدارة',
            status: 'active',
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            permissions: ['*'],
            lastLogin: null,
            loginAttempts: 0,
            accountLocked: false
        };
        this.create('users', adminUser);

        // 2. إنشاء أطباء افتراضيين
        const defaultDoctors = [
            {
                id: this.generateId('doctor'),
                code: 'DOC001',
                name: 'د. أحمد محمد',
                specialty: 'أسنان',
                qualification: 'دكتوراه في طب الأسنان',
                experience: '15 سنة',
                phone: '01234567891',
                email: 'ahmed@clinicpro.com',
                address: 'القاهرة، مصر',
                schedule: [
                    { day: 'الأحد', from: '09:00', to: '17:00', isAvailable: true },
                    { day: 'الاثنين', from: '09:00', to: '17:00', isAvailable: true },
                    { day: 'الثلاثاء', from: '09:00', to: '17:00', isAvailable: true },
                    { day: 'الأربعاء', from: '09:00', to: '17:00', isAvailable: true },
                    { day: 'الخميس', from: '09:00', to: '14:00', isAvailable: true }
                ],
                consultationFee: 200,
                status: 'active',
                notes: 'طبيب استشاري',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId('doctor'),
                code: 'DOC002',
                name: 'د. سارة خالد',
                specialty: 'جلدية',
                qualification: 'زمالة الأمراض الجلدية',
                experience: '10 سنوات',
                phone: '01234567892',
                email: 'sara@clinicpro.com',
                address: 'الإسكندرية، مصر',
                schedule: [
                    { day: 'الأحد', from: '10:00', to: '18:00', isAvailable: true },
                    { day: 'الثلاثاء', from: '10:00', to: '18:00', isAvailable: true },
                    { day: 'الخميس', from: '10:00', to: '18:00', isAvailable: true }
                ],
                consultationFee: 250,
                status: 'active',
                notes: 'أخصائية جلدية وتجميل',
                createdAt: new Date().toISOString()
            }
        ];

        defaultDoctors.forEach(doctor => {
            this.create('doctors', doctor);
        });

        // 3. إنشاء بيانات المخزون الأولية
        const initialInventory = [
            {
                id: this.generateId('inv'),
                code: 'MED001',
                name: 'باراسيتامول 500 مجم',
                category: 'مسكنات',
                unit: 'علبة',
                quantity: 100,
                minQuantity: 20,
                price: 15.50,
                expiryDate: '2026-12-31',
                supplier: 'شركة الأدوية المصرية',
                status: 'available',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId('inv'),
                code: 'MED002',
                name: 'أموكسيسيلين 250 مجم',
                category: 'مضادات حيوية',
                unit: 'علبة',
                quantity: 50,
                minQuantity: 10,
                price: 45.00,
                expiryDate: '2025-06-30',
                supplier: 'المؤسسة الطبية',
                status: 'available',
                createdAt: new Date().toISOString()
            }
        ];

        initialInventory.forEach(item => {
            this.create('inventory', item);
        });

        console.log('✅ تم إنشاء البيانات الأولية بنجاح');
    }

    /**
     * تهيئة الإعدادات الافتراضية
     */
    initializeDefaultSettings() {
        const defaultSettings = [
            {
                id: 'clinic_info',
                key: 'clinic_info',
                value: {
                    name: 'عيادة الدكتور أحمد',
                    address: 'شارع المستشفى الرئيسي - القاهرة',
                    phone: '0223456789',
                    email: 'info@clinicpro.com',
                    website: 'www.clinicpro.com',
                    taxNumber: '123456789',
                    commercialRegister: '987654321'
                },
                category: 'general',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'business_settings',
                key: 'business_settings',
                value: {
                    currency: 'ج.م',
                    currencySymbol: '£',
                    taxRate: 14,
                    appointmentDuration: 30,
                    workingHours: {
                        start: '08:00',
                        end: '20:00',
                        breakStart: '12:00',
                        breakEnd: '13:00'
                    },
                    workingDays: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
                },
                category: 'business',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'notification_settings',
                key: 'notification_settings',
                value: {
                    appointmentReminders: true,
                    smsNotifications: false,
                    emailNotifications: true,
                    lowStockAlerts: true,
                    paymentReminders: true
                },
                category: 'notifications',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'backup_settings',
                key: 'backup_settings',
                value: {
                    autoBackup: true,
                    backupInterval: 24,
                    keepBackups: 30,
                    lastBackup: null
                },
                category: 'backup',
                updatedAt: new Date().toISOString()
            }
        ];

        localStorage.setItem(this.tables.settings, JSON.stringify(defaultSettings));
    }

    /**
     * توليد معرف فريد
     */
    generateId(prefix = 'id') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * تشفير كلمة المرور (بسيط - للإنتاج استخدم bcrypt)
     */
    hashPassword(password) {
        return btoa(unescape(encodeURIComponent(password))) + '_clinicpro';
    }

    /**
     * التحقق من كلمة المرور
     */
    verifyPassword(inputPassword, storedPassword) {
        const hashedInput = this.hashPassword(inputPassword);
        return hashedInput === storedPassword;
    }

    // ===========================================
    // CRUD Operations - العمليات الأساسية
    // ===========================================

    /**
     * إنشاء سجل جديد
     */
    create(table, data) {
        try {
            if (!this.tables[table]) {
                throw new Error(`الجدول ${table} غير موجود`);
            }

            const tableData = this.getAll(table);
            
            // إضافة بيانات نظامية
            const record = {
                ...data,
                id: data.id || this.generateId(table),
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: data.createdBy || this.getCurrentUser()?.id || 'system'
            };

            tableData.push(record);
            localStorage.setItem(this.tables[table], JSON.stringify(tableData));

            // إرسال حدث إنشاء جديد
            this.emitEvent(`${table}_created`, record);

            return {
                success: true,
                data: record,
                message: 'تم إنشاء السجل بنجاح'
            };
        } catch (error) {
            console.error(`خطأ في إنشاء سجل في ${table}:`, error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في إنشاء السجل'
            };
        }
    }

    /**
     * قراءة جميع السجلات
     */
    getAll(table, filters = {}) {
        try {
            if (!this.tables[table]) {
                return [];
            }

            const tableData = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            
            // تطبيق الفلاتر إذا وجدت
            if (Object.keys(filters).length > 0) {
                return tableData.filter(record => {
                    return Object.entries(filters).every(([key, value]) => {
                        if (value === undefined || value === null) return true;
                        
                        if (typeof value === 'object' && value.operator) {
                            return this.applyFilterOperator(record[key], value);
                        }
                        
                        return record[key] == value;
                    });
                });
            }

            return tableData;
        } catch (error) {
            console.error(`خطأ في قراءة الجدول ${table}:`, error);
            return [];
        }
    }

    /**
     * تطبيق عوامل التصفية
     */
    applyFilterOperator(recordValue, filter) {
        const { operator, value } = filter;
        
        switch (operator) {
            case 'equals':
                return recordValue == value;
            case 'notEquals':
                return recordValue != value;
            case 'contains':
                return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
            case 'startsWith':
                return String(recordValue).toLowerCase().startsWith(String(value).toLowerCase());
            case 'endsWith':
                return String(recordValue).toLowerCase().endsWith(String(value).toLowerCase());
            case 'greaterThan':
                return recordValue > value;
            case 'lessThan':
                return recordValue < value;
            case 'between':
                return recordValue >= value[0] && recordValue <= value[1];
            case 'in':
                return value.includes(recordValue);
            default:
                return true;
        }
    }

    /**
     * قراءة سجل واحد
     */
    getById(table, id) {
        try {
            const tableData = this.getAll(table);
            return tableData.find(record => record.id === id) || null;
        } catch (error) {
            console.error(`خطأ في قراءة السجل ${id} من ${table}:`, error);
            return null;
        }
    }

    /**
     * تحديث سجل
     */
    update(table, id, updates) {
        try {
            const tableData = this.getAll(table);
            const index = tableData.findIndex(record => record.id === id);
            
            if (index === -1) {
                throw new Error('السجل غير موجود');
            }

            // الاحتفاظ بالبيانات الأصلية وتحديثها
            const updatedRecord = {
                ...tableData[index],
                ...updates,
                updatedAt: new Date().toISOString(),
                updatedBy: this.getCurrentUser()?.id || 'system'
            };

            tableData[index] = updatedRecord;
            localStorage.setItem(this.tables[table], JSON.stringify(tableData));

            // إرسال حدث تحديث
            this.emitEvent(`${table}_updated`, updatedRecord);

            return {
                success: true,
                data: updatedRecord,
                message: 'تم تحديث السجل بنجاح'
            };
        } catch (error) {
            console.error(`خطأ في تحديث السجل ${id} في ${table}:`, error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في تحديث السجل'
            };
        }
    }

    /**
     * حذف سجل
     */
    delete(table, id) {
        try {
            const tableData = this.getAll(table);
            const index = tableData.findIndex(record => record.id === id);
            
            if (index === -1) {
                throw new Error('السجل غير موجود');
            }

            const deletedRecord = tableData[index];
            tableData.splice(index, 1);
            localStorage.setItem(this.tables[table], JSON.stringify(tableData));

            // إرسال حدث حذف
            this.emitEvent(`${table}_deleted`, deletedRecord);

            return {
                success: true,
                data: deletedRecord,
                message: 'تم حذف السجل بنجاح'
            };
        } catch (error) {
            console.error(`خطأ في حذف السجل ${id} من ${table}:`, error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في حذف السجل'
            };
        }
    }

    /**
     * البحث في الجدول
     */
    search(table, query, fields = []) {
        try {
            const tableData = this.getAll(table);
            
            if (!query || query.trim() === '') {
                return tableData;
            }

            const searchTerm = query.toLowerCase().trim();
            
            return tableData.filter(record => {
                // إذا تم تحديد حقول معينة، ابحث فيها فقط
                const searchFields = fields.length > 0 ? fields : Object.keys(record);
                
                return searchFields.some(field => {
                    const value = record[field];
                    
                    if (value === null || value === undefined) {
                        return false;
                    }
                    
                    // تحويل القيمة إلى سلسلة للبحث
                    const stringValue = String(value).toLowerCase();
                    
                    // البحث باستخدام includes
                    if (stringValue.includes(searchTerm)) {
                        return true;
                    }
                    
                    // البحث في القيم الفرعية (مثل الاسم في كائن)
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value).toLowerCase().includes(searchTerm);
                    }
                    
                    return false;
                });
            });
        } catch (error) {
            console.error(`خطأ في البحث في ${table}:`, error);
            return [];
        }
    }

    // ===========================================
    // إدارة المستخدمين والمصادقة
    // ===========================================

    /**
     * تسجيل الدخول
     */
    login(username, password) {
        try {
            const users = this.getAll('users');
            
            // البحث عن المستخدم
            const user = users.find(u => 
                (u.username === username || u.email === username) && 
                u.status === 'active'
            );

            if (!user) {
                return {
                    success: false,
                    message: 'اسم المستخدم أو البريد الإلكتروني غير صحيح'
                };
            }

            // التحقق من تأمين الحساب
            if (user.accountLocked) {
                const lockTime = new Date(user.lockedUntil);
                if (lockTime > new Date()) {
                    return {
                        success: false,
                        message: 'الحساب مؤقتاً. حاول مرة أخرى لاحقاً'
                    };
                }
            }

            // التحقق من كلمة المرور
            if (!this.verifyPassword(password, user.password)) {
                // زيادة عدد محاولات الدخول الفاشلة
                const updatedAttempts = (user.loginAttempts || 0) + 1;
                const maxAttempts = this.config.get('SECURITY.MAX_LOGIN_ATTEMPTS', 5);
                
                if (updatedAttempts >= maxAttempts) {
                    // تأمين الحساب
                    const lockoutTime = this.config.get('SECURITY.LOCKOUT_TIME', 15 * 60 * 1000);
                    const lockedUntil = new Date(Date.now() + lockoutTime);
                    
                    this.update('users', user.id, {
                        loginAttempts: updatedAttempts,
                        accountLocked: true,
                        lockedUntil: lockedUntil.toISOString()
                    });
                    
                    return {
                        success: false,
                        message: 'تم تأمين الحساب بسبب محاولات دخول فاشلة متعددة'
                    };
                }
                
                this.update('users', user.id, {
                    loginAttempts: updatedAttempts
                });
                
                return {
                    success: false,
                    message: 'كلمة المرور غير صحيحة'
                };
            }

            // تسجيل الدخول الناجح
            const sessionId = this.generateId('session');
            const sessionData = {
                userId: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions || [],
                loginTime: new Date().toISOString(),
                sessionId: sessionId
            };

            // حفظ بيانات الجلسة
            localStorage.setItem('clinicpro_session', JSON.stringify(sessionData));
            
            // تحديث بيانات المستخدم
            this.update('users', user.id, {
                lastLogin: new Date().toISOString(),
                loginAttempts: 0,
                accountLocked: false,
                lockedUntil: null
            });

            // إنشاء إشعار
            this.createNotification(
                user.id,
                'تسجيل دخول ناجح',
                'تم تسجيل الدخول إلى حسابك بنجاح',
                'success'
            );

            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions
                    },
                    session: sessionData
                },
                message: 'تم تسجيل الدخول بنجاح'
            };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            return {
                success: false,
                message: 'حدث خطأ أثناء تسجيل الدخول'
            };
        }
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        try {
            const session = this.getCurrentSession();
            if (session) {
                // تسجيل وقت الخروج
                const logoutData = {
                    ...session,
                    logoutTime: new Date().toISOString()
                };
                
                // حفظ سجل الخروج (اختياري)
                const logoutLogs = JSON.parse(localStorage.getItem('clinicpro_logout_logs') || '[]');
                logoutLogs.push(logoutData);
                localStorage.setItem('clinicpro_logout_logs', JSON.stringify(logoutLogs));
            }
            
            // مسح بيانات الجلسة
            localStorage.removeItem('clinicpro_session');
            
            return {
                success: true,
                message: 'تم تسجيل الخروج بنجاح'
            };
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            return {
                success: false,
                message: 'حدث خطأ أثناء تسجيل الخروج'
            };
        }
    }

    /**
     * الحصول على المستخدم الحالي
     */
    getCurrentUser() {
        const session = this.getCurrentSession();
        if (!session) return null;
        
        const users = this.getAll('users');
        return users.find(u => u.id === session.userId) || null;
    }

    /**
     * الحصول على الجلسة الحالية
     */
    getCurrentSession() {
        try {
            const sessionData = localStorage.getItem('clinicpro_session');
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            
            // التحقق من انتهاء صلاحية الجلسة
            const sessionTimeout = this.config.get('SECURITY.SESSION_TIMEOUT', 30 * 60 * 1000);
            const loginTime = new Date(session.loginTime);
            const currentTime = new Date();
            
            if (currentTime - loginTime > sessionTimeout) {
                localStorage.removeItem('clinicpro_session');
                return null;
            }
            
            return session;
        } catch (error) {
            return null;
        }
    }

    /**
     * التحقق مما إذا كان المستخدم مسجلاً دخوله
     */
    isLoggedIn() {
        return this.getCurrentSession() !== null;
    }

    /**
     * التحقق من الصلاحيات
     */
    hasPermission(permission) {
        const session = this.getCurrentSession();
        if (!session) return false;
        
        // المدير لديه جميع الصلاحيات
        if (session.role === 'admin' && session.permissions.includes('*')) {
            return true;
        }
        
        return session.permissions.includes(permission);
    }

    // ===========================================
    // إدارة المواعيد
    // ===========================================

    /**
     * حجز موعد جديد
     */
    bookAppointment(appointmentData) {
        try {
            // التحقق من توفر الوقت
            const isAvailable = this.checkAppointmentAvailability(
                appointmentData.doctorId,
                appointmentData.date,
                appointmentData.time
            );

            if (!isAvailable.available) {
                return {
                    success: false,
                    message: isAvailable.message || 'الموعد غير متاح'
                };
            }

            // إنشاء الموعد
            const appointment = {
                id: this.generateId('apt'),
                code: `APT${Date.now().toString().slice(-6)}`,
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId,
                date: appointmentData.date,
                time: appointmentData.time,
                type: appointmentData.type || 'كشف جديد',
                status: 'مجدول',
                reason: appointmentData.reason || '',
                notes: appointmentData.notes || '',
                fee: appointmentData.fee || 0,
                paymentStatus: 'غير مدفوع',
                createdAt: new Date().toISOString(),
                createdBy: this.getCurrentUser()?.id || 'system'
            };

            const result = this.create('appointments', appointment);

            if (result.success) {
                // إنشاء إشعار للمريض والطبيب
                this.createAppointmentNotification(appointment);
                
                // إرسال حدث حجز موعد
                this.emitEvent('appointment_booked', appointment);
            }

            return result;
        } catch (error) {
            console.error('خطأ في حجز الموعد:', error);
            return {
                success: false,
                message: 'حدث خطأ أثناء حجز الموعد'
            };
        }
    }

    /**
     * التحقق من توفر الموعد
     */
    checkAppointmentAvailability(doctorId, date, time) {
        try {
            // 1. التحقق من تاريخ الموعد
            const appointmentDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (appointmentDate < today) {
                return {
                    available: false,
                    message: 'لا يمكن حجز موعد في تاريخ ماضي'
                };
            }

            // 2. التحقق من يوم العمل
            const settings = this.getSetting('business_settings');
            const workingDays = settings?.value?.workingDays || ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
            const dayName = this.getArabicDayName(appointmentDate);
            
            if (!workingDays.includes(dayName)) {
                return {
                    available: false,
                    message: 'العيادة مغلقة في هذا اليوم'
                };
            }

            // 3. التحقق من ساعات العمل
            const workingHours = settings?.value?.workingHours;
            if (workingHours) {
                const appointmentTime = this.timeToMinutes(time);
                const startTime = this.timeToMinutes(workingHours.start);
                const endTime = this.timeToMinutes(workingHours.end);
                
                if (appointmentTime < startTime || appointmentTime > endTime) {
                    return {
                        available: false,
                        message: 'الموعد خارج ساعات العمل'
                    };
                }
            }

            // 4. التحقق من جدول الطبيب
            const doctor = this.getById('doctors', doctorId);
            if (!doctor) {
                return {
                    available: false,
                    message: 'الطبيب غير موجود'
                };
            }

            const doctorSchedule = doctor.schedule?.find(s => s.day === dayName);
            if (!doctorSchedule || !doctorSchedule.isAvailable) {
                return {
                    available: false,
                    message: 'الطبيب غير متاح في هذا اليوم'
                };
            }

            // 5. التحقق من المواعيد المتعارضة
            const existingAppointments = this.getAll('appointments', {
                doctorId: doctorId,
                date: date,
                status: { operator: 'in', value: ['مجدول', 'مؤكد'] }
            });

            const appointmentDuration = settings?.value?.appointmentDuration || 30;
            const newAppointmentTime = this.timeToMinutes(time);
            
            for (const existing of existingAppointments) {
                const existingTime = this.timeToMinutes(existing.time);
                
                if (Math.abs(newAppointmentTime - existingTime) < appointmentDuration) {
                    return {
                        available: false,
                        message: 'هذا الموعد متعارض مع موعد آخر'
                    };
                }
            }

            return {
                available: true,
                message: 'الموعد متاح'
            };
        } catch (error) {
            console.error('خطأ في التحقق من توفر الموعد:', error);
            return {
                available: false,
                message: 'حدث خطأ أثناء التحقق من توفر الموعد'
            };
        }
    }

    /**
     * تحويل الوقت إلى دقائق
     */
    timeToMinutes(time) {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + (minutes || 0);
    }

    /**
     * الحصول على اليوم بالعربية
     */
    getArabicDayName(date) {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[date.getDay()];
    }

    /**
     * إنشاء إشعار للموعد
     */
    createAppointmentNotification(appointment) {
        // إشعار للمريض
        this.createNotification(
            appointment.patientId,
            'موعد جديد',
            `تم حجز موعد لك بتاريخ ${appointment.date} الساعة ${appointment.time}`,
            'info'
        );

        // إشعار للطبيب
        this.createNotification(
            appointment.doctorId,
            'موعد جديد',
            `لديك موعد جديد بتاريخ ${appointment.date} الساعة ${appointment.time}`,
            'info'
        );
    }

    // ===========================================
    // إدارة الإعدادات
    // ===========================================

    /**
     * الحصول على إعداد
     */
    getSetting(key) {
        const settings = this.getAll('settings');
        return settings.find(s => s.key === key) || null;
    }

    /**
     * تحديث إعداد
     */
    updateSetting(key, value) {
        const existing = this.getSetting(key);
        
        if (existing) {
            return this.update('settings', existing.id, {
                value: value,
                updatedAt: new Date().toISOString()
            });
        } else {
            return this.create('settings', {
                key: key,
                value: value,
                category: 'general',
                updatedAt: new Date().toISOString()
            });
        }
    }

    /**
     * الحصول على إعدادات العيادة
     */
    getClinicSettings() {
        const clinicInfo = this.getSetting('clinic_info');
        const businessSettings = this.getSetting('business_settings');
        
        return {
            clinic: clinicInfo?.value || {},
            business: businessSettings?.value || {}
        };
    }

    // ===========================================
    // الإشعارات
    // ===========================================

    /**
     * إنشاء إشعار جديد
     */
    createNotification(userId, title, message, type = 'info') {
        const notification = {
            id: this.generateId('notif'),
            userId: userId,
            title: title,
            message: message,
            type: type,
            isRead: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // تنتهي بعد أسبوع
        };

        return this.create('notifications', notification);
    }

    /**
     * الحصول على إشعارات المستخدم
     */
    getUserNotifications(userId, unreadOnly = false) {
        let notifications = this.getAll('notifications', {
            userId: userId
        });

        if (unreadOnly) {
            notifications = notifications.filter(n => !n.isRead);
        }

        // ترتيب تنازلي حسب التاريخ
        return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * تحديد الإشعار كمقروء
     */
    markNotificationAsRead(notificationId) {
        return this.update('notifications', notificationId, {
            isRead: true,
            readAt: new Date().toISOString()
        });
    }

    // ===========================================
    // الإحصائيات والتقارير
    // ===========================================

    /**
     * الحصول على إحصائيات النظام
     */
    getStatistics() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // تعداد السجلات
            const stats = {
                total: {
                    patients: this.getAll('patients').length,
                    doctors: this.getAll('doctors').length,
                    appointments: this.getAll('appointments').length,
                    users: this.getAll('users').length,
                    payments: this.getAll('payments').length
                },
                today: {
                    appointments: this.getAll('appointments', { date: today }).length,
                    patients: this.getAll('patients', { 
                        createdAt: { operator: 'contains', value: today }
                    }).length,
                    revenue: this.calculateDailyRevenue(today)
                },
                upcoming: {
                    appointments: this.getUpcomingAppointments().length
                },
                financial: {
                    totalRevenue: this.calculateTotalRevenue(),
                    pendingPayments: this.calculatePendingPayments(),
                    collectedToday: this.calculateDailyRevenue(today)
                }
            };

            return stats;
        } catch (error) {
            console.error('خطأ في حساب الإحصائيات:', error);
            return null;
        }
    }

    /**
     * حساب الإيرادات اليومية
     */
    calculateDailyRevenue(date) {
        const payments = this.getAll('payments', {
            date: date,
            status: 'مكتمل'
        });
        
        return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    }

    /**
     * حساب إجمالي الإيرادات
     */
    calculateTotalRevenue() {
        const payments = this.getAll('payments', {
            status: 'مكتمل'
        });
        
        return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    }

    /**
     * حساب المدفوعات المعلقة
     */
    calculatePendingPayments() {
        const appointments = this.getAll('appointments', {
            paymentStatus: 'غير مدفوع'
        });
        
        return appointments.reduce((total, appointment) => total + (appointment.fee || 0), 0);
    }

    /**
     * الحصول على المواعيد القادمة
     */
    getUpcomingAppointments(limit = 10) {
        const today = new Date().toISOString().split('T')[0];
        
        const appointments = this.getAll('appointments', {
            date: { operator: 'greaterThan', value: today },
            status: { operator: 'in', value: ['مجدول', 'مؤكد'] }
        });

        // ترتيب حسب التاريخ والوقت
        return appointments
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.time.localeCompare(b.time);
            })
            .slice(0, limit);
    }

    // ===========================================
    // النسخ الاحتياطي والاستعادة
    // ===========================================

    /**
     * إعداد النسخ الاحتياطي التلقائي
     */
    setupAutoBackup() {
        const backupSettings = this.getSetting('backup_settings');
        
        if (backupSettings?.value?.autoBackup) {
            const interval = (backupSettings.value.backupInterval || 24) * 60 * 60 * 1000;
            
            // التحقق من آخر نسخ احتياطي
            const lastBackup = localStorage.getItem('clinicpro_last_backup');
            
            if (!lastBackup || (Date.now() - parseInt(lastBackup)) > interval) {
                this.createBackup();
            }
            
            // إعداد النسخ الاحتياطي الدوري
            setInterval(() => {
                this.createBackup();
            }, interval);
        }
    }

    /**
     * إنشاء نسخة احتياطية
     */
    createBackup() {
        try {
            const backupData = {};
            
            // جمع بيانات جميع الجداول
            Object.entries(this.tables).forEach(([key, tableName]) => {
                backupData[key] = JSON.parse(localStorage.getItem(tableName) || '[]');
            });
            
            // إنشاء نسخة احتياطية
            const backup = {
                id: this.generateId('backup'),
                timestamp: Date.now(),
                date: new Date().toISOString(),
                data: backupData,
                size: JSON.stringify(backupData).length,
                createdBy: this.getCurrentUser()?.id || 'system'
            };
            
            // حفظ النسخة الاحتياطية
            const backups = this.getAll('backup');
            backups.push(backup);
            
            // الاحتفاظ بعدد محدد من النسخ
            const maxBackups = this.getSetting('backup_settings')?.value?.keepBackups || 30;
            if (backups.length > maxBackups) {
                backups.sort((a, b) => b.timestamp - a.timestamp);
                backups.splice(maxBackups);
            }
            
            localStorage.setItem(this.tables.backup, JSON.stringify(backups));
            localStorage.setItem('clinicpro_last_backup', Date.now().toString());
            
            console.log('✅ تم إنشاء نسخة احتياطية');
            
            return {
                success: true,
                data: backup,
                message: 'تم إنشاء نسخة احتياطية بنجاح'
            };
        } catch (error) {
            console.error('خطأ في إنشاء نسخة احتياطية:', error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في إنشاء نسخة احتياطية'
            };
        }
    }

    /**
     * استعادة نسخة احتياطية
     */
    restoreBackup(backupId) {
        try {
            const backup = this.getById('backup', backupId);
            if (!backup) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }
            
            // استعادة البيانات
            Object.entries(backup.data).forEach(([key, data]) => {
                if (this.tables[key]) {
                    localStorage.setItem(this.tables[key], JSON.stringify(data));
                }
            });
            
            console.log('✅ تم استعادة النسخة الاحتياطية');
            
            return {
                success: true,
                message: 'تم استعادة النسخة الاحتياطية بنجاح'
            };
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في استعادة النسخة الاحتياطية'
            };
        }
    }

    // ===========================================
    // أدوات مساعدة
    // ===========================================

    /**
     * إرسال حدث
     */
    emitEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * عرض خطأ للمستخدم
     */
    showError(message) {
        const errorEvent = new CustomEvent('database_error', { detail: { message } });
        window.dispatchEvent(errorEvent);
        
        // يمكن إضافة عرض إشعار للمستخدم هنا
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        }
    }

    /**
     * تصدير البيانات
     */
    exportData(format = 'json') {
        try {
            const exportData = {};
            
            Object.entries(this.tables).forEach(([key, tableName]) => {
                if (key !== 'backup') { // استبعاد جدول النسخ الاحتياطية
                    exportData[key] = JSON.parse(localStorage.getItem(tableName) || '[]');
                }
            });
            
            let dataStr, fileName, mimeType;
            
            if (format === 'json') {
                dataStr = JSON.stringify(exportData, null, 2);
                fileName = `clinicpro-export-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (format === 'csv') {
                // يمكن إضافة دعم CSV هنا
                throw new Error('تنسيق CSV غير مدعوم حالياً');
            } else {
                throw new Error('تنسيق غير مدعوم');
            }
            
            const blob = new Blob([dataStr], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return {
                success: true,
                fileName: fileName,
                message: 'تم تصدير البيانات بنجاح'
            };
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في تصدير البيانات'
            };
        }
    }

    /**
     * استيراد البيانات
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('لم يتم تحديد ملف');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // التحقق من صحة البيانات
                    if (typeof importedData !== 'object') {
                        reject('ملف غير صالح');
                        return;
                    }
                    
                    // استيراد البيانات
                    Object.entries(importedData).forEach(([key, data]) => {
                        if (this.tables[key] && Array.isArray(data)) {
                            localStorage.setItem(this.tables[key], JSON.stringify(data));
                        }
                    });
                    
                    resolve({
                        success: true,
                        message: 'تم استيراد البيانات بنجاح'
                    });
                } catch (error) {
                    reject('ملف غير صالح: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                reject('خطأ في قراءة الملف');
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * مسح جميع البيانات (تنبيه: خطير!)
     */
    clearAllData() {
        try {
            Object.values(this.tables).forEach(table => {
                localStorage.setItem(table, JSON.stringify([]));
            });
            
            // إعادة إنشاء البيانات الأولية
            this.createInitialData();
            
            return {
                success: true,
                message: 'تم مسح جميع البيانات وإعادة التهيئة'
            };
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return {
                success: false,
                error: error.message,
                message: 'فشل في مسح البيانات'
            };
        }
    }

    /**
     * التحقق من صحة قاعدة البيانات
     */
    validateDatabase() {
        const issues = [];
        
        // التحقق من وجود جميع الجداول
        Object.entries(this.tables).forEach(([key, tableName]) => {
            if (!localStorage.getItem(tableName)) {
                issues.push(`الجدول ${key} مفقود`);
            } else {
                try {
                    JSON.parse(localStorage.getItem(tableName));
                } catch (error) {
                    issues.push(`الجدول ${key} به بيانات غير صالحة`);
                }
            }
        });
        
        // التحقق من وجود مستخدم مسؤول
        const adminUsers = this.getAll('users', { role: 'admin' });
        if (adminUsers.length === 0) {
            issues.push('لا يوجد مستخدم مسؤول في النظام');
        }
        
        // التحقق من إعدادات العيادة
        const clinicSettings = this.getSetting('clinic_info');
        if (!clinicSettings) {
            issues.push('إعدادات العيادة مفقودة');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues,
            timestamp: new Date().toISOString()
        };
    }
}

// ===========================================
// إنشاء وتصدير نسخة واحدة من قاعدة البيانات
// ===========================================
const clinicDB = new ClinicDatabase();

// تعيين global للإصلاح
window.clinicDB = clinicDB;

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = clinicDB;
}

console.log('✅ تم تحميل قاعدة البيانات بنجاح');
