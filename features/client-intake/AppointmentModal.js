/* 📅 Isolated Appointment Booking Component for Client Intake */

(function() {
    // 1. Translations dictionary for Appointment Booking
    const appointmentTranslations = {
        ar: {
            linkText: "حجز موعد",
            modalTitle: "📅 طلب حجز موعد جديد",
            selectDate: "اختر التاريخ المفضل:",
            selectTime: "اختر وقت الحجز المتاح:",
            clientName: "الاسم الكريم:",
            clientPhone: "رقم الهاتف المحمول:",
            clientNotes: "خيارات لاختيار صنف القضية:",
            btnSubmit: "تأكيد طلب الموعد",
            btnCancelClose: "إلغاء وإغلاق",
            successToast: "سيتم مراجعتها من قبل مكتب المحاماه المختص خلال وقت قصير",
            alertDate: "يرجى تحديد التاريخ المفضل.",
            alertTime: "يرجى تحديد الوقت المفضل للموعد.",
            alertName: "يرجى إدخال اسمك الكريم.",
            alertPhone: "يرجى إدخال رقم هاتف محمول صحيح يتكون من 10 أرقام ويبدأ بـ 05.",
            selectPlaceholder: "-- يرجى اختيار صنف القضية --",
            alertCategory: "يرجى اختيار صنف القضية من القائمة المتاحة.",
            successTitle: "🎉 تم إرسال طلبك بنجاح!",
            addCalendarTitle: "📅 إضافة الموعد إلى تقويمك الخاص:",
            googleCalendar: "Google Calendar (جوجل)",
            outlookCalendar: "Outlook Calendar (أوتلوك)",
            appleCalendar: "Apple Calendar (أبل/آيفون)",
            btnCloseSuccess: "إغلاق النافذة"
        },
        he: {
            linkText: "קביעת תור",
            modalTitle: "📅 בקשת קביעת תור חדש",
            selectDate: "בחר תאריך מועדף:",
            selectTime: "בחר שעה פנויה:",
            clientName: "שם מלא:",
            clientPhone: "מספר טלפון נייד:",
            clientNotes: "אפשרויות לבחירת סוג התיק:",
            btnSubmit: "אישור בקשת תור",
            btnCancelClose: "ביטול וסגירה",
            successToast: "הבקשה תיבדק על ידי משרד עורכי הדין המוסמך תוך זמן קצר",
            alertDate: "נא לבחור תאריך לתור.",
            alertTime: "נא לבחור שעה מועדפת לתור.",
            alertName: "נא להזין שם מלא.",
            alertPhone: "נא להזין מספר טלפון נייד תקין בן 10 ספרות המתחיל ב-05.",
            selectPlaceholder: "-- נא לבחור סוג פנייה --",
            alertCategory: "נא לבחור את סוג התיק מהרשימה.",
            successTitle: "🎉 בקשתך נשלחה בהצלחה!",
            addCalendarTitle: "📅 הוסף את התור ללוח השנה שלך:",
            googleCalendar: "Google Calendar",
            outlookCalendar: "Outlook Calendar",
            appleCalendar: "Apple Calendar",
            btnCloseSuccess: "סגור חלון"
        },
        en: {
            linkText: "Book Appointment",
            modalTitle: "📅 Request New Appointment",
            selectDate: "Select Preferred Date:",
            selectTime: "Select Available Time Slot:",
            clientName: "Full Name:",
            clientPhone: "Mobile Phone Number:",
            clientNotes: "Options to select the case category:",
            btnSubmit: "Confirm Appointment Request",
            btnCancelClose: "Cancel & Close",
            successToast: "It will be reviewed by the specialized law firm shortly.",
            alertDate: "Please select your preferred date.",
            alertTime: "Please select your preferred time slot.",
            alertName: "Please enter your name.",
            alertPhone: "Please enter a valid 10-digit mobile number starting with 05.",
            selectPlaceholder: "-- Please Select Case Category --",
            alertCategory: "Please choose a case category from the dropdown.",
            successTitle: "🎉 Request Sent Successfully!",
            addCalendarTitle: "📅 Add to your Calendar:",
            googleCalendar: "Google Calendar",
            outlookCalendar: "Outlook Calendar",
            appleCalendar: "Apple Calendar",
            btnCloseSuccess: "Close Window"
        }
    };

    let selectedTimeSlot = '';
    let lastBookedDetails = null; // Store temp details to generate calendar files

    // Wait until document body is available
    if (document.body) {
        initAppointmentFeature();
    } else {
        document.addEventListener('DOMContentLoaded', initAppointmentFeature);
    }

    function initAppointmentFeature() {
        // Ensure we don't init twice
        if (document.getElementById('linkAppointment')) return;

        // 2. Insert links dynamically
        insertNavigationLinks();

        // 3. Create Modal DOM
        createModalDOM();

        // 4. Hook into Language Switching
        hookLanguageSwitching();

        // Initialize translations with current active language
        const initialLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        translateAppointmentUI(initialLang);
    }

    // Insert links into Navbar and Footer dynamically
    function insertNavigationLinks() {
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
                    <div id="appointmentModalBody">
                        <!-- Populated dynamically by renderFormInsideModal() -->
                    </div>
                </div>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        document.body.appendChild(tempDiv.firstElementChild);

        const closeBtn = document.getElementById('closeAppointmentBtn');
        if (closeBtn) closeBtn.onclick = closeAppointmentModal;

        const overlay = document.getElementById('appointmentModal');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) closeAppointmentModal();
            };
        }
    }

    // Render original booking form
    function renderFormInsideModal(lang) {
        const body = document.getElementById('appointmentModalBody');
        if (!body) return;

        const t = appointmentTranslations[lang] || appointmentTranslations.ar;

        body.innerHTML = `
            <h2 style="color: var(--accent-gold, #c5a880); margin-bottom: 24px; font-size: 1.4rem; font-weight: 700; text-align: center;" id="appointmentModalTitle">${t.modalTitle}</h2>
            
            <form id="appointmentForm" onsubmit="handleAppointmentSubmit(event)">
                <!-- Date selector -->
                <div class="appointment-form-group">
                    <label class="appointment-label" id="lblSelectDate">${t.selectDate}</label>
                    <input type="date" id="appointmentDate" class="appointment-input" required min="${new Date().toISOString().split('T')[0]}">
                </div>

                <!-- Time slot selector grid -->
                <div class="appointment-form-group">
                    <label class="appointment-label" id="lblSelectTime">${t.selectTime}</label>
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
                    <label class="appointment-label" id="lblClientName">${t.clientName}</label>
                    <input type="text" id="appointmentName" class="appointment-input" required placeholder="...">
                </div>

                <!-- Client Phone -->
                <div class="appointment-form-group">
                    <label class="appointment-label" id="lblClientPhone">${t.clientPhone}</label>
                    <input type="tel" id="appointmentPhone" class="appointment-input" required placeholder="05XXXXXXXX" pattern="^05\\d-?\\d{7}$">
                </div>

                <!-- Notes -->
                <div class="appointment-form-group">
                    <label class="appointment-label" id="lblClientNotes">${t.clientNotes}</label>
                    <select id="appointmentNotes" class="appointment-input" required>
                        <!-- Options populated dynamically -->
                    </select>
                </div>

                <!-- Submit -->
                <button type="submit" class="appointment-btn-submit" id="btnConfirmAppointment">${t.btnSubmit}</button>
            </form>
        `;

        // Prepopulate Case Category Select Dropdown
        populateSelectDropdown(lang);

        // Bind Slot buttons selection
        const slotButtons = document.querySelectorAll('.time-slot-btn');
        slotButtons.forEach(btn => {
            btn.onclick = () => {
                slotButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTimeSlot = btn.getAttribute('data-time');
                // Trigger change to validate filled state
                btn.dispatchEvent(new Event('change', { bubbles: true }));
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
            setTimeout(checkFilled, 150);
        });

        // Autofill details from chatbot session if available
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
    }

    // Populate Case Categories Dropdown Options
    function populateSelectDropdown(lang) {
        const notesSelect = document.getElementById('appointmentNotes');
        if (!notesSelect) return;

        const t = appointmentTranslations[lang] || appointmentTranslations.ar;
        const prevValue = notesSelect.value;
        const caseOptions = {
            ar: [
                "قضايا حوادث السير: (حوادث المركبات - حوادث الدهس - حوادث الدراجات النارية - مطالبات التأمين - التعويض عن أضرار المركبات - التعويض عن الإصابات الناتجة عن الحوادث - الوفاة الناتجة عن حوادث السير)",
                "قضايا الإصابات: (الإصابات الشخصية - إصابات العمل - الأخطاء الطبية - العجز المؤقت والدائم - التعويض عن الأضرار الجسدية - التعويض عن الأضرار المعنوية - فقدان القدرة على العمل)",
                "القضايا المدنية: (النزاعات المالية - العقود والالتزامات - التعويض عن الأضرار - الملكية والعقارات)",
                "القضايا الجنائية (الجزائية): (السرقة - الاحتيال - الاعتداء - الجرائم الإلكترونية - القضايا المتعلقة بالمخدرات وغيرها)",
                "قضايا الأحوال الشخصية (الأسرة): (الزواج والطلاق - النفقة - الحضانة - الميراث والوصايا)",
                "القضايا العمالية: (حقوق العامل وصاحب العمل - الفصل من العمل - الأجور والتعويضات)",
                "القضايا التجارية: (النزاعات بين الشركات - الأوراق التجارية - الإفلاس - الشراكات والعقود التجارية)",
                "القضايا الإدارية: (الطعون في القرارات الحكومية - المنازعات مع الجهات العامة)",
                "القضايا العقارية: (الملكية - الإيجارات - تسجيل الأراضي والحدود)"
            ],
            he: [
                "תביעות תאונות דרכים: (תאונות רכב - תאונות דריסה - תאונות אופנוע - תביעות ביטוח - פיצוי על נזקי רכב - פיצוי על פגיעות גוף מתאונות - מוות כתוצאה מתאונת דרכים)",
                "תביעות נזקי גוף ופציעות: (פציעות אישיות - תאונות עבודה - רשלנות רפואית - נכות זמנית וצמיתה - פיצוי על נזק גופני - פיצוי על נזק לא ממוני - אובדן כושר עבודה)",
                "תיקים אזרחיים: (סכסוכים כספיים - חוזים והתחייבויות - פיצוי בגין נזקים - בעלות ומקרקעין)",
                "תיקים פליליים: (גניבה - מרמה והונאה - תקיפה - פשעי סייבר - עבירות סמים ואחרות)",
                "מעמד אישי ומשפחה: (נישואין וגירושין - מזונות - משמורת ילדים - ירושות וצוואות)",
                "דיני עבודה: (זכויות עובדים ומעסיקים - פיטורין מהעבודה - שכר ופיצויים)",
                "תיקים מסחריים: (סכסוכים בין חברות - מסמכים סחירים - פשיטת רגל - שותפויות וחוזים מסחריים)",
                "תיקים מנהליים: (ערעור על החלטות ממשלה - סכסוכים עם גופים ציבוריים)",
                "תיקי מקרקעין ונדל\"ן: (בעלות - שכירות - רישום מקרקעין וגבולות)"
            ],
            en: [
                "Traffic Accidents: (Vehicle Accidents - Pedestrian Accidents - Motorcycle Accidents - Insurance Claims - Vehicle Damage Compensation - Injury Compensation - Fatal Road Accidents)",
                "Injury Claims: (Personal Injury - Work Injuries - Medical Malpractice - Temporary & Permanent Disability - Physical Damage Compensation - Moral Damage Compensation - Loss of Earning Capacity)",
                "Civil Cases: (Financial Disputes - Contracts & Obligations - Damage Compensation - Ownership & Real Estate)",
                "Criminal Cases: (Theft - Fraud - Assault - Cybercrimes - Drug Cases & Others)",
                "Family & Personal Status: (Marriage & Divorce - Alimony / Child Support - Child Custody - Inheritance & Wills)",
                "Labor & Employment: (Employee & Employer Rights - Wrongful Dismissal - Wages & Compensation)",
                "Commercial Cases: (Corporate Disputes - Commercial Papers - Bankruptcy - Partnerships & Commercial Contracts)",
                "Administrative Cases: (Appeals Against Government Decisions - Disputes with Public Entities)",
                "Real Estate Cases: (Property Ownership - Rentals / Leases - Land Registration & Boundaries)"
            ]
        };
        const list = caseOptions[lang] || caseOptions.ar;
        let optionsHtml = `<option value="" disabled selected>${t.selectPlaceholder}</option>`;
        optionsHtml += list.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        notesSelect.innerHTML = optionsHtml;
        if (prevValue && list.includes(prevValue)) {
            notesSelect.value = prevValue;
        }
    }

    // Open Modal and pre-fill details from chatbot session
    function openAppointmentModal() {
        const overlay = document.getElementById('appointmentModal');
        if (!overlay) return;

        // Reset previous slot selection state
        selectedTimeSlot = '';
        lastBookedDetails = null;

        // Always reload/reset default booking form in current active language
        const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        renderFormInsideModal(activeLang);

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

    // Hook language switcher
    function hookLanguageSwitching() {
        if (typeof applyLanguage !== 'undefined') {
            const originalApplyLang = applyLanguage;
            applyLanguage = function(lang) {
                originalApplyLang(lang);
                translateAppointmentUI(lang);
            };
        }
    }

    // Translate all appointment text blocks
    function translateAppointmentUI(lang) {
        const t = appointmentTranslations[lang] || appointmentTranslations.ar;
        
        // Update trigger links
        const navLink = document.getElementById('linkAppointment');
        if (navLink) navLink.innerText = t.linkText;
        
        const footerLink = document.getElementById('footerAppointment');
        if (footerLink) footerLink.innerText = t.linkText;

        // If success view is active, update the success view language, otherwise reload form
        const successView = document.getElementById('appointmentSuccessView');
        if (successView && lastBookedDetails) {
            renderSuccessView(lang, lastBookedDetails.date, lastBookedDetails.time);
        } else {
            renderFormInsideModal(lang);
        }
    }

    // Parse date and time slots to generate calendar ISO format (YYYYMMDDTHHmmSS)
    function parseCalendarDates(dateStr, timeStr) {
        const parts = timeStr.split(' ');
        const timeParts = parts[0].split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = parts[1];

        if (ampm === 'PM' && hours < 12) {
            hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }

        const pad = (n) => n < 10 ? '0' + n : n;
        const cleanDate = dateStr.replace(/-/g, '');
        const start = `${cleanDate}T${pad(hours)}${minutes}00`;

        let endHours = hours + 1;
        if (endHours >= 24) endHours = 0;
        const end = `${cleanDate}T${pad(endHours)}${minutes}00`;

        return { start, end };
    }

    // Trigger local ICS download for Outlook / Apple Calendar
    window.downloadAppointmentICS = function(dateStr, timeStr, lang) {
        const t = appointmentTranslations[lang] || appointmentTranslations.ar;
        const dates = parseCalendarDates(dateStr, timeStr);
        
        const summary = lang === 'he' ? 'פגישת ייעוץ משפטי' : (lang === 'en' ? 'Legal Consultation Appointment' : 'موعد استشارة قانونية');
        const desc = lang === 'he' ? 'פגישת ייעוץ במשרד עורכי הדין גשר ירושלים' : (lang === 'en' ? 'Consultation meeting at Jerusalem Legal Bridge law office' : 'جلسة استشارة في مكتب جسر القدس للمحاماة');

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Jerusalem Legal Bridge//NONSGML Calendar//EN",
            "BEGIN:VEVENT",
            `SUMMARY:${summary}`,
            `DESCRIPTION:${desc}`,
            `DTSTART:${dates.start}`,
            `DTEND:${dates.end}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'legal_appointment.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render the post-booking success screen inside the modal
    function renderSuccessView(lang, dateStr, timeStr) {
        const body = document.getElementById('appointmentModalBody');
        if (!body) return;

        const t = appointmentTranslations[lang] || appointmentTranslations.ar;
        const dates = parseCalendarDates(dateStr, timeStr);

        const summary = lang === 'he' ? 'פגישת ייעוץ משפטי' : (lang === 'en' ? 'Legal Consultation Appointment' : 'موعد استشارة قانونية');
        const desc = lang === 'he' ? 'פגישת ייעוץ במשרד עורכי הדין גשר ירושלים' : (lang === 'en' ? 'Consultation meeting at Jerusalem Legal Bridge law office' : 'جلسة استشارة في مكتب جسر القدس للمحاماة');

        // Google Calendar template link
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&dates=${dates.start}/${dates.end}&details=${encodeURIComponent(desc)}`;

        body.innerHTML = `
            <div id="appointmentSuccessView" style="text-align: center; padding: 10px 5px; direction: inherit;">
                <h2 style="font-size: 2.2rem; color: var(--accent-gold, #c5a880); margin-bottom: 12px; margin-top: 10px;">🎉</h2>
                <h3 style="color: #ffffff; font-size: 1.35rem; font-weight: bold; margin-bottom: 14px;">${t.successTitle}</h3>
                <p style="color: var(--text-secondary, #8e9297); font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
                    ⏱️ ${t.successToast}
                </p>
                
                <!-- Add to Calendar Container -->
                <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 20px; margin-bottom: 24px; text-align: right; direction: inherit;">
                    <label class="appointment-label" style="font-weight: bold; margin-bottom: 12px; display: block; text-align: inherit;">
                        ${t.addCalendarTitle}
                    </label>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                        <!-- Google Calendar -->
                        <a href="${googleUrl}" target="_blank" class="calendar-btn" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 16px; border-radius: 8px; color: #ffffff; display: flex; align-items: center; gap: 10px; text-decoration: none; font-size: 0.9rem; transition: background 0.2s, border 0.2s;">
                            <span style="color: var(--accent-gold, #c5a880); font-weight: bold;">📅</span> ${t.googleCalendar}
                        </a>
                        
                        <!-- Outlook Calendar -->
                        <a href="#" onclick="event.preventDefault(); downloadAppointmentICS('${dateStr}', '${timeStr}', '${lang}')" class="calendar-btn" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 16px; border-radius: 8px; color: #ffffff; display: flex; align-items: center; gap: 10px; text-decoration: none; font-size: 0.9rem; transition: background 0.2s, border 0.2s;">
                            <span style="color: var(--accent-gold, #c5a880); font-weight: bold;">📅</span> ${t.outlookCalendar}
                        </a>
                        
                        <!-- Apple Calendar -->
                        <a href="#" onclick="event.preventDefault(); downloadAppointmentICS('${dateStr}', '${timeStr}', '${lang}')" class="calendar-btn" style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 16px; border-radius: 8px; color: #ffffff; display: flex; align-items: center; gap: 10px; text-decoration: none; font-size: 0.9rem; transition: background 0.2s, border 0.2s;">
                            <span style="color: var(--accent-gold, #c5a880); font-weight: bold;">📅</span> ${t.appleCalendar}
                        </a>
                    </div>
                </div>
                
                <button class="appointment-btn-submit" id="btnCloseSuccessModal" style="margin-top: 10px;">${t.btnCloseSuccess}</button>
            </div>
        `;

        // Bind Close Success Button
        const closeSuccessBtn = document.getElementById('btnCloseSuccessModal');
        if (closeSuccessBtn) {
            closeSuccessBtn.onclick = closeAppointmentModal;
        }
    }

    // Submit handler
    window.handleAppointmentSubmit = function(e) {
        e.preventDefault();
        const activeLang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const t = appointmentTranslations[activeLang] || appointmentTranslations.ar;

        const dateVal = document.getElementById('appointmentDate').value;
        const nameVal = document.getElementById('appointmentName').value.trim();
        const phoneVal = document.getElementById('appointmentPhone').value.trim();
        const notesVal = document.getElementById('appointmentNotes').value.trim();

        // Validate
        if (!dateVal) {
            alert(t.alertDate);
            return;
        }
        if (!selectedTimeSlot) {
            alert(t.alertTime);
            return;
        }
        if (!notesVal) {
            alert(t.alertCategory);
            return;
        }
        if (!nameVal) {
            alert(t.alertName);
            return;
        }
        const phoneRegex = /^05\d-?\\d{7}$/;
        if (!phoneRegex.test(phoneVal)) {
            alert(t.alertPhone);
            return;
        }

        // Save appointment
        let appointments = JSON.parse(localStorage.getItem('jlm_appointment_requests') || '[]');
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
        appointments.push(newAppointment);
        localStorage.setItem('jlm_appointment_requests', JSON.stringify(appointments));

        // Save last booked details globally for language switches
        lastBookedDetails = {
            date: dateVal,
            time: selectedTimeSlot
        };

        // Render success calendar screen in modal body
        renderSuccessView(activeLang, dateVal, selectedTimeSlot);

        // Confetti celebration (uses global startCelebration or alert if not loaded)
        if (typeof startCelebration !== 'undefined') {
            startCelebration("🎉");
        }
    };
})();
