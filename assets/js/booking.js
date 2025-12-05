import db from '../database.js';

document.addEventListener('DOMContentLoaded', function() {
    const steps = document.querySelectorAll('.form-step');
    const bookingSteps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const bookingForm = document.getElementById('bookingForm');
    const bookingSuccess = document.getElementById('bookingSuccess');
    const doctorsList = document.getElementById('doctorsList');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    const today = new Date().toISOString().split('T')[0];

    // تعيين الحد الأدنى للتاريخ
    appointmentDate.min = today;

    let currentStep = 1;
    let selectedDoctor = null;
    let bookingData = {};

    // تحميل الأطباء
    function loadDoctors() {
        const doctors = db.getDoctors();
        doctorsList.innerHTML = '';

        doctors.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';
            doctorCard.innerHTML = `
                <h3>${doctor.name}</h3>
                <p><strong>التخصص:</strong> ${doctor.specialty}</p>
                <p><strong>الهاتف:</strong> ${doctor.phone}</p>
                <p><strong>الأيام المتاحة:</strong> ${doctor.availableDays.join('، ')}</p>
                <p><strong>الوقت:</strong> ${doctor.startTime} - ${doctor.endTime}</p>
            `;

            doctorCard.addEventListener('click', () => {
                document.querySelectorAll('.doctor-card').forEach(card => {
                    card.classList.remove('selected');
                });
                doctorCard.classList.add('selected');
                selectedDoctor = doctor;
            });

            doctorsList.appendChild(doctorCard);
        });
    }

    // تغيير الخطوة
    function goToStep(step) {
        // إخفاء جميع الخطوات
        steps.forEach(s => s.classList.remove('active'));
        bookingSteps.forEach(s => s.classList.remove('active'));

        // إظهار الخطوة المحددة
        document.getElementById(`step${step}`).classList.add('active');
        bookingSteps[step - 1].classList.add('active');
        currentStep = step;

        // إذا كانت الخطوة 3، تحميل الأوقات المتاحة
        if (step === 3 && selectedDoctor && appointmentDate.value) {
            loadAvailableTimes();
        }

        // إذا كانت الخطوة 4، تحديث تفاصيل التأكيد
        if (step === 4) {
            updateConfirmationDetails();
        }
    }

    // تحميل الأوقات المتاحة
    function loadAvailableTimes() {
        if (!selectedDoctor || !appointmentDate.value) return;

        const appointments = db.getAppointments();
        const selectedDay = new Date(appointmentDate.value).toLocaleDateString('ar-SA', { weekday: 'long' });
        
        // التحقق من أن اليوم متاح للطبيب
        if (!selectedDoctor.availableDays.includes(selectedDay)) {
            appointmentTime.innerHTML = '<option value="">لا يوجد مواعيد في هذا اليوم</option>';
            return;
        }

        // توليد الأوقات المتاحة
        appointmentTime.innerHTML = '<option value="">اختر الوقت</option>';
        
        const startHour = parseInt(selectedDoctor.startTime.split(':')[0]);
        const endHour = parseInt(selectedDoctor.endTime.split(':')[0]);
        
        const bookedTimes = appointments
            .filter(app => 
                app.doctorId === selectedDoctor.id && 
                app.date === appointmentDate.value &&
                app.status !== 'ملغى'
            )
            .map(app => app.time);

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                if (!bookedTimes.includes(time)) {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    appointmentTime.appendChild(option);
                }
            }
        }
    }

    // تحديث تفاصيل التأكيد
    function updateConfirmationDetails() {
        bookingData = {
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value,
            notes: document.getElementById('patientNotes').value,
            doctor: selectedDoctor,
            date: appointmentDate.value,
            time: appointmentTime.value
        };

        document.getElementById('confirmName').textContent = bookingData.name;
        document.getElementById('confirmPhone').textContent = bookingData.phone;
        document.getElementById('confirmDoctor').textContent = `${bookingData.doctor.name} - ${bookingData.doctor.specialty}`;
        document.getElementById('confirmDateTime').textContent = `${bookingData.date} الساعة ${bookingData.time}`;
    }

    // معالجة الحجز
    function handleBooking(e) {
        e.preventDefault();

        // حفظ الموعد
        const appointments = db.getAppointments();
        const newAppointment = {
            id: Date.now(),
            patientName: bookingData.name,
            patientPhone: bookingData.phone,
            patientEmail: bookingData.email,
            notes: bookingData.notes,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            date: bookingData.date,
            time: bookingData.time,
            status: 'مؤكد',
            createdAt: new Date().toISOString()
        };

        appointments.push(newAppointment);
        db.saveAppointments(appointments);

        // حفظ المريض إذا كان جديداً
        const patients = db.getPatients();
        if (!patients.find(p => p.phone === bookingData.phone)) {
            patients.push({
                id: Date.now(),
                name: bookingData.name,
                phone: bookingData.phone,
                email: bookingData.email,
                createdAt: new Date().toISOString()
            });
            db.savePatients(patients);
        }

        // إظهار رسالة النجاح
        bookingForm.style.display = 'none';
        bookingSuccess.style.display = 'block';

        // تحديث تفاصيل النجاح
        document.getElementById('successDetails').innerHTML = `
            <p><strong>رقم الحجز:</strong> ${newAppointment.id}</p>
            <p><strong>اسم المريض:</strong> ${newAppointment.patientName}</p>
            <p><strong>الطبيب:</strong> ${newAppointment.doctorName}</p>
            <p><strong>التاريخ:</strong> ${newAppointment.date}</p>
            <p><strong>الوقت:</strong> ${newAppointment.time}</p>
        `;
    }

    // الأحداث
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStep = parseInt(button.dataset.step);
            
            // التحقق من صحة البيانات قبل الانتقال
            if (currentStep === 1) {
                const name = document.getElementById('patientName').value;
                const phone = document.getElementById('patientPhone').value;
                
                if (!name || !phone) {
                    alert('الرجاء ملء جميع الحقول المطلوبة');
                    return;
                }
            } else if (currentStep === 2 && !selectedDoctor) {
                alert('الرجاء اختيار طبيب');
                return;
            } else if (currentStep === 3) {
                if (!appointmentDate.value || !appointmentTime.value) {
                    alert('الرجاء اختيار التاريخ والوقت');
                    return;
                }
            }

            goToStep(nextStep);
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = parseInt(button.dataset.step);
            goToStep(prevStep);
        });
    });

    appointmentDate.addEventListener('change', loadAvailableTimes);

    bookingForm.addEventListener('submit', handleBooking);

    // التحميل الأولي
    loadDoctors();
    goToStep(1);
});
