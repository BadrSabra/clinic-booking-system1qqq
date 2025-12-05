document.addEventListener('DOMContentLoaded', function() {
    const simulateBookingBtn = document.getElementById('simulateBooking');
    const successModal = document.getElementById('successModal');
    const closeModalButtons = document.querySelectorAll('.modal-close');

    // محاكاة عملية الحجز
    simulateBookingBtn.addEventListener('click', function() {
        // عرض رسالة المحاكاة
        successModal.classList.add('active');
    });

    // إغلاق النافذة المنبثقة
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            successModal.classList.remove('active');
        });
    });

    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // تمرير سلس للروابط الداخلية
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
});
