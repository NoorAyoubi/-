/* 📅 Isolated Appointment Booking Dashboard Component for Lawyer Dashboard */

(function() {
    const dashboardTranslations = {
        ar: {
            appointmentsSectionTitle: "جدول المواعيد المحجوزة للعملاء",
            emptyAppointments: "لا توجد مواعيد محجوزة حالياً.",
            colName: "الاسم",
            colPhone: "الهاتف",
            colDate: "تاريخ الموعد",
            colTime: "الوقت المفضل",
            colNotes: "صنف القضية",
            colStatus: "الحالة",
            colAction: "الإجراء",
            btnApprove: "تأكيد الموعد",
            btnReject: "حذف / إلغاء",
            statusPending: "معلّق / بانتظار التأكيد",
            statusApproved: "✔️ مؤكد ومحجوز",
            confirmApprove: "هل أنت متأكد من رغبتك في تأكيد حجز هذا الموعد وتغيير حالته؟",
            confirmDelete: "هل أنت متأكد من رغبتك في حذف أو إلغاء هذا الموعد نهائياً؟",
            approveSuccess: "✔️ تم تأكيد الموعد وحفظ الحجز بنجاح!",
            deleteSuccess: "🧹 تم مسح وإلغاء الموعد بنجاح!"
        },
        he: {
            appointmentsSectionTitle: "ניהול פגישות ותורים של לקוחות",
            emptyAppointments: "אין תורים מוזמנים כעת.",
            colName: "שם",
            colPhone: "טלפון",
            colDate: "תאריך פגישה",
            colTime: "שעה מועדפת",
            colNotes: "סוג התיק",
            colStatus: "סטטוס",
            colAction: "פעולה",
            btnApprove: "אשר פגישה",
            btnReject: "מחק / בטל",
            statusPending: "ממתין לאישור",
            statusApproved: "✔️ מאושר וסגור",
            confirmApprove: "האם אתה בטוח שברצונך לאשר פגישה זו ולשריין את התור?",
            confirmDelete: "האם אתה בטוח שברצונך למחוק או לבטל פגישה זו לצמיתות?",
            approveSuccess: "✔️ הפגישה אושרה ושוריינה בהצלחה!",
            deleteSuccess: "🧹 הפגישה נמחקה ובסיס הנתונים עודכן!"
        },
        en: {
            appointmentsSectionTitle: "Manage Client Appointments",
            emptyAppointments: "No appointments scheduled at the moment.",
            colName: "Name",
            colPhone: "Phone",
            colDate: "Date",
            colTime: "Preferred Time",
            colNotes: "Case Category",
            colStatus: "Status",
            colAction: "Action",
            btnApprove: "Approve Booking",
            btnReject: "Cancel / Delete",
            statusPending: "Pending Approval",
            statusApproved: "✔️ Approved & Scheduled",
            confirmApprove: "Are you sure you want to approve this appointment and reserve this slot?",
            confirmDelete: "Are you sure you want to delete or cancel this appointment permanently?",
            approveSuccess: "✔️ Appointment approved and scheduled successfully!",
            deleteSuccess: "🧹 Appointment canceled and deleted successfully!"
        }
    };

    // Wait until document body is available
    if (document.body) {
        initAppointmentDashboard();
    } else {
        document.addEventListener('DOMContentLoaded', initAppointmentDashboard);
    }

    function initAppointmentDashboard() {
        // Ensure leadsSection element exists
        const leadsSec = document.getElementById('leadsSection');
        if (!leadsSec) {
            // Retry in 100ms if not rendered yet
            setTimeout(initAppointmentDashboard, 100);
            return;
        }

        // 1. Create Section HTML structure inside leadsSection
        insertSectionContainer();

        // 2. Hook Navigation, Lang selectors, and Render Table wrapper
        hookNavigationAndLang();

        // Initialize translations with current active language
        const initialLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        translateDashboardUI(initialLang);
        renderAppointmentsTable();
    }

    // Insert appointments Section Container at the bottom of leadsSection
    function insertSectionContainer() {
        const leadsSection = document.getElementById('leadsSection');
        if (leadsSection && !document.getElementById('appointmentsSection')) {
            const sectionHtml = `
                <div id="appointmentsSection" style="margin-top: 48px; border-top: 1px dashed var(--card-border, rgba(255, 255, 255, 0.12)); padding-top: 36px;">
                    <h1 class="dashboard-title" id="appointmentsSectionTitle" style="display: flex; align-items: center; justify-content: space-between;">
                        <span>جدول المواعيد المحجوزة للعملاء</span>
                    </h1>
                    <div class="table-container">
                        <table class="leads-table">
                            <thead>
                                <tr id="appointmentsTableHead">
                                    <!-- Headers populated dynamically -->
                                </tr>
                            </thead>
                            <tbody id="appointmentsTableBody">
                                <!-- Rows loaded dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sectionHtml;
            leadsSection.appendChild(tempDiv.firstElementChild);
        }
    }

    // Hook original functions
    function hookNavigationAndLang() {
        // Wrap original renderTable to auto-update appointments and sum badge count
        if (typeof renderTable !== 'undefined') {
            const originalRenderTable = renderTable;
            renderTable = function(submissions) {
                originalRenderTable(submissions);
                renderAppointmentsTable();
            };
        }

        // Wrap original applyLanguage
        if (typeof applyLanguage !== 'undefined') {
            const originalApplyLanguage = applyLanguage;
            applyLanguage = function(lang) {
                originalApplyLanguage(lang);
                translateDashboardUI(lang);
                renderAppointmentsTable();
            };
        }

        // Listen for storage event to support live sync updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'jlm_appointment_requests') {
                renderAppointmentsTable();
            }
        });
    }

    // Translate UI
    function translateDashboardUI(lang) {
        const t = dashboardTranslations[lang] || dashboardTranslations.ar;

        // Section Title
        const secTitle = document.getElementById('appointmentsSectionTitle');
        if (secTitle) {
            const titleSpan = secTitle.querySelector('span');
            if (titleSpan) titleSpan.innerText = t.appointmentsSectionTitle;
        }

        // Table headers
        const headRow = document.getElementById('appointmentsTableHead');
        if (headRow) {
            headRow.innerHTML = `
                <th>${t.colName}</th>
                <th>${t.colPhone}</th>
                <th>${t.colDate}</th>
                <th>${t.colTime}</th>
                <th>${t.colNotes}</th>
                <th style="text-align: center;">${t.colStatus}</th>
                <th>${t.colAction}</th>
            `;
        }
    }

    // Render Table rows
    function renderAppointmentsTable() {
        const tableBody = document.getElementById('appointmentsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const t = dashboardTranslations[activeLang] || dashboardTranslations.ar;

        const appointments = JSON.parse(localStorage.getItem('jlm_appointment_requests') || '[]');

        // Update counts badge combined with leads badge
        updatePendingAppointmentsBadge(appointments);

        if (appointments.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 24px;">${t.emptyAppointments}</td></tr>`;
            return;
        }

        // Render rows
        appointments.forEach(app => {
            const tr = document.createElement('tr');
            
            // Status markup
            let statusText = t.statusPending;
            let statusStyle = 'color: var(--text-secondary);';
            if (app.status === 'approved') {
                statusText = t.statusApproved;
                statusStyle = 'color: #c5a880; font-weight: bold;';
            }

            // Buttons
            let actionButtons = '';
            if (app.status === 'pending') {
                actionButtons = `
                    <button class="btn-table-action" onclick="approveAppointment(${app.id})">${t.btnApprove}</button>
                    <button class="btn-table-action" onclick="deleteAppointment(${app.id})" style="background-color: #ef4444; color: white !important; margin-left: 5px; margin-right: 5px;">${t.btnReject}</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-table-action" onclick="deleteAppointment(${app.id})" style="background-color: #ef4444; color: white !important;">${t.btnReject}</button>
                `;
            }

            tr.innerHTML = `
                <td><strong>${app.name}</strong></td>
                <td><a href="tel:${app.phone}" style="color: var(--accent-gold); text-decoration: none;">${app.phone}</a></td>
                <td>${app.date}</td>
                <td>${app.time}</td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;" title="${app.notes}">${app.notes}</td>
                <td style="text-align: center; ${statusStyle}">${statusText}</td>
                <td style="white-space: nowrap;">${actionButtons}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Update notification badge count inside leads badge (sum of leads + appointments)
    function updatePendingAppointmentsBadge(appointments) {
        const badge = document.getElementById('leadsBadge');
        if (badge) {
            let submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
            const pendingLeadsCount = submissions.filter(item => !item.processed).length;
            const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;
            
            const totalCount = pendingLeadsCount + pendingAppointmentsCount;
            if (totalCount > 0) {
                badge.innerText = totalCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Also add badge in section header
        const secTitle = document.getElementById('appointmentsSectionTitle');
        if (secTitle) {
            const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
            const t = dashboardTranslations[activeLang] || dashboardTranslations.ar;
            const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;
            
            // Remove old badge span if exists
            const oldSpan = secTitle.querySelector('.appointments-header-badge');
            if (oldSpan) oldSpan.remove();

            if (pendingAppointmentsCount > 0) {
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'appointments-header-badge';
                badgeSpan.style.cssText = `
                    font-size: 0.85rem; 
                    color: var(--accent-gold); 
                    background: rgba(197, 168, 128, 0.1); 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-weight: bold;
                    margin-right: 12px;
                    margin-left: 12px;
                `;
                badgeSpan.innerText = activeLang === 'he' ? `${pendingAppointmentsCount} ממתינים` : (activeLang === 'en' ? `${pendingAppointmentsCount} pending` : `${pendingAppointmentsCount} معلّق`);
                secTitle.appendChild(badgeSpan);
            }
        }
    }

    // Approve Appointment Action
    window.approveAppointment = function(id) {
        const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const t = dashboardTranslations[activeLang] || dashboardTranslations.ar;

        if (confirm(t.confirmApprove)) {
            let appointments = JSON.parse(localStorage.getItem('jlm_appointment_requests') || '[]');
            const idx = appointments.findIndex(a => a.id == id);
            if (idx > -1) {
                appointments[idx].status = 'approved';
                localStorage.setItem('jlm_appointment_requests', JSON.stringify(appointments));
                
                renderAppointmentsTable();

                // Play celebration
                if (typeof startCelebration !== 'undefined') {
                    startCelebration(t.approveSuccess);
                } else {
                    alert(t.approveSuccess);
                }
            }
        }
    };

    // Delete/Reject Appointment Action
    window.deleteAppointment = function(id) {
        const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const t = dashboardTranslations[activeLang] || dashboardTranslations.ar;

        if (confirm(t.confirmDelete)) {
            let appointments = JSON.parse(localStorage.getItem('jlm_appointment_requests') || '[]');
            const appt = appointments.find(a => a.id == id);

            if (appt) {
                // Add to jlm_legal_submissions as processed (archived client)
                let submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
                
                const leadLang = appt.lang || 'ar';
                const noteText = leadLang === 'he' ? `תור בוטל/נמחק: ${appt.date} - ${appt.time}` : 
                               (leadLang === 'en' ? `Canceled/Deleted Appointment: ${appt.date} - ${appt.time}` : 
                               `موعد ملغى/محذوف: ${appt.date} - ${appt.time}`);
                               
                const newLead = {
                    id: appt.id,
                    clientName: appt.name,
                    clientPhone: appt.phone,
                    dateSent: new Date(appt.id).toLocaleDateString('en-GB'),
                    category: appt.notes,
                    workLocation: "---",
                    isNegligence: "---",
                    accidentDetails: noteText,
                    locationBefore: "---",
                    processed: true, // Mark as processed/archived
                    submissionLang: leadLang
                };
                
                submissions.push(newLead);
                localStorage.setItem('jlm_legal_submissions', JSON.stringify(submissions));
                
                // Trigger reload of the main dashboard leads/archive tables if available
                if (typeof loadSubmissions === 'function') {
                    loadSubmissions();
                }
            }

            // Filter out of active appointments list
            appointments = appointments.filter(a => a.id != id);
            localStorage.setItem('jlm_appointment_requests', JSON.stringify(appointments));
            
            renderAppointmentsTable();

            if (typeof startCelebration !== 'undefined') {
                startCelebration(t.deleteSuccess);
            } else {
                alert(t.deleteSuccess);
            }
        }
    };
})();
