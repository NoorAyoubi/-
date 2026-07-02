/**
 * WelcomeModal.js - Fully self-contained Welcome Modal Component
 * Grouped under the Client Intake feature.
 * 
 * Injecting CSS, HTML and Translation dictionaries dynamically.
 * Zero external CSS dependencies, supports local file scheme (file:///) without CORS.
 */
(function() {
    // 1. Translations Dictionary
    const localTranslations = {
        ar: {
            title: "أهلاً بك في جسر القدس القانوني",
            spec: "⚖️ يختص مكتبنا في قضايا التعويضات وإصابات العمل وحوادث الطرق",
            whatTitle: "ماذا يمكنك أن تفعل من خلال الموقع؟",
            opt1: "✅ الحصول على استشارة أولية عن بُعد.",
            opt2: "✅ معرفة ما إذا كانت حالتك قد تستحق تعويضًا.",
            opt3: "✅ إرسال تفاصيل حالتك إلى مكتب المحاماة لمراجعتها من قبل محامٍ مختص.",
            opt4: "✅ طلب مكالمة هاتفية أو حجز موعد في المكتب.",
            beforeTitle: "قبل أن تبدأ:",
            beforeDesc: "سيقوم المساعد الذكي بطرح مجموعة من الأسئلة البسيطة لفهم حالتك بشكل أولي. تستغرق العملية عادة أقل من دقيقتين.",
            privacy: "🔒 معلوماتك تُعامل بسرية تامة.",
            cta: "👉 ابدأ الاستشارة"
        },
        he: {
            title: "ברוכים הבאים לגשר אל-קודס המשפטי",
            spec: "⚖️ משרדנו מתמחה בתביעות פיצויים, תאונות עבודה ותאונות דרכים",
            whatTitle: "מה ניתן לעשות באמצעות האתר?",
            opt1: "✅ קבלת ייעוץ ראשוני מרחוק.",
            opt2: "✅ בדיקה האם המקרה שלך עשוי להקנות לך פיצוי כספי.",
            opt3: "✅ שליחת פרטי המקרה למשרד עורכי הדין לבדיקה על ידי עורך דין מומחה.",
            opt4: "✅ בקשת שיחת טלפון או קביעת פגישה במשרד.",
            beforeTitle: "לפני שמתחילים:",
            beforeDesc: "העוזר החכם ישאל אותך מספר שאלות פשוטות כדי להבין את המקרה שלך באופן ראשוני. התהליך לוקח בדרך כלל פחות משתי דקות.",
            privacy: "🔒 המידע שלך מטופל בסודיות מוחלטת.",
            cta: "👉 התחל ייעוץ"
        },
        en: {
            title: "Welcome to Jerusalem Legal Bridge",
            spec: "⚖️ Our firm specializes in compensation, work injuries, and traffic accidents",
            whatTitle: "What can you do on this website?",
            opt1: "✅ Obtain an initial remote consultation.",
            opt2: "✅ Learn if your case might be eligible for financial compensation.",
            opt3: "✅ Send your case details to the law firm for review by a specialist lawyer.",
            opt4: "✅ Request a callback or book an appointment at our office.",
            beforeTitle: "Before you start:",
            beforeDesc: "The smart assistant will ask simple questions to understand your case initially. The process usually takes less than 2 minutes.",
            privacy: "🔒 Your information is treated with strict confidentiality.",
            cta: "👉 Start Consultation"
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
                background: rgba(11, 15, 25, 0.75);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            .welcome-overlay.show {
                opacity: 1;
            }
            .welcome-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -48%) scale(0.95);
                width: 90%;
                max-width: 620px;
                background: rgba(21, 28, 44, 0.85);
                border: 1px solid rgba(251, 191, 36, 0.25);
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.05);
                padding: 30px;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease-in-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: #f1f5f9;
                font-family: 'Cairo', 'Outfit', sans-serif;
            }
            .welcome-modal.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            .welcome-close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
                transition: color 0.2s;
            }
            .welcome-close-btn:hover {
                color: #fbbf24;
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
                margin-bottom: 24px;
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
                padding: 12px 36px;
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
            
            /* LTR Direction Adjustments for English */
            .welcome-ltr {
                direction: ltr;
                text-align: left;
            }
            .welcome-ltr .welcome-close-btn {
                right: auto;
                left: 15px;
            }
            
            /* RTL Direction Adjustments */
            .welcome-rtl {
                direction: rtl;
                text-align: right;
            }
            .welcome-rtl .welcome-close-btn {
                left: auto;
                right: 15px;
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
            <button class="welcome-close-btn" id="welcomeCloseBtn">&times;</button>
            <h2 class="welcome-title">${t.title}</h2>
            <div class="welcome-spec">${t.spec}</div>
            
            <span class="welcome-section-title">${t.whatTitle}</span>
            <ul class="welcome-list">
                <li>${t.opt1}</li>
                <li>${t.opt2}</li>
                <li>${t.opt3}</li>
                <li>${t.opt4}</li>
            </ul>
            
            <hr class="welcome-divider">
            
            <span class="welcome-section-title">${t.beforeTitle}</span>
            <p class="welcome-desc">${t.beforeDesc}</p>
            
            <div class="welcome-privacy">${t.privacy}</div>
            
            <div class="welcome-cta-container">
                <button class="welcome-cta-btn" id="welcomeStartBtn">${t.cta}</button>
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
        document.getElementById("welcomeStartBtn").onclick = closeWelcome;
        
        // Close on clicking backdrop overlay
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeWelcome();
            }
        };
    };
})();
