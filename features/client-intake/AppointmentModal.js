/**
 * 📅 AppointmentModal.js - Isolated Appointment Booking Component for Client Intake
 * Rebuilt to use JLM.TranslationService and JLM.StorageService.
 */
(function() {
    let selectedTimeSlot = '';

    // Wait until document body is available
    if (document.body) {
        initAppointmentFeature();
    } else {
        document.addEventListener('DOMContentLoaded', initAppointmentFeature);
    }

    function initAppointmentFeature() {
        // Ensure we don't init twice
        if (document.getElementById('linkAppointment')) return;

        // 1. Insert links dynamically
        insertNavigationLinks();

        // 2. Create Modal DOM
        createModalDOM();

        // 3. Hook into Language Switching pub-sub
        if (window.JLM && window.JLM.TranslationService) {
            window.JLM.TranslationService.onLanguageChange((lang) => {
                translateAppointmentUI(lang);
            });
            // Initial translation
            translateAppointmentUI(window.JLM.TranslationService.getLanguage());
        } else {
            translateAppointmentUI('ar');
        }
    }

    // Insert links into Navbar and Footer dynamically
    function insertNavigationLinks() {
        // Navbar link
        const navLinks = document.querySelector('.nav-links');
        const switcher = document.getElementById('langSelectorLanding');
        
        if (navLinks && switcher) {
            const link = document.createElement('a');
            link.href = '#';
            link.id = 'linkAppointment';
            link.className = 'nav-appointment-link';
            link.style.marginRight = '8px';
            link.style.marginLeft = '8px';
            link.style.fontWeight = '500';
            link.onclick = (e) => {
                e.preventDefault();
                openAppointmentModal();
            };
            navLinks.insertBefore(link, switcher);
        }

        // Footer link
        const footerLinks = document.querySelector('.footer-links');
        if (footerLinks) {
            const fLink = document.createElement('a');
            fLink.href = '#';
            fLink.id = 'footerAppointment';
            fLink.onclick = (e) => {
                e.preventDefault();
                openAppointmentModal();
            };
            footerLinks.appendChild(fLink);
        }
    }

    // Create Modal HTML elements in DOM
    function createModalDOM() {
        const modalHtml = `
            <div class="appointment-modal-overlay" id="appointmentModal">
                <div class="appointment-modal-content">
                    <button class="appointment-close-btn" id="closeAppointmentBtn">&times;</button>
                    <h2 style="color: var(--accent-gold, #c5a880); margin-bottom: 24px; font-size: 1.4rem; font-weight: 700; text-align: center;" id="appointmentModalTitle">📅 طلب حجز موعد جديد</h2>
                    
                    <form id="appointmentForm" onsubmit="handleAppointmentSubmit(event)">
                        <!-- Date selector -->
                        <div class="appointment-form-group">
                            <label class="appointment-label" id="lblSelectDate">اختر التاريخ المفضل:</label>
                            <div style="position: relative; width: 100%;">
                                <input type="text" id="appointmentDate" class="appointment-input" required placeholder="YYYY-MM-DD" style="padding-right: 40px; padding-left: 12px; direction: ltr; text-align: left;">
                                <div class="custom-calendar-icon" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c5a880" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <input type="date" id="appointmentDateHelper" min="${new Date().toISOString().split('T')[0]}" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; padding: 0;">
                                </div>
                            </div>
                        </div>

                        <!-- Time slot selector grid -->
                        <div class="appointment-form-group">
                            <label class="appointment-label" id="lblSelectTime">اختر وقت الحجز المتاح:</label>
                            <div class="time-slots-grid">
                                <button type="button" class="time-slot-btn" data-time="09:00 AM">09:00 AM</button>
                                <button type="button" class="time-slot-btn" data-time="10:00 AM">10:00 AM</button>
                                <button type="button" class="time-slot-btn" data-time="11:00 AM">11:00 AM</button>
                                <button type="button" class="time-slot-btn" data-time="12:00 PM">12:00 PM</button>
                                <button type="button" class="time-slot-btn" data-time="02:00 PM">02:00 PM</button>
                                <button type="button" class="time-slot-btn" data-time="03:00 PM">03:00 PM</button>
                                <button type="button" class="time-slot-btn" data-time="04:00 PM">04:00 PM</button>
                            </div>
                        </div>

                        <!-- Client Name -->
                        <div class="appointment-form-group">
                            <label class="appointment-label" id="lblClientName">الاسم الكريم:</label>
                            <input type="text" id="appointmentName" class="appointment-input" required placeholder="...">
                        </div>

                        <!-- Client Phone -->
                        <div class="appointment-form-group">
                            <label class="appointment-label" id="lblClientPhone">رقم الهاتف المحمول:</label>
                            <input type="tel" id="appointmentPhone" class="appointment-input" required placeholder="05XXXXXXXX" pattern="^05\\d-?\\d{7}$">
                        </div>

                        <!-- Notes -->
                        <div class="appointment-form-group">
                            <label class="appointment-label" id="lblClientNotes">خيارات لاختيار صنف القضية:</label>
                            <select id="appointmentNotes" class="appointment-input" required>
                                <!-- Options will be dynamically populated/translated -->
                            </select>
                        </div>

                        <!-- Submit -->
                        <button type="submit" class="appointment-btn-submit" id="btnConfirmAppointment">تأكيد طلب الموعد</button>
                    </form>
                </div>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        document.body.appendChild(tempDiv.firstElementChild);

        // Bind events
        const closeBtn = document.getElementById('closeAppointmentBtn');
        const overlay = document.getElementById('appointmentModal');
        
        if (closeBtn) {
            closeBtn.onclick = closeAppointmentModal;
        }
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) closeAppointmentModal();
            };
        }

        // Handle Slot buttons selection
        const slotButtons = document.querySelectorAll('.time-slot-btn');
        slotButtons.forEach(btn => {
            btn.onclick = () => {
                slotButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTimeSlot = btn.getAttribute('data-time');
            };
        });

        // Bind form input filled/glow listeners
        const formInputs = document.querySelectorAll('.appointment-input');
        formInputs.forEach(input => {
            const checkFilled = () => {
                if (input.value && input.value !== "") {
                    input.classList.add('filled');
                } else {
                    input.classList.remove('filled');
                }
            };
            input.addEventListener('input', checkFilled);
            input.addEventListener('change', checkFilled);
            // Run initial check
            setTimeout(checkFilled, 150);
        });

        // Bind calendar helper date picker to visible text input
        const dateInput = document.getElementById('appointmentDate');
        const dateHelper = document.getElementById('appointmentDateHelper');
        if (dateInput && dateHelper) {
            dateHelper.addEventListener('change', () => {
                if (dateHelper.value) {
                    dateInput.value = dateHelper.value;
                    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    }

    // Open Modal and pre-fill details from chatbot session
    function openAppointmentModal() {
        const overlay = document.getElementById('appointmentModal');
        if (!overlay) return;

        // Scroll modal content back to the top
        const modalContent = document.querySelector('.appointment-modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }

        // Reset form inputs completely
        const form = document.getElementById('appointmentForm');
        if (form) {
            form.reset();
            // Clear filled glow states
            const inputs = form.querySelectorAll('.appointment-input');
            inputs.forEach(input => {
                input.classList.remove('filled');
                input.dispatchEvent(new Event('change'));
            });
        }

        // Reset time slot selections
        selectedTimeSlot = '';
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
        
        // Populate client name & phone if available from global state
        if (typeof state !== 'undefined') {
            const nameField = document.getElementById('appointmentName');
            const phoneField = document.getElementById('appointmentPhone');
            
            if (nameField && state.clientName) {
                nameField.value = state.clientName;
                nameField.dispatchEvent(new Event('change'));
            }
            if (phoneField && state.clientPhone) {
                phoneField.value = state.clientPhone;
                phoneField.dispatchEvent(new Event('change'));
            }
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAppointmentModal() {
        const overlay = document.getElementById('appointmentModal');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Translate all appointment text blocks
    function translateAppointmentUI(lang) {
        const getT = (key) => {
            if (window.JLM && window.JLM.TranslationService) {
                return window.JLM.TranslationService.get(key);
            }
            return key;
        };

        // Update links
        const navLink = document.getElementById('linkAppointment');
        if (navLink) navLink.innerText = getT('appLinkText');
        
        const footLink = document.getElementById('footerAppointment');
        if (footLink) footLink.innerText = getT('appLinkText');

        // Update Modal elements
        const title = document.getElementById('appointmentModalTitle');
        if (title) title.innerText = getT('appModalTitle');

        const dateInput = document.getElementById('appointmentDate');
        const dateHelper = document.getElementById('appointmentDateHelper');
        if (dateInput) {
            dateInput.style.textAlign = (lang === 'en') ? 'left' : 'right';
        }
        if (dateHelper) {
            dateHelper.setAttribute('lang', lang === 'he' ? 'he' : (lang === 'en' ? 'en' : 'ar'));
        }

        const dateLbl = document.getElementById('lblSelectDate');
        if (dateLbl) dateLbl.innerText = getT('appSelectDate');

        const timeLbl = document.getElementById('lblSelectTime');
        if (timeLbl) timeLbl.innerText = getT('appSelectTime');

        const nameLbl = document.getElementById('lblClientName');
        if (nameLbl) nameLbl.innerText = getT('appClientName');

        const phoneLbl = document.getElementById('lblClientPhone');
        if (phoneLbl) phoneLbl.innerText = getT('appClientPhone');

        const notesLbl = document.getElementById('lblClientNotes');
        if (notesLbl) notesLbl.innerText = getT('appClientNotes');

        const notesSelect = document.getElementById('appointmentNotes');
        if (notesSelect) {
            const prevValue = notesSelect.value;
            const list = getT('appCaseOptions') || [];
            let optionsHtml = `<option value="" disabled selected>${getT('appSelectPlaceholder')}</option>`;
            optionsHtml += list.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            notesSelect.innerHTML = optionsHtml;
            if (prevValue && list.includes(prevValue)) {
                notesSelect.value = prevValue;
            }
        }

        const submitBtn = document.getElementById('btnConfirmAppointment');
        if (submitBtn) submitBtn.innerText = getT('appBtnSubmit');
    }

    // Submit handler
    window.handleAppointmentSubmit = function(e) {
        e.preventDefault();
        
        const getT = (key) => {
            if (window.JLM && window.JLM.TranslationService) {
                return window.JLM.TranslationService.get(key);
            }
            return key;
        };

        const activeLang = (window.JLM && window.JLM.TranslationService) ? window.JLM.TranslationService.getLanguage() : 'ar';

        const dateVal = document.getElementById('appointmentDate').value;
        const nameVal = document.getElementById('appointmentName').value.trim();
        const phoneVal = document.getElementById('appointmentPhone').value.trim();
        const notesVal = document.getElementById('appointmentNotes').value.trim();

        // Validate
        if (!dateVal) {
            alert(getT('appAlertDate'));
            return;
        }
        if (!selectedTimeSlot) {
            alert(getT('appAlertTime'));
            return;
        }
        if (!notesVal) {
            alert(getT('appAlertCategory'));
            return;
        }
        if (!nameVal) {
            alert(getT('appAlertName'));
            return;
        }
        const phoneRegex = /^05\d-?\d{7}$/;
        if (!phoneRegex.test(phoneVal)) {
            alert(getT('appAlertPhone'));
            return;
        }

        // Save appointment using JLM.StorageService
        const newAppointment = {
            id: Date.now(),
            name: nameVal,
            phone: phoneVal,
            date: dateVal,
            time: selectedTimeSlot,
            notes: notesVal || '---',
            status: 'pending',
            lang: activeLang
        };

        if (window.JLM && window.JLM.StorageService) {
            window.JLM.StorageService.saveAppointment(newAppointment);
        } else {
            // Fallback if not loaded
            let appointments = JSON.parse(localStorage.getItem('jlm_appointment_requests') || '[]');
            appointments.push(newAppointment);
            localStorage.setItem('jlm_appointment_requests', JSON.stringify(appointments));
        }

        // Close modal
        closeAppointmentModal();

        // Confetti celebration (uses global startCelebration or alert if not loaded)
        if (typeof startCelebration !== 'undefined') {
            startCelebration(getT('appSuccessToast'));
        } else {
            alert(getT('appSuccessToast'));
        }

        // Clear fields
        document.getElementById('appointmentForm').reset();
        const dateInput = document.getElementById('appointmentDate');
        const dateHelper = document.getElementById('appointmentDateHelper');
        if (dateInput) dateInput.dispatchEvent(new Event('change'));
        if (dateHelper) dateHelper.value = '';
        selectedTimeSlot = '';
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
    };
})();
