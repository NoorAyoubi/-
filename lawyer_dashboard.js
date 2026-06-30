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
const translations = {
    ar: {
        title: "لوحة التحكم - مكتب المحاماة بالقدس",
        sidebarTitle: "⚖️ جسر القدس",
        btnLeads: "📋 طلبات الموكلين الجدد",
        btnArchive: "👥 الأرشيف والعملاء",
        btnSettings: "⚙️ إعدادات النظام",
        leadsSectionTitle: "إدارة طلبات إصابات العمل الواردة",
        archiveSectionTitle: "أرشيف العملاء المعالجة قضاياهم",
        settingsSectionTitle: "إعدادات نظام جسر القدس القانوني",
        settingsHeading: "🛠️ إعدادات عامة وتطهير البيانات",
        settingsDesc: "يمكنك تهيئة أو تفريغ قاعدة بيانات الاستشارات بالكامل للبدء من جديد وتجربة النظام بصفر مدخلات:",
        resetBtn: "⚠️ تفريغ كافة الطلبات والبدء من جديد",
        resetConfirm: "⚠️ هل أنت متأكد من رغبتك في تفريغ قاعدة البيانات ومسح كافة الطلبات؟ لا يمكن التراجع عن هذه الخطوة.",
        resetSuccess: "تم تفريغ قاعدة البيانات بنجاح وبدء المحاكاة بصفر مدخلات!",
        modalTitle: "📋 تفاصيل طلب الموكل",
        emptyLeads: "لا توجد طلبات جديدة معلقة. جميع الحالات تمت معالجتها!",
        emptyArchive: "الأرشيف فارغ حالياً.",
        colName: "الاسم",
        colPhone: "الهاتف",
        colCategory: "نوع الحادث / موقع العمل",
        colProcessed: "تمت المعالجة",
        colSummary: "ملخص الحادث",
        colAction: "الإجراء",
        btnDetails: "فتح التفاصيل",
        colArchiveStatus: "حالة الأرشفة",
        
        mName: "👤 اسم الموكل:",
        mPhone: "📞 رقم الهاتف:",
        mDate: "📅 تاريخ التقديم:",
        mLoc: "🏢 مكان الحادث والقانون:",
        mCat: "🛠️ نوع الحادث:",
        mNeg: "🚗 هل تعتقد بوجود طرف مسؤول؟",
        mBefore: "📍 أين كان الموكل قبل الإصابة؟",
        mStatus: "✔️ حالة المعالجة والمتابعة:",
        statusProcessed: "تمت معالجته وأرشفته",
        statusPending: "معلّق / لم تتم معالجته بعد",
        mFullDesc: "📝 النص الكامل لشرح الحادث:",
        mAiSummary: "💡 ملخص القضية لدراسة المحامي (AI Summary):",
        mAiText: (cat, loc, neg, before, details) => `طلب استشارة بخصوص (<strong>${cat}</strong>) وقع في (<strong>${loc}</strong>). المسؤولية: (<strong>${neg}</strong>). الموقع المسبق للموكل: (<strong>${before}</strong>). شرح الحادث: (<strong>${details}</strong>). الملف جاهز للتواصل المباشر مع العميل لإعداد المطالبة.`
    },
    he: {
        title: "לוח בקרה - משרד עורכי דין ירושלים",
        sidebarTitle: "⚖️ גשר אל-קודס",
        btnLeads: "📋 פניות לקוחות חדשות",
        btnArchive: "👥 ארכיון ולקוחות",
        btnSettings: "⚙️ הגדרות מערכת",
        leadsSectionTitle: "ניהול פניות ואינטייק מלקוחות",
        archiveSectionTitle: "ארכיון פניות מטופלות",
        settingsSectionTitle: "הגדרות מערכת גשר אל-קודס",
        settingsHeading: "🛠️ הגדרות כלליות וניקוי נתונים",
        settingsDesc: "ניתן לאפס או למחוק את בסיס הנתונים לחלוטין כדי להתחיל מחדש ולנסות את המערכת ללא פניות פתוחות:",
        resetBtn: "⚠️ מחיקת כל הפניות והתחלה מחדש",
        resetConfirm: "⚠️ האם אתה בטוח שברצונך למחוק את כל הפניות מהמערכת? לא ניתן לבטל פעולה זו.",
        resetSuccess: "בסיס הנתונים אופס בהצלחה והחל סימולטור עם אפס פניות!",
        modalTitle: "📋 פרטי פניית הלקוח",
        emptyLeads: "אין פניות חדשות ממתינות. כל המקרים טופלו בהצלחה!",
        emptyArchive: "הארכיון ריק כעת.",
        colName: "שם",
        colPhone: "טלפון",
        colCategory: "סוג התאונה / מיקום",
        colProcessed: "טופל",
        colSummary: "תקציר התאונה",
        colAction: "פעולה",
        btnDetails: "פרטים מלאים",
        colArchiveStatus: "סטטוס ארכוב",
        
        mName: "👤 שם הלקוח:",
        mPhone: "📞 מספר טלפון:",
        mDate: "📅 תאריך שליחה:",
        mLoc: "🏢 מיקום התאונה וסמכות שיפוט:",
        mCat: "🛠️ סוג התאונה:",
        mNeg: "🚗 האם קיים צד ג' אחראי?",
        mBefore: "📍 היכן היה הלקוח לפני התאונה?",
        mStatus: "✔️ סטטוס טיפול ומעקב:",
        statusProcessed: "טופל ואורכב במערכת",
        statusPending: "ממתין לטיפול / חדש",
        mFullDesc: "📝 פירוט האירוע המלא:",
        mAiSummary: "💡 סיכום תיק ראשוני לניתוח עורך דין (AI Summary):",
        mAiText: (cat, loc, neg, before, details) => `בקשת ייעוץ בנושא (<strong>${cat}</strong>) שהתרחשה ב(<strong>${loc}</strong>). אחריות צד ג': (<strong>${neg}</strong>). מיקום לפני התאונה: (<strong>${before}</strong>). פירוט האירוע: (<strong>${details}</strong>). התיק מוכן ליצירת קשר ראשוני עם הלקוח להכנת התביעה.`
    },
    en: {
        title: "Lawyer Dashboard - Jerusalem Law Firm",
        sidebarTitle: "⚖️ Al-Quds Law",
        btnLeads: "📋 New Client Submissions",
        btnArchive: "👥 Archive & Clients",
        btnSettings: "⚙️ System Settings",
        leadsSectionTitle: "Manage Incoming Case Submissions",
        archiveSectionTitle: "Archived Case Submissions",
        settingsSectionTitle: "JLM Legal Bridge System Settings",
        settingsHeading: "🛠️ General Settings & Database Cleanup",
        settingsDesc: "You can reset or wipe the submissions database to start fresh with zero records in simulation mode:",
        resetBtn: "⚠️ Wipe All Submissions & Reset",
        resetConfirm: "⚠️ Are you sure you want to wipe the database and clear all submissions? This action cannot be undone.",
        resetSuccess: "Database wiped successfully! Starting fresh with zero records.",
        modalTitle: "📋 Client Submission Details",
        emptyLeads: "No pending submissions. All cases are processed!",
        emptyArchive: "The archive is currently empty.",
        colName: "Name",
        colPhone: "Phone",
        colCategory: "Incident Type / Location",
        colProcessed: "Processed",
        colSummary: "Accident Summary",
        colAction: "Action",
        btnDetails: "Open Details",
        colArchiveStatus: "Archive Status",
        
        mName: "👤 Client Name:",
        mPhone: "📞 Phone Number:",
        mDate: "📅 Submission Date:",
        mLoc: "🏢 Accident Location & Jurisdiction:",
        mCat: "🛠️ Incident Category:",
        mNeg: "🚗 Is there a responsible third party?",
        mBefore: "📍 Client Location before incident:",
        mStatus: "✔️ Handling & Follow-up Status:",
        statusProcessed: "Processed & Archived",
        statusPending: "Pending / Unprocessed",
        mFullDesc: "📝 Full Accident Details Description:",
        mAiSummary: "💡 Case Summary for Attorney Review (AI Summary):",
        mAiText: (cat, loc, neg, before, details) => `Consultation request regarding (<strong>${cat}</strong>) occurred in (<strong>${loc}</strong>). Third-party liability: (<strong>${neg}</strong>). Pre-incident location: (<strong>${before}</strong>). Accident description: (<strong>${details}</strong>). File ready for direct client outreach.`
    }
};

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
    let submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
    
    // Pre-populate if empty
    if (submissions.length === 0) {
        localStorage.setItem('jlm_legal_submissions', JSON.stringify(mockSubmissions));
        submissions = mockSubmissions;
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
function playChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        playTone(659.25, now, 0.3); // E5 note
        playTone(880.00, now + 0.12, 0.45); // A5 note
    } catch (e) {
        console.log("Audio play failed:", e);
    }
}

