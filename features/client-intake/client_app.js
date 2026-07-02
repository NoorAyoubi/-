const chatArea = document.getElementById('chatArea');
const appFooter = document.getElementById('appFooter');
const progressBarFill = document.getElementById('progressBarFill');

// Questionnaire state
let state = {
    category: '',             // Accident Type (traffic / work / other)
    workLocation: '',         // Location (West Bank / Israeli region)
    isNegligence: '',         // Negligence (yes / not_sure / other)
    accidentDetails: '',      // Explain what happened
    locationBefore: '',       // Where they were before the injury
    clientName: '',
    clientPhone: ''
};

// Dynamic steps count
let totalSteps = 5; // Default for traffic (Category, Location, Explanation, LocationBefore, Contact)
let currentStep = 0;

// Multilingual translations schema

let currentLang = 'ar';
let activeStepFn = null;
let isSwitchingLanguage = false;
let lastBotMsgBubble = null;
let isIntakeStarted = false;
let isProcessingChoice = false;

// Function to translate the whole app dynamically
function applyLanguage(lang) {
    currentLang = lang;
    
    // Highlight active capsule button
    const btns = document.querySelectorAll('#langSelectorLanding .lang-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update direction and lang attributes
    const dir = (lang === 'en') ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.style.direction = dir;
    
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.direction = dir;
    
    const chatApp = document.getElementById('chatApp');
    if (chatApp) chatApp.style.direction = dir;
    
    // Static page translation
    const t = translations[lang];
    if (!t) return;
    
    const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    const safeSetHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };
    
    safeSetText('logoLink', t.title);
    
    safeSetText('heroTitle', t.heroTitle);
    safeSetText('heroSubtitle', t.heroSubtitle);
    
    safeSetText('startBtn', t.startBtn);
    safeSetText('explainTitle', t.explainTitle);
    safeSetText('explainSub', t.explainSub);
    
    // Modals and footer copyright translation
    safeSetText('servicesModalTitle', t.servicesModalTitle);
    safeSetHtml('servicesModalContent', t.servicesModalContent);
    safeSetText('privacyModalTitle', t.privacyModalTitle);
    safeSetHtml('privacyModalContent', t.privacyModalContent);
    safeSetText('footerCopyright', t.footerCopyright);
    
    safeSetText('costTitle', t.costTitle);
    safeSetHtml('costText', t.costText);
    
    safeSetText('humanTitle', t.humanTitle);
    safeSetHtml('humanText', t.humanText);
    
    safeSetText('paperTitle', t.paperTitle);
    safeSetHtml('paperText', t.paperText);
    
    safeSetText('roadmapSectionTitle', t.roadmapTitle);
    safeSetText('step1Label', t.step1Label);
    safeSetText('step1Desc', t.step1Desc);
    safeSetText('step2Label', t.step2Label);
    safeSetText('step2Desc', t.step2Desc);
    safeSetText('step3Label', t.step3Label);
    safeSetText('step3Desc', t.step3Desc);
    safeSetText('step4Label', t.step4Label);
    safeSetText('step4Desc', t.step4Desc);
    
    if (lang === 'he') {
        safeSetText('faqTitle', '💬 שאלות נפוצות וחוויות לקוחות');
        safeSetText('faq1Q', '❓ מה קורה אם נפסיד בתביעה?');
        safeSetText('faq1A', 'אתה לא משלם כלום. אנו נושאים בכל עלויות הטיפול והבדיקה, ואם לא נצליח להשיג פיצוי, לא תשלם שכר טרחה למשרד בכלל.');
        safeSetText('faq2Q', '❓ האם הערכה חכמה מחייבת אותי במשהו?');
        safeSetText('faq2A', 'בכלל לא. ההערכה היא דיסקרטית לחלוטין ומתבצעת בדפדפן שלך. שום מידע לא ישותף אלא אם תבחר בעצמך בסוף לשלוח ולהמשיך לעבוד איתנו.');
        safeSetText('bioTitle', 'משרד עורכי דין גשר אל-קודס');
        safeSetText('bioSubtitle', 'היועץ האנושי והמשפטי המוסמך שלך');
        safeSetText('bioQuote', '"הזכות הכספית שלך אינה חמדנות, אלא פיצוי הוגן שיעזור לך לשקם את חייך ובריאותך. חברות הביטוח תמיד מסתמכות על כך שתדחה את התביעה עד שתתיישן. אנו כאן כדי להקשיב לך ולתמוך בך צעד אחר צעד."');
        safeSetText('footerLogo', '⚖️ משרד עורכי דין גשר אל-קודס');
        safeSetText('footerServices', 'שירותים');
        safeSetText('footerPrivacy', 'פרטיות');
        safeSetText('linkServices', 'שירותים');
        safeSetText('linkPrivacy', 'פרטיות');
        safeSetText('footerRights', '© 2026 משרד עורכי דין גשר אל-קודס. כל הזכויות שמורות.');
        safeSetText('chatBadge', 'ייעוץ ראשוני חינם');
        safeSetText('backToHomeBtn', '⬅️ חזור');
        safeSetText('chatBrandTitle', '⚖️ גשר אל-קודס');
        
        safeSetText('badge1', '✅ ללא עלות');
        safeSetText('badge2', '✅ ללא התחייבות');
        safeSetText('badge3', '✅ תוך 2 דקות בלבד');
    } else if (lang === 'en') {
        safeSetText('faqTitle', '💬 Frequently Asked Questions & Client Reviews');
        safeSetText('faq1Q', '❓ What happens if we lose the claim?');
        safeSetText('faq1A', 'You pay nothing. We bear all costs, and if we do not succeed in getting compensation, you will not pay any fees to the firm.');
        safeSetText('faq2Q', '❓ Does the smart evaluation commit me to anything?');
        safeSetText('faq2A', 'Never. The evaluation is completely private on your browser. No info will be shared unless you choose to send it at the end.');
        safeSetText('bioTitle', 'Al-Quds Law Firm');
        safeSetText('bioSubtitle', 'Your Certified Human & Legal Advisor');
        safeSetText('bioQuote', '"Your financial right is not greed, it is fair compensation to help you restore your life and health. Insurance companies always rely on you delaying the claim. We are here to listen and support you step-by-step."');
        safeSetText('footerLogo', '⚖️ Al-Quds Law Firm');
        safeSetText('footerServices', 'Services');
        safeSetText('footerPrivacy', 'Privacy');
        safeSetText('linkServices', 'Services');
        safeSetText('linkPrivacy', 'Privacy');
        safeSetText('footerRights', '© 2026 Al-Quds Law Firm. All rights reserved.');
        safeSetText('chatBadge', 'Free Consultation');
        safeSetText('backToHomeBtn', '⬅️ Back');
        safeSetText('chatBrandTitle', '⚖️ Al-Quds Law');
        
        safeSetText('badge1', '✅ Free of Charge');
        safeSetText('badge2', '✅ No Obligation');
        safeSetText('badge3', '✅ Just 2 Minutes');
    } else {
        safeSetText('faqTitle', '💬 الأسئلة الشائعة وتجارب الموكلين');
        safeSetText('faq1Q', '❓ ماذا يحدث لو خسرنا المطالبة بالتعويض؟');
        safeSetText('faq1A', 'لا تدفع أي شيء. نحن نتحمل كامل أتعاب المتابعة والبحث، وإذا لم ننجح في تحصيل التعويض، فلن تدفع أي أتعاب للمكتب نهائياً.');
        safeSetText('faq2Q', '❓ هل التقييم الذكي يلزمني بأي شيء؟');
        safeSetText('faq2A', 'أبداً. التقييم سري تماماً ويتم على متصفحك. لن تتم مشاركة أي معلومة إلا إذا اخترت بنفسك في نهاية المطاف إرسالها ومتابعة العمل معنا.');
        safeSetText('bioTitle', 'مكتب جسر القدس القانوني');
        safeSetText('bioSubtitle', 'مستشارك الإنساني والقانوني المعتمد');
        safeSetText('bioQuote', '"حقك المالي ليس طمعاً، بل هو تعويض عادل لمساعدتك على استعادة حياتك وصحتك. شركات التأمين تعتمد دائماً على تأجيلك للمطالبة حتى يسقط حقك بالتقادم. نحن هنا لنسمعك ونسانك خطوة بخطوة."');
        safeSetText('footerLogo', '⚖️ جسر القدس القانوني');
        safeSetText('footerServices', 'الخدمات');
        safeSetText('footerPrivacy', 'الخصوصية');
        safeSetText('linkServices', 'الخدمات');
        safeSetText('linkPrivacy', 'الخصوصية');
        safeSetText('footerRights', '© 2026 مكتب جسر القدس للمحاماة والاستشارات القانونية. جميع الحقوق محفوظة.');
        safeSetText('chatBadge', 'استشارة أولية مجانية');
        safeSetText('backToHomeBtn', '⬅️ رجوع');
        safeSetText('chatBrandTitle', '⚖️ جسر القدس');
        
        safeSetText('badge1', '✅ بدون تكلفة');
        safeSetText('badge2', '✅ بدون التزام');
        safeSetText('badge3', '✅ خلال دقيقتين فقط');
    }
    
    // Re-render the current chatbot step in the new language if active
    if (activeStepFn) {
        isSwitchingLanguage = true;
        clearFooter();
        activeStepFn();
        isSwitchingLanguage = false;
    }
}

