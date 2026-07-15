/**
 * ⚖️ lawyer_app.js - Lawyer Dashboard Controller Logic
 * Rebuilt using Clean Code & SOLID principles:
 * - Namespace pattern (window.JLM)
 * - Decoupled shared services (StorageService, TranslationService, UIHelper)
 * - Brittle monkeys-patches removed in favor of clean pub-sub events
 * - Clear separation of DOM and logic concerns
 */
(function() {
    // Shared aliases
    const UI = window.JLM.UIHelper;
    const Storage = window.JLM.StorageService;
    const Translate = window.JLM.TranslationService;

    // References to DOM elements
    let leadsTableBody = null;
    let archiveTableBody = null;
    let detailModal = null;
    let modalDetailsBody = null;
    let closeModalBtn = null;

    let btnLeads = null;
    let btnArchive = null;
    let btnSettings = null;

    let leadsSection = null;
    let archiveSection = null;
    let settingsSection = null;

    // Track active state
    let knownSubmissionIds = new Set();
    let isFirstLoad = true;
    let isModalTranslated = false;
    let currentActiveLeadId = null;

    // Translation helper database for mock translations
    const translationDatabase = {
        "صدمة من الخلف أثناء التوقف عند الإشارة الضوئية.": {
            he: "פגיעה מאחור בזמן עצירה ברמזור.",
            en: "Rear-end collision while stopped at a red light."
        },
        "كنت أقود السيارة متوجهاً إلى عملي في الصباح الباكر.": {
            he: "נסעתי במכונית בדרכי לעבודה בשעות הבוקר המוקדמות.",
            en: "I was driving to work early in the morning."
        },
        "سقوط لوح خشبي ثقيل على القدم بسبب خلل في الرافعة.": {
            he: "נפילת לוח עץ כבד על הרגל עקב תקלה במנוף.",
            en: "A heavy wooden plank fell on the foot due to a crane malfunction."
        },
        "كنت أقف بجوار منطقة التحميل في الورشة استعداداً لنقل الأخشاب.": {
            he: "עמדתי ליד אזור הטעינה בבית המלאכה כהכנה להעברת עצים.",
            en: "I was standing near the loading area in the workshop preparing to move wood."
        }
    };

    function getMockTranslation(text, targetLang) {
        if (!text) return "";
        if (translationDatabase[text] && translationDatabase[text][targetLang]) {
            return translationDatabase[text][targetLang];
        }
        
        // Fallback for custom user inputs
        if (targetLang === 'he') {
            return `[תרגום AI סימולטני]: פניית לקוח מנוסחת בערבית: "${text}". נראה כי המקרה מתאר פגיעה בגוף במהלך העבודה או תאונה. מומלץ ליצור קשר מיידי עם הלקוח.`;
        }
        if (targetLang === 'en') {
            return `[AI Translation]: Client submission original text: "${text}". The case appears to describe a personal injury or work-related accident. Direct contact with client is recommended.`;
        }
        if (targetLang === 'ar') {
            return `[ترجمة AI]: النص الأصلي للعميل: "${text}". يرجى التواصل مباشرة مع العميل لمتابعة تفاصيل القضية.`;
        }
        return text;
    }

    // Category translator helper
    function translateCategory(cat, lang) {
        if (!cat) return "";
        if (lang === 'ar') return cat;
        if (cat.includes('حادث سير') || cat.includes('Road') || cat.includes('תאונת דרכים')) {
            return lang === 'he' ? "🚗 תאונת דרכים / תנועה" : "🚗 Road / Traffic Accident";
        }
        if (cat.includes('إصابة عمل') || cat.includes('Work') || cat.includes('תאונת עבודה')) {
            return lang === 'he' ? "🛠️ תאונת עבודה / מפעל" : "🛠️ Work Injury / Factory";
        }
        return cat;
    }

    function translateLocation(loc, lang) {
        if (!loc) return "";
        if (lang === 'ar') return loc;
        if (loc.includes('إسرائيلية') || loc.includes('Israeli') || loc.includes('ישראלי')) {
            return lang === 'he' ? "📍 אזור ישראלי (חוק הפיצויים)" : "📍 Israeli Jurisdiction (Israeli Law)";
        }
        if (loc.includes('الضفة') || loc.includes('West Bank') || loc.includes('יהודה ושומרון')) {
            return lang === 'he' ? "📍 אזור יהודה ושומרון (חוק פלסטיני)" : "📍 West Bank Jurisdiction (Palestinian Law)";
        }
        return loc;
    }

    function translateNegligence(neg, lang) {
        if (!neg) return "";
        if (lang === 'ar') return neg;
        if (neg.includes('لا ينطبق') || neg.includes('Not applicable') || neg.includes('לא רלוונטי')) {
            return lang === 'he' ? "לא רלוונטי / לא ينطبق" : "Not applicable";
        }
        if (neg.includes('نعم') || neg.includes('Yes') || neg.includes('כן')) {
            return lang === 'he' ? "כן, קיים גורם שלישי אחראי" : "Yes, there is a third-party liable";
        }
        return neg;
    }

    function parseDateSent(dateStr) {
        if (!dateStr) return new Date();
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        const iso = Date.parse(dateStr);
        if (!isNaN(iso)) return new Date(iso);
        return new Date();
    }

    // Gmail-style Date and Time formatter
    function formatGmailDate(lead, lang) {
        let date = null;
        if (lead.id && lead.id > 1000000000000) {
            date = new Date(lead.id);
        } else {
            date = parseDateSent(lead.dateSent);
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffMs = today - targetDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = `${hours}:${minutes} ${ampm}`;
        
        if (diffDays === 0) {
            const todayLabel = lang === 'he' ? 'היום' : (lang === 'en' ? 'Today' : 'اليوم');
            return `${todayLabel}، ${timeStr}`;
        } else if (diffDays === 1) {
            const yesterdayLabel = lang === 'he' ? 'אתמול' : (lang === 'en' ? 'Yesterday' : 'أمس');
            return `${yesterdayLabel}، ${timeStr}`;
        } else if (diffDays > 1 && diffDays < 7 && targetDate.getDay() <= today.getDay()) {
            const dayNames = {
                ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                he: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'],
                en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            };
            const list = dayNames[lang] || dayNames.ar;
            return `${list[date.getDay()]}، ${timeStr}`;
        } else {
            const monthNames = {
                ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                he: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'],
                en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            };
            const mList = monthNames[lang] || monthNames.ar;
            return `${date.getDate()} ${mList[date.getMonth()]}، ${timeStr}`;
        }
    }

    // Expose controller globally
    window.JLM.LawyerDashboardController = {
        init: function() {
            // Get DOM element references
            leadsTableBody = document.getElementById('leadsTableBody');
            archiveTableBody = document.getElementById('archiveTableBody');
            detailModal = document.getElementById('detailModal');
            modalDetailsBody = document.getElementById('modalDetailsBody');
            closeModalBtn = document.getElementById('closeModalBtn');

            btnLeads = document.getElementById('btnLeads');
            btnArchive = document.getElementById('btnArchive');
            btnSettings = document.getElementById('btnSettings');

            leadsSection = document.getElementById('leadsSection');
            archiveSection = document.getElementById('archiveSection');
            settingsSection = document.getElementById('settingsSection');

            // Initialize translations with auto detection
            const activeLang = Translate.detectLanguage(['ar', 'he', 'en'], 'ar');
            Translate.init(translations, activeLang);
            Translate.setLanguage(activeLang);

            // Bind click handlers
            this.bindEvents();

            // Subscribe to language changes
            Translate.onLanguageChange((lang) => {
                this.applyLanguageUI(lang);
            });

            // Initial load of submissions and setup UI
            this.loadSubmissions();
            this.applyLanguageUI(Translate.getLanguage());

            // Polling interval for live updates from other tabs
            setInterval(() => this.loadSubmissions(), 3000);

            // Listen to browser storage changes for instant synchronization
            window.addEventListener('storage', (e) => {
                if (e.key === 'jlm_legal_submissions') {
                    this.loadSubmissions();
                } else if (e.key === 'jlm_appointment_requests') {
                    if (typeof renderAppointmentsTable === 'function') {
                        renderAppointmentsTable();
                    }
                }
            });

            // Request permission safely
            this.initDesktopNotificationPermissions();
        },

        bindEvents: function() {
            // Tabs switching logic
            const switchTab = (activeBtn, showSection) => {
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
                    btn.classList.remove('active');
                });
                activeBtn.classList.add('active');
                
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    Array.from(mainContent.children).forEach(child => {
                        if (child.id && child.id.endsWith('Section')) {
                            child.style.display = 'none';
                        }
                    });
                }
                
                showSection.style.display = 'block';
            };

            // Expose globally so dynamically injected sections (Outlook, Pomodoro) can switch tabs
            window.switchTab = switchTab;

            if (btnLeads && leadsSection) {
                btnLeads.onclick = (e) => { e.preventDefault(); switchTab(btnLeads, leadsSection); };
            }
            if (btnArchive && archiveSection) {
                btnArchive.onclick = (e) => { e.preventDefault(); switchTab(btnArchive, archiveSection); };
            }
            if (btnSettings && settingsSection) {
                btnSettings.onclick = (e) => { e.preventDefault(); switchTab(btnSettings, settingsSection); };
            }

            // Lang capsule switcher
            const langBtns = document.querySelectorAll('#langSelectorDashboard .lang-btn');
            langBtns.forEach(btn => {
                btn.onclick = () => {
                    const lang = btn.getAttribute('data-lang');
                    Translate.setLanguage(lang);
                };
            });

            // Close modal button
            if (closeModalBtn) {
                closeModalBtn.onclick = () => detailModal.classList.remove('active');
            }
            if (detailModal) {
                detailModal.onclick = (e) => {
                    if (e.target === detailModal) detailModal.classList.remove('active');
                };
            }
        },

        applyLanguageUI: function(lang) {
            // Highlight active button
            const btns = document.querySelectorAll('#langSelectorDashboard .lang-btn');
            btns.forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Translate welcome stats banner
            UI.safeSetText('txtLawyerGreeting', Translate.get('txtLawyerGreeting'));
            UI.safeSetText('txtMotivationQuote', Translate.get('txtMotivationQuote'));
            UI.safeSetText('txtStatPending', Translate.get('txtStatPending'));
            UI.safeSetText('txtStatProcessed', Translate.get('txtStatProcessed'));
            UI.safeSetText('txtStatHelped', Translate.get('txtStatHelped'));

            // Update document title & dashboard elements
            document.title = Translate.get('title');

            const sTitle = document.querySelector('.sidebar-title');
            if (sTitle) sTitle.innerText = Translate.get('sidebarTitle');

            if (btnLeads) {
                // Keep the badge if it exists
                const badge = document.getElementById('leadsBadge');
                btnLeads.innerText = Translate.get('btnLeads');
                if (badge) btnLeads.appendChild(badge);
            }
            if (btnArchive) btnArchive.innerText = Translate.get('btnArchive');
            if (btnSettings) btnSettings.innerText = Translate.get('btnSettings');

            const leadsSecTitle = document.querySelector('#leadsSection .dashboard-title');
            if (leadsSecTitle) leadsSecTitle.innerText = Translate.get('leadsSectionTitle');
            const archiveSecTitle = document.querySelector('#archiveSection .dashboard-title');
            if (archiveSecTitle) archiveSecTitle.innerText = Translate.get('archiveSectionTitle');
            const settingsSecTitle = document.querySelector('#settingsSection .dashboard-title');
            if (settingsSecTitle) settingsSecTitle.innerText = Translate.get('settingsSectionTitle');

            const settingsCard = document.querySelector('#settingsSection .feature-card');
            if (settingsCard) {
                const h3 = settingsCard.querySelector('h3');
                if (h3) h3.innerText = Translate.get('settingsHeading');
                const p = settingsCard.querySelector('p');
                if (p) p.innerText = Translate.get('settingsDesc');
                const btn = settingsCard.querySelector('button');
                if (btn) btn.innerText = Translate.get('resetBtn');
            }

            const modalHeaderTitle = document.querySelector('#detailModal .modal-header-title');
            if (modalHeaderTitle) modalHeaderTitle.innerText = Translate.get('modalTitle');

            // Table headers
            this.updateTableHeaders();

            // Rerender table
            this.loadSubmissions();

            // Refresh permission banners
            this.checkNotificationPermissionAndShowBanner();
        },

        updateTableHeaders: function() {
            const lHead = document.querySelector('#leadsSection table thead tr');
            if (lHead) {
                lHead.innerHTML = `
                    <th>${Translate.get('colName')}</th>
                    <th>${Translate.get('colPhone')}</th>
                    <th>${Translate.get('colCategory')}</th>
                    <th style="text-align: center;">${Translate.get('colProcessed')}</th>
                    <th>${Translate.get('colSummary')}</th>
                    <th>${Translate.get('colDate')}</th>
                    <th>${Translate.get('colAction')}</th>
                `;
            }
            const aHead = document.querySelector('#archiveSection table thead tr');
            if (aHead) {
                aHead.innerHTML = `
                    <th>${Translate.get('colName')}</th>
                    <th>${Translate.get('colPhone')}</th>
                    <th>${Translate.get('colCategory')}</th>
                    <th style="text-align: center;">${Translate.get('colArchiveStatus')}</th>
                    <th>${Translate.get('colSummary')}</th>
                    <th>${Translate.get('colDate')}</th>
                    <th>${Translate.get('colAction')}</th>
                `;
            }
        },

        loadSubmissions: function() {
            const submissions = Storage.getSubmissions();

            // Desktop notification on new leads
            if (!isFirstLoad) {
                submissions.forEach(lead => {
                    if (!lead.processed && !knownSubmissionIds.has(lead.id)) {
                        if (typeof triggerDesktopNotification === 'function') {
                            triggerDesktopNotification(lead);
                        }
                    }
                });
            }

            knownSubmissionIds = new Set(submissions.map(lead => lead.id));
            isFirstLoad = false;

            this.renderTable(submissions);

            // Re-render appointments if available
            if (typeof renderAppointmentsTable === 'function') {
                renderAppointmentsTable();
            }
        },

        renderTable: function(submissions) {
            leadsTableBody.innerHTML = '';
            archiveTableBody.innerHTML = '';

            const currentLang = Translate.getLanguage();

            const pendingLeads = submissions.filter(lead => !lead.processed);
            const processedLeads = submissions.filter(lead => lead.processed);

            // Update live stats in welcome banner
            const countPending = pendingLeads.length;
            const countProcessed = processedLeads.length;
            const countHelped = countProcessed + 14; // Include historical cases helped

            UI.safeSetText('statCountPending', countPending);
            UI.safeSetText('statCountProcessed', countProcessed);
            UI.safeSetText('statCountHelped', countHelped);

            // Sidebar counts
            const leadsBadge = document.getElementById('leadsBadge');
            if (leadsBadge) {
                const count = pendingLeads.length;
                if (count > 0) {
                    leadsBadge.innerText = count;
                    leadsBadge.style.display = 'inline-block';
                } else {
                    leadsBadge.style.display = 'none';
                }
            }

            // Pending leads render
            if (pendingLeads.length === 0) {
                leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 24px;">${Translate.get('emptyLeads')}</td></tr>`;
            } else {
                pendingLeads.forEach(lead => {
                    const tr = document.createElement('tr');
                    const details = lead.accidentDetails || lead.accidentDate || '---';
                    const croppedDetails = details.length > 35 ? details.substring(0, 35) + '...' : details;
                    const leadLang = lead.submissionLang || 'ar';
                    
                    const dateObj = lead.id && lead.id > 1000000000000 ? new Date(lead.id) : parseDateSent(lead.dateSent);

                    tr.innerHTML = `
                        <td><strong>${lead.clientName}</strong></td>
                        <td><a href="tel:${lead.clientPhone}" style="color: var(--accent-gold); text-decoration: none;">${lead.clientPhone}</a></td>
                        <td>${translateCategory(lead.category, leadLang)} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${translateLocation(lead.workLocation, leadLang)}</span></td>
                        <td style="text-align: center;">
                            <input type="checkbox" onchange="window.JLM.LawyerDashboardController.toggleLeadStatus(${lead.id}, this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
                        </td>
                        <td style="color: var(--text-secondary); font-size: 0.85rem;" title="${details}">${croppedDetails}</td>
                        <td style="color: var(--text-secondary); font-size: 0.85rem; white-space: nowrap;" title="${dateObj.toLocaleString()}">${formatGmailDate(lead, currentLang)}</td>
                        <td><button class="btn-table-action" onclick="window.JLM.LawyerDashboardController.showLeadDetails(${lead.id})">${Translate.get('btnDetails')}</button></td>
                    `;
                    leadsTableBody.appendChild(tr);
                });
            }

            // Archived leads render
            if (processedLeads.length === 0) {
                archiveTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 24px;">${Translate.get('emptyArchive')}</td></tr>`;
            } else {
                processedLeads.forEach(lead => {
                    const tr = document.createElement('tr');
                    const details = lead.accidentDetails || lead.accidentDate || '---';
                    const croppedDetails = details.length > 35 ? details.substring(0, 35) + '...' : details;
                    const leadLang = lead.submissionLang || 'ar';
                    
                    const dateObj = lead.id && lead.id > 1000000000000 ? new Date(lead.id) : parseDateSent(lead.dateSent);
                    tr.style.opacity = '0.65';

                    tr.innerHTML = `
                        <td><strong>${lead.clientName}</strong></td>
                        <td><a href="tel:${lead.clientPhone}" style="color: var(--text-secondary); text-decoration: none;">${lead.clientPhone}</a></td>
                        <td>${translateCategory(lead.category, leadLang)} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${translateLocation(lead.workLocation, leadLang)}</span></td>
                        <td style="text-align: center;">
                            <input type="checkbox" checked onchange="window.JLM.LawyerDashboardController.toggleLeadStatus(${lead.id}, this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
                        </td>
                        <td style="color: var(--text-secondary); font-size: 0.85rem; text-decoration: line-through;" title="${details}">${croppedDetails}</td>
                        <td style="color: var(--text-secondary); font-size: 0.85rem; white-space: nowrap;" title="${dateObj.toLocaleString()}">${formatGmailDate(lead, currentLang)}</td>
                        <td><button class="btn-table-action" onclick="window.JLM.LawyerDashboardController.showLeadDetails(${lead.id})">${Translate.get('btnDetails')}</button></td>
                    `;
                    archiveTableBody.appendChild(tr);
                });
            }
        },

        toggleLeadStatus: function(id, isProcessed) {
            Storage.updateSubmission(id, { processed: isProcessed });
            if (isProcessed) {
                const msg = Translate.getLanguage() === 'en' ? "✅ Task completed successfully." : (Translate.getLanguage() === 'he' ? "✅ המשימה הושלמה בהצלחה." : "✅ تم إنجاز المهمة بنجاح.");
                if (typeof startCelebration === 'function') {
                    startCelebration(msg);
                }
            }
            this.loadSubmissions();
        },

        showLeadDetails: function(id) {
            currentActiveLeadId = id;
            isModalTranslated = false;
            this.renderModalContent(id);
            detailModal.classList.add('active');
        },

        toggleModalTranslation: function() {
            const bannerBtn = document.querySelector('#translationBanner button');
            const detailsContainer = document.querySelector('#modalDetailsBody');
            
            if (!isModalTranslated) {
                bannerBtn.innerHTML = `<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid var(--bg-dark); border-radius:50%; border-top-color:transparent; animation: spin 0.6s linear infinite; margin-right:5px; margin-left:5px; vertical-align:middle;"></span> ...`;
                detailsContainer.style.opacity = '0.5';
                detailsContainer.style.transition = 'opacity 0.2s';
                
                setTimeout(() => {
                    isModalTranslated = true;
                    this.renderModalContent(currentActiveLeadId);
                    detailsContainer.style.opacity = '1';
                }, 800);
            } else {
                isModalTranslated = false;
                this.renderModalContent(currentActiveLeadId);
            }
        },

        renderModalContent: function(id) {
            const submissions = Storage.getSubmissions();
            const lead = submissions.find(item => item.id == id);
            if (!lead) return;

            const clientLang = lead.submissionLang || 'ar';
            const renderLang = isModalTranslated ? Translate.getLanguage() : clientLang;

            const details = lead.accidentDetails || lead.accidentDate || "---";
            const otherParty = lead.isNegligence || lead.workType || "---";
            const locationBefore = lead.locationBefore || lead.activityBefore || "---";

            const displayCat = translateCategory(lead.category, renderLang);
            const displayLoc = translateLocation(lead.workLocation, renderLang);
            const displayNeg = translateNegligence(otherParty, renderLang);

            const translatedDetails = isModalTranslated ? getMockTranslation(details, renderLang) : details;
            const translatedLocationBefore = isModalTranslated ? getMockTranslation(locationBefore, renderLang) : locationBefore;

            let bannerHtml = '';
            if (clientLang !== Translate.getLanguage()) {
                let promptText = '';
                let buttonText = '';
                
                if (Translate.getLanguage() === 'he') {
                    promptText = isModalTranslated ? "הצגת פרטי המקרה מתורגמים לעברית באמצעות AI." : "האם ברצונך לתרגם את פרטי המקרה לשפת המערכת (עברית)?";
                    buttonText = isModalTranslated ? "הצג מקור" : "תרגם AI 🌐";
                } else if (Translate.getLanguage() === 'en') {
                    promptText = isModalTranslated ? "Case details translated to English using AI." : "Would you like to translate the case details to English?";
                    buttonText = isModalTranslated ? "Show Original" : "Translate AI 🌐";
                } else {
                    promptText = isModalTranslated ? "تم ترجمة تفاصيل القضية للغة النظام بواسطة الذكاء الاصطناعي." : "هل تريد ترجمة تفاصيل الحادث إلى العربية؟";
                    buttonText = isModalTranslated ? "عرض الأصل" : "ترجمة AI 🌐";
                }
                
                bannerHtml = `
                    <div id="translationBanner" style="background: rgba(197, 168, 128, 0.06); border: 1px dashed var(--accent-gold); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; direction: ${Translate.getLanguage() === 'en' ? 'ltr' : 'rtl'};">
                        <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">
                            🌐 ${promptText}
                        </span>
                        <button onclick="window.JLM.LawyerDashboardController.toggleModalTranslation()" class="btn-table-action" style="padding: 6px 14px; font-size: 0.8rem; background: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; border-radius: 20px; cursor: pointer; border: none; transition: all 0.2s;">
                            ${buttonText}
                        </button>
                    </div>
                `;
            }

            modalDetailsBody.innerHTML = `
                ${bannerHtml}
                <div style="display: flex; flex-direction: column; gap: 14px; line-height: 1.6; font-size: 0.95rem;">
                    <div>
                        <strong>${Translate.get('mName')}</strong> <span>${lead.clientName}</span>
                    </div>
                    <div>
                        <strong>${Translate.get('mPhone')}</strong> <a href="tel:${lead.clientPhone}" style="color: var(--accent-gold); text-decoration: none;">${lead.clientPhone}</a>
                    </div>
                    <div>
                        <strong>${Translate.get('mDate')}</strong> <span>${lead.dateSent}</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid var(--card-border);">
                    <div>
                        <strong>${Translate.get('mLoc')}</strong> <span>${displayLoc}</span>
                    </div>
                    <div>
                        <strong>${Translate.get('mCat')}</strong> <span>${displayCat}</span>
                    </div>
                    <div>
                        <strong>${Translate.get('mNeg')}</strong> <span>${displayNeg}</span>
                    </div>
                    <div>
                        <strong>${Translate.get('mBefore')}</strong> <span>${translatedLocationBefore}</span>
                    </div>
                    <div>
                        <strong>${Translate.get('mStatus')}</strong> <span style="color: var(--accent-gold); font-weight: bold;">${lead.processed ? Translate.get('statusProcessed') : Translate.get('statusPending')}</span>
                    </div>
                    <hr style="border: 0; border-top: 1px solid var(--card-border);">
                    <div style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--card-border); border-radius: 8px; padding: 12px;">
                        <strong>${Translate.get('mFullDesc')}</strong>
                        <p style="margin-top: 6px; font-size: 0.9rem; color: var(--text-primary); line-height: 1.5;">
                            ${translatedDetails}
                        </p>
                    </div>
                </div>
            `;
        },

        resetDatabase: function() {
            if (confirm(Translate.get('resetConfirm'))) {
                Storage.clearArchive();
                this.loadSubmissions();
                
                const msg = Translate.getLanguage() === 'en' ? "🧹 Archive cleared successfully." : (Translate.getLanguage() === 'he' ? "🧹 הארכיון רוקן בהצלחה." : "🧹 تم تفريغ الأرشيف بنجاح.");
                if (typeof startCelebration === 'function') {
                    startCelebration(msg);
                }
            }
        },

        initDesktopNotificationPermissions: function() {
            if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission().then(() => {
                    this.checkNotificationPermissionAndShowBanner();
                });
            } else {
                this.checkNotificationPermissionAndShowBanner();
            }
        },

        checkNotificationPermissionAndShowBanner: function() {
            if ("Notification" in window && Notification.permission !== "granted") {
                const mainContent = document.querySelector('.main-content');
                if (!mainContent) return;
                
                const oldBanner = document.getElementById('notificationEnableBanner');
                if (oldBanner) oldBanner.remove();
                
                const banner = document.createElement('div');
                banner.id = 'notificationEnableBanner';
                banner.style.cssText = `
                    background: rgba(197, 168, 128, 0.08); 
                    border: 1px solid var(--accent-gold); 
                    border-radius: 12px; 
                    padding: 16px 24px; 
                    margin-bottom: 24px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    gap: 16px;
                    direction: ${Translate.getLanguage() === 'en' ? 'ltr' : 'rtl'};
                `;
                
                let text = '';
                let btnText = '';
                if (Translate.getLanguage() === 'he') {
                    text = "🔔 לקבלת התראות וצלצול בזמן אמת בעת קבלת פנייה או תור חדש, אנא אשר שליחת התראות בדפדפן.";
                    btnText = "אשר התראות 🔔";
                } else if (Translate.getLanguage() === 'en') {
                    text = "🔔 To receive live audio and desktop notifications when new leads or bookings arrive, please enable notifications.";
                    btnText = "Enable Notifications 🔔";
                } else {
                    text = "🔔 لتلقي تنبيهات صوتية وإشعارات لحظية فورية عند وصول حجز أو رسالة جديدة، يرجى تفعيل الإشعارات في المتصفح.";
                    btnText = "تفعيل الإشعارات 🔔";
                }
                
                banner.innerHTML = `
                    <span style="font-size: 0.95rem; color: var(--text-primary); font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        ${text}
                    </span>
                    <button onclick="window.JLM.LawyerDashboardController.requestNotificationPermissionFromBanner()" class="btn-primary" style="padding: 10px 20px; font-size: 0.85rem; font-weight: bold; border-radius: 8px; border: none; background: var(--accent-gold); color: var(--bg-dark) !important; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                        ${btnText}
                    </button>
                `;
                
                mainContent.insertBefore(banner, mainContent.firstChild);
            }
        },

        requestNotificationPermissionFromBanner: function() {
            if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        if (typeof playChime === 'function') {
                            playChime();
                        }
                        const banner = document.getElementById('notificationEnableBanner');
                        if (banner) banner.remove();
                    } else {
                        alert(Translate.getLanguage() === 'he' ? "נא לאשר התראות בהגדרות הדפדפן שלך." : (Translate.getLanguage() === 'en' ? "Please enable notifications in your browser settings." : "يرجى تفعيل الإشعارات من إعدادات المتصفح الخاص بك."));
                    }
                });
            }
        }
    };

    // Global helper for settings section button (directly declared in lawyer_dashboard.html inline onclick)
    window.resetDatabase = function() {
        window.JLM.LawyerDashboardController.resetDatabase();
    };

    // Load dashboard on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        window.JLM.LawyerDashboardController.init();
    });
})();