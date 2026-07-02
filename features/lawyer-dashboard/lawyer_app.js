const leadsTableBody = document.getElementById('leadsTableBody');
const archiveTableBody = document.getElementById('archiveTableBody');
const detailModal = document.getElementById('detailModal');
const modalDetailsBody = document.getElementById('modalDetailsBody');
const closeModalBtn = document.getElementById('closeModalBtn');

// Navigation Tabs
const btnLeads = document.getElementById('btnLeads');
const btnArchive = document.getElementById('btnArchive');
const btnSettings = document.getElementById('btnSettings');

const leadsSection = document.getElementById('leadsSection');
const archiveSection = document.getElementById('archiveSection');
const settingsSection = document.getElementById('settingsSection');

// Translation System Dictionary

let currentLang = 'ar';

// Mock data to pre-populate if empty
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

// Helper translation functions for DB categories and locations
function translateCategory(cat, lang) {
    if (!cat) return "";
    if (lang === 'ar') return cat;
    if (cat.includes('حادث سير') || cat.includes('Road') || cat.includes('תאונת דרכים')) {
        return lang === 'he' ? "🚗 תאונת דרכים / תחבורה" : "🚗 Road / Traffic Accident";
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
    if (neg.includes('لا ينطبق') || neg.includes('Not applicable') || neg.includes('لا ينطبق')) {
        return lang === 'he' ? "לא רלוונטי / לא ينطبق" : "Not applicable";
    }
    if (neg.includes('نعم') || neg.includes('Yes') || neg.includes('כן')) {
        return lang === 'he' ? "כן, קיים גורם שלישי אחראי" : "Yes, there is a third-party liable";
    }
    return neg;
}

// Function to translate the dashboard UI components dynamically
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('jlm_lawyer_lang', lang);
    
    // Highlight active capsule button
    const btns = document.querySelectorAll('#langSelectorDashboard .lang-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Set document directions
    const dir = (lang === 'en') ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.style.direction = dir;
    
    const t = translations[lang];
    if (!t) return;
    
    // Title
    document.title = t.title;
    
    // Sidebar
    const sTitle = document.querySelector('.sidebar-title');
    if (sTitle) sTitle.innerText = t.sidebarTitle;
    if (btnLeads) btnLeads.innerText = t.btnLeads;
    if (btnArchive) btnArchive.innerText = t.btnArchive;
    if (btnSettings) btnSettings.innerText = t.btnSettings;
    
    // Header Sections titles
    const leadsSecTitle = document.querySelector('#leadsSection .dashboard-title');
    if (leadsSecTitle) leadsSecTitle.innerText = t.leadsSectionTitle;
    const archiveSecTitle = document.querySelector('#archiveSection .dashboard-title');
    if (archiveSecTitle) archiveSecTitle.innerText = t.archiveSectionTitle;
    const settingsSecTitle = document.querySelector('#settingsSection .dashboard-title');
    if (settingsSecTitle) settingsSecTitle.innerText = t.settingsSectionTitle;
    
    // Settings description
    const settingsCard = document.querySelector('#settingsSection .feature-card');
    if (settingsCard) {
        const h3 = settingsCard.querySelector('h3');
        if (h3) h3.innerText = t.settingsHeading;
        const p = settingsCard.querySelector('p');
        if (p) p.innerText = t.settingsDesc;
        const btn = settingsCard.querySelector('button');
        if (btn) btn.innerText = t.resetBtn;
    }
    
    // Detail Modal Title
    const modalHeaderTitle = document.querySelector('#detailModal .modal-header-title');
    if (modalHeaderTitle) modalHeaderTitle.innerText = t.modalTitle;
    
    // Update tables headers
    updateTableHeaders(t);
    
    // Refresh Table contents
    loadSubmissions();
}

function updateTableHeaders(t) {
    // Leads Header
    const leadsHead = document.querySelector('#leadsSection table thead tr');
    if (leadsHead) {
        leadsHead.innerHTML = `
            <th>${t.colName}</th>
            <th>${t.colPhone}</th>
            <th>${t.colCategory}</th>
            <th style="text-align: center;">${t.colProcessed}</th>
            <th>${t.colSummary}</th>
            <th>${t.colAction}</th>
        `;
    }
    
    // Archive Header
    const archiveHead = document.querySelector('#archiveSection table thead tr');
    if (archiveHead) {
        archiveHead.innerHTML = `
            <th>${t.colName}</th>
            <th>${t.colPhone}</th>
            <th>${t.colCategory}</th>
            <th style="text-align: center;">${t.colArchiveStatus}</th>
            <th>${t.colSummary}</th>
            <th>${t.colAction}</th>
        `;
    }
}

let knownSubmissionIds = new Set();
let isFirstLoad = true;

// Load submissions from LocalStorage
function loadSubmissions() {
    let rawSubmissions = localStorage.getItem('jlm_legal_submissions');
    const isInitialized = localStorage.getItem('jlm_db_initialized');
    let submissions = [];
    
    if (rawSubmissions === null) {
        if (!isInitialized) {
            // First time ever: pre-populate with mock data
            localStorage.setItem('jlm_legal_submissions', JSON.stringify(mockSubmissions));
            localStorage.setItem('jlm_db_initialized', 'true');
            submissions = mockSubmissions;
        } else {
            // Wiped/Empty state: set to empty array
            localStorage.setItem('jlm_legal_submissions', JSON.stringify([]));
            submissions = [];
        }
    } else {
        submissions = JSON.parse(rawSubmissions);
        if (submissions.length === 0 && !isInitialized) {
            localStorage.setItem('jlm_legal_submissions', JSON.stringify(mockSubmissions));
            localStorage.setItem('jlm_db_initialized', 'true');
            submissions = mockSubmissions;
        }
    }
    
    // Notify on new submissions
    if (!isFirstLoad) {
        submissions.forEach(lead => {
            if (!knownSubmissionIds.has(lead.id)) {
                triggerDesktopNotification(lead);
            }
        });
    }
    
    // Populate known IDs
    knownSubmissionIds = new Set(submissions.map(lead => lead.id));
    isFirstLoad = false;
    
    renderTable(submissions);
}

// Play synth chime notification tone using Web Audio API


// Function to trigger Desktop Notifications


// Render submissions table
function renderTable(submissions) {
    leadsTableBody.innerHTML = '';
    archiveTableBody.innerHTML = '';
    
    const t = translations[currentLang];
    if (!t) return;
    
    // Filter pending vs processed
    const pendingLeads = submissions.filter(lead => !lead.processed);
    const processedLeads = submissions.filter(lead => lead.processed);
    
    // Update leads count badge in sidebar
    const btnLeads = document.getElementById('btnLeads');
    if (btnLeads) {
        let badge = document.getElementById('leadsBadge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'leadsBadge';
            badge.className = 'leads-count-badge';
            btnLeads.appendChild(badge);
        }
        const pendingCount = pendingLeads.length;
        if (pendingCount > 0) {
            badge.innerText = pendingCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // 1. Render pending table
    if (pendingLeads.length === 0) {
        leadsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">${t.emptyLeads}</td></tr>`;
    } else {
        pendingLeads.forEach(lead => {
            const tr = document.createElement('tr');
            const shortSummary = lead.accidentDetails ? lead.accidentDetails : (lead.accidentDate ? lead.accidentDate : '---');
            const croppedSummary = shortSummary.length > 35 ? shortSummary.substring(0, 35) + '...' : shortSummary;
            
            const leadLang = lead.submissionLang || 'ar';
            const displayCat = translateCategory(lead.category, leadLang);
            const displayLoc = translateLocation(lead.workLocation, leadLang);
            
            tr.innerHTML = `
                <td><strong>${lead.clientName}</strong></td>
                <td><a href="tel:${lead.clientPhone}" style="color: var(--accent-gold); text-decoration: none;">${lead.clientPhone}</a></td>
                <td>${displayCat} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${displayLoc}</span></td>
                <td style="text-align: center;">
                    <input type="checkbox" onchange="toggleProcessed(${lead.id}, this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;" title="${shortSummary}">${croppedSummary}</td>
                <td><button class="btn-table-action" onclick="showLeadDetails(${lead.id})">${t.btnDetails}</button></td>
            `;
            leadsTableBody.appendChild(tr);
        });
    }
    
    // 2. Render archive table
    if (processedLeads.length === 0) {
        archiveTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">${t.emptyArchive}</td></tr>`;
    } else {
        processedLeads.forEach(lead => {
            const tr = document.createElement('tr');
            const shortSummary = lead.accidentDetails ? lead.accidentDetails : (lead.accidentDate ? lead.accidentDate : '---');
            const croppedSummary = shortSummary.length > 35 ? shortSummary.substring(0, 35) + '...' : shortSummary;
            
            const leadLang = lead.submissionLang || 'ar';
            const displayCat = translateCategory(lead.category, leadLang);
            const displayLoc = translateLocation(lead.workLocation, leadLang);
            
            tr.style.opacity = '0.65';
            
            tr.innerHTML = `
                <td><strong>${lead.clientName}</strong></td>
                <td><a href="tel:${lead.clientPhone}" style="color: var(--text-secondary); text-decoration: none;">${lead.clientPhone}</a></td>
                <td>${displayCat} <br><span style="font-size: 0.8rem; color: var(--text-secondary);">${displayLoc}</span></td>
                <td style="text-align: center;">
                    <input type="checkbox" checked onchange="toggleProcessed(${lead.id}, this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-gold);">
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem; text-decoration: line-through;" title="${shortSummary}">${croppedSummary}</td>
                <td><button class="btn-table-action" onclick="showLeadDetails(${lead.id})" style="text-decoration: none !important;">${t.btnDetails}</button></td>
            `;
            archiveTableBody.appendChild(tr);
        });
    }
}

// Celebrate Task Completion with Confetti and custom toast


// Toggle Processed status in LocalStorage
window.toggleProcessed = function(id, isChecked) {
    let submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
    const leadIndex = submissions.findIndex(item => item.id == id);
    if (leadIndex > -1) {
        submissions[leadIndex].processed = isChecked;
        localStorage.setItem('jlm_legal_submissions', JSON.stringify(submissions));
        
        if (isChecked) {
            const msg = currentLang === 'en' ? "✅ Task completed successfully." : (currentLang === 'he' ? "✅ המשימה הושלמה בהצלחה." : "✅ تم إنجاز المهمة بنجاح.");
            startCelebration(msg);
        }
    }
    loadSubmissions();
};

// Database of mock translations for mock cases
const translationDatabase = {
    // Case 101 details
    "صدمة من الخلف أثناء التوقف عند الإشارة الضوئية.": {
        he: "פגיעה מאחור בזמן עצירה ברמזור.",
        en: "Rear-end collision while stopped at a red light."
    },
    "كنت أقود السيارة متوجهاً إلى عملي في الصباح الباكر.": {
        he: "נסעתי במכונית בדרכי לעבודה בשעות הבוקר המוקדמות.",
        en: "I was driving to work early in the morning."
    },
    // Case 102 details
    "سقوط لوح خشبي ثقيل على القدم بسبب خلل في الرافعة.": {
        he: "נפילת לוח עץ כבד על הרגל עקב תקלה במנוף.",
        en: "A heavy wooden plank fell on the foot due to a crane malfunction."
    },
    "كنت أقف بجوار منطقة التحميل في الورشة استعداداً لنقل الأخشاب.": {
        he: "עמדתי ליד אזור הטעינה בבית המלאכה כהכנה להעברת עצים.",
        en: "I was standing near the loading area in the workshop preparing to move wood."
    }
};

// Simulated AI Translator Helper
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

let isModalTranslated = false;
let currentActiveLeadId = null;

// Show case details in modal
window.showLeadDetails = function(id) {
    currentActiveLeadId = id;
    isModalTranslated = false; // Reset translation state
    renderModalContent(id);
    detailModal.classList.add('active');
};

// Trigger simulated dynamic translation inside the modal
window.toggleModalTranslation = function() {
    const bannerBtn = document.querySelector('#translationBanner button');
    const detailsContainer = document.querySelector('#modalDetailsBody');
    
    if (!isModalTranslated) {
        // Show loading state to simulate translation engine
        bannerBtn.innerHTML = `<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid var(--bg-dark); border-radius:50%; border-top-color:transparent; animation: spin 0.6s linear infinite; margin-right:5px; margin-left:5px; vertical-align:middle;"></span> ...`;
        
        detailsContainer.style.opacity = '0.5';
        detailsContainer.style.transition = 'opacity 0.2s';
        
        setTimeout(() => {
            isModalTranslated = true;
            renderModalContent(currentActiveLeadId);
            detailsContainer.style.opacity = '1';
        }, 800);
    } else {
        isModalTranslated = false;
        renderModalContent(currentActiveLeadId);
    }
};

// Sub-render method for the details modal
function renderModalContent(id) {
    const submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
    const lead = submissions.find(item => item.id == id);
    if (!lead) return;
    
    const t = translations[currentLang];
    if (!t) return;
    
    const clientLang = lead.submissionLang || 'ar';
    
    // Choose display language based on translation toggled state
    const renderLang = isModalTranslated ? currentLang : clientLang;
    const tSub = translations[renderLang] || translations['ar'];
    
    const isNewSchema = lead.hasOwnProperty('accidentDetails');
    const details = isNewSchema ? lead.accidentDetails : (lead.accidentDate || "---");
    const otherParty = isNewSchema ? lead.isNegligence : (lead.workType || "---");
    const locationBefore = lead.locationBefore || (lead.activityBefore || "---");
    
    const displayCat = translateCategory(lead.category, renderLang);
    const displayLoc = translateLocation(lead.workLocation, renderLang);
    const displayNeg = translateNegligence(otherParty, renderLang);
    
    const translatedDetails = isModalTranslated ? getMockTranslation(details, renderLang) : details;
    const translatedLocationBefore = isModalTranslated ? getMockTranslation(locationBefore, renderLang) : locationBefore;
    
    // Translation banner
    let bannerHtml = '';
    if (clientLang !== currentLang) {
        let promptText = '';
        let buttonText = '';
        
        if (currentLang === 'he') {
            promptText = isModalTranslated ? "הצגת פרטי המקרה מתורגמים לעברית באמצעות AI." : "האם ברצונך לתרגם את פרטי המקרה לשפת המערכת (עברית)?";
            buttonText = isModalTranslated ? "הצג מקור" : "תרגם AI 🌐";
        } else if (currentLang === 'en') {
            promptText = isModalTranslated ? "Case details translated to English using AI." : "Would you like to translate the case details to English?";
            buttonText = isModalTranslated ? "Show Original" : "Translate AI 🌐";
        } else {
            promptText = isModalTranslated ? "تم ترجمة تفاصيل القضية للغة النظام بواسطة الذكاء الاصطناعي." : "هل تريد ترجمة تفاصيل الحادث إلى العربية؟";
            buttonText = isModalTranslated ? "عرض الأصل" : "ترجمة AI 🌐";
        }
        
        bannerHtml = `
            <div id="translationBanner" style="background: rgba(197, 168, 128, 0.06); border: 1px dashed var(--accent-gold); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; direction: ${currentLang === 'en' ? 'ltr' : 'rtl'};">
                <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">
                    🌐 ${promptText}
                </span>
                <button onclick="toggleModalTranslation()" class="btn-table-action" style="padding: 6px 14px; font-size: 0.8rem; background: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; border-radius: 20px; cursor: pointer; border: none; transition: all 0.2s;">
                    ${buttonText}
                </button>
            </div>
        `;
    }
    
    modalDetailsBody.innerHTML = `
        ${bannerHtml}
        <div style="display: flex; flex-direction: column; gap: 14px; line-height: 1.6; font-size: 0.95rem;">
            <div>
                <strong>${t.mName}</strong> <span>${lead.clientName}</span>
            </div>
            <div>
                <strong>${t.mPhone}</strong> <a href="tel:${lead.clientPhone}" style="color: var(--accent-gold); text-decoration: none;">${lead.clientPhone}</a>
            </div>
            <div>
                <strong>${t.mDate}</strong> <span>${lead.dateSent}</span>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--card-border);">
            <div>
                <strong>${t.mLoc}</strong> <span>${displayLoc}</span>
            </div>
            <div>
                <strong>${t.mCat}</strong> <span>${displayCat}</span>
            </div>
            <div>
                <strong>${t.mNeg}</strong> <span>${displayNeg}</span>
            </div>
            <div>
                <strong>${t.mBefore}</strong> <span>${translatedLocationBefore}</span>
            </div>
            <div>
                <strong>${t.mStatus}</strong> <span style="color: var(--accent-gold); font-weight: bold;">${lead.processed ? t.statusProcessed : t.statusPending}</span>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--card-border);">
            <div style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--card-border); border-radius: 8px; padding: 12px;">
                <strong>${t.mFullDesc}</strong>
                <p style="margin-top: 6px; font-size: 0.9rem; color: var(--text-primary); line-height: 1.5;">
                    ${translatedDetails}
                </p>
            </div>
        </div>
    `;
}

// Reset database functionality in Settings tab
window.resetDatabase = function() {
    const t = translations[currentLang];
    if (!t) return;
    
    if (confirm(t.resetConfirm)) {
        localStorage.setItem('jlm_legal_submissions', JSON.stringify([]));
        localStorage.setItem('jlm_db_initialized', 'true');
        loadSubmissions();
        
        // Trigger database reset celebration confetti
        const msg = currentLang === 'en' ? "🧹 Database wiped successfully." : (currentLang === 'he' ? "🧹 בסיס הנתונים אופס בהצלחה." : "🧹 تم تفريغ قاعدة البيانات بنجاح.");
        startCelebration(msg);
    }
};

// Close modal
closeModalBtn.onclick = function() {
    detailModal.classList.remove('active');
};

detailModal.onclick = function(e) {
    if (e.target === detailModal) {
        detailModal.classList.remove('active');
    }
};

// Tab Switching Navigation Click Handlers
function switchTab(activeBtn, showSection) {
    btnLeads.classList.remove('active');
    btnArchive.classList.remove('active');
    btnSettings.classList.remove('active');
    
    activeBtn.classList.add('active');
    
    leadsSection.style.display = 'none';
    archiveSection.style.display = 'none';
    settingsSection.style.display = 'none';
    
    showSection.style.display = 'block';
}

if (btnLeads && leadsSection) {
    btnLeads.onclick = (e) => {
        e.preventDefault();
        switchTab(btnLeads, leadsSection);
    };
}

if (btnArchive && archiveSection) {
    btnArchive.onclick = (e) => {
        e.preventDefault();
        switchTab(btnArchive, archiveSection);
    };
}

if (btnSettings && settingsSection) {
    btnSettings.onclick = (e) => {
        e.preventDefault();
        switchTab(btnSettings, settingsSection);
    };
}

// Initial Lang selection setup
const initLang = localStorage.getItem('jlm_lawyer_lang') || 'ar';

// Register language selector event listener and request permission
document.addEventListener('DOMContentLoaded', () => {
    // Register language selector capsule button click listeners
    const langBtns = document.querySelectorAll('#langSelectorDashboard .lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang);
        });
    });
    applyLanguage(initLang);
    
    // Request desktop notification permission on startup
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
});

// Listen to local storage changes to update live from client tab instantly
window.addEventListener('storage', (e) => {
    if (e.key === 'jlm_legal_submissions') {
        loadSubmissions();
    }
});

// Periodic fallback polling (every 3 seconds) for live updates
setInterval(loadSubmissions, 3000);

// Run on Load
window.onload = function() {
    applyLanguage(initLang);
};