// Reusable helper to show text input with mic trigger and language choice
function showTextInputWithVoice(placeholder, currentVal, callback) {
    clearFooter();
    
    const form = document.createElement('div');
    form.className = 'intake-form';
    
    // Row container
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.width = '100%';
    row.style.alignItems = 'center';
    row.style.marginBottom = '8px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.style.flex = '1';
    input.style.minWidth = '0';
    input.placeholder = placeholder;
    input.value = currentVal;
    
    const micBtn = document.createElement('button');
    micBtn.className = 'btn-mic';
    micBtn.type = 'button';
    micBtn.style.background = 'var(--accent-gold)';
    micBtn.style.color = '#000';
    micBtn.style.border = 'none';
    micBtn.style.padding = '12px';
    micBtn.style.borderRadius = '8px';
    micBtn.style.cursor = 'pointer';
    micBtn.style.fontSize = '1.1rem';
    micBtn.style.display = 'flex';
    micBtn.style.alignItems = 'center';
    micBtn.style.justifyContent = 'center';
    micBtn.style.width = '45px';
    micBtn.style.height = '45px';
    micBtn.style.flexShrink = '0';
    micBtn.innerText = '🎙️';
    
    row.appendChild(input);
    row.appendChild(micBtn);
    
    const btnRow = document.createElement('div');
    btnRow.className = 'action-row';
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn-primary';
    submitBtn.innerText = translations[currentLang].q7Submit || 'موافق';
    submitBtn.onclick = () => {
        if (isProcessingChoice) return;
        isProcessingChoice = true;
        submitBtn.disabled = true;
        setTimeout(() => {
            isProcessingChoice = false;
            callback(input.value.trim());
        }, 100);
    };
    
    btnRow.appendChild(submitBtn);
    form.appendChild(row);
    form.appendChild(btnRow);
    appFooter.appendChild(form);
    input.focus();
    
    // Voice recognition trigger
    micBtn.onclick = () => {
        // Switch footer to show language choices
        clearFooter();
        
        const langContainer = document.createElement('div');
        langContainer.className = 'choices-container';
        langContainer.style.flexWrap = 'wrap';
        
        const langTitle = document.createElement('div');
        langTitle.style.width = '100%';
        langTitle.style.textAlign = 'center';
        langTitle.style.marginBottom = '12px';
        langTitle.style.fontSize = '0.95rem';
        langTitle.style.fontWeight = 'bold';
        langTitle.style.color = 'var(--accent-gold)';
        langTitle.innerText = translations[currentLang].micTitle || '🎙️ اختر لغة التحدث:';
        langContainer.appendChild(langTitle);
        
        const langs = [
            { text: "عربي (Arabic)", langCode: "ar-IL" },
            { text: "עברית (Hebrew)", langCode: "he-IL" },
            { text: "English", langCode: "en-US" }
        ];
        
        langs.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'btn-choice';
            btn.innerText = item.text;
            btn.style.flex = '1 1 45%';
            btn.onclick = () => {
                startVoiceListening(item.langCode, input.value, placeholder, callback);
            };
            langContainer.appendChild(btn);
        });
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-choice';
        cancelBtn.style.flex = '1 1 100%';
        cancelBtn.style.borderColor = 'rgba(255,255,255,0.1)';
        cancelBtn.innerText = translations[currentLang].micCancel || '❌ إلغاء';
        cancelBtn.onclick = () => {
            showTextInputWithVoice(placeholder, input.value, callback);
        };
        langContainer.appendChild(cancelBtn);
        
        appFooter.appendChild(langContainer);
    };
}

