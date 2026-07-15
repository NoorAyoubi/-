/**
 * WelcomeModal.js - Fully self-contained Welcome Modal Component
 * Grouped under the Client Intake feature.
 * Uses JLM.TranslationService for clean internationalization.
 */
(function() {
    // 1. Inject CSS Stylesheets dynamically into <head>
    const styleId = "welcome-modal-styles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .welcome-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(11, 15, 25, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .welcome-overlay.show {
                opacity: 1;
            }
            .welcome-modal {
                position: relative;
                width: 90%;
                max-width: 600px;
                background: rgba(21, 28, 44, 0.85);
                border: 1px solid rgba(251, 191, 36, 0.25);
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.05);
                padding: 30px;
                z-index: 10001;
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.3s ease-in-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: #f1f5f9;
                font-family: 'Cairo', 'Outfit', sans-serif;
            }
            .welcome-modal.show {
                opacity: 1;
                transform: scale(1);
            }
            .welcome-title {
                color: #fbbf24;
                margin-bottom: 12px;
                font-size: 1.45rem;
                text-align: center;
                font-weight: 700;
            }
            .welcome-spec {
                background: rgba(251, 191, 36, 0.06);
                border: 1px solid rgba(251, 191, 36, 0.2);
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 20px;
                font-size: 0.92rem;
                font-weight: 600;
                text-align: center;
                line-height: 1.5;
            }
            .welcome-section-title {
                color: #fbbf24;
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 8px;
                display: block;
            }
            .welcome-list {
                list-style: none;
                padding: 0;
                margin: 0 0 16px 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .welcome-list li {
                font-size: 0.92rem;
                line-height: 1.5;
                text-align: inherit;
            }
            .welcome-divider {
                border: 0;
                border-top: 1px solid #232d42;
                margin: 14px 0;
            }
            .welcome-desc {
                font-size: 0.9rem;
                color: #94a3b8;
                line-height: 1.5;
                margin-bottom: 12px;
            }
            .welcome-privacy {
                font-weight: 600;
                color: #fbbf24;
                font-size: 0.9rem;
                margin-bottom: 22px;
                text-align: center;
            }
            .welcome-cta-container {
                display: flex;
                justify-content: center;
            }
            .welcome-cta-btn {
                background: linear-gradient(135deg, #fbbf24, #d97706);
                color: #0b0f19;
                border: none;
                padding: 12px 38px;
                font-size: 1.05rem;
                font-weight: 700;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
                font-family: inherit;
            }
            .welcome-cta-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(251, 191, 36, 0.45);
            }
            
            /* Directions Adjustments */
            .welcome-ltr {
                direction: ltr;
                text-align: left;
            }
            .welcome-rtl {
                direction: rtl;
                text-align: right;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Expose showWelcomeModal function to global scope
    window.showWelcomeModal = function(lang, onStartCallback) {
        // Fallback to TranslationService if available, otherwise mock translation function
        const getT = (key) => {
            if (window.JLM && window.JLM.TranslationService) {
                return window.JLM.TranslationService.get(key);
            }
            return key;
        };

        const dirClass = (lang === 'en') ? 'welcome-ltr' : 'welcome-rtl';

        // Create overlay backdrop
        const overlay = document.createElement("div");
        overlay.className = `welcome-overlay ${dirClass}`;
        
        // Create modal content
        const modal = document.createElement("div");
        modal.className = "welcome-modal";
        
        modal.innerHTML = `
            <h2 class="welcome-title">${getT('wTitle')}</h2>
            <div class="welcome-spec">${getT('wSpec')}</div>
            
            <span class="welcome-section-title">${getT('wWhatTitle')}</span>
            <ul class="welcome-list">
                <li>${getT('wOpt1')}</li>
                <li>${getT('wOpt2')}</li>
                <li>${getT('wOpt3')}</li>
                <li>${getT('wOpt4')}</li>
            </ul>
            
            <hr class="welcome-divider">
            
            <span class="welcome-section-title">${getT('wBeforeTitle')}</span>
            <p class="welcome-desc">${getT('wBeforeDesc')}</p>
            
            <div class="welcome-privacy">${getT('wPrivacy')}</div>
            
            <div class="welcome-cta-container">
                <button class="welcome-cta-btn" id="welcomeCloseBtn">${getT('wCloseBtn')}</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Trigger animations
        setTimeout(() => {
            overlay.classList.add("show");
            modal.classList.add("show");
        }, 50);
        
        // Cleanup and Close Logic
        const closeWelcome = () => {
            modal.classList.remove("show");
            overlay.classList.remove("show");
            
            setTimeout(() => {
                overlay.remove();
                if (typeof onStartCallback === "function") {
                    onStartCallback();
                }
            }, 300);
        };
        
        // Event Listeners
        document.getElementById("welcomeCloseBtn").onclick = closeWelcome;
        
        // Close on clicking backdrop overlay
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeWelcome();
            }
        };
    };
})();
