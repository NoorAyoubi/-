// Client App Entrypoint Module
import { translations, getCurrentLang, setCurrentLang, updateDirectionAndLang } from '../modules/language.js';
import { validateIsraeliPhone } from '../modules/validation.js';
import { getSubmissions, saveSubmissions } from '../modules/storage.js';
import { startCelebration } from '../modules/celebration.js';

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

let totalSteps = 5;
let currentStep = 0;
let activeStepFn = null;
let isSwitchingLanguage = false;
let lastBotMsgBubble = null;
let isIntakeStarted = false;
let isProcessingChoice = false;

// Function to translate the whole app dynamically
function applyLanguage(lang) {
    setCurrentLang(lang);
    updateDirectionAndLang(lang);
    
    // Highlight active capsule button
    const btns = document.querySelectorAll('#langSelectorLanding .lang-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Get translations for client
    const t = translations[lang].client;
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
    
    safeSetText('faqTitle', lang === 'he' ? '💬 שאלות נפוצות וחוויות לקוחות' : (lang === 'en' ? '💬 Frequently Asked Questions & Client Reviews' : '💬 أسئلة شائعة وتجارب الموكلين'));
    safeSetText('faq1Q', lang === 'he' ? '❓ מה קורה אם נפסיד בתביעה?' : (lang === 'en' ? '❓ What happens if we lose the claim?' : '❓ ماذا يحدث لو خسرنا القضية؟'));
    safeSetText('faq1A', lang === 'he' ? 'אתה לא משלם כלום. אנו נושאים בכל עלויות הטיפול והבדיקה, ואם לא נצליח להשיג פיצוי, לא תשלם שכר טרחה למשרד בכלל.' : (lang === 'en' ? 'You pay nothing. We bear all costs, and if we do not succeed in getting compensation, you will not pay any fees to the firm.' : 'لا تدفع شيئاً. نحن نتحمل كامل تكاليف الفحص والتقرير الطبي، وإذا لم ننجح في تحصيل تعويضك، فلا تدفع أتعاباً للمكتب نهائياً.'));
    safeSetText('faq2Q', lang === 'he' ? '❓ האם הערכה חכמה מחייבת אותי במשהו?' : (lang === 'en' ? '❓ Does the smart evaluation commit me to anything?' : '❓ هل التقييم الذكي يلزمني بأي شيء؟'));
    safeSetText('faq2A', lang === 'he' ? 'בכלל לא. ההערכה היא דיסקרטית לחלוטין ומתבצעת בדפדפן שלך. שום מידע לא ישותף אלא אם תבחר בעצמך בסוף לשלוח ולהמשיך לעבוד איתנו.' : (lang === 'en' ? 'Never. The evaluation is completely private on your browser. No info will be shared unless you choose to send it at the end.' : 'لا على الإطلاق. التقييم سري ويتم في متصفحك. لن تُرسل أي بيانات إلا إذا وافقت بنفسك في نهاية المحادثة لمتابعة طلبك مع المستشار.'));
    
    safeSetText('bioTitle', t.bioTitle);
    safeSetText('bioSubtitle', t.bioSubtitle);
    safeSetText('bioQuote', t.bioQuote);
    safeSetText('footerLogo', t.footerLogo);
    safeSetText('footerServices', t.footerServices);
    safeSetText('footerPrivacy', t.footerPrivacy);
    safeSetText('linkServices', t.linkServices);
    safeSetText('linkPrivacy', t.linkPrivacy);
    safeSetText('footerRights', t.footerRights);
    safeSetText('chatBadge', t.chatBadge);
    safeSetText('backToHomeBtn', t.backToHomeBtn);
    safeSetText('chatBrandTitle', t.chatBrandTitle);
    
    safeSetText('badge1', t.badge1);
    safeSetText('badge2', t.badge2);
    safeSetText('badge3', t.badge3);
    
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
    submitBtn.innerText = translations[getCurrentLang()].client.q7Submit || 'موافق';
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
        langTitle.innerText = translations[getCurrentLang()].client.micTitle || '🎙️ اختر لغة التحدث:';
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
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-choice';
        cancelBtn.style.flex = '1 1 100%';
        cancelBtn.style.borderColor = 'rgba(255,255,255,0.1)';
        cancelBtn.innerText = translations[getCurrentLang()].client.micCancel || '❌ إلغاء';
        cancelBtn.onclick = () => {
            showTextInputWithVoice(placeholder, input.value, callback);
        };
        langContainer.appendChild(cancelBtn);
        
        appFooter.appendChild(langContainer);
    };
}

