/**
 * 💾 storage.js - Shared Storage Service
 * Encapsulates LocalStorage CRUD operations safely and separates data concerns.
 */
(function() {
    window.JLM = window.JLM || {};

    const SUBMISSIONS_KEY = 'jlm_legal_submissions';
    const APPOINTMENTS_KEY = 'jlm_appointment_requests';

    // Mock data for initial loading if empty
    const mockSubmissions = [
        {
            id: 101,
            clientName: "محمد",
            clientPhone: "050-1234567",
            dateSent: "25/06/2026",
            category: "🚗 حادث سير / مرور",
            workLocation: "📍 منطقة إسرائيلية (قانون إسرائيلي)",
            isNegligence: "لا ينطبق (حادث سير)",
            accidentDetails: "صدمة من الخلف أثناء التوقف عند الإشارة الضوئية.",
            locationBefore: "كنت أقود السيارة متوجهاً إلى عملي في الصباح الباكر.",
            processed: false,
            submissionLang: "ar"
        },
        {
            id: 102,
            clientName: "أحمد",
            clientPhone: "054-9876543",
            dateSent: "24/06/2026",
            category: "🛠️ إصابة عمل / مصنع",
            workLocation: "📍 منطقة الضفة الغربية (قانون فلسطيني)",
            isNegligence: "نعم، أعتقد أن هناك طرف آخر يجب أن يتحمل المسؤولية",
            accidentDetails: "سقوط لوح خشبي ثقيل على القدم بسبب خلل في الرافعة.",
            locationBefore: "كنت أقف بجوار منطقة التحميل في الورشة استعداداً لنقل الأخشاب.",
            processed: true,
            submissionLang: "ar"
        }
    ];

    function safeGetItem(key, defaultValue = '[]') {
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from LocalStorage:`, e);
            return defaultValue;
        }
    }

    function safeSetItem(key, val) {
        try {
            localStorage.setItem(key, val);
            return true;
        } catch (e) {
            console.error(`Error writing ${key} to LocalStorage:`, e);
            return false;
        }
    }

    window.JLM.StorageService = {
        getSubmissions: function() {
            const data = JSON.parse(safeGetItem(SUBMISSIONS_KEY, '[]'));
            // Populate mock data if completely empty
            if (data.length === 0) {
                this.saveSubmissionsBatch(mockSubmissions);
                return mockSubmissions;
            }
            return data;
        },

        saveSubmission: function(submission) {
            const submissions = this.getSubmissions();
            submissions.push(submission);
            return safeSetItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
        },

        saveSubmissionsBatch: function(batch) {
            return safeSetItem(SUBMISSIONS_KEY, JSON.stringify(batch));
        },

        updateSubmission: function(id, data) {
            const submissions = this.getSubmissions();
            const index = submissions.findIndex(s => s.id === Number(id));
            if (index !== -1) {
                submissions[index] = { ...submissions[index], ...data };
                return safeSetItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
            }
            return false;
        },

        deleteSubmission: function(id) {
            const submissions = this.getSubmissions();
            const filtered = submissions.filter(s => s.id !== Number(id));
            return safeSetItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
        },

        getAppointments: function() {
            return JSON.parse(safeGetItem(APPOINTMENTS_KEY, '[]'));
        },

        saveAppointment: function(appointment) {
            const appointments = this.getAppointments();
            appointments.push(appointment);
            return safeSetItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
        },

        saveAppointmentsBatch: function(batch) {
            return safeSetItem(APPOINTMENTS_KEY, JSON.stringify(batch));
        },

        updateAppointment: function(id, data) {
            const appointments = this.getAppointments();
            const index = appointments.findIndex(a => a.id === Number(id));
            if (index !== -1) {
                appointments[index] = { ...appointments[index], ...data };
                return safeSetItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
            }
            return false;
        },

        deleteAppointment: function(id) {
            const appointments = this.getAppointments();
            const filtered = appointments.filter(a => a.id !== Number(id));
            return safeSetItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
        },

        clearArchive: function() {
            // Keep pending submissions and delete processed ones
            const submissions = this.getSubmissions();
            const pendingSubmissions = submissions.filter(s => !s.processed);
            this.saveSubmissionsBatch(pendingSubmissions);

            // Also remove approved/deleted appointments
            const appointments = this.getAppointments();
            const pendingAppointments = appointments.filter(a => a.status === 'pending');
            this.saveAppointmentsBatch(pendingAppointments);
            return true;
        }
    };
})();
