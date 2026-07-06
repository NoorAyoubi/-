/* 📅 Isolated Appointment Booking Dashboard Component for Lawyer Dashboard */

(function() {
    const dashboardTranslations = {
        ar: {
            btnAppointments: "📅 جدول المواعيد",
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
            btnAppointments: "📅 לוח פגישות",
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
            btnAppointments: "📅 Schedule Bookings",
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
        // Ensure we don't init twice
        if (document.getElementById('btnAppointments')) return;

        // 1. Create sidebar button
        insertSidebarButton();

        // 2. Create Section HTML structure
        insertSectionContainer();

        // 3. Hook Navigation and Lang selectors
        hookNavigationAndLang();

        // Initialize translations with current active language
        const initialLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        translateDashboardUI(initialLang);
        renderAppointmentsTable();
    }

    // Insert Sidebar Button
    function insertSidebarButton() {
        const nav = document.querySelector('.sidebar-nav');
        if (nav) {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.className = 'nav-item';
            btn.id = 'btnAppointments';
            btn.onclick = (e) => {
                e.preventDefault();
                activateAppointmentsTab();
            };
            nav.appendChild(btn);
        }
    }

    // Insert appointments Section Container
    function insertSectionContainer() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const sectionHtml = `
                <div id="appointmentsSection" style="display: none;">
                    <h1 class="dashboard-title" id="appointmentsSectionTitle">جدول المواعيد المحجوزة للعملاء</h1>
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
            mainContent.appendChild(tempDiv.firstElementChild);
        }
    }

    // Switch view to Appointments tab
    function activateAppointmentsTab() {
        // Hide original dashboard sections
        const leadsSec = document.getElementById('leadsSection');
        const archiveSec = document.getElementById('archiveSection');
        const settingsSec = document.getElementById('settingsSection');
        if (leadsSec) leadsSec.style.display = 'none';
        if (archiveSec) archiveSec.style.display = 'none';
        if (settingsSec) settingsSec.style.display = 'none';

        // Remove active class from standard buttons
        const btnL = document.getElementById('btnLeads');
        const btnA = document.getElementById('btnArchive');
        const btnS = document.getElementById('btnSettings');
        if (btnL) btnL.classList.remove('active');
        if (btnA) btnA.classList.remove('active');
        if (btnS) btnS.classList.remove('active');

        // Activate custom appointments section
        const appointmentsSec = document.getElementById('appointmentsSection');
        const btnApp = document.getElementById('btnAppointments');
        if (appointmentsSec) appointmentsSec.style.display = 'block';
        if (btnApp) btnApp.classList.add('active');

        renderAppointmentsTable();
    }

    // Hook original functions
    function hookNavigationAndLang() {
        // Wrap original switchTab to hide appointmentsSection
        if (typeof switchTab !== 'undefined') {
            const originalSwitchTab = switchTab;
            switchTab = function(activeBtn, showSection) {
                // Hide custom section
                const appointmentsSec = document.getElementById('appointmentsSection');
                if (appointmentsSec) appointmentsSec.style.display = 'none';

                // Remove active class from custom button
                const btnApp = document.getElementById('btnAppointments');
                if (btnApp) btnApp.classList.remove('active');

                // Call original
                originalSwitchTab(activeBtn, showSection);
            };
        }

        // Wrap original applyLanguage (to support lang updates)
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

        // Sidebar link text
        const btnApp = document.getElementById('btnAppointments');
        if (btnApp) {
            // Retain badge if exists
            let badge = document.getElementById('appointmentsBadge');
            btnApp.innerHTML = `${t.btnAppointments}`;
            if (badge) btnApp.appendChild(badge);
        }

        // Section Title
        const secTitle = document.getElementById('appointmentsSectionTitle');
        if (secTitle) secTitle.innerText = t.appointmentsSectionTitle;

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

        // Update counts badge
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

    // Update notification badge count in sidebar
    function updatePendingAppointmentsBadge(appointments) {
        const btnApp = document.getElementById('btnAppointments');
        if (!btnApp) return;

        let badge = document.getElementById('appointmentsBadge');
        const pendingCount = appointments.filter(a => a.status === 'pending').length;

        if (pendingCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'appointmentsBadge';
                badge.className = 'appointments-count-badge';
                btnApp.appendChild(badge);
            }
            badge.innerText = pendingCount;
            badge.style.display = 'inline-block';
        } else {
            if (badge) badge.style.display = 'none';
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