// Start continuous Speech Recognition
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
    stopBtn.innerText = translations[getCurrentLang()].client.micStop || '⏹️ إيقاف وتأكيد الصوت';
    
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
            const lang = getCurrentLang();
            let langLabel = "العربية";
            if (langCode === "he-IL") langLabel = (lang === 'en' ? "Hebrew" : (lang === 'he' ? "עברית" : "العبرية"));
            else if (langCode === "en-US") langLabel = (lang === 'en' ? "English" : (lang === 'he' ? "אנגלית" : "الإنجليزية"));
            else langLabel = (lang === 'en' ? "Arabic" : (lang === 'he' ? "ערבית" : "العربية"));
            
            let listeningMsg = `جاري الاستماع باللغة ${langLabel}... تحدث الآن`;
            if (lang === 'en') listeningMsg = `Listening in ${langLabel}... Speak now`;
            if (lang === 'he') listeningMsg = `מקשיב בשפה ${langLabel}... דבר עכשיו`;
            
            input.placeholder = listeningMsg;
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
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
    totalSteps = 5; // Default
    updateProgress(0);
    clearFooter();
    addBotMessage(translations[getCurrentLang()].client.welcomeMsg);
    
    setTimeout(() => {
        askCategory();
    }, 1200);
}

// Q1: Category Selection
function askCategory() {
    activeStepFn = askCategory;
    const t = translations[getCurrentLang()].client;
    addBotMessage(t.q1Title);
    
    const choices = [
        { text: t.q1OptTraffic, val: "traffic" },
        { text: t.q1OptWork, val: "work" },
        { text: t.q1OptOther, val: "other" }
    ];
    
    showChoices(choices, (choice) => {
        state.category = choice.text;
        addUserMessage(choice.text);
        
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
        const t = translations[getCurrentLang()].client;
        addBotMessage(t.q2Title);
        
        const choices = [
            { text: t.q2OptWB, val: "westbank" },
            { text: t.q2OptIL, val: "israel" }
        ];
        
        showChoices(choices, (choice) => {
            state.workLocation = choice.text;
            addUserMessage(choice.text);
            updateProgress(2);
            
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
        const t = translations[getCurrentLang()].client;
        addBotMessage(t.q3Title);
        
        const choices = [
            { text: t.q3OptYes, val: "yes" },
            { text: t.q3OptSure, val: "not_sure" },
            { text: t.q3OptOther, val: "other" }
        ];
        
        showChoices(choices, (choice) => {
            state.isNegligence = choice.text;
            addUserMessage(choice.text);
            updateProgress(3);
            askAccidentDetails();
        });
    }, 800);
}

// Q4: Explain what happened
function askAccidentDetails() {
    activeStepFn = askAccidentDetails;
    setTimeout(() => {
        const t = translations[getCurrentLang()].client;
        addBotMessage(t.q4Title);
        
        showTextInputWithVoice(t.q4Placeholder, '', (val) => {
            state.accidentDetails = val || "غير محدد";
            addUserMessage(state.accidentDetails);
            
            const isTraffic = state.category.includes("سير") || state.category.includes("Traffic") || state.category.includes("תנועה");
            const nextStepNum = isTraffic ? 3 : 4;
            updateProgress(nextStepNum);
            askLocationBefore();
        });
    }, 800);
}

// Q5: Where were you before the injury
function askLocationBefore() {
    activeStepFn = askLocationBefore;
    setTimeout(() => {
        const t = translations[getCurrentLang()].client;
        addBotMessage(t.q5Title);
        
        showTextInputWithVoice(t.q5Placeholder, '', (val) => {
            state.locationBefore = val || "غير محدد";
            addUserMessage(state.locationBefore);
            updateProgress(totalSteps - 1);
            showResults();
        });
    }, 800);
}

// Q6: Show Simplified Results & Permission check
function showResults() {
    activeStepFn = showResults;
    clearFooter();
    updateProgress(totalSteps);
    
    let evaluationMsg = "";
    const isTraffic = state.category.includes("سير") || state.category.includes("Traffic") || state.category.includes("תנועה");
    const hasNegligence = state.isNegligence && (state.isNegligence.includes("نعم") || state.isNegligence.includes("כן") || state.isNegligence.includes("Yes"));
    const t = translations[getCurrentLang()].client;

    if (isTraffic || hasNegligence) {
        evaluationMsg = t.q6Yes;
    } else {
        evaluationMsg = t.q6No;
    }
    
    addBotMessage(evaluationMsg);
    
    setTimeout(() => {
        addBotMessage(t.q6Permission);
        
        const choices = [
            { text: t.q6OptAgree, val: "yes" },
            { text: t.q6OptDecline, val: "no" }
        ];
        
        showChoices(choices, (choice) => {
            if (choice.val === "yes") {
                addUserMessage(choice.text);
                askContactInfo();
            } else {
                clearFooter();
                addBotMessage(t.q6Closed);
                
                const form = document.createElement('div');
                form.className = 'intake-form';
                const restartBtn = document.createElement('button');
                restartBtn.className = 'btn-primary';
                restartBtn.innerText = t.q6Undo;
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
    const t = translations[getCurrentLang()].client;
    addBotMessage(t.q7Contact);
    
    setTimeout(() => {
        const form = document.createElement('div');
        form.className = 'intake-form';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control';
        nameInput.placeholder = t.q7Name;
        nameInput.id = 'clientNameInput';
        
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.className = 'form-control';
        phoneInput.placeholder = t.q7Phone;
        phoneInput.id = 'clientPhoneInput';
        
        const errorMsg = document.createElement('div');
        errorMsg.id = 'validationErrorMsg';
        errorMsg.style.color = '#f87171';
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
        submitBtn.innerText = t.q7Submit;
        submitBtn.onclick = () => {
            if (isProcessingChoice) return;
            
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            
            nameInput.style.borderColor = '';
            phoneInput.style.borderColor = '';
            errorMsg.style.display = 'none';
            
            if (name === '' || phone === '') {
                errorMsg.innerHTML = `⚠️ ${t.q7Alert}`;
                errorMsg.style.display = 'block';
                if (name === '') nameInput.style.borderColor = '#ef4444';
                if (phone === '') phoneInput.style.borderColor = '#ef4444';
                return;
            }
            
            if (!validateIsraeliPhone(phone)) {
                errorMsg.innerHTML = `⚠️ ${t.q7PhoneAlert}`;
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
        form.appendChild(errorMsg);
        form.appendChild(submitBtn);
        appFooter.appendChild(form);
        nameInput.focus();
    }, 600);
}

// Save Submission and Trigger celebration
function saveSubmission() {
    activeStepFn = null;
    isProcessingChoice = false;
    isIntakeStarted = false;
    clearFooter();
    
    const lang = getCurrentLang();
    const alertMsg = lang === 'en' ? "File sent successfully" : (lang === 'he' ? "הקובץ נשלח בהצלחה" : "تم إرسال الملف للمكتب بنجاح");
    addUserMessage(alertMsg);
    
    let submissions = getSubmissions();
    submissions.push({
        id: Date.now(),
        clientName: state.clientName,
        clientPhone: state.clientPhone,
        dateSent: new Date().toLocaleDateString(),
        category: state.category,
        workLocation: state.workLocation,
        isNegligence: state.isNegligence || (lang === 'en' ? "N/A (Road accident)" : (lang === 'he' ? "לא רלוונטי (תאונת דרכים)" : "لا ينطبق (حادث سير)")),
        accidentDetails: state.accidentDetails,
        locationBefore: state.locationBefore,
        processed: false,
        submissionLang: lang
    });
    saveSubmissions(submissions);
    
    // Celebration
    const celebrateMsg = lang === 'en' ? "🎉 Request submitted successfully." : (lang === 'he' ? "🎉 הבקשה נשלחה בהצלחה." : "🎉 تم إرسال الطلب بنجاح.");
    startCelebration(celebrateMsg);
    
    setTimeout(() => {
        addBotMessage(translations[getCurrentLang()].client.finalSuccess);
    }, 800);
}

// Modal Toggle Helpers
window.openModal = (modal) => {
    if (modal) modal.classList.add('active');
};
window.closeModal = (modal) => {
    if (modal) modal.classList.remove('active');
};

// Window Load handler
window.onload = () => {
    const startBtn = document.getElementById('startBtn');
    const landingPage = document.getElementById('landingPage');
    const chatApp = document.getElementById('chatApp');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
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
    
    if (linkServices) linkServices.onclick = (e) => { e.preventDefault(); window.openModal(servicesModal); };
    if (footerServices) footerServices.onclick = (e) => { e.preventDefault(); window.openModal(servicesModal); };
    if (linkPrivacy) linkPrivacy.onclick = (e) => { e.preventDefault(); window.openModal(privacyModal); };
    if (footerPrivacy) footerPrivacy.onclick = (e) => { e.preventDefault(); window.openModal(privacyModal); };
    
    if (closeServicesBtn) closeServicesBtn.onclick = () => window.closeModal(servicesModal);
    if (closePrivacyBtn) closePrivacyBtn.onclick = () => window.closeModal(privacyModal);
    
    window.onclick = (e) => {
        if (e.target === servicesModal) window.closeModal(servicesModal);
        if (e.target === privacyModal) window.closeModal(privacyModal);
    };
    
    if (logoLink) logoLink.onclick = () => window.location.reload();
    if (footerLogo) footerLogo.onclick = (e) => { e.preventDefault(); window.location.reload(); };

    // Register language selector listeners
    const langBtns = document.querySelectorAll('#langSelectorLanding .lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang);
        });
    });

    const initLang = getCurrentLang();
    applyLanguage(initLang);

    if (startBtn) {
        startBtn.onclick = () => {
            if (isIntakeStarted) return;
            isIntakeStarted = true;
            
            landingPage.style.display = 'none';
            chatApp.style.display = 'flex';
            
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
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.onclick = () => {
            chatApp.style.display = 'none';
            landingPage.style.display = 'flex';
            isIntakeStarted = false;
            isProcessingChoice = false;
        };
    }
};