// Start continuous Speech Recognition with real-time updates and language choice
function startVoiceListening(langCode, existingText, originalPlaceholder, callback) {
    clearFooter();
    
    const form = document.createElement('div');
    form.className = 'intake-form';
    
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.width = '100%';
    row.style.alignItems = 'center';
    row.style.marginBottom = '8px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.style.flex = '1';
    input.style.minWidth = '0';
    input.value = existingText;
    
    const micBtn = document.createElement('button');
    micBtn.className = 'btn-mic';
    micBtn.type = 'button';
    micBtn.style.background = '#ef4444'; // Red for recording
    micBtn.style.color = '#fff';
    micBtn.style.border = 'none';
    micBtn.style.padding = '12px';
    micBtn.style.borderRadius = '8px';
    micBtn.style.cursor = 'pointer';
    micBtn.style.fontSize = '1.1rem';
    micBtn.style.display = 'flex';
    micBtn.style.alignItems = 'center';
    micBtn.style.justifyContent = 'center';
    micBtn.style.width = '45px';
    micBtn.style.height = '45px';
    micBtn.style.flexShrink = '0';
    micBtn.innerText = '🔴';
    
    row.appendChild(input);
    row.appendChild(micBtn);
    
    const btnRow = document.createElement('div');
    btnRow.className = 'action-row';
    
    const stopBtn = document.createElement('button');
    stopBtn.className = 'btn-primary';
    stopBtn.innerText = translations[currentLang].micStop || '⏹️ إيقاف وتأكيد الصوت';
    
    btnRow.appendChild(stopBtn);
    form.appendChild(row);
    form.appendChild(btnRow);
    appFooter.appendChild(form);
    input.focus();
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.continuous = true;
        recognition.interimResults = true;
        
        let prefixText = existingText ? existingText + ' ' : '';
        let hasEnded = false;
        
        recognition.onstart = () => {
            let langLabel = "العربية";
            if (langCode === "he-IL") langLabel = (currentLang === 'en' ? "Hebrew" : (currentLang === 'he' ? "עברית" : "العبرية"));
            else if (langCode === "en-US") langLabel = (currentLang === 'en' ? "English" : (currentLang === 'he' ? "אנגלית" : "الإنجليزية"));
            else langLabel = (currentLang === 'en' ? "Arabic" : (currentLang === 'he' ? "ערבית" : "العربية"));
            
            let listeningMsg = `جاري الاستماع باللغة ${langLabel}... تحدث الآن`;
            if (currentLang === 'en') listeningMsg = `Listening in ${langLabel}... Speak now`;
            if (currentLang === 'he') listeningMsg = `מקשיב בשפה ${langLabel}... דבר עכשיו`;
            
            input.placeholder = listeningMsg;
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            // Loop from 0 to results length (fixes the pause/overwrite issue!)
            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            input.value = prefixText + finalTranscript + interimTranscript;
        };
        
        recognition.onerror = (e) => {
            console.error(e);
        };
        
        recognition.onend = () => {
            if (!hasEnded) {
                hasEnded = true;
                showTextInputWithVoice(originalPlaceholder, input.value, callback);
            }
        };
        
        const stopListening = () => {
            if (!hasEnded) {
                hasEnded = true;
                recognition.stop();
                showTextInputWithVoice(originalPlaceholder, input.value, callback);
            }
        };
        
        stopBtn.onclick = stopListening;
        micBtn.onclick = stopListening;
        
        recognition.start();
    } else {
        showTextInputWithVoice(originalPlaceholder, existingText, callback);
    }
}

