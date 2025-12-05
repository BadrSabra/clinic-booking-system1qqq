
/**
 * ClinicPro - الملف الرئيسي للجافاسكريبت
 * يحتوي على جميع الدوال العامة والمشتركة بين صفحات النظام
 * @version 1.0.0
 * @author ClinicPro Team
 */

class ClinicProApp {
    constructor() {
        this.config = window.configManager || null;
        this.db = window.clinicDB || null;
        this.currentUser = null;
        this.currentTheme = 'light';
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('🚀 بدء تشغيل نظام ClinicPro...');
        
        try {
            // الانتظار حتى تحميل الصفحة بالكامل
            await this.waitForDOM();
            
            // تهيئة المكونات الأساسية
            await this.initializeComponents();
            
            // تحميل المستخدم الحالي
            await this.loadCurrentUser();
            
            // إعداد الواجهة بناءً على المستخدم
            await this.setupUserInterface();
            
            // إعداد المستمعين للأحداث
            this.setupEventListeners();
            
            // تحديث الإحصائيات والبيانات
            await this.updateSystemData();
            
            console.log('✅ تم تهيئة التطبيق بنجاح');
            
        } catch (error) {
            console.error('❌ فشل في تهيئة التطبيق:', error);
            this.showError('فشل في تحميل النظام', error.message);
        }
    }

