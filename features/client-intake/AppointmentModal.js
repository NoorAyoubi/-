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
            successToast: "🎉 تم إرسال طلب حجز الموعد بنجاح. سنتواصل معك لتأكيده!",
            alertDate: "يرجى تحديد التاريخ المفضل.",
            alertTime: "يرجى تحديد الوقت المفضل للموعد.",
            alertName: "يرجى إدخال اسمك الكريم.",
            alertPhone: "يرجى إدخال رقم هاتف محمول صحيح يتكون من 10 أرقام ويبدأ بـ 05.",
            selectPlaceholder: "-- يرجى اختيار صنف القضية --",
            alertCategory: "يرجى اختيار صنف القضية من القائمة المتاحة."
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
            successToast: "🎉 בקשת התור נשלחה בהצלחה! ניצור איתך קשר בהקדם.",
            alertDate: "נא לבחור תאריך לתור.",
            alertTime: "נא לבחור שעה מועדפת לתור.",
            alertName: "נא להזין שם מלא.",
            alertPhone: "נא להזין מספר טלפון נייד תקין בן 10 ספרות המתחיל ב-05.",
            selectPlaceholder: "-- נא לבחור סוג פנייה --",
            alertCategory: "נא לבחור את סוג התיק מהרשימה."
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
            successToast: "🎉 Appointment request submitted successfully! We will contact you to confirm.",
            alertDate: "Please select your preferred date.",
            alertTime: "Please select your preferred time slot.",
            alertName: "Please enter your name.",
            alertPhone: "Please enter a valid 10-digit mobile number starting with 05.",
            selectPlaceholder: "-- Please Select Case Category --",
            alertCategory: "Please choose a case category from the dropdown."
        }
    };

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
                            <input type="date" id="appointmentDate" class="appointment-input" required min="${new Date().toISOString().split('T')[0]}">
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
    }

    // Open Modal and pre-fill details from chatbot session
    function openAppointmentModal() {
        const overlay = document.getElementById('appointmentModal');
        if (!overlay) return;

        // Reset previous selections
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
        
        // Update links
        const navLink = document.getElementById('linkAppointment');
        if (navLink) navLink.innerText = t.linkText;
        
        const footLink = document.getElementById('footerAppointment');
        if (footLink) footLink.innerText = t.linkText;

        // Update Modal elements
        const title = document.getElementById('appointmentModalTitle');
        if (title) title.innerText = t.modalTitle;

        const dateLbl = document.getElementById('lblSelectDate');
        if (dateLbl) dateLbl.innerText = t.selectDate;

        const timeLbl = document.getElementById('lblSelectTime');
        if (timeLbl) timeLbl.innerText = t.selectTime;

        const nameLbl = document.getElementById('lblClientName');
        if (nameLbl) nameLbl.innerText = t.clientName;

        const phoneLbl = document.getElementById('lblClientPhone');
        if (phoneLbl) phoneLbl.innerText = t.clientPhone;

        const notesLbl = document.getElementById('lblClientNotes');
        if (notesLbl) notesLbl.innerText = t.clientNotes;

        const notesSelect = document.getElementById('appointmentNotes');
        if (notesSelect) {
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

        const submitBtn = document.getElementById('btnConfirmAppointment');
        if (submitBtn) submitBtn.innerText = t.btnSubmit;
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
        const phoneRegex = /^05\d-?\d{7}$/;
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

        // Close modal
        closeAppointmentModal();

        // Confetti celebration (uses global startCelebration or alert if not loaded)
        if (typeof startCelebration !== 'undefined') {
            startCelebration(t.successToast);
        } else {
            alert(t.successToast);
        }

        // Clear fields
        document.getElementById('appointmentForm').reset();
        selectedTimeSlot = '';
        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
    };
})();