// Helper to update progress bar
function updateProgress(stepNumber) {
    currentStep = stepNumber;
    const percentage = Math.round((currentStep / totalSteps) * 100);
    if (progressBarFill) {
        progressBarFill.style.width = percentage + '%';
    }
}

// Helper to add bot message
function addBotMessage(text) {
    if (isSwitchingLanguage && lastBotMsgBubble) {
        lastBotMsgBubble.innerHTML = text;
        return;
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text;
    
    const time = document.createElement('div');
    time.className = 'msg-time';
    time.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    lastBotMsgBubble = bubble;
}

// Helper to add user message
function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerText = text;
    
    const time = document.createElement('div');
    time.className = 'msg-time';
    time.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Clear input footer
function clearFooter() {
    appFooter.innerHTML = '';
}

// Show choices helper
function showChoices(options, callback) {
    clearFooter();
    const container = document.createElement('div');
    container.className = 'choices-container';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-choice';
        btn.innerText = opt.text;
        btn.onclick = () => {
            if (isProcessingChoice) return;
            isProcessingChoice = true;
            
            btn.classList.add('active');
            // Disable all other options
            const siblings = container.querySelectorAll('.btn-choice');
            siblings.forEach(s => s.disabled = true);
            
            setTimeout(() => {
                isProcessingChoice = false;
                callback(opt);
            }, 200);
        };
        container.appendChild(btn);
    });
    
    appFooter.appendChild(container);
}

