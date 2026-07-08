/* 📬 Isolated Outlook Web Portal Injection Component */

(function() {
    const portalTranslations = {
        ar: {
            sidebarLink: "📬 بريد وتقويم Outlook",
            title: "بوابة Microsoft Outlook المدمجة",
            desc: "تصفح البريد الإلكتروني، والتقويم، وإدارة مهام مكتبك مباشرة من داخل لوحة التحكم.",
            btnPopout: "فتح في نافذة منفصلة 🚀",
            fallbackTitle: "مستعرض Outlook المدمج",
            fallbackDesc: "قد تمنع سياسة حماية مايكروسوفت تسجيل الدخول المباشر داخل الإطارات لبعض المتصفحات والحسابات الشخصية. يرجى النقر أدناه لفتح بريد Outlook الحقيقي في نافذة عمل منبثقة سريعة ومتصلة بموقعنا.",
            btnFallback: "🚀 تسجيل الدخول لبريد Outlook الحقيقي"
        },
        he: {
            sidebarLink: "📬 דואר ויומן Outlook",
            title: "פורטל Microsoft Outlook המובנה",
            desc: "נהל את הדואר האלקטרוני, לוח השנה והמשימות של משרדך ישירות מתוך לוח הבקרה.",
            btnPopout: "פתח בחלון נפרד 🚀",
            fallbackTitle: "דפדפן Outlook מובנה",
            fallbackDesc: "מדיניות האבטחה של מיקרוסופט עשויה למנוע התחברות ישירה בתוך מסגרות בדפדפנים מסוימים. אנא לחץ למטה כדי לפתוח את דואר Outlook האמיתי בחלון עבודה מהיר ומחובר.",
            btnFallback: "🚀 התחבר לחשבון Outlook האמיתי"
        },
        en: {
            sidebarLink: "📬 Outlook Mail & Calendar",
            title: "Integrated Microsoft Outlook Portal",
            desc: "Browse email, calendar, and manage your law office tasks directly from within the dashboard.",
            btnPopout: "Open in Pop-out Window 🚀",
            fallbackTitle: "Outlook Embedded Portal",
            fallbackDesc: "Microsoft security policies may restrict direct login inside frames for some browsers and personal accounts. Click below to launch your real Outlook mail in a fast, standalone work window.",
            btnFallback: "🚀 Sign in to Real Outlook Mail"
        }
    };

    const targetMailUrl = "https://outlook.live.com/mail/";

    // Check DOM state and initialize
    if (document.body) {
        injectOutlookPortal();
    } else {
        document.addEventListener('DOMContentLoaded', injectOutlookPortal);
    }

    function injectOutlookPortal() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        const mainContent = document.querySelector('.main-content');
        if (!sidebarNav || !mainContent) {
            // Retry if main dashboard layout is not loaded yet
            setTimeout(injectOutlookPortal, 100);
            return;
        }

        // 1. Inject Stylesheet link in head dynamically
        if (!document.getElementById('outlookPortalCss')) {
            const link = document.createElement('link');
            link.id = 'outlookPortalCss';
            link.rel = 'stylesheet';
            link.href = 'features/shared/styles/outlook_portal.css?v=1.0.0';
            document.head.appendChild(link);
        }

        // 2. Inject Sidebar navigation item if not exists
        let btnOutlook = document.getElementById('btnOutlook');
        if (!btnOutlook) {
            btnOutlook = document.createElement('a');
            btnOutlook.href = '#';
            btnOutlook.className = 'nav-item';
            btnOutlook.id = 'btnOutlook';
            btnOutlook.innerText = portalTranslations.ar.sidebarLink;
            sidebarNav.appendChild(btnOutlook);
        }

        // 3. Inject Main Section Container if not exists
        let outlookSection = document.getElementById('outlookSection');
        if (!outlookSection) {
            outlookSection = document.createElement('div');
            outlookSection.id = 'outlookSection';
            outlookSection.className = 'outlook-portal-container';
            outlookSection.style.display = 'none';
            mainContent.appendChild(outlookSection);
        }

        // 4. Hook Navigation Tab switcher in lawyer_app.js dynamically
        hookNavigationSwitcher(btnOutlook, outlookSection);

        // 5. Hook language switcher wrapper to translate portal text dynamically
        hookLanguageSwitcher();

        // 6. Draw dynamic portal structure
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        renderPortalHTML(lang);
    }

    // Hook sidebar routing dynamically
    function hookNavigationSwitcher(btn, section) {
        btn.onclick = (e) => {
            e.preventDefault();
            if (typeof switchTab === 'function') {
                switchTab(btn, section);
            }
        };

        // Wrap original switchTab to support hiding/resetting our injected view
        if (typeof switchTab !== 'undefined') {
            const originalSwitchTab = switchTab;
            switchTab = function(activeBtn, showSection) {
                // Reset active class for our injected button
                const btnOutlook = document.getElementById('btnOutlook');
                if (btnOutlook) btnOutlook.classList.remove('active');

                // Hide our section
                const outlookSection = document.getElementById('outlookSection');
                if (outlookSection) outlookSection.style.display = 'none';

                // Call original logic
                originalSwitchTab(activeBtn, showSection);
            };
        }
    }

    // Hook applyLanguage wrapper to translate portal content on updates
    function hookLanguageSwitcher() {
        if (typeof applyLanguage !== 'undefined') {
            const originalApplyLanguage = applyLanguage;
            applyLanguage = function(lang) {
                originalApplyLanguage(lang);
                
                // Translate sidebar text
                const t = portalTranslations[lang] || portalTranslations.ar;
                const btnOutlook = document.getElementById('btnOutlook');
                if (btnOutlook) {
                    btnOutlook.innerText = t.sidebarLink;
                }

                // Re-render HTML content inside section
                renderPortalHTML(lang);
            };
        }
    }

    // Populates HTML structure inside container
    function renderPortalHTML(lang) {
        const outlookSection = document.getElementById('outlookSection');
        if (!outlookSection) return;

        const t = portalTranslations[lang] || portalTranslations.ar;

        outlookSection.innerHTML = `
            <div class="outlook-portal-header">
                <div class="outlook-portal-title-block">
                    <h2>${t.title}</h2>
                    <p>${t.desc}</p>
                </div>
                <button class="btn-primary" onclick="launchOutlookPopout()" style="background-color: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; font-size: 0.85rem; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                    <span>${t.btnPopout}</span>
                </button>
            </div>

            <div class="outlook-iframe-viewport">
                <!-- Fallback card underneath iframe to catch loading errors / blocked frame -->
                <div class="outlook-iframe-fallback">
                    <div class="outlook-fallback-icon">📬</div>
                    <h3>${t.fallbackTitle}</h3>
                    <p>${t.fallbackDesc}</p>
                    <button class="btn-primary" onclick="launchOutlookPopout()" style="background-color: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; border: none; border-radius: 8px; padding: 12px 28px; cursor: pointer;">
                        ${t.btnFallback}
                    </button>
                </div>
                
                <!-- Web View Iframe loading real Outlook Web Mail -->
                <iframe class="outlook-embedded-frame" id="outlookIframe" src="${targetMailUrl}" title="Microsoft Outlook Web Application"></iframe>
            </div>
        `;

        // Attempt iframe load check
        const iframe = document.getElementById('outlookIframe');
        if (iframe) {
            iframe.onload = function() {
                // If it successfully fires load, we can hide the fallback under normal conditions
                const fallback = document.querySelector('.outlook-iframe-fallback');
                if (fallback) fallback.style.display = 'none';
            };
        }
    }

    // Helper window launch popout
    window.launchOutlookPopout = function() {
        const width = 1024;
        const height = 768;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(
            targetMailUrl, 
            'Microsoft Outlook Workspace', 
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
        );
    };
})();
