/**
 * 📬 OutlookPortal.js - Microsoft 365 Web Portal Integration Component
 * Rebuilt using Clean Code & SOLID principles:
 * - Uses shared JLM.TranslationService.
 * - Brittle global monkey-patches eliminated.
 * - Listens reactively to language changes.
 */
(function() {
    // Shared aliases
    const Translate = window.JLM.TranslationService;

    const appsDatabase = {
        mail: { url: "https://outlook.live.com/mail/", icon: "features/shared/celebration/options/option1_mail.png", fallbackEmoji: "✉️" },
        calendar: { url: "https://outlook.live.com/calendar/", icon: "features/shared/celebration/options/option2_calendar.png", fallbackEmoji: "📅" },
        copilot: { url: "https://copilot.microsoft.com/", icon: "features/shared/celebration/options/option3_copilot.png", fallbackEmoji: "🎨" },
        people: { url: "https://outlook.live.com/people/", icon: "features/shared/celebration/options/option4_people.png", fallbackEmoji: "👥" },
        tasks: { url: "https://to-do.office.com/", icon: "features/shared/celebration/options/option5_tasks.png", fallbackEmoji: "✔️" },
        onedrive: { url: "https://onedrive.live.com/", icon: "features/shared/celebration/options/option6_onedrive.png", fallbackEmoji: "☁️" },
        word: { url: "https://www.microsoft365.com/launch/word", icon: "features/shared/celebration/options/option7_word.png", fallbackEmoji: "📘" },
        excel: { url: "https://www.microsoft365.com/launch/excel", icon: "features/shared/celebration/options/option8_excel.png", fallbackEmoji: "📗" },
        powerpoint: { url: "https://www.microsoft365.com/launch/powerpoint", icon: "features/shared/celebration/options/option9_powerpoint.png", fallbackEmoji: "📙" }
    };

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
            setTimeout(injectOutlookPortal, 100);
            return;
        }

        // 1. Inject Stylesheet link in head dynamically
        if (!document.getElementById('outlookPortalCss')) {
            const link = document.createElement('link');
            link.id = 'outlookPortalCss';
            link.rel = 'stylesheet';
            link.href = 'features/shared/styles/outlook_portal.css?v=1.0.1';
            document.head.appendChild(link);
        }

        // 2. Inject Sidebar navigation item if not exists
        let btnOutlook = document.getElementById('btnOutlook');
        if (!btnOutlook) {
            btnOutlook = document.createElement('a');
            btnOutlook.href = '#';
            btnOutlook.className = 'nav-item';
            btnOutlook.id = 'btnOutlook';
            btnOutlook.innerText = Translate.get('sidebarLink');
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
        btnOutlook.onclick = (e) => {
            e.preventDefault();
            if (typeof switchTab === 'function') {
                switchTab(btnOutlook, outlookSection);
            }
        };

        // 5. Hook language switcher wrapper to translate portal text dynamically
        Translate.onLanguageChange((lang) => {
            const btnOutlook = document.getElementById('btnOutlook');
            if (btnOutlook) {
                btnOutlook.innerText = Translate.get('sidebarLink');
            }
            renderPortalHTML(lang);
        });

        // 6. Draw dynamic portal structure
        renderPortalHTML(Translate.getLanguage());
    }

    // Populates HTML structure inside container
    function renderPortalHTML(lang) {
        const outlookSection = document.getElementById('outlookSection');
        if (!outlookSection) return;

        outlookSection.innerHTML = `
            <div class="outlook-portal-header">
                <div class="outlook-portal-title-block">
                    <h2>${Translate.get('outlookTitle')}</h2>
                    <p>${Translate.get('outlookDesc')}</p>
                </div>
                <button class="btn-primary" onclick="launchOutlookPopout('${appsDatabase.mail.url}')" style="background-color: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; font-size: 0.85rem; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                    <span>${Translate.get('btnPopout')}</span>
                </button>
            </div>

            <!-- Double Column layout: Left App Launchpad, Right Microsoft 365 Toolbar -->
            <div class="outlook-portal-workspace" style="display: flex; gap: 24px; flex: 1;">
                
                <!-- Main application dashboard details (Left) -->
                <div class="outlook-portal-details-card" style="flex: 1; background: var(--card-bg, #1a1d26); border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08)); border-radius: 12px; padding: 32px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px; display: inline-flex; align-items: center; justify-content: center; width: 90px; height: 90px; background: rgba(197, 168, 128, 0.08); border-radius: 20px; border: 1px solid rgba(197, 168, 128, 0.2);">
                        <span style="color: var(--accent-gold);">🚀</span>
                    </div>
                    <h3 style="color: #ffffff; font-size: 1.4rem; margin: 0 0 12px 0;">${Translate.get('panelTitle')}</h3>
                    <p style="color: var(--text-secondary, #a0aec0); font-size: 0.95rem; line-height: 1.6; max-width: 580px; margin: 0 0 28px 0;">${Translate.get('panelDesc')}</p>
                    
                    <div style="width: 100%; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 24px;">
                        <span style="color: var(--accent-gold); font-weight: bold; font-size: 0.9rem; letter-spacing: 0.5px; text-transform: uppercase;">${Translate.get('quickStartTitle')}</span>
                        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px;">
                            <button class="btn-primary" onclick="launchOutlookPopout('${appsDatabase.mail.url}')" style="padding: 12px 24px; border-radius: 8px;">✉️ Mail</button>
                            <button class="btn-primary" onclick="launchOutlookPopout('${appsDatabase.calendar.url}')" style="padding: 12px 24px; border-radius: 8px;">📅 Calendar</button>
                            <button class="btn-primary" onclick="launchOutlookPopout('${appsDatabase.tasks.url}')" style="padding: 12px 24px; border-radius: 8px;">✔️ To-Do</button>
                        </div>
                    </div>
                </div>

                <!-- Microsoft 365 Vertically Aligned Sidebar Toolbar (Right) -->
                <div class="outlook-portal-bar" style="width: 70px; background: var(--card-bg, #1a1d26); border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08)); border-radius: 12px; display: flex; flex-direction: column; align-items: center; padding: 18px 0; gap: 14px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);">
                    
                    <!-- Outlook Mail Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.mail.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipMail')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.mail.fallbackEmoji}</span>
                    </div>

                    <!-- Outlook Calendar Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.calendar.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipCalendar')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.calendar.fallbackEmoji}</span>
                    </div>

                    <!-- Copilot Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.copilot.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipCopilot')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.copilot.fallbackEmoji}</span>
                    </div>

                    <!-- People Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.people.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipPeople')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.people.fallbackEmoji}</span>
                    </div>

                    <!-- Tasks To-Do Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.tasks.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipTasks')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.tasks.fallbackEmoji}</span>
                    </div>

                    <!-- OneDrive Cloud Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.onedrive.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipOneDrive')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.onedrive.fallbackEmoji}</span>
                    </div>

                    <!-- Divider -->
                    <div style="width: 32px; height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0;"></div>

                    <!-- Word Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.word.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipWord')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.word.fallbackEmoji}</span>
                    </div>

                    <!-- Excel Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.excel.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipExcel')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.excel.fallbackEmoji}</span>
                    </div>

                    <!-- PowerPoint Icon -->
                    <div class="outlook-bar-icon-wrapper" onclick="launchOutlookPopout('${appsDatabase.powerpoint.url}')" style="cursor: pointer; position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;" title="${Translate.get('tooltipPowerPoint')}">
                        <span style="font-size: 1.8rem;">${appsDatabase.powerpoint.fallbackEmoji}</span>
                    </div>

                </div>

            </div>
        `;

        injectToolbarHoverStyles();
    }

    function injectToolbarHoverStyles() {
        if (!document.getElementById('outlookToolbarHoverStyles')) {
            const style = document.createElement('style');
            style.id = 'outlookToolbarHoverStyles';
            style.innerHTML = `
                .outlook-bar-icon-wrapper:hover {
                    background: rgba(197, 168, 128, 0.08) !important;
                    transform: scale(1.08);
                    box-shadow: 0 0 10px rgba(197, 168, 128, 0.2);
                }
                .outlook-bar-icon-wrapper:active {
                    transform: scale(0.95);
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Helper window launch popout with dynamic coordinates
    window.launchOutlookPopout = function(url) {
        const width = 1100;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
            url, 
            '_blank', 
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
        );
    };
})();