// Start the flow
function startIntake() {
    totalSteps = 5; // Default (Category, Location, Explanation, LocationBefore, Contact)
    updateProgress(0);
    clearFooter();
    addBotMessage(translations[currentLang].welcomeMsg);
    
    setTimeout(() => {
        askCategory();
    }, 1200);
}

// Q1: Category Selection
function askCategory() {
    activeStepFn = askCategory;
    addBotMessage(translations[currentLang].q1Title);
    
    const choices = [
        { text: translations[currentLang].q1OptTraffic, val: "traffic" },
        { text: translations[currentLang].q1OptWork, val: "work" },
        { text: translations[currentLang].q1OptOther, val: "other" }
    ];
    
    showChoices(choices, (choice) => {
        state.category = choice.text;
        addUserMessage(choice.text);
        
        // Adjust steps if work/other (requires negligence question)
        if (choice.val !== "traffic") {
            totalSteps = 6;
        }
        
        updateProgress(1);
        askLocation();
    });
}

// Q2: Location (West Bank or Israeli Law)
function askLocation() {
    activeStepFn = askLocation;
    setTimeout(() => {
        addBotMessage(translations[currentLang].q2Title);
        
        const choices = [
            { text: translations[currentLang].q2OptWB, val: "westbank" },
            { text: translations[currentLang].q2OptIL, val: "israel" }
        ];
        
        showChoices(choices, (choice) => {
            state.workLocation = choice.text;
            addUserMessage(choice.text);
            updateProgress(2);
            
            // Branch: if traffic accident, skip responsibility question
            if (state.category.includes("سير") || state.category.includes("Traffic") || state.category.includes("תנועה")) {
                askAccidentDetails();
            } else {
                askResponsibility();
            }
        });
    }, 800);
}