// Function to trigger Desktop Notifications
function triggerDesktopNotification(lead) {
    if (!("Notification" in window)) return;
    
    const showNotification = () => {
        playChime(); // Play synthesized audio chime!
        const title = "🔔 Lawyer AI";
        const options = {
            body: `طلب جديد\nوصلتك رسالة جديدة من:\n${lead.clientName}`,
            requireInteraction: true
        };
        const n = new Notification(title, options);
        n.onclick = function() {
            window.focus();
            showLeadDetails(lead.id);
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
function startCelebration(message) {
    let canvas = document.getElementById('celebrationCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'celebrationCanvas';
        canvas.className = 'celebration-canvas';
        document.body.appendChild(canvas);
    }
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171', '#22d3ee'];
    const confettiCount = 150;
    const confetti = [];
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            speedY: Math.random() * 5 + 3,
            speedX: Math.random() * 3 - 1.5,
            opacity: 1
        });
    }
    
    let toast = document.getElementById('celebrationToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'celebrationToast';
        toast.className = 'success-celebration-toast';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <div style="font-size: 3.5rem; animation: bounce 0.8s infinite alternate;">🎉</div>
        <div style="text-align: center; color: var(--text-primary); font-family: inherit;">${message}</div>
    `;
    
    setTimeout(() => toast.classList.add('show'), 50);
    
    let animationFrameId;
    const startTime = Date.now();
    const duration = 3500;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;
        
        confetti.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.x += Math.sin(p.y / 30) * 0.5;
            
            const elapsed = Date.now() - startTime;
            if (elapsed > duration - 1000) {
                p.opacity = Math.max(0, 1 - (elapsed - (duration - 1000)) / 1000);
            }
            
            if (p.y < canvas.height && p.opacity > 0) {
                activeParticles++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }
        });
        
        if (Date.now() - startTime < duration && activeParticles > 0) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            toast.classList.remove('show');
            window.removeEventListener('resize', handleResize);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    }
    
    draw();
}

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
            <hr style="border: 0; border-top: 1px solid var(--card-border);">
            <div style="background-color: rgba(197, 168, 128, 0.05); border: 1px dashed var(--accent-gold); border-radius: 8px; padding: 12px;">
                <strong style="color: var(--accent-gold);">${t.mAiSummary}</strong>
                <p style="margin-top: 6px; font-size: 0.9rem; color: var(--text-secondary);">
                    ${tSub.mAiText(displayCat, displayLoc, displayNeg, translatedLocationBefore, translatedDetails)}
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
        localStorage.removeItem('jlm_legal_submissions');
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