    /**
     * الانتظار حتى تحميل DOM
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => resolve());
            } else {
                resolve();
            }
        });
    }

    /**
     * تهيئة المكونات الأساسية
     */
    async initializeComponents() {
        // إخفاء شاشة التحميل
        this.hideLoadingScreen();
        
        // إعداد السمة
        await this.setupTheme();
        
        // إعداد اللغة
        await this.setupLanguage();
        
        // إعداد شريط التنقل
        this.setupNavigation();
        
        // إعداد الأزرار والإجراءات
        this.setupButtons();
        
        // إعداد النماذج
        this.setupForms();
        
        // إعداد نظام الإشعارات
        this.setupNotifications();
        
        // إعداد المؤقتات الدورية
        this.setupTimers();
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
            setTimeout(() => {
                loadingSpinner.style.display = 'none';
            }, 500);
        }
    }

    /**
     * إعداد السمة (فاتحة/مظلمة)
     */
    async setupTheme() {
        try {
            // الحصول على السمة المحفوظة
            this.currentTheme = localStorage.getItem('clinicpro_theme') || 'light';
            
            // تطبيق السمة
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            
            // تحديث زر تبديل السمة
            this.updateThemeToggleButton();
            
            // إضافة زر تبديل السمة إذا كان المستخدم مسجلاً دخوله
            if (this.currentUser) {
                this.addThemeToggleButton();
            }
            
        } catch (error) {
            console.warn('⚠️ فشل إعداد السمة:', error);
        }
    }

    /**
     * تحديث زر تبديل السمة
     */
    updateThemeToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            themeToggle.title = this.currentTheme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم';
        }
    }

    /**
     * إضافة زر تبديل السمة
     */
    addThemeToggleButton() {
        // إذا كان الزر موجوداً بالفعل، لا نضيفه مجدداً
        if (document.getElementById('theme-toggle')) return;
        
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle btn btn-icon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'تبديل السمة';
        
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // البحث عن مكان مناسب لإضافة الزر
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const li = document.createElement('li');
            li.appendChild(themeToggle);
            navMenu.appendChild(li);
        }
    }

    /**
     * تبديل السمة بين فاتحة ومظلمة
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // تطبيق السمة الجديدة
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // حفظ التفضيل
        localStorage.setItem('clinicpro_theme', this.currentTheme);
        
        // تحديث الزر
        this.updateThemeToggleButton();
        
        // إرسال حدث تغيير السمة
        this.emitEvent('themeChanged', { theme: this.currentTheme });
        
        // إظهار إشعار
        this.showToast(`تم التبديل إلى الوضع ${this.currentTheme === 'dark' ? 'المظلم' : 'الفاتح'}`, 'success');
    }

    /**
     * إعداد اللغة (العربية)
     */
    async setupLanguage() {
        try {
            const language = this.config?.get('THEME.LANGUAGE') || 'ar';
            document.documentElement.setAttribute('lang', language);
            document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
            
        } catch (error) {
            console.warn('⚠️ فشل إعداد اللغة:', error);
        }
    }

    /**
     * إعداد شريط التنقل
     */
    setupNavigation() {
        // زر القائمة المتنقلة
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
        }
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (navMenu?.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileMenuBtn?.contains(e.target)) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
        
        // إغلاق القائمة عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
        
        // تفعيل الروابط النشطة
        this.setActiveNavLink();
    }

    /**
     * تعيين الرابط النشط في شريط التنقل
     */
    setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || 
                (currentPath.includes(href) && href !== '#' && href !== '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * إعداد الأزرار والإجراءات
     */
    setupButtons() {
        // زر العودة للأعلى
        this.setupBackToTopButton();
        
        // أزرار التسجيل والدخول
        this.setupAuthButtons();
        
        // أزرار النماذج العامة
        this.setupFormButtons();
        
        // أزرار الإجراءات السريعة
        this.setupQuickActionButtons();
    }

    /**
     * إعداد زر العودة للأعلى
     */
    setupBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        
        if (backToTopBtn) {
            // التحكم في الظهور/الاختفاء
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });
            
            // الحدث عند النقر
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * إعداد أزرار المصادقة
     */
    setupAuthButtons() {
        const loginButtons = document.querySelectorAll('.btn-login, [href="login.html"]');
        const logoutButtons = document.querySelectorAll('.btn-logout');
        
        // تحديث حالة أزرار الدخول/الخروج بناءً على حالة المستخدم
        this.updateAuthButtons();
        
        // إضافة أحداث لأزرار تسجيل الخروج
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    /**
     * تحديث أزرار المصادقة
     */
    updateAuthButtons() {
        const loginButtons = document.querySelectorAll('.btn-login, [href="login.html"]');
        const logoutButtons = document.querySelectorAll('.btn-logout');
        const userMenu = document.getElementById('user-menu');
        
        if (this.currentUser) {
            // المستخدم مسجل الدخول
            loginButtons.forEach(btn => {
                btn.style.display = 'none';
            });
            logoutButtons.forEach(btn => {
                btn.style.display = 'block';
            });
            
            // تحديث قائمة المستخدم
            if (userMenu) {
                this.updateUserMenu(userMenu);
            }
        } else {
            // المستخدم غير مسجل الدخول
            loginButtons.forEach(btn => {
                btn.style.display = 'block';
            });
            logoutButtons.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    /**
     * تحديث قائمة المستخدم
     */
    updateUserMenu(userMenu) {
        if (!this.currentUser) return;
        
        const userName = userMenu.querySelector('.user-name');
        const userRole = userMenu.querySelector('.user-role');
        const userAvatar = userMenu.querySelector('.user-avatar');
        
        if (userName) {
            userName.textContent = this.currentUser.fullName || this.currentUser.username;
        }
        
        if (userRole) {
            const roleNames = {
                'admin': 'مدير النظام',
                'doctor': 'طبيب',
                'receptionist': 'موظف استقبال',
                'patient': 'مريض'
            };
            userRole.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
        }
        
        if (userAvatar) {
            const initials = this.getUserInitials(this.currentUser);
            userAvatar.textContent = initials;
            userAvatar.style.backgroundColor = this.getUserColor(this.currentUser);
        }
    }

    /**
     * الحصول على الأحرف الأولى من اسم المستخدم
     */
    getUserInitials(user) {
        const name = user.fullName || user.username || '';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    /**
     * الحصول على لون مميز للمستخدم
     */
    getUserColor(user) {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
            '#9b59b6', '#1abc9c', '#d35400', '#27ae60'
        ];
        
        // توليد لون ثابت بناءً على معرف المستخدم
        let hash = 0;
        const str = user.id || user.username || 'user';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    /**
     * إعداد أزرار النماذج
     */
    setupFormButtons() {
        // أزرار الإرسال في النماذج
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        
        submitButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const form = button.closest('form');
                if (form) {
                    this.handleFormSubmit(e, form);
                }
            });
        });
        
        // أزرار الإلغاء
        const cancelButtons = document.querySelectorAll('.btn-cancel, [data-action="cancel"]');
        
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (button.hasAttribute('href')) {
                    window.location.href = button.getAttribute('href');
                } else if (button.hasAttribute('data-target')) {
                    const target = button.getAttribute('data-target');
                    this.closeModal(target);
                } else {
                    window.history.back();
                }
            });
        });
    }

    /**
     * إعداد أزرار الإجراءات السريعة
     */
    setupQuickActionButtons() {
        // زر إضافة جديد
        const addButtons = document.querySelectorAll('.btn-add, [data-action="add"]');
        
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const entity = button.getAttribute('data-entity');
                this.openAddModal(entity);
            });
        });
        
        // زر التحرير
        const editButtons = document.querySelectorAll('.btn-edit, [data-action="edit"]');
        
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = button.getAttribute('data-id');
                const entity = button.getAttribute('data-entity');
                this.openEditModal(entity, id);
            });
        });
        
        // زر الحذف
        const deleteButtons = document.querySelectorAll('.btn-delete, [data-action="delete"]');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = button.getAttribute('data-id');
                const entity = button.getAttribute('data-entity');
                const name = button.getAttribute('data-name');
                this.confirmDelete(entity, id, name);
            });
        });
    }

    /**
     * فتح نموذج إضافة
     */
    openAddModal(entity) {
        const modalId = `modal-add-${entity}`;
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.style.display = 'block';
            this.setupModal(modal);
        } else {
            this.showToast('نموذج الإضافة غير متوفر', 'warning');
        }
    }

    /**
     * فتح نموذج تحرير
     */
    openEditModal(entity, id) {
        const modalId = `modal-edit-${entity}`;
        const modal = document.getElementById(modalId);
        
        if (modal && id) {
            // تحميل البيانات في النموذج
            this.loadEntityData(entity, id, modal);
            modal.style.display = 'block';
            this.setupModal(modal);
        } else {
            this.showToast('نموذج التحرير غير متوفر', 'warning');
        }
    }

    /**
     * تأكيد الحذف
     */
    confirmDelete(entity, id, name) {
        const message = `هل أنت متأكد من حذف ${name || 'هذا العنصر'}؟`;
        
        this.showConfirmDialog(message, 'حذف', 'danger', async () => {
            try {
                const result = await this.deleteEntity(entity, id);
                if (result.success) {
                    this.showToast('تم الحذف بنجاح', 'success');
                    this.refreshData();
                } else {
                    this.showToast(result.message || 'فشل في الحذف', 'error');
                }
            } catch (error) {
                this.showToast('حدث خطأ أثناء الحذف', 'error');
            }
        });
    }

    /**
     * حذف كيان
     */
    async deleteEntity(entity, id) {
        if (!this.db) {
            return { success: false, message: 'قاعدة البيانات غير متاحة' };
        }
        
        try {
            return await this.db.delete(entity, id);
        } catch (error) {
            console.error(`فشل حذف ${entity}:`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * تحميل بيانات كيان
     */
    async loadEntityData(entity, id, modal) {
        if (!this.db) return;
        
        try {
            const data = await this.db.getById(entity, id);
            if (data) {
                // ملء الحقول في النموذج
                const form = modal.querySelector('form');
                if (form) {
                    this.fillForm(form, data);
                }
            }
        } catch (error) {
            console.error(`فشل تحميل بيانات ${entity}:`, error);
        }
    }

    /**
     * ملء نموذج بالبيانات
     */
    fillForm(form, data) {
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = Boolean(data[key]);
                } else if (input.type === 'select-multiple') {
                    // معالجة select متعدد
                    const values = Array.isArray(data[key]) ? data[key] : [data[key]];
                    Array.from(input.options).forEach(option => {
                        option.selected = values.includes(option.value);
                    });
                } else {
                    input.value = data[key] || '';
                }
            }
        });
    }

    /**
     * إعداد النماذج
     */
    setupForms() {
        // التحقق من صحة النماذج
        this.setupFormValidation();
        
        // الأتمتة في النماذج
        this.setupFormAutomation();
        
        // النماذج الديناميكية
        this.setupDynamicForms();
    }

    /**
     * إعداد التحقق من صحة النماذج
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
            
            // التحقق أثناء الكتابة
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    /**
     * التحقق من صحة نموذج
     */
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('[required], [data-validate]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * التحقق من صحة حقل
     */
    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.getAttribute('data-label') || input.name || 'هذا الحقل';
        let isValid = true;
        let message = '';
        
        // التحقق من الحقول المطلوبة
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            message = `${fieldName} مطلوب`;
        }
        
        // التحقق من صيغة البريد الإلكتروني
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'بريد إلكتروني غير صالح';
            }
        }
        
        // التحقق من رقم الهاتف
        if (input.type === 'tel' && value && input.hasAttribute('data-validate-phone')) {
            const phoneRegex = /^[0-9+\-\s()]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'رقم هاتف غير صالح';
            }
        }
        
        // التحقق من الطول الأدنى
        const minLength = input.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            isValid = false;
            message = `الحد الأدنى ${minLength} حرف`;
        }
        
        // التحقق من الطول الأقصى
        const maxLength = input.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            isValid = false;
            message = `الحد الأقصى ${maxLength} حرف`;
        }
        
        // التحقق من التطابق
        const matchField = input.getAttribute('data-match');
        if (matchField && value) {
            const matchInput = document.querySelector(`[name="${matchField}"]`);
            if (matchInput && value !== matchInput.value.trim()) {
                isValid = false;
                message = 'القيم غير متطابقة';
            }
        }
        
        // إظهار أو إخفاء رسالة الخطأ
        if (!isValid) {
            this.showFieldError(input, message);
        } else {
            this.clearFieldError(input);
        }
        
        return isValid;
    }

    /**
     * إظهار خطأ في الحقل
     */
    showFieldError(input, message) {
        // إزالة أي رسائل خطأ سابقة
        this.clearFieldError(input);
        
        // إضافة فئة الخطأ
        input.classList.add('is-invalid');
        
        // إنشاء عنصر رسالة الخطأ
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        // إضافة رسالة الخطأ بعد الحقل
        input.parentNode.appendChild(errorDiv);
        
        // التركيز على الحقل
        input.focus();
    }

    /**
     * مسح خطأ الحقل
     */
    clearFieldError(input) {
        input.classList.remove('is-invalid');
        
        // إزالة رسائل الخطأ السابقة
        const parent = input.parentNode;
        const errorDiv = parent.querySelector('.invalid-feedback');
        if (errorDiv) {
            parent.removeChild(errorDiv);
        }
    }

    /**
     * إعداد أتمتة النماذج
     */
    setupFormAutomation() {
        // توليد الرموز التلقائية
        const autoGenerateFields = document.querySelectorAll('[data-auto-generate]');
        
        autoGenerateFields.forEach(field => {
            const prefix = field.getAttribute('data-prefix') || '';
            const entity = field.getAttribute('data-entity') || 'item';
            
            field.addEventListener('focus', () => {
                if (!field.value) {
                    const code = this.generateCode(prefix, entity);
                    field.value = code;
                }
            });
        });
        
        // حساب التلقائي
        const calculateFields = document.querySelectorAll('[data-calculate]');
        
        calculateFields.forEach(field => {
            const formula = field.getAttribute('data-calculate');
            const fields = formula.match(/\[(.*?)\]/g);
            
            if (fields) {
                const fieldNames = fields.map(f => f.replace(/[\[\]]/g, ''));
                
                fieldNames.forEach(fieldName => {
                    const input = document.querySelector(`[name="${fieldName}"]`);
                    if (input) {
                        input.addEventListener('input', () => {
                            this.calculateField(field, formula);
                        });
                    }
                });
            }
        });
        
        // الإكمال التلقائي
        this.setupAutoComplete();
    }

    /**
     * توليد رمز
     */
    generateCode(prefix, entity) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${entity.substring(0, 3).toUpperCase()}${timestamp}${random}`;
    }

    /**
     * حساب قيمة حقل
     */
    calculateField(field, formula) {
        try {
            // استبدال أسماء الحقول بقيمها
            let expression = formula;
            const fields = formula.match(/\[(.*?)\]/g);
            
            if (fields) {
                fields.forEach(fieldRef => {
                    const fieldName = fieldRef.replace(/[\[\]]/g, '');
                    const input = document.querySelector(`[name="${fieldName}"]`);
                    const value = input ? parseFloat(input.value) || 0 : 0;
                    expression = expression.replace(fieldRef, value);
                });
                
                // حساب النتيجة
                const result = eval(expression);
                field.value = result.toFixed(2);
            }
        } catch (error) {
            console.error('خطأ في الحساب:', error);
        }
    }

    /**
     * إعداد الإكمال التلقائي
     */
    setupAutoComplete() {
        const autoCompleteFields = document.querySelectorAll('[data-autocomplete]');
        
        autoCompleteFields.forEach(field => {
            const source = field.getAttribute('data-autocomplete');
            const minChars = parseInt(field.getAttribute('data-min-chars')) || 2;
            
            field.addEventListener('input', async () => {
                const query = field.value.trim();
                
                if (query.length >= minChars) {
                    const suggestions = await this.getAutocompleteSuggestions(source, query);
                    this.showAutocompleteSuggestions(field, suggestions);
                } else {
                    this.hideAutocompleteSuggestions(field);
                }
            });
            
            // إخفاء القائمة عند فقدان التركيز
            field.addEventListener('blur', () => {
                setTimeout(() => {
                    this.hideAutocompleteSuggestions(field);
                }, 200);
            });
        });
    }

    /**
     * الحصول على اقتراحات الإكمال التلقائي
     */
    async getAutocompleteSuggestions(source, query) {
        if (!this.db) return [];
        
        try {
            // البحث في قاعدة البيانات
            const results = await this.db.search(source, query, ['name', 'code', 'fullName']);
            return results.slice(0, 10); // الحد الأقصى 10 نتائج
        } catch (error) {
            console.error('خطأ في الإكمال التلقائي:', error);
            return [];
        }
    }

    /**
     * إظهار اقتراحات الإكمال التلقائي
     */
    showAutocompleteSuggestions(field, suggestions) {
        // إزالة القائمة السابقة
        this.hideAutocompleteSuggestions(field);
        
        if (suggestions.length === 0) return;
        
        // إنشاء قائمة الاقتراحات
        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'autocomplete-suggestions';
        suggestionsList.style.position = 'absolute';
        suggestionsList.style.zIndex = '1000';
        suggestionsList.style.backgroundColor = 'white';
        suggestionsList.style.border = '1px solid #ddd';
        suggestionsList.style.borderRadius = '4px';
        suggestionsList.style.maxHeight = '200px';
        suggestionsList.style.overflowY = 'auto';
        suggestionsList.style.width = field.offsetWidth + 'px';
        
        // إضافة الاقتراحات
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            li.textContent = suggestion.name || suggestion.fullName || suggestion.code;
            li.style.padding = '8px 12px';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid #eee';
            
            li.addEventListener('mouseenter', () => {
                li.style.backgroundColor = '#f5f5f5';
            });
            
            li.addEventListener('mouseleave', () => {
                li.style.backgroundColor = 'white';
            });
            
            li.addEventListener('click', () => {
                field.value = suggestion.name || suggestion.fullName || suggestion.code;
                field.setAttribute('data-id', suggestion.id);
                this.hideAutocompleteSuggestions(field);
                
                // إرسال حدث تغيير القيمة
                field.dispatchEvent(new Event('change'));
            });
            
            suggestionsList.appendChild(li);
        });
        
        // تحديد الموضع
        const rect = field.getBoundingClientRect();
        suggestionsList.style.top = (rect.bottom + window.scrollY) + 'px';
        suggestionsList.style.right = rect.right + 'px';
        
        // إضافة القائمة إلى الصفحة
        document.body.appendChild(suggestionsList);
        field.suggestionsList = suggestionsList;
    }

    /**
     * إخفاء اقتراحات الإكمال التلقائي
     */
    hideAutocompleteSuggestions(field) {
        if (field.suggestionsList && field.suggestionsList.parentNode) {
            field.suggestionsList.parentNode.removeChild(field.suggestionsList);
            field.suggestionsList = null;
        }
    }

    /**
     * إعداد النماذج الديناميكية
     */
    setupDynamicForms() {
        // إضافة حقول ديناميكية
        const addFieldButtons = document.querySelectorAll('[data-add-field]');
        
        addFieldButtons.forEach(button => {
            button.addEventListener('click', () => {
                const templateId = button.getAttribute('data-template');
                const containerId = button.getAttribute('data-container');
                this.addDynamicField(templateId, containerId);
            });
        });
        
        // إزالة حقول ديناميكية
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-remove-field]')) {
                e.preventDefault();
                const field = e.target.closest('.dynamic-field');
                if (field) {
                    field.remove();
                }
            }
        });
    }

    /**
     * إضافة حقل ديناميكي
     */
    addDynamicField(templateId, containerId) {
        const template = document.getElementById(templateId);
        const container = document.getElementById(containerId);
        
        if (template && container) {
            const clone = template.content.cloneNode(true);
            container.appendChild(clone);
            
            // تحديث أرقام الحقول
            this.updateDynamicFieldIndexes(container);
        }
    }

    /**
     * تحديث فهارس الحقول الديناميكية
     */
    updateDynamicFieldIndexes(container) {
        const fields = container.querySelectorAll('.dynamic-field');
        fields.forEach((field, index) => {
            const inputs = field.querySelectorAll('[name]');
            inputs.forEach(input => {
                const name = input.getAttribute('name');
                const baseName = name.replace(/\[\d+\]/, '');
                input.setAttribute('name', `${baseName}[${index}]`);
            });
            
            const labels = field.querySelectorAll('label');
            labels.forEach(label => {
                const html = label.innerHTML;
                const newHtml = html.replace(/\s\d+/, ` ${index + 1}`);
                label.innerHTML = newHtml;
            });
        });
    }

    /**
     * إعداد نظام الإشعارات
     */
    setupNotifications() {
        // إنشاء حاوية الإشعارات
        this.createNotificationContainer();
        
        // تحميل الإشعارات غير المقروءة
        this.loadUnreadNotifications();
        
        // تحديث عدد الإشعارات
        this.updateNotificationBadge();
    }

    /**
     * إنشاء حاوية الإشعارات
     */
    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    /**
     * تحميل الإشعارات غير المقروءة
     */
    async loadUnreadNotifications() {
        if (!this.db || !this.currentUser) return;
        
        try {
            const notifications = await this.db.getUserNotifications(this.currentUser.id, true);
            
            // إظهار الإشعارات الجديدة
            notifications.forEach(notification => {
                if (!notification.isRead) {
                    this.showNotification(notification);
                }
            });
            
        } catch (error) {
            console.error('خطأ في تحميل الإشعارات:', error);
        }
    }

    /**
     * تحديث شارة الإشعارات
     */
    async updateNotificationBadge() {
        if (!this.db || !this.currentUser) return;
        
        try {
            const notifications = await this.db.getUserNotifications(this.currentUser.id, true);
            const count = notifications.length;
            
            // تحديث شارة الإشعارات
            const badge = document.querySelector('.notifications-badge');
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
            
        } catch (error) {
            console.error('خطأ في تحديث شارة الإشعارات:', error);
        }
    }

    /**
     * إعداد المؤقتات الدورية
     */
    setupTimers() {
        // تحديث الوقت الحالي
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000); // كل دقيقة
        
        // تحديث الإحصائيات
        this.updateStatistics();
        setInterval(() => this.updateStatistics(), 300000); // كل 5 دقائق
        
        // التحقق من الإشعارات
        setInterval(() => this.checkForNotifications(), 120000); // كل دقيقتين
        
        // حفظ البيانات التلقائي
        setInterval(() => this.autoSave(), 300000); // كل 5 دقائق
    }

    /**
     * تحديث الوقت الحالي
     */
    updateCurrentTime() {
        const timeElements = document.querySelectorAll('.current-time');
        const now = new Date();
        
        const timeString = now.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const dateString = now.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        timeElements.forEach(element => {
            if (element.hasAttribute('data-format') && element.getAttribute('data-format') === 'date') {
                element.textContent = dateString;
            } else {
                element.textContent = timeString;
            }
        });
    }

    /**
     * تحديث الإحصائيات
     */
    async updateStatistics() {
        if (!this.db) return;
        
        try {
            const stats = await this.db.getStatistics();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('خطأ في تحديث الإحصائيات:', error);
        }
    }

    /**
     * تحديث عرض الإحصائيات
     */
    updateStatsDisplay(stats) {
        // تحديث العدادات المتحركة
        this.animateCounters(stats);
        
        // تحديث الرسوم البيانية (إذا كانت موجودة)
        this.updateCharts(stats);
    }

    /**
     * تحريك العدادات
     */
    animateCounters(stats) {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target')) || 0;
            const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
            const start = parseInt(counter.textContent) || 0;
            
            this.animateCounter(counter, start, target, duration);
        });
    }

    /**
     * تحريك عداد واحد
     */
    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // استخدام دالة توقيع للحركة السلسة
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = value.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    /**
     * تحديث الرسوم البيانية
     */
    updateCharts(stats) {
        // يمكن إضافة مكتبة رسوم بيانية هنا مثل Chart.js
        // هذا مجرد نموذج أساسي
        const chartElements = document.querySelectorAll('[data-chart]');
        
        chartElements.forEach(chartElement => {
            const chartType = chartElement.getAttribute('data-chart');
            const chartData = chartElement.getAttribute('data-data');
            
            // معالجة أنواع الرسوم البيانية المختلفة
            switch (chartType) {
                case 'bar':
                    this.renderBarChart(chartElement, JSON.parse(chartData));
                    break;
                case 'line':
                    this.renderLineChart(chartElement, JSON.parse(chartData));
                    break;
                case 'pie':
                    this.renderPieChart(chartElement, JSON.parse(chartData));
                    break;
            }
        });
    }

    /**
     * رسم مخطط أعمدة
     */
    renderBarChart(element, data) {
        // تنفيذ بسيط لمخطط الأعمدة
        const maxValue = Math.max(...data.values);
        const barWidth = 100 / data.labels.length;
        
        let html = '<div class="chart-bars">';
        data.values.forEach((value, index) => {
            const height = (value / maxValue) * 100;
            html += `
                <div class="chart-bar" style="width: ${barWidth}%">
                    <div class="bar-fill" style="height: ${height}%"></div>
                    <div class="bar-label">${data.labels[index]}</div>
                    <div class="bar-value">${value}</div>
                </div>
            `;
        });
        html += '</div>';
        
        element.innerHTML = html;
    }

    /**
     * رسم مخطط خطي
     */
    renderLineChart(element, data) {
        // تنفيذ بسيط للمخطط الخطي
        console.log('رسم مخطط خطي:', data);
        // يمكن إضافة تنفيذ كامل هنا
    }

    /**
     * رسم مخطط دائري
     */
    renderPieChart(element, data) {
        // تنفيذ بسيط للمخطط الدائري
        console.log('رسم مخطط دائري:', data);
        // يمكن إضافة تنفيذ كامل هنا
    }

    /**
     * التحقق من الإشعارات الجديدة
     */
    async checkForNotifications() {
        if (!this.db || !this.currentUser) return;
        
        try {
            const notifications = await this.db.getUserNotifications(this.currentUser.id, true);
            
            // إظهار الإشعارات الجديدة
            notifications.forEach(notification => {
                if (!this.isNotificationShown(notification.id)) {
                    this.showNotification(notification);
                    this.markNotificationAsShown(notification.id);
                }
            });
            
            // تحديث الشارة
            this.updateNotificationBadge();
            
        } catch (error) {
            console.error('خطأ في التحقق من الإشعارات:', error);
        }
    }

    /**
     * التحقق مما إذا تم عرض الإشعار
     */
    isNotificationShown(notificationId) {
        const shownNotifications = JSON.parse(localStorage.getItem('clinicpro_shown_notifications') || '[]');
        return shownNotifications.includes(notificationId);
    }

    /**
     * تعليم الإشعار كمُعرض
     */
    markNotificationAsShown(notificationId) {
        const shownNotifications = JSON.parse(localStorage.getItem('clinicpro_shown_notifications') || '[]');
        shownNotifications.push(notificationId);
        
        // الاحتفاظ بـ 100 إشعار فقط
        if (shownNotifications.length > 100) {
            shownNotifications.splice(0, shownNotifications.length - 100);
        }
        
        localStorage.setItem('clinicpro_shown_notifications', JSON.stringify(shownNotifications));
    }

    /**
     * حفظ تلقائي للبيانات
     */
    async autoSave() {
        if (!this.db) return;
        
        try {
            // التحقق مما إذا كان النظام بحاجة لحفظ
            const lastSave = localStorage.getItem('clinicpro_last_autosave');
            const now = Date.now();
            
            if (!lastSave || (now - parseInt(lastSave)) > 300000) { // كل 5 دقائق
                await this.db.createBackup();
                localStorage.setItem('clinicpro_last_autosave', now.toString());
                console.log('💾 تم الحفظ التلقائي للبيانات');
            }
        } catch (error) {
            console.error('خطأ في الحفظ التلقائي:', error);
        }
    }

    /**
     * تحميل المستخدم الحالي
     */
    async loadCurrentUser() {
        try {
            if (this.db) {
                this.currentUser = this.db.getCurrentUser();
            }
        } catch (error) {
            console.error('خطأ في تحميل المستخدم:', error);
        }
    }

    /**
     * إعداد واجهة المستخدم بناءً على الصلاحيات
     */
    async setupUserInterface() {
        if (!this.currentUser) return;
        
        // إخفاء/إظهار العناصر بناءً على الصلاحيات
        this.setupPermissionBasedUI();
        
        // تحديث معلومات المستخدم
        this.updateUserInfo();
        
        // تحميل بيانات المستخدم
        await this.loadUserData();
    }

    /**
     * إعداد واجهة المستخدم بناءً على الصلاحيات
     */
    setupPermissionBasedUI() {
        const role = this.currentUser?.role;
        
        // إخفاء العناصر غير المسموح بها
        const restrictedElements = document.querySelectorAll('[data-role], [data-permission]');
        
        restrictedElements.forEach(element => {
            const requiredRole = element.getAttribute('data-role');
            const requiredPermission = element.getAttribute('data-permission');
            
            let shouldShow = true;
            
            // التحقق من الدور
            if (requiredRole && requiredRole !== role) {
                shouldShow = false;
            }
            
            // التحقق من الصلاحية
            if (requiredPermission && !this.hasPermission(requiredPermission)) {
                shouldShow = false;
            }
            
            // إظهار/إخفاء العنصر
            element.style.display = shouldShow ? '' : 'none';
        });
    }

    /**
     * التحقق من صلاحية المستخدم
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // المدير لديه جميع الصلاحيات
        if (this.currentUser.role === 'admin') {
            return true;
        }
        
        // التحقق من الصلاحيات المحددة
        const permissions = this.currentUser.permissions || [];
        return permissions.includes(permission) || permissions.includes('*');
    }

    /**
     * تحديث معلومات المستخدم في الواجهة
     */
    updateUserInfo() {
        const userElements = document.querySelectorAll('[data-user-info]');
        
        userElements.forEach(element => {
            const field = element.getAttribute('data-user-info');
            const value = this.currentUser[field] || '';
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        });
    }

    /**
     * تحميل بيانات المستخدم الإضافية
     */
    async loadUserData() {
        if (!this.db || !this.currentUser) return;
        
        try {
            // يمكن تحميل بيانات إضافية هنا حسب الحاجة
            switch (this.currentUser.role) {
                case 'doctor':
                    await this.loadDoctorData();
                    break;
                case 'patient':
                    await this.loadPatientData();
                    break;
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدم:', error);
        }
    }

    /**
     * تحميل بيانات الطبيب
     */
    async loadDoctorData() {
        // البحث عن بيانات الطبيب
        const doctors = await this.db.getAll('doctors', { email: this.currentUser.email });
        if (doctors.length > 0) {
            this.currentUser.doctorData = doctors[0];
        }
    }

    /**
     * تحميل بيانات المريض
     */
    async loadPatientData() {
        // البحث عن بيانات المريض
        const patients = await this.db.getAll('patients', { email: this.currentUser.email });
        if (patients.length > 0) {
            this.currentUser.patientData = patients[0];
        }
    }

    /**
     * إعداد المستمعين للأحداث
     */
    setupEventListeners() {
        // أحداث النوافذ
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());
        window.addEventListener('resize', () => this.handleResize());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // أحداث النظام المخصصة
        this.setupCustomEventListeners();
    }

    /**
     * معالجة حالة الاتصال بالإنترنت
     */
    handleOnlineStatus() {
        this.showToast('تم استعادة الاتصال بالإنترنت', 'success');
        this.emitEvent('connectionRestored');
    }

    /**
     * معالجة حالة انقطاع الإنترنت
     */
    handleOfflineStatus() {
        this.showToast('تم فقدان الاتصال بالإنترنت', 'warning');
        this.emitEvent('connectionLost');
    }

    /**
     * معالجة تغيير حجم النافذة
     */
    handleResize() {
        // يمكن إضافة منطق للتصميم المتجاوب هنا
        this.emitEvent('windowResized', { width: window.innerWidth, height: window.innerHeight });
    }

    /**
     * معالجة اختصارات لوحة المفاتيح
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S لحفظ
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveData();
        }
        
        // Ctrl/Cmd + D للوضع المظلم
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleTheme();
        }
        
        // Esc لإغلاق النوافذ المنبثقة
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
        
        // F1 للمساعدة
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    }

    /**
     * حفظ البيانات
     */
    async saveData() {
        if (!this.db) return;
        
        try {
            const result = await this.db.createBackup();
            if (result.success) {
                this.showToast('تم حفظ البيانات بنجاح', 'success');
            } else {
                this.showToast('فشل في حفظ البيانات', 'error');
            }
        } catch (error) {
            this.showToast('حدث خطأ أثناء حفظ البيانات', 'error');
        }
    }

    /**
     * إغلاق جميع النوافذ المنبثقة
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        // إغلاق القوائم المنسدلة
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    /**
     * عرض المساعدة
     */
    showHelp() {
        this.showModal('المساعدة', `
            <h3>اختصارات لوحة المفاتيح</h3>
            <ul>
                <li><kbd>Ctrl/Cmd + S</kbd> - حفظ البيانات</li>
                <li><kbd>Ctrl/Cmd + D</kbd> - تبديل الوضع المظلم</li>
                <li><kbd>Esc</kbd> - إغلاق النوافذ المنبثقة</li>
                <li><kbd>F1</kbd> - عرض هذه النافذة</li>
            </ul>
            
            <h3>نصائح سريعة</h3>
            <ul>
                <li>انقر نقراً مزدوجاً على أي عنصر لتعديله</li>
                <li>استخدم Ctrl + F للبحث في الصفحة</li>
                <li>انقر بزر الماوس الأيمن للحصول على خيارات إضافية</li>
            </ul>
        `);
    }

    /**
     * إعداد مستمعي الأحداث المخصصة
     */
    setupCustomEventListeners() {
        // حدث تسجيل الدخول
        window.addEventListener('userLoggedIn', (e) => {
            this.currentUser = e.detail.user;
            this.setupUserInterface();
        });
        
        // حدث تسجيل الخروج
        window.addEventListener('userLoggedOut', () => {
            this.currentUser = null;
            this.setupUserInterface();
        });
        
        // حدث تحديث البيانات
        window.addEventListener('dataUpdated', () => {
            this.refreshData();
        });
    }

    /**
     * تحديث البيانات في الواجهة
     */
    async refreshData() {
        // يمكن للصفحات الفرعية تخصيص هذا الأسلوب
        console.log('🔄 تحديث البيانات...');
        this.emitEvent('refreshRequested');
    }

    /**
     * تحديث بيانات النظام
     */
    async updateSystemData() {
        try {
            // تحديث الإحصائيات
            await this.updateStatistics();
            
            // تحديث الإشعارات
            await this.updateNotificationBadge();
            
            // تحديث البيانات الحية
            this.updateLiveData();
            
        } catch (error) {
            console.error('خطأ في تحديث بيانات النظام:', error);
        }
    }

    /**
     * تحديث البيانات الحية
     */
    updateLiveData() {
        // يمكن إضافة تحديث للبيانات الحية هنا
        // مثل: المواعيد القادمة، الإشعارات الفورية، الخ
    }

    /**
     * تسجيل الخروج
     */
    async logout() {
        if (!this.db) return;
        
        try {
            const result = await this.db.logout();
            if (result.success) {
                this.currentUser = null;
                this.showToast('تم تسجيل الخروج بنجاح', 'success');
                this.emitEvent('userLoggedOut');
                
                // إعادة التوجيه إلى الصفحة الرئيسية
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            this.showToast('فشل في تسجيل الخروج', 'error');
        }
    }

    /**
     * إرسال حدث مخصص
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    /**
     * إظهار إشعار
     */
    showNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${notification.type || 'info'}`;
        toast.dataset.notificationId = notification.id;
        
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[notification.type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // إضافة أحداث
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(toast);
        });
        
        // الإزالة التلقائية بعد 5 ثواني
        setTimeout(() => {
            this.removeNotification(toast);
        }, 5000);
        
        // تحديد الإشعار كمقروء
        if (this.db) {
            this.db.markNotificationAsRead(notification.id);
        }
    }

    /**
     * إزالة إشعار
     */
    removeNotification(toastElement) {
        toastElement.style.transform = 'translateX(100%)';
        toastElement.style.opacity = '0';
        
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }

    /**
     * إظهار رسالة تأكيد
     */
    showConfirmDialog(message, title = 'تأكيد', type = 'warning', onConfirm) {
        const modalId = 'confirm-dialog';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="modal-close" data-dismiss="modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-${type}" id="confirm-btn">تأكيد</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // تحديث المحتوى
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body p').textContent = message;
        
        // إعداد الأحداث
        const confirmBtn = modal.querySelector('#confirm-btn');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-secondary');
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', confirmHandler);
            closeBtn.removeEventListener('click', closeHandler);
            cancelBtn.removeEventListener('click', closeHandler);
            modal.style.display = 'none';
        };
        
        const confirmHandler = () => {
            cleanup();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        };
        
        const closeHandler = () => {
            cleanup();
        };
        
        confirmBtn.addEventListener('click', confirmHandler);
        closeBtn.addEventListener('click', closeHandler);
        cancelBtn.addEventListener('click', closeHandler);
        
        // إظهار النافذة
        modal.style.display = 'block';
        this.setupModal(modal);
    }

    /**
     * إعداد النافذة المنبثقة
     */
    setupModal(modal) {
        // زر الإغلاق
        const closeBtn = modal.querySelector('.modal-close, [data-dismiss="modal"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // إغلاق عند النقر خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // إغلاق بمفتاح Esc
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        
        document.addEventListener('keydown', escapeHandler);
        
        // التركيز على أول حقل إدخال
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * إظهار نافذة منبثقة
     */
    showModal(title, content) {
        const modalId = 'custom-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="modal-close" data-dismiss="modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">حسناً</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        this.setupModal(modal);
    }

    /**
     * إظهار رسالة خطأ
     */
    showError(title, message) {
        this.showModal(title, `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> إعادة تحميل الصفحة
                </button>
            </div>
        `);
    }

    /**
     * إظهار رسالة toast
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // إضافة أحداث
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(toast);
        });
        
        // الإزالة التلقائية
        setTimeout(() => {
            this.removeNotification(toast);
        }, 3000);
    }

    /**
     * معالجة إرسال النموذج
     */
    handleFormSubmit(e, form) {
        e.preventDefault();
        
        // التحقق من الصحة
        if (!this.validateForm(form)) {
            this.showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }
        
        // جمع البيانات
        const formData = this.collectFormData(form);
        
        // إرسال البيانات
        this.submitFormData(form, formData);
    }

    /**
     * جمع بيانات النموذج
     */
    collectFormData(form) {
        const formData = {};
        const elements = form.elements;
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const name = element.name;
            
            if (!name) continue;
            
            if (element.type === 'checkbox') {
                formData[name] = element.checked;
            } else if (element.type === 'radio') {
                if (element.checked) {
                    formData[name] = element.value;
                }
            } else if (element.type === 'select-multiple') {
                const selectedValues = [];
                for (let j = 0; j < element.options.length; j++) {
                    if (element.options[j].selected) {
                        selectedValues.push(element.options[j].value);
                    }
                }
                formData[name] = selectedValues;
            } else {
                formData[name] = element.value;
            }
        }
        
        return formData;
    }

    /**
     * إرسال بيانات النموذج
     */
    async submitFormData(form, formData) {
        const action = form.getAttribute('action');
        const method = form.getAttribute('method') || 'POST';
        const entity = form.getAttribute('data-entity');
        const itemId = form.getAttribute('data-item-id');
        
        try {
            let result;
            
            if (this.db && entity) {
                // استخدام قاعدة البيانات المحلية
                if (itemId) {
                    // تحديث سجل موجود
                    result = await this.db.update(entity, itemId, formData);
                } else {
                    // إنشاء سجل جديد
                    result = await this.db.create(entity, formData);
                }
            } else if (action) {
                // إرسال إلى الخادم
                result = await this.submitToServer(action, method, formData);
            } else {
                throw new Error('لا يوجد طريقة معالجة محددة للنموذج');
            }
            
            if (result.success) {
                this.showToast(result.message || 'تم الحفظ بنجاح', 'success');
                form.reset();
                
                // إرسال حدث تحديث
                this.emitEvent('formSubmitted', { entity, data: result.data });
                
                // إغلاق النافذة المنبثقة إذا كانت موجودة
                const modal = form.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // تحديث البيانات
                this.refreshData();
                
            } else {
                this.showToast(result.message || 'فشل في الحفظ', 'error');
            }
            
        } catch (error) {
            console.error('خطأ في إرسال النموذج:', error);
            this.showToast('حدث خطأ أثناء الحفظ', 'error');
        }
    }

    /**
     * إرسال البيانات إلى الخادم
     */
    async submitToServer(url, method, data) {
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            throw new Error(`فشل الاتصال بالخادم: ${error.message}`);
        }
    }
}