// Q3: Responsibility (Only for Work Injury & Public Falls)
function askResponsibility() {
    activeStepFn = askResponsibility;
    setTimeout(() => {
        addBotMessage(translations[currentLang].q3Title);
        
        const choices = [
            { text: translations[currentLang].q3OptYes, val: "yes" },
            { text: translations[currentLang].q3OptSure, val: "not_sure" },
            { text: translations[currentLang].q3OptOther, val: "other" }
        ];
        
        showChoices(choices, (choice) => {
            state.isNegligence = choice.text;
            addUserMessage(choice.text);
            updateProgress(3);
            askAccidentDetails();
        });
    }, 800);
}

// Q4: Explain what happened (شرح ما حدث)
function askAccidentDetails() {
    activeStepFn = askAccidentDetails;
    setTimeout(() => {
        addBotMessage(translations[currentLang].q4Title);
        
        showTextInputWithVoice(translations[currentLang].q4Placeholder, '', (val) => {
            state.accidentDetails = val || "غير محدد";
            addUserMessage(state.accidentDetails);
            
            const isTraffic = state.category.includes("سير") || state.category.includes("Traffic") || state.category.includes("תנועה");
            const nextStepNum = isTraffic ? 3 : 4;
            updateProgress(nextStepNum);
            askLocationBefore();
        });
    }, 800);
}

// Q5: Where were you before the injury (أين كنت قبل الإصابة؟)
function askLocationBefore() {
    activeStepFn = askLocationBefore;
    setTimeout(() => {
        addBotMessage(translations[currentLang].q5Title);
        
        showTextInputWithVoice(translations[currentLang].q5Placeholder, '', (val) => {
            state.locationBefore = val || "غير محدد";
            addUserMessage(state.locationBefore);
            
            // Go to final step and display simplified contact prompt
            updateProgress(totalSteps - 1);
            showResults();
        });
    }, 800);
}

// Q6: Show Simplified Results (Permission check)
function showResults() {
    activeStepFn = showResults;
    clearFooter();
    updateProgress(totalSteps);
    
    // Evaluate the case immediately
    let evaluationMsg = "";
    const isTraffic = state.category.includes("سير") || state.category.includes("Traffic") || state.category.includes("תנועה");
    const hasNegligence = state.isNegligence && (state.isNegligence.includes("نعم") || state.isNegligence.includes("כן") || state.isNegligence.includes("Yes"));
    
    if (isTraffic || hasNegligence) {
        evaluationMsg = translations[currentLang].q6Yes;
    } else {
        evaluationMsg = translations[currentLang].q6No;
    }
    
    addBotMessage(evaluationMsg);
    
    setTimeout(() => {
        addBotMessage(translations[currentLang].q6Permission);
        
        const choices = [
            { text: translations[currentLang].q6OptAgree, val: "yes" },
            { text: translations[currentLang].q6OptDecline, val: "no" }
        ];
        
        showChoices(choices, (choice) => {
            if (choice.val === "yes") {
                addUserMessage(choice.text);
                askContactInfo();
            } else {
                clearFooter();
                addBotMessage(translations[currentLang].q6Closed);
                
                // Add undo button to re-ask the permission question
                const form = document.createElement('div');
                form.className = 'intake-form';
                const restartBtn = document.createElement('button');
                restartBtn.className = 'btn-primary';
                restartBtn.innerText = translations[currentLang].q6Undo;
                restartBtn.onclick = () => {
                    if (isProcessingChoice) return;
                    isProcessingChoice = true;
                    restartBtn.disabled = true;
                    setTimeout(() => {
                        isProcessingChoice = false;
                        showResults();
                    }, 100);
                };
                form.appendChild(restartBtn);
                appFooter.appendChild(form);
            }
        });
    }, 1000);
}

