/**
 * 📅 AppointmentDashboard.js - Isolated Appointment Booking Dashboard Component
 * Rebuilt using Clean Code & SOLID principles:
 * - Uses shared JLM.TranslationService and JLM.StorageService.
 * - Monkey-patching of global functions eliminated in favor of clean callbacks.
 * - Centralized LocalStorage keys.
 */
(function() {
    // Shared aliases
    const Storage = window.JLM.StorageService;
    const Translate = window.JLM.TranslationService;

    let knownAppointmentIds = new Set();
    let isFirstApptLoad = true;

    function triggerAppointmentNotification(appt) {
        if (!("Notification" in window)) return;
        
        const showNotification = () => {
            if (typeof playChime === 'function') playChime();
            
            const activeLang = Translate.getLanguage();
            const title = "🔔 Lawyer AI";
            
            const bodyText = activeLang === 'he' ? `פנייה חדשה\nהתקבל תור חדש מ:\n${appt.name}\n(${appt.date} - ${appt.time})` : 
                            (activeLang === 'en' ? `New Request\nNew appointment request from:\n${appt.name}\n(${appt.date} - ${appt.time})` : 
                            `طلب جديد\nوصلك طلب موعد جديد من:\n${appt.name}\n(${appt.date} - ${appt.time})`);
            
            const options = {
                body: bodyText,
                requireInteraction: true
            };
            const n = new Notification(title, options);
            n.onclick = function() {
                window.focus();
                const btnLeads = document.getElementById('btnLeads');
                const leadsSection = document.getElementById('leadsSection');
                if (btnLeads && leadsSection && typeof switchTab === 'function') {
                    switchTab(btnLeads, leadsSection);
                }
                n.close();
            };
        };
        
        if (Notification.permission === "granted") {
            showNotification();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showNotification();
                }
            });
        }
    }

    // Wait until document body is available
    if (document.body) {
        initAppointmentDashboard();
    } else {
        document.addEventListener('DOMContentLoaded', initAppointmentDashboard);
    }

    function initAppointmentDashboard() {
        const leadsSec = document.getElementById('leadsSection');
        if (!leadsSec) {
            setTimeout(initAppointmentDashboard, 100);
            return;
        }

        // 1. Create Section HTML structure inside leadsSection
        insertSectionContainer();

        // 2. Subscribe to Translate changes
        Translate.onLanguageChange((lang) => {
            translateDashboardUI(lang);
            renderAppointmentsTable();
        });

        // Initial translation & render
        translateDashboardUI(Translate.getLanguage());
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

    // Translate UI
    function translateDashboardUI(lang) {
        // Section Title
        const secTitle = document.getElementById('appointmentsSectionTitle');
        if (secTitle) {
            const titleSpan = secTitle.querySelector('span');
            if (titleSpan) titleSpan.innerText = Translate.get('appointmentsSectionTitle');
        }

        // Table headers
        const headRow = document.getElementById('appointmentsTableHead');
        if (headRow) {
            headRow.innerHTML = `
                <th>${Translate.get('apptColName')}</th>
                <th>${Translate.get('apptColPhone')}</th>
                <th>${Translate.get('apptColDate')}</th>
                <th>${Translate.get('apptColTime')}</th>
                <th>${Translate.get('apptColNotes')}</th>
                <th style="text-align: center;">${Translate.get('apptColStatus')}</th>
                <th>${Translate.get('apptColAction')}</th>
            `;
        }
    }

    // Render Table rows
    function renderAppointmentsTable() {
        const tableBody = document.getElementById('appointmentsTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const appointments = Storage.getAppointments();

        // Check for new appointments to trigger notifications
        if (!isFirstApptLoad) {
            appointments.forEach(app => {
                if (app.status === 'pending' && !knownAppointmentIds.has(app.id)) {
                    triggerAppointmentNotification(app);
                }
            });
        }
        knownAppointmentIds = new Set(appointments.map(a => a.id));
        isFirstApptLoad = false;

        // Update counts badge combined with leads badge
        updatePendingAppointmentsBadge(appointments);

        if (appointments.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 24px;">${Translate.get('emptyAppointments')}</td></tr>`;
            return;
        }

        // Render rows
        appointments.forEach(app => {
            const tr = document.createElement('tr');
            
            // Status markup
            let statusText = Translate.get('apptStatusPending');
            let statusStyle = 'color: var(--text-secondary);';
            if (app.status === 'approved') {
                statusText = Translate.get('apptStatusApproved');
                statusStyle = 'color: #c5a880; font-weight: bold;';
            }

            // Action Buttons
            let actionButtons = '';
            if (app.status === 'pending') {
                actionButtons = `
                    <button class="btn-table-action" onclick="approveAppointment(${app.id})">${Translate.get('apptBtnApprove')}</button>
                    <button class="btn-table-action" onclick="deleteAppointment(${app.id})" style="background-color: #ef4444; color: white !important; margin-left: 5px; margin-right: 5px;">${Translate.get('apptBtnReject')}</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn-table-action" onclick="deleteAppointment(${app.id})" style="background-color: #ef4444; color: white !important;">${Translate.get('apptBtnReject')}</button>
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
            const pendingLeadsCount = Storage.getSubmissions().filter(item => !item.processed).length;
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
                badgeSpan.innerText = Translate.getLanguage() === 'he' ? `${pendingAppointmentsCount} ממתינים` : (Translate.getLanguage() === 'en' ? `${pendingAppointmentsCount} pending` : `${pendingAppointmentsCount} معلّق`);
                secTitle.appendChild(badgeSpan);
            }
        }
    }

    // Expose functions globally for table buttons onclicks
    window.renderAppointmentsTable = renderAppointmentsTable;

    window.approveAppointment = function(id) {
        if (confirm(Translate.get('apptConfirmApprove'))) {
            Storage.updateAppointment(id, { status: 'approved' });
            renderAppointmentsTable();

            if (typeof startCelebration !== 'undefined') {
                startCelebration(Translate.get('apptApproveSuccess'));
            } else {
                alert(Translate.get('apptApproveSuccess'));
            }
        }
    };

    window.deleteAppointment = function(id) {
        if (confirm(Translate.get('apptConfirmDelete'))) {
            const appointments = Storage.getAppointments();
            const appt = appointments.find(a => a.id == id);

            if (appt) {
                // Add to JLM.StorageService submissions as processed (archived client)
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
                    processed: true,
                    submissionLang: leadLang
                };
                
                Storage.saveSubmission(newLead);
                
                // Trigger reload of the main dashboard tables
                if (window.JLM.LawyerDashboardController && typeof window.JLM.LawyerDashboardController.loadSubmissions === 'function') {
                    window.JLM.LawyerDashboardController.loadSubmissions();
                }
            }

            // Delete appointment
            Storage.deleteAppointment(id);
            renderAppointmentsTable();

            if (typeof startCelebration !== 'undefined') {
                startCelebration(Translate.get('apptDeleteSuccess'));
            } else {
                alert(Translate.get('apptDeleteSuccess'));
            }
        }
    };
})();
