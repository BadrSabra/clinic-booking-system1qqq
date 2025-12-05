import db from '../database.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerLink = document.getElementById('registerLink');
    const backToLogin = document.getElementById('backToLogin');
    const rememberCheckbox = document.getElementById('remember');

    // التحقق من بيانات الدخول المحفوظة
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const userData = JSON.parse(rememberedUser);
        document.getElementById('username').value = userData.username;
        document.getElementById('password').value = userData.password;
        rememberCheckbox.checked = true;
    }

    // تبديل بين تسجيل الدخول والتسجيل
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    backToLogin.addEventListener('click', function() {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // معالجة تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = rememberCheckbox.checked;

        const users = db.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // حفظ بيانات الدخول إذا طلب المستخدم ذلك
            if (remember) {
                localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // حفظ جلسة المستخدم
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            alert('تم تسجيل الدخول بنجاح!');
            window.location.href = 'dashboard.html';
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    });

    // معالجة إنشاء حساب جديد
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // التحقق من تطابق كلمات المرور
        if (password !== confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }

        const users = db.getUsers();

        // التحقق من عدم وجود اسم مستخدم مكرر
        if (users.find(u => u.username === username)) {
            alert('اسم المستخدم موجود بالفعل');
            return;
        }

        // إنشاء مستخدم جديد
        const newUser = {
            id: Date.now(),
            name,
            email,
            username,
            password, // في التطبيق الحقيقي يجب تشفير كلمة المرور
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        db.saveUsers(users);

        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.reset();
    });
});