// Q7: Contact Info & Validation
function askContactInfo() {
    activeStepFn = askContactInfo;
    clearFooter();
    addBotMessage(translations[currentLang].q7Contact);
    
    setTimeout(() => {
        const form = document.createElement('div');
        form.className = 'intake-form';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control';
        nameInput.placeholder = translations[currentLang].q7Name;
        nameInput.id = 'clientNameInput';
        
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.className = 'form-control';
        phoneInput.placeholder = translations[currentLang].q7Phone;
        phoneInput.id = 'clientPhoneInput';
        
        // Premium Inline Error Message Div
        const errorMsg = document.createElement('div');
        errorMsg.id = 'validationErrorMsg';
        errorMsg.style.color = '#f87171'; // Lighter premium red for dark mode
        errorMsg.style.fontSize = '0.85rem';
        errorMsg.style.marginTop = '4px';
        errorMsg.style.marginBottom = '8px';
        errorMsg.style.fontWeight = '600';
        errorMsg.style.display = 'none';
        errorMsg.style.width = '100%';
        errorMsg.style.background = 'rgba(239, 68, 68, 0.08)';
        errorMsg.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        errorMsg.style.padding = '8px 12px';
        errorMsg.style.borderRadius = '8px';
        errorMsg.style.textAlign = 'inherit';
        
        // Real-time border reset on input
        nameInput.oninput = () => {
            nameInput.style.borderColor = '';
            errorMsg.style.display = 'none';
        };
        phoneInput.oninput = () => {
            phoneInput.style.borderColor = '';
            errorMsg.style.display = 'none';
        };
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary';
        submitBtn.innerText = translations[currentLang].q7Submit;
        submitBtn.onclick = () => {
            if (isProcessingChoice) return;
            
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            
            // Reset borders and hide error
            nameInput.style.borderColor = '';
            phoneInput.style.borderColor = '';
            errorMsg.style.display = 'none';
            
            if (name === '' || phone === '') {
                errorMsg.innerHTML = `⚠️ ${translations[currentLang].q7Alert || "يرجى إدخال الاسم ورقم الهاتف."}`;
                errorMsg.style.display = 'block';
                if (name === '') nameInput.style.borderColor = '#ef4444';
                if (phone === '') phoneInput.style.borderColor = '#ef4444';
                return;
            }
            
            // Validating Israeli Mobile Phone starts with 05 and has exactly 10 digits
            const phoneRegex = /^05\d-?\d{7}$/;
            if (!phoneRegex.test(phone)) {
                errorMsg.innerHTML = `⚠️ ${translations[currentLang].q7PhoneAlert || "يرجى إدخال رقم هاتف محمول صحيح يتكون من 10 أرقام ويبدأ بـ 05."}`;
                errorMsg.style.display = 'block';
                phoneInput.style.borderColor = '#ef4444';
                return;
            }
            
            isProcessingChoice = true;
            submitBtn.disabled = true;
            
            state.clientName = name;
            state.clientPhone = phone;
            saveSubmission();
        };
        
        form.appendChild(nameInput);
        form.appendChild(phoneInput);
        form.appendChild(errorMsg); // Visual error feedback inline
        form.appendChild(submitBtn);
        appFooter.appendChild(form);
        nameInput.focus();
    }, 600);
}

// Celebrate Task Completion with Confetti and custom toast


// Save Submission
function saveSubmission() {
    activeStepFn = null; // Submission complete, stop dynamic updates
    isProcessingChoice = false;
    isIntakeStarted = false;
    clearFooter();
    addUserMessage(currentLang === 'en' ? "File sent successfully" : (currentLang === 'he' ? "הקובץ נשלח בהצלחה" : "تم إرسال الملف للمكتب بنجاح"));
    
    let submissions = JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
    
    submissions.push({
        id: Date.now(),
        clientName: state.clientName,
        clientPhone: state.clientPhone,
        dateSent: new Date().toLocaleDateString(),
        category: state.category,
        workLocation: state.workLocation,
        isNegligence: state.isNegligence || (currentLang === 'en' ? "N/A (Road accident)" : (currentLang === 'he' ? "לא רלוונטי (תאונת דרכים)" : "لا ينطبق (حادث سير)")),
        accidentDetails: state.accidentDetails,
        locationBefore: state.locationBefore,
        processed: false,
        submissionLang: currentLang
    });
    
    localStorage.setItem('jlm_legal_submissions', JSON.stringify(submissions));
    
    // Trigger celebration confetti
    const msg = currentLang === 'en' ? "🎉 Request submitted successfully." : (currentLang === 'he' ? "🎉 הבקשה נשלחה בהצלחה." : "🎉 تم إرسال الطلب بنجاح.");
    startCelebration(msg);
    
    setTimeout(() => {
        addBotMessage(translations[currentLang].finalSuccess);
    }, 800);
}