// ===========================================
// تهيئة التطبيق
// ===========================================

// الانتظار حتى تحميل جميع الملفات الأساسية
window.addEventListener('load', () => {
    // إعطاء وقت لتحميل الملفات الأساسية
    setTimeout(() => {
        // إنشاء نسخة من التطبيق
        window.clinicProApp = new ClinicProApp();
        
        // جعل الدوال الأساسية متاحة عالمياً
        window.showToast = (message, type) => window.clinicProApp?.showToast(message, type);
        window.showModal = (title, content) => window.clinicProApp?.showModal(title, content);
        window.showError = (title, message) => window.clinicProApp?.showError(title, message);
        
        console.log('🌟 ClinicPro جاهز للعمل!');
        
    }, 1000);
});

// دوال مساعدة إضافية
window.formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

window.formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    const period = hour >= 12 ? 'م' : 'ص';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

window.formatCurrency = (amount) => {
    if (window.configManager) {
        return window.configManager.formatCurrency(amount);
    }
    
    return `${parseFloat(amount).toFixed(2)} ج.م`;
};

window.truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
};

// تحسينات للأداء
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// التعامل مع الأخطاء غير المتوقعة
window.addEventListener('error', (event) => {
    console.error('خطأ غير متوقع:', event.error);
    
    // عدم عرض رسائل الخطأ للمستخدم في الإنتاج
    if (window.location.hostname !== 'localhost') {
        event.preventDefault();
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('وعد مرفوض غير معالج:', event.reason);
    event.preventDefault();
});

// تحسينات لـ PWA
if ('standalone' in navigator || window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('pwa-mode');
}

// نهاية الملف
console.log('✅ تم تحميل main.js بنجاح');
