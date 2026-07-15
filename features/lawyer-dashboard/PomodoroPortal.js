/**
 * ⏱️ PomodoroPortal.js - Pomofocus Timer Integration Component
 * Follows the clean, namespaced, SOLID design patterns of the dashboard.
 */
(function() {
    const Translate = window.JLM.TranslationService;

    const pomodoroUrl = "https://pomofocus.io/";

    // Check DOM state and initialize
    if (document.body) {
        injectPomodoroPortal();
    } else {
        document.addEventListener('DOMContentLoaded', injectPomodoroPortal);
    }

    function injectPomodoroPortal() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        const mainContent = document.querySelector('.main-content');
        if (!sidebarNav || !mainContent) {
            setTimeout(injectPomodoroPortal, 100);
            return;
        }

        // 1. Inject Stylesheet link in head dynamically
        if (!document.getElementById('pomodoroPortalCss')) {
            const link = document.createElement('link');
            link.id = 'pomodoroPortalCss';
            link.rel = 'stylesheet';
            link.href = 'features/shared/styles/pomodoro_portal.css?v=1.0.0';
            document.head.appendChild(link);
        }

        // 2. Inject Sidebar navigation item if not exists
        let btnPomodoro = document.getElementById('btnPomodoro');
        if (!btnPomodoro) {
            btnPomodoro = document.createElement('a');
            btnPomodoro.href = '#';
            btnPomodoro.className = 'nav-item';
            btnPomodoro.id = 'btnPomodoro';
            btnPomodoro.innerText = Translate.get('pomodoroSidebar');
            // Append before settings link if possible, or at the end
            const btnSettings = document.getElementById('btnSettings');
            if (btnSettings) {
                sidebarNav.insertBefore(btnPomodoro, btnSettings);
            } else {
                sidebarNav.appendChild(btnPomodoro);
            }
        }

        // 3. Inject Main Section Container if not exists
        let pomodoroSection = document.getElementById('pomodoroSection');
        if (!pomodoroSection) {
            pomodoroSection = document.createElement('div');
            pomodoroSection.id = 'pomodoroSection';
            pomodoroSection.className = 'pomodoro-portal-container';
            pomodoroSection.style.display = 'none';
            mainContent.appendChild(pomodoroSection);
        }

        // 4. Hook Navigation Tab switcher dynamically
        btnPomodoro.onclick = (e) => {
            e.preventDefault();
            if (typeof window.switchTab === 'function') {
                window.switchTab(btnPomodoro, pomodoroSection);
            }
        };

        // 5. Hook language switcher wrapper to translate portal text dynamically
        Translate.onLanguageChange((lang) => {
            const btnPom = document.getElementById('btnPomodoro');
            if (btnPom) {
                btnPom.innerText = Translate.get('pomodoroSidebar');
            }
            renderPortalHTML(lang);
        });

        // 6. Draw dynamic portal structure
        renderPortalHTML(Translate.getLanguage());
    }

    // Populates HTML structure inside container
    function renderPortalHTML(lang) {
        const pomodoroSection = document.getElementById('pomodoroSection');
        if (!pomodoroSection) return;

        pomodoroSection.innerHTML = `
            <div class="pomodoro-portal-header">
                <div class="pomodoro-portal-title-block">
                    <h2>${Translate.get('pomodoroTitle')}</h2>
                    <p>${Translate.get('pomodoroDesc')}</p>
                </div>
                <button class="btn-primary" onclick="launchPomodoroPopout()" style="background-color: var(--accent-gold); color: var(--bg-dark) !important; font-weight: bold; font-size: 0.85rem; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                    <span>${Translate.get('pomodoroBtnPopout')}</span>
                </button>
            </div>

            <!-- Embedded Pomodoro Viewport -->
            <div class="pomodoro-iframe-viewport">
                <!-- allow="autoplay" is critical for playing sound effects in modern browsers -->
                <iframe src="${pomodoroUrl}" class="pomodoro-embedded-frame" allow="autoplay"></iframe>
            </div>
        `;
    }

    // Helper window launch popout with dynamic coordinates
    window.launchPomodoroPopout = function() {
        const width = 620;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
            pomodoroUrl, 
            '_blank', 
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
        );
    };
})();
