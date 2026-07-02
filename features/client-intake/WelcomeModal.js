/**
 * WelcomeModal.js - Fully self-contained Welcome Modal Component
 * Grouped under the Client Intake feature.
 * 
 * High-End Premium Glassmorphism Design.
 * Zero external CSS dependencies, supports local file scheme (file:///) without CORS.
 */
(function() {
    // 1. Translations Dictionary
    const localTranslations = {
        ar: {
            title: "جسر القدس القانوني",
            spec: "⚖️ يختص مكتبنا في قضايا التعويضات وإصابات العمل وحوادث الطرق",
            whatTitle: "ماذا يمكنك أن تفعل من خلال الموقع؟",
            opt1: "✨ الحصول على استشارة أولية عن بُعد مجاناً.",
            opt2: "✨ معرفة ما إذا كانت حالتك قد تستحق تعويضاً مالياً.",
            opt3: "✨ إرسال تفاصيل حالتك للمراجعة الفورية من قبل محامٍ مختص.",
            opt4: "✨ طلب مكالمة هاتفية أو حجز موعد مباشر في المكتب.",
            beforeTitle: "إرشادات هامة قبل البدء:",
            beforeDesc: "سيقوم المساعد الذكي بطرح مجموعة من الأسئلة المبسطة لفهم حالتك بشكل أولي. تستغرق العملية أقل من دقيقتين.",
            privacy: "🔒 خصوصية بياناتك ومعلوماتك مكفولة بسرية تامة.",
            closeBtn: "شكراً، فهمت"
        },
        he: {
            title: "גשר אל-קודס המשפטי",
            spec: "⚖️ משרדנו מתמחה בתביעות פיצויים, תאונות עבודה ותאונות דרכים",
            whatTitle: "מה ניתן לעשות באמצעות האתר?",
            opt1: "✨ קבלת ייעוץ ראשוני מרחוק ללא עלות.",
            opt2: "✨ בדיקה האם המקרה שלך עשוי להקנות לך פיצוי כספי.",
            opt3: "✨ שליחת פרטי המקרה לבדיקה מיידית על ידי עורך דין מומחה.",
            opt4: "✨ בקשת שיחת טלפון או קביעת פגישה ישירה במשרד.",
            beforeTitle: "הנחיות חשובות לפני שמתחילים:",
            beforeDesc: "העוזר החכם ישאל אותך מספר שאלות פשוטות כדי להבין את המקרה שלך באופן ראשוני. התהליך לוקח פחות משתי דקות.",
            privacy: "🔒 המידע שלך מטופל בסודיות מוחלטת ומאובטחת.",
            closeBtn: "תודה, הבנתי"
        },
        en: {
            title: "Jerusalem Legal Bridge",
            spec: "⚖️ Our firm specializes in compensation, work injuries, and traffic accidents",
            whatTitle: "What can you do on this website?",
            opt1: "✨ Obtain a free initial remote consultation.",
            opt2: "✨ Learn if your case might be eligible for financial compensation.",
            opt3: "✨ Send your case details for immediate review by a specialist lawyer.",
            opt4: "✨ Request a callback or book an appointment at our office.",
            beforeTitle: "Important Guidelines Before Starting:",
            beforeDesc: "The smart assistant will ask simple questions to understand your case initially. The process takes less than 2 minutes.",
            privacy: "🔒 Your information is treated with strict confidentiality.",
            closeBtn: "Thank you, I understand"
        }
    };

    // 2. Inject CSS Stylesheets dynamically into <head>
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
                background: rgba(8, 12, 21, 0.82);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.4s ease-in-out;
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
                max-width: 580px;
                background: linear-gradient(145deg, rgba(21, 28, 44, 0.9), rgba(13, 18, 30, 0.95));
                border: 1px solid rgba(251, 191, 36, 0.35);
                border-radius: 24px;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(251, 191, 36, 0.08);
                padding: 35px;
                z-index: 10001;
                opacity: 0;
                transform: scale(0.92) translateY(20px);
                transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: #f1f5f9;
                font-family: 'Cairo', 'Outfit', sans-serif;
                overflow: hidden;
            }
            .welcome-modal::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(251,191,36,0.03) 0%, transparent 70%);
                pointer-events: none;
                z-index: 0;
            }
            .welcome-modal.show {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            .welcome-header {
                text-align: center;
                margin-bottom: 22px;
                position: relative;
                z-index: 1;
            }
            .welcome-icon {
                font-size: 32px;
                color: #fbbf24;
                margin-bottom: 8px;
                display: inline-block;
                filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.3));
                animation: welcome-pulse 2s infinite ease-in-out;
            }
            .welcome-title {
                color: #ffffff;
                margin: 0;
                font-size: 1.6rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            }
            .welcome-spec {
                background: linear-gradient(90deg, rgba(251, 191, 36, 0.04), rgba(217, 119, 6, 0.08), rgba(251, 191, 36, 0.04));
                border: 1px solid rgba(251, 191, 36, 0.25);
                border-radius: 14px;
                padding: 14px;
                margin-bottom: 24px;
                font-size: 0.95rem;
                font-weight: 600;
                text-align: center;
                line-height: 1.6;
                color: #fbbf24;
                position: relative;
                z-index: 1;
                box-shadow: inset 0 0 10px rgba(251, 191, 36, 0.03);
            }
            .welcome-body {
                position: relative;
                z-index: 1;
            }
            .welcome-section-title {
                color: #fbbf24;
                font-size: 1.05rem;
                font-weight: 700;
                margin-bottom: 12px;
                display: block;
            }
            .welcome-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .welcome-list li {
                font-size: 0.95rem;
                line-height: 1.6;
                color: #e2e8f0;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }
            .welcome-divider {
                border: 0;
                border-top: 1px solid rgba(35, 45, 66, 0.6);
                margin: 18px 0;
            }
            .welcome-desc {
                font-size: 0.92rem;
                color: #94a3b8;
                line-height: 1.6;
                margin-bottom: 16px;
            }
            .welcome-privacy {
                font-weight: 600;
                color: #34d399;
                font-size: 0.9rem;
                margin-bottom: 26px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .welcome-cta-container {
                display: flex;
                justify-content: center;
                position: relative;
                z-index: 1;
            }
            .welcome-cta-btn {
                background: linear-gradient(135deg, #fbbf24, #d97706);
                color: #0b0f19;
                border: none;
                padding: 14px 48px;
                font-size: 1.1rem;
                font-weight: 700;
                border-radius: 30px;
                cursor: pointer;
                box-shadow: 0 8px 20px rgba(251, 191, 36, 0.35);
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, background 0.2s;
                font-family: inherit;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            .welcome-cta-btn:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 12px 25px rgba(251, 191, 36, 0.5);
                background: linear-gradient(135deg, #fcd34d, #f59e0b);
            }
            .welcome-cta-btn:active {
                transform: translateY(0) scale(1);
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
            
            @keyframes welcome-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.08); opacity: 0.9; }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Expose showWelcomeModal function to global scope
    window.showWelcomeModal = function(lang, onStartCallback) {
        // Fallback to Arabic if language is unsupported
        const t = localTranslations[lang] || localTranslations.ar;
        const dirClass = (lang === 'en') ? 'welcome-ltr' : 'welcome-rtl';

        // Create overlay backdrop
        const overlay = document.createElement("div");
        overlay.className = `welcome-overlay ${dirClass}`;
        
        // Create modal content
        const modal = document.createElement("div");
        modal.className = "welcome-modal";
        
        modal.innerHTML = `
            <div class="welcome-header">
                <span class="welcome-icon">⚖️</span>
                <h2 class="welcome-title">${t.title}</h2>
            </div>
            <div class="welcome-spec">${t.spec}</div>
            
            <div class="welcome-body">
                <span class="welcome-section-title">${t.whatTitle}</span>
                <ul class="welcome-list">
                    <li>${t.opt1}</li>
                    <li>&nbsp;</li>
                    <li>${t.opt2}</li>
                    <li>&nbsp;</li>
                    <li>${t.opt3}</li>
                    <li>&nbsp;</li>
                    <li>${t.opt4}</li>
                </ul>
                
                <hr class="welcome-divider">
                
                <span class="welcome-section-title">${t.beforeTitle}</span>
                <p class="welcome-desc">${t.beforeDesc}</p>
                
                <div class="welcome-privacy">${t.privacy}</div>
                
                <div class="welcome-cta-container">
                    <button class="welcome-cta-btn" id="welcomeCloseBtn">
                        <span>✨ ${t.closeBtn}</span>
                    </button>
                </div>
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
            }, 400);
        };
        
        // Event Listeners
        document.getElementById("welcomeCloseBtn").onclick = closeWelcome;
        
        // Disable backdrop click close so they must click the Gold understanding button
    };
})();