// ---------------------------------------------------------
// Modal Window & Navbar Interactions
// ---------------------------------------------------------
window.onload = () => {
    const startBtn = document.getElementById('startBtn');
    const landingPage = document.getElementById('landingPage');
    const chatApp = document.getElementById('chatApp');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    // Modal Selectors
    const linkServices = document.getElementById('linkServices');
    const linkPrivacy = document.getElementById('linkPrivacy');
    const footerServices = document.getElementById('footerServices');
    const footerPrivacy = document.getElementById('footerPrivacy');
    const logoLink = document.getElementById('logoLink');
    const footerLogo = document.getElementById('footerLogo');
    
    const servicesModal = document.getElementById('servicesModal');
    const privacyModal = document.getElementById('privacyModal');
    
    const closeServicesBtn = document.getElementById('closeServicesBtn');
    const closePrivacyBtn = document.getElementById('closePrivacyBtn');
    
    // Reusable Modal toggling
    const openModal = (modal) => {
        if (modal) modal.classList.add('active');
    };
    
    const closeModal = (modal) => {
        if (modal) modal.classList.remove('active');
    };
    
    // Link triggers
    if (linkServices) linkServices.onclick = (e) => { e.preventDefault(); openModal(servicesModal); };
    if (footerServices) footerServices.onclick = (e) => { e.preventDefault(); openModal(servicesModal); };
    if (linkPrivacy) linkPrivacy.onclick = (e) => { e.preventDefault(); openModal(privacyModal); };
    if (footerPrivacy) footerPrivacy.onclick = (e) => { e.preventDefault(); openModal(privacyModal); };
    
    // Close triggers
    if (closeServicesBtn) closeServicesBtn.onclick = () => closeModal(servicesModal);
    if (closePrivacyBtn) closePrivacyBtn.onclick = () => closeModal(privacyModal);
    
    // Close modals by clicking outside on backdrop overlay
    window.onclick = (e) => {
        if (e.target === servicesModal) closeModal(servicesModal);
        if (e.target === privacyModal) closeModal(privacyModal);
    };
    
    // Logo reload click triggers
    if (logoLink) logoLink.onclick = () => window.location.reload();
    if (footerLogo) footerLogo.onclick = (e) => { e.preventDefault(); window.location.reload(); };

    // Language dropdown listeners
    // Register language selector capsule button click listeners
    const langBtns = document.querySelectorAll('#langSelectorLanding .lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang);
        });
    });

    // Sync language selection on page load
    applyLanguage(currentLang);

    // Chatbot entrance trigger
    if (startBtn) {
        startBtn.onclick = () => {
            if (isIntakeStarted) return;
            
            const launchChat = () => {
                isIntakeStarted = true;
                landingPage.style.display = 'none';
                chatApp.style.display = 'flex';
                
                // Reset state variables
                state = {
                    category: '',
                    workLocation: '',
                    isNegligence: '',
                    accidentDetails: '',
                    locationBefore: '',
                    clientName: '',
                    clientPhone: ''
                };
                chatArea.innerHTML = '';
                lastBotMsgBubble = null;
                startIntake();
            };
            
            // Safe call with fallback: if WelcomeModal is loaded, show it, else start directly
            if (window.showWelcomeModal) {
                window.showWelcomeModal(currentLang, launchChat);
            } else {
                launchChat();
            }
        };
    }
    
    // Back to home page trigger
    if (backToHomeBtn) {
        backToHomeBtn.onclick = () => {
            chatApp.style.display = 'none';
            landingPage.style.display = 'flex';
            isIntakeStarted = false;
            isProcessingChoice = false;
        };
    }
};