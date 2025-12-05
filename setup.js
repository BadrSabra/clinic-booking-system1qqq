import db from './database.js';
import config from './config.js';

// إعداد البيانات الأولية
function setup() {
    // إعدادات افتراضية
    const settings = db.getSettings();
    if (Object.keys(settings).length === 0) {
        db.saveSettings(config);
    }

    // بيانات الأطباء الافتراضية
    const doctors = db.getDoctors();
    if (doctors.length === 0) {
        const defaultDoctors = [
            {
                id: 1,
                name: "د. أحمد محمد",
                specialty: "أسنان",
                phone: "0555555551",
                email: "ahmed@example.com",
                availableDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                startTime: "09:00",
                endTime: "17:00"
            },
            {
                id: 2,
                name: "د. سارة عبدالله",
                specialty: "جلدية",
                phone: "0555555552",
                email: "sara@example.com",
                availableDays: ["الأحد", "الثلاثاء", "الأربعاء", "الخميس"],
                startTime: "10:00",
                endTime: "18:00"
            }
        ];
        db.saveDoctors(defaultDoctors);
    }

    // مستخدم افتراضي
    const users = db.getUsers();
    if (users.length === 0) {
        const defaultUser = {
            id: 1,
            username: "admin",
            password: "admin123", // في التطبيق الحقيقي يجب تشفير كلمة المرور
            name: "المسؤول",
            role: "admin"
        };
        db.saveUsers([defaultUser]);
    }

    console.log("تم إعداد النظام بنجاح!");
}

export default setup;
