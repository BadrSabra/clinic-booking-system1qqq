import db from '../database.js';

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const doctorModal = document.getElementById('doctorModal');
    const addDoctorBtn = document.getElementById('addDoctorBtn');
    const closeModalButtons = document.querySelectorAll('.modal-close');
    const doctorForm = document.getElementById('doctorForm');
    const doctorsTableBody = document.getElementById('doctorsTableBody');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const resetBtn = document.getElementById('resetBtn');

    let currentDoctorId = null;

    // تبديل التبويبات
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // إزالة النشاط من جميع الأزرار
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // إضافة النشاط للتبويب المحدد
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // تحميل الإعدادات العامة
    function loadGeneralSettings() {
        const settings = db.getSettings();
        
        if (settings.clinicName) {
            document.getElementById('clinicName').value = settings.clinicName;
        }
        if (settings.clinicPhone) {
            document.getElementById('clinicPhone').value = settings.clinicPhone;
        }
        if (settings.clinicEmail) {
            document.getElementById('clinicEmail').value = settings.clinicEmail;
        }
        if (settings.clinicAddress) {
            document.getElementById('clinicAddress').value = settings.clinicAddress;
        }
        if (settings.currency) {
            document.getElementById('currency').value = settings.currency;
        }
        if (settings.workingHours) {
            document.getElementById('workStart').value = settings.workingHours.start;
            document.getElementById('workEnd').value = settings.workingHours.end;
        }
        if (settings.appointmentDuration) {
            document.getElementById('appointmentDuration').value = settings.appointmentDuration;
        }
        if (settings.workDays) {
            document.querySelectorAll('input[name="workDays"]').forEach(checkbox => {
                checkbox.checked = settings.workDays.includes(checkbox.value);
            });
        }
        if (settings.notifications) {
            document.getElementById('emailNotifications').checked = settings.notifications.email;
            document.getElementById('smsNotifications').checked = settings.notifications.sms;
            document.getElementById('reminderTime').value = settings.notifications.reminderTime || 24;
        }
    }

    // حفظ الإعدادات العامة
    document.getElementById('generalSettings').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = db.getSettings();
        
        settings.clinicName = document.getElementById('clinicName').value;
        settings.clinicPhone = document.getElementById('clinicPhone').value;
        settings.clinicEmail = document.getElementById('clinicEmail').value;
        settings.clinicAddress = document.getElementById('clinicAddress').value;
        settings.currency = document.getElementById('currency').value;
        
        db.saveSettings(settings);
        alert('تم حفظ الإعدادات العامة بنجاح');
    });

    // حفظ إعدادات أوقات العمل
    document.getElementById('workingHoursSettings').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = db.getSettings();
        
        settings.workingHours = {
            start: document.getElementById('workStart').value,
            end: document.getElementById('workEnd').value
        };
        
        settings.appointmentDuration = parseInt(document.getElementById('appointmentDuration').value);
        
        const selectedDays = Array.from(document.querySelectorAll('input[name="workDays"]:checked'))
            .map(checkbox => checkbox.value);
        settings.workDays = selectedDays;
        
        db.saveSettings(settings);
        alert('تم حفظ إعدادات أوقات العمل بنجاح');
    });

    // حفظ إعدادات الإشعارات
    document.getElementById('notificationsSettings').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = db.getSettings();
        
        settings.notifications = {
            email: document.getElementById('emailNotifications').checked,
            sms: document.getElementById('smsNotifications').checked,
            reminderTime: parseInt(document.getElementById('reminderTime').value)
        };
        
        db.saveSettings(settings);
        alert('تم حفظ إعدادات الإشعارات بنجاح');
    });

    // تحميل قائمة الأطباء
    function loadDoctors() {
        const doctors = db.getDoctors();
        doctorsTableBody.innerHTML = '';

        if (doctors.length === 0) {
            doctorsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">لا توجد أطباء مسجلين</td>
                </tr>
            `;
            return;
        }

        doctors.forEach(doctor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doctor.name}</td>
                <td>${doctor.specialty}</td>
                <td>${doctor.phone}</td>
                <td>${doctor.email || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-info btn-sm" onclick="editDoctor(${doctor.id})">
                            تعديل
                        </button>
                        <button class="btn-danger btn-sm" onclick="deleteDoctor(${doctor.id})">
                            حذف
                        </button>
                    </div>
                </td>
            `;
            doctorsTableBody.appendChild(row);
        });
    }

    // فتح نافذة إضافة طبيب
    addDoctorBtn.addEventListener('click', () => {
        currentDoctorId = null;
        document.getElementById('modalTitle').textContent = 'إضافة طبيب جديد';
        doctorForm.reset();
        doctorModal.classList.add('active');
    });

    // إغلاق النافذة المنبثقة
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            doctorModal.classList.remove('active');
        });
    });

    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', (e) => {
        if (e.target === doctorModal) {
            doctorModal.classList.remove('active');
        }
    });

    // معالجة نموذج الطبيب
    doctorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const doctorData = {
            name: document.getElementById('modalDoctorName').value,
            specialty: document.getElementById('modalSpecialty').value,
            phone: document.getElementById('modalPhone').value,
            email: document.getElementById('modalEmail').value,
            startTime: document.getElementById('modalStartTime').value,
            endTime: document.getElementById('modalEndTime').value,
            availableDays: Array.from(document.querySelectorAll('input[name="modalWorkDays"]:checked'))
                .map(checkbox => checkbox.value)
        };

        const doctors = db.getDoctors();

        if (currentDoctorId) {
            // تحديث طبيب موجود
            const doctorIndex = doctors.findIndex(d => d.id === currentDoctorId);
            if (doctorIndex !== -1) {
                doctors[doctorIndex] = { ...doctors[doctorIndex], ...doctorData };
            }
        } else {
            // إضافة طبيب جديد
            doctorData.id = Date.now();
            doctors.push(doctorData);
        }

        db.saveDoctors(doctors);
        loadDoctors();
        doctorModal.classList.remove('active');
        alert(currentDoctorId ? 'تم تحديث بيانات الطبيب' : 'تم إضافة الطبيب بنجاح');
    });

    // وظائف إدارة الأطباء
    window.editDoctor = function(id) {
        const doctors = db.getDoctors();
        const doctor = doctors.find(d => d.id === id);
        
        if (doctor) {
            currentDoctorId = id;
            document.getElementById('modalTitle').textContent = 'تعديل بيانات الطبيب';
            
            document.getElementById('modalDoctorName').value = doctor.name;
            document.getElementById('modalSpecialty').value = doctor.specialty;
            document.getElementById('modalPhone').value = doctor.phone;
            document.getElementById('modalEmail').value = doctor.email || '';
            document.getElementById('modalStartTime').value = doctor.startTime;
            document.getElementById('modalEndTime').value = doctor.endTime;
            
            // تحديد أيام العمل
            document.querySelectorAll('input[name="modalWorkDays"]').forEach(checkbox => {
                checkbox.checked = doctor.availableDays.includes(checkbox.value);
            });
            
            doctorModal.classList.add('active');
        }
    };

    window.deleteDoctor = function(id) {
        if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
            const doctors = db.getDoctors();
            const filteredDoctors = doctors.filter(d => d.id !== id);
            db.saveDoctors(filteredDoctors);
            loadDoctors();
            alert('تم حذف الطبيب بنجاح');
        }
    };

    // تصدير البيانات
    exportBtn.addEventListener('click', function() {
        const data = {
            patients: db.getPatients(),
            appointments: db.getAppointments(),
            doctors: db.getDoctors(),
            settings: db.getSettings(),
            users: db.getUsers(),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `clinicpro-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('تم تصدير البيانات بنجاح');
    });

    // استيراد البيانات
    importBtn.addEventListener('click', function() {
        importFile.click();
    });

    importFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('الرجاء اختيار ملف JSON صالح');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟')) {
                    if (data.patients) db.savePatients(data.patients);
                    if (data.appointments) db.saveAppointments(data.appointments);
                    if (data.doctors) db.saveDoctors(data.doctors);
                    if (data.settings) db.saveSettings(data.settings);
                    if (data.users) db.saveUsers(data.users);
                    
                    alert('تم استيراد البيانات بنجاح');
                    location.reload();
                }
            } catch (error) {
                alert('خطأ في قراءة الملف. الرجاء التأكد من صحة الملف.');
            }
        };
        reader.readAsText(file);
    });

    // إعادة تعيين النظام
    resetBtn.addEventListener('click', function() {
        if (confirm('⚠️ تحذير: سيتم حذف جميع البيانات والعودة إلى الإعدادات الافتراضية. هل أنت متأكد؟')) {
            if (confirm('❌ هل أنت متأكد تماماً؟ لا يمكن التراجع عن هذه العملية.')) {
                localStorage.clear();
                alert('تم إعادة تعيين النظام بنجاح. سيتم إعادة تحميل الصفحة.');
                location.reload();
            }
        }
    });

    // التحميل الأولي
    loadGeneralSettings();
    loadDoctors();
});
