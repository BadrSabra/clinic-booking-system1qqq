
import db from '../database.js';

document.addEventListener('DOMContentLoaded', function() {
    const todayAppointmentsCount = document.getElementById('todayAppointmentsCount');
    const totalPatientsCount = document.getElementById('totalPatientsCount');
    const doctorsCount = document.getElementById('doctorsCount');
    const todayRevenue = document.getElementById('todayRevenue');
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    const currentDate = document.getElementById('currentDate');

    // تحديث التاريخ الحالي
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = today.toLocaleDateString('ar-SA', options);

    // تحميل الإحصائيات
    function loadStatistics() {
        const appointments = db.getAppointments();
        const patients = db.getPatients();
        const doctors = db.getDoctors();

        // مواعيد اليوم
        const todayStr = today.toISOString().split('T')[0];
        const todayApps = appointments.filter(app => app.date === todayStr);
        todayAppointmentsCount.textContent = todayApps.length;

        // إجمالي المرضى
        totalPatientsCount.textContent = patients.length;

        // عدد الأطباء
        doctorsCount.textContent = doctors.length;

        // الإيرادات اليوم (مثال: 100 ريال لكل موعد)
        const revenue = todayApps.length * 100;
        todayRevenue.textContent = `${revenue} ر.س`;
    }

    // تحميل المواعيد القادمة
    function loadUpcomingAppointments() {
        const appointments = db.getAppointments();
        const todayStr = today.toISOString().split('T')[0];

        // ترتيب المواعيد حسب التاريخ والوقت
        const upcoming = appointments
            .filter(app => app.date >= todayStr && app.status !== 'ملغى')
            .sort((a, b) => {
                if (a.date === b.date) {
                    return a.time.localeCompare(b.time);
                }
                return a.date.localeCompare(b.date);
            })
            .slice(0, 10); // عرض 10 مواعيد فقط

        upcomingAppointments.innerHTML = '';

        if (upcoming.length === 0) {
            upcomingAppointments.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">لا توجد مواعيد قادمة</td>
                </tr>
            `;
            return;
        }

        upcoming.forEach(appointment => {
            const row = document.createElement('tr');
            
            // تنسيق الحالة
            let statusClass = '';
            switch(appointment.status) {
                case 'مؤكد':
                    statusClass = 'confirmed';
                    break;
                case 'قيد الانتظار':
                    statusClass = 'pending';
                    break;
                case 'مكتمل':
                    statusClass = 'completed';
                    break;
                case 'ملغى':
                    statusClass = 'cancelled';
                    break;
            }

            row.innerHTML = `
                <td>${appointment.time}</td>
                <td>
                    <strong>${appointment.patientName}</strong><br>
                    <small>${appointment.patientPhone}</small>
                </td>
                <td>${appointment.doctorName}</td>
                <td>كشف عام</td>
                <td><span class="status ${statusClass}">${appointment.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-info btn-sm" onclick="viewAppointment(${appointment.id})">
                            عرض
                        </button>
                        <button class="btn-warning btn-sm" onclick="editAppointment(${appointment.id})">
                            تعديل
                        </button>
                        <button class="btn-danger btn-sm" onclick="cancelAppointment(${appointment.id})">
                            إلغاء
                        </button>
                    </div>
                </td>
            `;

            upcomingAppointments.appendChild(row);
        });
    }

    // وظائف الإجراءات
    window.viewAppointment = function(id) {
        alert(`عرض الموعد برقم ${id}`);
        // يمكن تنفيذ عرض تفاصيل الموعد في نافذة منبثقة
    };

    window.editAppointment = function(id) {
        alert(`تعديل الموعد برقم ${id}`);
        // يمكن تنفيذ تعديل الموعد
    };

    window.cancelAppointment = function(id) {
        if (confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) {
            const appointments = db.getAppointments();
            const appointmentIndex = appointments.findIndex(app => app.id === id);
            
            if (appointmentIndex !== -1) {
                appointments[appointmentIndex].status = 'ملغى';
                db.saveAppointments(appointments);
                loadStatistics();
                loadUpcomingAppointments();
                alert('تم إلغاء الموعد بنجاح');
            }
        }
    };

    // التحميل الأولي
    loadStatistics();
    loadUpcomingAppointments();
});
