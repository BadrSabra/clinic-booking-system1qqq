// نظام قاعدة البيانات المبسط باستخدام localStorage
class Database {
    constructor() {
        this.storage = window.localStorage;
        this.initialize();
    }

    initialize() {
        // إذا كانت هذه هي المرة الأولى، نقوم بتهيئة الهياكل
        if (!this.storage.getItem('clinic_pro_initialized')) {
            this.storage.setItem('clinic_pro_patients', JSON.stringify([]));
            this.storage.setItem('clinic_pro_appointments', JSON.stringify([]));
            this.storage.setItem('clinic_pro_doctors', JSON.stringify([]));
            this.storage.setItem('clinic_pro_settings', JSON.stringify({}));
            this.storage.setItem('clinic_pro_users', JSON.stringify([]));
            this.storage.setItem('clinic_pro_initialized', 'true');
        }
    }

    // المرضى
    getPatients() {
        return JSON.parse(this.storage.getItem('clinic_pro_patients'));
    }

    savePatients(patients) {
        this.storage.setItem('clinic_pro_patients', JSON.stringify(patients));
    }

    // المواعيد
    getAppointments() {
        return JSON.parse(this.storage.getItem('clinic_pro_appointments'));
    }

    saveAppointments(appointments) {
        this.storage.setItem('clinic_pro_appointments', JSON.stringify(appointments));
    }

    // الأطباء
    getDoctors() {
        return JSON.parse(this.storage.getItem('clinic_pro_doctors'));
    }

    saveDoctors(doctors) {
        this.storage.setItem('clinic_pro_doctors', JSON.stringify(doctors));
    }

    // الإعدادات
    getSettings() {
        return JSON.parse(this.storage.getItem('clinic_pro_settings'));
    }

    saveSettings(settings) {
        this.storage.setItem('clinic_pro_settings', JSON.stringify(settings));
    }

    // المستخدمين (للمسؤولين)
    getUsers() {
        return JSON.parse(this.storage.getItem('clinic_pro_users'));
    }

    saveUsers(users) {
        this.storage.setItem('clinic_pro_users', JSON.stringify(users));
    }
}

const db = new Database();
export default db;
