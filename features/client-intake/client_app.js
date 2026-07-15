/**
 * ⚖️ client_app.js - Client Intake Application Logic
 * Rebuilt to use Clean Code & SOLID principles:
 * - Namespace pattern (window.JLM)
 * - Schema-based Chatbot engine
 * - Decoupled shared services (StorageService, TranslationService, VoiceService, UIHelper)
 * - No global state pollution
 */
(function() {
    // Shared aliases
    const UI = window.JLM.UIHelper;
    const Storage = window.JLM.StorageService;
    const Translate = window.JLM.TranslationService;
    const Voice = window.JLM.VoiceService;

    // Define window.state for backward compatibility with AppointmentModal
    window.state = {
        category: '',
        workLocation: '',
        isNegligence: '',
        accidentDetails: '',
        locationBefore: '',
        clientName: '',
        clientPhone: ''
    };

    // Chatbot Engine variables
    let chatArea = null;
    let appFooter = null;
    let progressBarFill = null;

    let isIntakeStarted = false;
    let isProcessingChoice = false;
    let currentStepIndex = 0;
    let lastBotMsgBubble = null;

    // Schema definition for the chatbot steps
    const intakeFlowSteps = [
        {
            id: "category",
            getQuestion: () => Translate.get("q1Title"),
            type: "choice",
            getChoices: () => [
                { text: Translate.get("q1OptTraffic"), val: "traffic" },
                { text: Translate.get("q1OptWork"), val: "work" },
                { text: Translate.get("q1OptOther"), val: "other" }
            ],
            onSave: (choice) => {
                window.state.category = choice.text;
            },
            next: (choice) => "location"
        },
        {
            id: "location",
            getQuestion: () => Translate.get("q2Title"),
            type: "choice",
            getChoices: () => [
                { text: Translate.get("q2OptWB"), val: "westbank" },
                { text: Translate.get("q2OptIL"), val: "israel" }
            ],
            onSave: (choice) => {
                window.state.workLocation = choice.text;
            },
            next: () => {
                const isTraffic = window.state.category.includes("سير") || window.state.category.includes("Traffic") || window.state.category.includes("תנועה");
                return isTraffic ? "accidentDetails" : "responsibility";
            }
        },
        {
            id: "responsibility",
            getQuestion: () => Translate.get("q3Title"),
            type: "choice",
            getChoices: () => [
                { text: Translate.get("q3OptYes"), val: "yes" },
                { text: Translate.get("q3OptSure"), val: "not_sure" },
                { text: Translate.get("q3OptOther"), val: "other" }
            ],
            onSave: (choice) => {
                window.state.isNegligence = choice.text;
            },
            next: () => "accidentDetails"
        },
        {
            id: "accidentDetails",
            getQuestion: () => Translate.get("q4Title"),
            type: "text",
            placeholderKey: "q4Placeholder",
            onSave: (val) => {
                window.state.accidentDetails = val || "غير محدد";
            },
            next: () => "locationBefore"
        },
        {
            id: "locationBefore",
            getQuestion: () => Translate.get("q5Title"),
            type: "text",
            placeholderKey: "q5Placeholder",
            onSave: (val) => {
                window.state.locationBefore = val || "غير محدد";
            },
            next: () => "permission"
        },
        {
            id: "permission",
            getQuestion: () => {
                const isTraffic = window.state.category.includes("سير") || window.state.category.includes("Traffic") || window.state.category.includes("תנועה");
                const hasNegligence = window.state.isNegligence && (window.state.isNegligence.includes("نعم") || window.state.isNegligence.includes("כן") || window.state.isNegligence.includes("Yes"));
                
                const evaluationMsg = (isTraffic || hasNegligence) ? Translate.get("q6Yes") : Translate.get("q6No");
                return evaluationMsg + "<br><br>" + Translate.get("q6Permission");
            },
            type: "choice",
            getChoices: () => [
                { text: Translate.get("q6OptAgree"), val: "yes" },
                { text: Translate.get("q6OptDecline"), val: "no" }
            ],
            onSave: () => {},
            next: (choice) => choice.val === "yes" ? "contact" : "closed"
        },
        {
            id: "contact",
            getQuestion: () => Translate.get("q7Contact"),
            type: "contact",
            onSave: (info) => {
                window.state.clientName = info.name;
                window.state.clientPhone = info.phone;
            },
            next: () => "finished"
        }
    ];

    // Initialize the application controller
    window.JLM.ClientIntakeController = {
        init: function() {
            // Initialize translation system with global dictionary
            Translate.init(translations, 'ar');

            // Elements references
            chatArea = document.getElementById('chatArea');
            appFooter = document.getElementById('appFooter');
            progressBarFill = document.getElementById('progressBarFill');

            this.bindEvents();

            // Subscribe to language changes
            Translate.onLanguageChange((lang) => {
                this.handleLanguageSwitch(lang);
            });

            // Initial language rendering based on auto-detection
            const activeLang = Translate.detectLanguage(['ar', 'he', 'en'], 'ar');
            Translate.setLanguage(activeLang);

            // Auto-show Welcome Modal on page load
            if (window.showWelcomeModal) {
                window.showWelcomeModal(activeLang);
            }
        },

        bindEvents: function() {
            const startBtn = document.getElementById('startBtn');
            const landingPage = document.getElementById('landingPage');
            const chatApp = document.getElementById('chatApp');
            const backToHomeBtn = document.getElementById('backToHomeBtn');
            const logoLink = document.getElementById('logoLink');
            const footerLogo = document.getElementById('footerLogo');
            const linkServices = document.getElementById('linkServices');
            const linkPrivacy = document.getElementById('linkPrivacy');
            const footerServices = document.getElementById('footerServices');
            const footerPrivacy = document.getElementById('footerPrivacy');
            const servicesModal = document.getElementById('servicesModal');
            const privacyModal = document.getElementById('privacyModal');
            const closeServicesBtn = document.getElementById('closeServicesBtn');
            const closePrivacyBtn = document.getElementById('closePrivacyBtn');

            // Language Selector Buttons
            const langBtns = document.querySelectorAll('#langSelectorLanding .lang-btn');
            langBtns.forEach(btn => {
                btn.onclick = () => {
                    const lang = btn.getAttribute('data-lang');
                    Translate.setLanguage(lang);
                };
            });

            // Chat Start Trigger
            if (startBtn) {
                startBtn.onclick = () => {
                    if (isIntakeStarted) return;
                    isIntakeStarted = true;
                    landingPage.style.display = 'none';
                    chatApp.style.display = 'flex';
                    this.resetChatbot();
                };
            }

            // Back to Home Trigger
            if (backToHomeBtn) {
                backToHomeBtn.onclick = () => {
                    chatApp.style.display = 'none';
                    landingPage.style.display = 'flex';
                    isIntakeStarted = false;
                    isProcessingChoice = false;
                };
            }

            // Navigation and Modals
            const openModal = (m) => m && m.classList.add('active');
            const closeModal = (m) => m && m.classList.remove('active');

            if (linkServices) linkServices.onclick = (e) => { e.preventDefault(); openModal(servicesModal); };
            if (footerServices) footerServices.onclick = (e) => { e.preventDefault(); openModal(servicesModal); };
            if (linkPrivacy) linkPrivacy.onclick = (e) => { e.preventDefault(); openModal(privacyModal); };
            if (footerPrivacy) footerPrivacy.onclick = (e) => { e.preventDefault(); openModal(privacyModal); };

            if (closeServicesBtn) closeServicesBtn.onclick = () => closeModal(servicesModal);
            if (closePrivacyBtn) closePrivacyBtn.onclick = () => closeModal(privacyModal);

            window.onclick = (e) => {
                if (e.target === servicesModal) closeModal(servicesModal);
                if (e.target === privacyModal) closeModal(privacyModal);
            };

            if (logoLink) logoLink.onclick = () => window.location.reload();
            if (footerLogo) footerLogo.onclick = (e) => { e.preventDefault(); window.location.reload(); };
        },

        handleLanguageSwitch: function(lang) {
            // Update active capsule button
            const btns = document.querySelectorAll('#langSelectorLanding .lang-btn');
            btns.forEach(btn => {
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Dynamic translations for static landing elements
            UI.safeSetText('logoLink', Translate.get('title'));
            UI.safeSetText('heroTitle', Translate.get('heroTitle'));
            UI.safeSetText('heroSubtitle', Translate.get('heroSubtitle'));
            UI.safeSetText('startBtn', Translate.get('startBtn'));
            UI.safeSetText('explainTitle', Translate.get('explainTitle'));
            UI.safeSetText('explainSub', Translate.get('explainSub'));
            UI.safeSetText('servicesModalTitle', Translate.get('servicesModalTitle'));
            UI.safeSetHtml('servicesModalContent', Translate.get('servicesModalContent'));
            UI.safeSetText('privacyModalTitle', Translate.get('privacyModalTitle'));
            UI.safeSetHtml('privacyModalContent', Translate.get('privacyModalContent'));
            UI.safeSetText('footerCopyright', Translate.get('footerCopyright'));
            
            UI.safeSetText('costTitle', Translate.get('costTitle'));
            UI.safeSetHtml('costText', Translate.get('costText'));
            UI.safeSetText('humanTitle', Translate.get('humanTitle'));
            UI.safeSetHtml('humanText', Translate.get('humanText'));
            UI.safeSetText('paperTitle', Translate.get('paperTitle'));
            UI.safeSetHtml('paperText', Translate.get('paperText'));
            
            UI.safeSetText('roadmapSectionTitle', Translate.get('roadmapTitle'));
            UI.safeSetText('step1Label', Translate.get('step1Label'));
            UI.safeSetText('step1Desc', Translate.get('step1Desc'));
            UI.safeSetText('step2Label', Translate.get('step2Label'));
            UI.safeSetText('step2Desc', Translate.get('step2Desc'));
            UI.safeSetText('step3Label', Translate.get('step3Label'));
            UI.safeSetText('step3Desc', Translate.get('step3Desc'));
            UI.safeSetText('step4Label', Translate.get('step4Label'));
            UI.safeSetText('step4Desc', Translate.get('step4Desc'));

            UI.safeSetText('faqTitle', Translate.get('faqTitle'));
            UI.safeSetText('faq1Q', Translate.get('faq1Q'));
            UI.safeSetText('faq1A', Translate.get('faq1A'));
            UI.safeSetText('faq2Q', Translate.get('faq2Q'));
            UI.safeSetText('faq2A', Translate.get('faq2A'));
            UI.safeSetText('bioTitle', Translate.get('bioTitle') || Translate.get('title'));
            UI.safeSetText('bioSubtitle', Translate.get('bioSubtitle'));
            UI.safeSetText('bioQuote', Translate.get('bioQuote'));
            UI.safeSetText('footerLogo', Translate.get('title'));
            UI.safeSetText('footerServices', Translate.get('footerServices') || Translate.get('linkServices'));
            UI.safeSetText('footerPrivacy', Translate.get('footerPrivacy') || Translate.get('linkPrivacy'));
            UI.safeSetText('linkServices', Translate.get('footerServices') || Translate.get('linkServices'));
            UI.safeSetText('linkPrivacy', Translate.get('footerPrivacy') || Translate.get('linkPrivacy'));
            UI.safeSetText('chatBadge', Translate.get('chatBadge'));
            UI.safeSetText('backToHomeBtn', Translate.get('backToHomeBtn'));
            UI.safeSetText('chatBrandTitle', Translate.get('title'));
            UI.safeSetText('badge1', Translate.get('badge1'));
            UI.safeSetText('badge2', Translate.get('badge2'));
            UI.safeSetText('badge3', Translate.get('badge3'));

            // Re-render current chatbot step if active
            if (isIntakeStarted) {
                appFooter.innerHTML = '';
                this.renderCurrentStep(true);
            }
        },

        resetChatbot: function() {
            window.state = {
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
            currentStepIndex = 0;
            this.updateProgressBar();
            this.executeStep();
        },

        updateProgressBar: function() {
            if (!progressBarFill) return;
            const totalSteps = window.state.category.includes("سير") || window.state.category.includes("Traffic") || window.state.category.includes("תנועה") ? 5 : 6;
            const stepNum = Math.min(currentStepIndex, totalSteps);
            const percentage = Math.round((stepNum / totalSteps) * 100);
            progressBarFill.style.width = percentage + '%';
        },

        executeStep: function() {
            if (currentStepIndex >= intakeFlowSteps.length) return;
            
            const step = intakeFlowSteps[currentStepIndex];
            
            // Ask bot question
            this.addBotMsg(step.getQuestion());
            
            setTimeout(() => {
                this.renderCurrentStep();
            }, 500);
        },

        renderCurrentStep: function(isReRender = false) {
            appFooter.innerHTML = '';
            const step = intakeFlowSteps[currentStepIndex];

            if (step.type === 'choice') {
                const choices = step.getChoices();
                const container = UI.createElement('div', { className: 'choices-container' });

                choices.forEach(opt => {
                    const btn = UI.createElement('button', {
                        className: 'btn-choice',
                        onClick: () => this.handleChoiceSelection(opt, btn, container)
                    }, {}, opt.text);
                    container.appendChild(btn);
                });

                appFooter.appendChild(container);
            } else if (step.type === 'text') {
                this.renderTextInput(step);
            } else if (step.type === 'contact') {
                this.renderContactInput(step);
            }
        },

        handleChoiceSelection: function(choice, selectedBtn, container) {
            if (isProcessingChoice) return;
            isProcessingChoice = true;

            selectedBtn.classList.add('active');
            const buttons = container.querySelectorAll('.btn-choice');
            buttons.forEach(btn => btn.disabled = true);

            setTimeout(() => {
                isProcessingChoice = false;
                this.addUserMsg(choice.text);

                // Check permission branch
                const step = intakeFlowSteps[currentStepIndex];
                step.onSave(choice);
                const nextStepId = step.next(choice);

                if (nextStepId === 'closed') {
                    appFooter.innerHTML = '';
                    this.addBotMsg(Translate.get('q6Closed'));
                    
                    // Render Undo/Reset Button
                    const form = UI.createElement('div', { className: 'intake-form' });
                    const undoBtn = UI.createElement('button', {
                        className: 'btn-primary',
                        onClick: () => {
                            this.resetChatbot();
                        }
                    }, {}, Translate.get('q6Undo'));
                    form.appendChild(undoBtn);
                    appFooter.appendChild(form);
                    return;
                }

                // Advance to next index
                if (nextStepId === 'contact') {
                    currentStepIndex = intakeFlowSteps.findIndex(s => s.id === 'contact');
                } else if (nextStepId === 'accidentDetails') {
                    currentStepIndex = intakeFlowSteps.findIndex(s => s.id === 'accidentDetails');
                } else {
                    currentStepIndex++;
                }

                this.updateProgressBar();
                this.executeStep();
            }, 250);
        },

        renderTextInput: function(step) {
            const placeholder = Translate.get(step.placeholderKey);
            const wrapper = UI.createElement('div', { className: 'intake-form' });
            
            const row = UI.createElement('div', {}, {
                display: 'flex', gap: '8px', width: '100%', alignItems: 'center', marginBottom: '8px'
            });

            const input = UI.createElement('input', {
                type: 'text', className: 'form-control', placeholder: placeholder
            }, { flex: '1', minWidth: '0' });

            const micBtn = UI.createElement('button', {
                className: 'btn-mic',
                type: 'button',
                onClick: () => this.handleVoiceListening(input, placeholder, step)
            }, {
                background: 'var(--accent-gold)', color: '#000', border: 'none',
                padding: '12px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '1.1rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', width: '45px', height: '45px', flexShrink: '0'
            }, '🎙️');

            row.appendChild(input);
            row.appendChild(micBtn);

            const submitBtn = UI.createElement('button', {
                className: 'btn-primary',
                onClick: () => {
                    if (isProcessingChoice) return;
                    isProcessingChoice = true;
                    submitBtn.disabled = true;
                    setTimeout(() => {
                        isProcessingChoice = false;
                        const val = input.value.trim();
                        this.addUserMsg(val || '---');
                        step.onSave(val);
                        currentStepIndex++;
                        this.updateProgressBar();
                        this.executeStep();
                    }, 100);
                }
            }, {}, Translate.get('q7Submit') || 'موافق');

            wrapper.appendChild(row);
            wrapper.appendChild(submitBtn);
            appFooter.appendChild(wrapper);
            input.focus();
        },

        handleVoiceListening: function(inputElement, originalPlaceholder, step) {
            appFooter.innerHTML = '';

            const container = UI.createElement('div', { className: 'choices-container' }, { flexWrap: 'wrap' });
            const title = UI.createElement('div', {}, {
                width: '100%', textAlign: 'center', marginBottom: '12px',
                fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-gold)'
            }, Translate.get('micTitle') || '🎙️ اختر لغة التحدث:');
            container.appendChild(title);

            const langCodes = [
                { text: "عربي (Arabic)", code: "ar-IL" },
                { text: "עברית (Hebrew)", code: "he-IL" },
                { text: "English", code: "en-US" }
            ];

            langCodes.forEach(item => {
                const btn = UI.createElement('button', {
                    className: 'btn-choice',
                    onClick: () => this.startSpeechRecognition(item.code, inputElement.value, originalPlaceholder, step)
                }, { flex: '1 1 45%' }, item.text);
                container.appendChild(btn);
            });

            const cancelBtn = UI.createElement('button', {
                className: 'btn-choice',
                onClick: () => {
                    appFooter.innerHTML = '';
                    this.renderTextInput(step);
                }
            }, { flex: '1 1 100%', borderColor: 'rgba(255,255,255,0.1)' }, Translate.get('micCancel') || '❌ إلغاء');
            container.appendChild(cancelBtn);

            appFooter.appendChild(container);
        },

        startSpeechRecognition: function(langCode, existingText, originalPlaceholder, step) {
            appFooter.innerHTML = '';

            const wrapper = UI.createElement('div', { className: 'intake-form' });
            const row = UI.createElement('div', {}, {
                display: 'flex', gap: '8px', width: '100%', alignItems: 'center', marginBottom: '8px'
            });

            const input = UI.createElement('input', {
                type: 'text', className: 'form-control', value: existingText
            }, { flex: '1', minWidth: '0' });

            const micBtn = UI.createElement('button', {
                className: 'btn-mic', type: 'button'
            }, {
                background: '#ef4444', color: '#fff', border: 'none', padding: '12px',
                borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', flexShrink: '0'
            }, '🔴');

            const stopBtn = UI.createElement('button', {
                className: 'btn-primary'
            }, {}, Translate.get('micStop') || '⏹️ إيقاف وتأكيد الصوت');

            row.appendChild(input);
            row.appendChild(micBtn);
            wrapper.appendChild(row);
            wrapper.appendChild(stopBtn);
            appFooter.appendChild(wrapper);
            input.focus();

            let prefixText = existingText ? existingText + ' ' : '';
            let hasSessionEnded = false;

            const stopAndSave = () => {
                if (hasSessionEnded) return;
                hasSessionEnded = true;
                Voice.stopListening();
                appFooter.innerHTML = '';
                // Render text input again with newly speech-filled value
                this.reRenderTextInputWithValue(input.value, step);
            };

            stopBtn.onclick = stopAndSave;
            micBtn.onclick = stopAndSave;

            if (Voice.isSupported()) {
                Voice.startListening(langCode, {
                    onStart: () => {
                        const labels = { "ar-IL": "العربية", "he-IL": "עברית", "en-US": "English" };
                        const langLabel = labels[langCode] || "العربية";
                        
                        let listeningMsg = `جاري الاستماع باللغة ${langLabel}... تحدث الآن`;
                        if (Translate.getLanguage() === 'en') listeningMsg = `Listening in ${langLabel}... Speak now`;
                        if (Translate.getLanguage() === 'he') listeningMsg = `מקשיב בשפה ${langLabel}... דבר עכשיו`;
                        input.placeholder = listeningMsg;
                    },
                    onResult: (finalText, interimText) => {
                        input.value = prefixText + finalText + interimText;
                    },
                    onEnd: () => {
                        stopAndSave();
                    },
                    onError: () => {
                        stopAndSave();
                    }
                });
            } else {
                stopAndSave();
            }
        },

        reRenderTextInputWithValue: function(val, step) {
            this.renderTextInput(step);
            const input = appFooter.querySelector('.form-control');
            if (input) {
                input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        },

        renderContactInput: function(step) {
            const wrapper = UI.createElement('div', { className: 'intake-form' });

            const nameInput = UI.createElement('input', {
                type: 'text', className: 'form-control', placeholder: Translate.get('q7Name'), id: 'clientNameInput'
            });

            const phoneInput = UI.createElement('input', {
                type: 'tel', className: 'form-control', placeholder: Translate.get('q7Phone'), id: 'clientPhoneInput'
            });

            const errorMsg = UI.createElement('div', { id: 'validationErrorMsg' }, {
                color: '#f87171', fontSize: '0.85rem', marginTop: '4px', marginBottom: '8px',
                fontWeight: '600', display: 'none', width: '100%', background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '8px', textAlign: 'inherit'
            });

            nameInput.oninput = () => {
                nameInput.style.borderColor = '';
                errorMsg.style.display = 'none';
            };
            phoneInput.oninput = () => {
                phoneInput.style.borderColor = '';
                errorMsg.style.display = 'none';
            };

            const submitBtn = UI.createElement('button', {
                className: 'btn-primary',
                onClick: () => {
                    if (isProcessingChoice) return;
                    
                    const name = nameInput.value.trim();
                    const phone = phoneInput.value.trim();

                    nameInput.style.borderColor = '';
                    phoneInput.style.borderColor = '';
                    errorMsg.style.display = 'none';

                    if (name === '' || phone === '') {
                        errorMsg.innerHTML = `⚠️ ${Translate.get('q7Alert')}`;
                        errorMsg.style.display = 'block';
                        if (name === '') nameInput.style.borderColor = '#ef4444';
                        if (phone === '') phoneInput.style.borderColor = '#ef4444';
                        return;
                    }

                    const phoneRegex = /^05\d-?\d{7}$/;
                    if (!phoneRegex.test(phone)) {
                        errorMsg.innerHTML = `⚠️ ${Translate.get('q7PhoneAlert')}`;
                        errorMsg.style.display = 'block';
                        phoneInput.style.borderColor = '#ef4444';
                        return;
                    }

                    isProcessingChoice = true;
                    submitBtn.disabled = true;

                    // Save and Submit
                    step.onSave({ name, phone });
                    this.saveSubmission();
                }
            }, {}, Translate.get('q7Submit'));

            wrapper.appendChild(nameInput);
            wrapper.appendChild(phoneInput);
            wrapper.appendChild(errorMsg);
            wrapper.appendChild(submitBtn);
            appFooter.appendChild(wrapper);
            nameInput.focus();
        },

        saveSubmission: function() {
            isProcessingChoice = false;
            isIntakeStarted = false;
            appFooter.innerHTML = '';

            const successMsg = Translate.getLanguage() === 'en' ? "File sent successfully" : (Translate.getLanguage() === 'he' ? "הקובץ נשלח בהצלחה" : "تم إرسال الملف للمكتب بنجاح");
            this.addUserMsg(successMsg);

            // Construct new intake object
            const newSubmission = {
                id: Date.now(),
                clientName: window.state.clientName,
                clientPhone: window.state.clientPhone,
                dateSent: new Date().toLocaleDateString(),
                category: window.state.category,
                workLocation: window.state.workLocation,
                isNegligence: window.state.isNegligence || (Translate.getLanguage() === 'en' ? "N/A (Road accident)" : (Translate.getLanguage() === 'he' ? "לא רלוונטי (תאונת דרכים)" : "لا ينطبق (حادث سير)")),
                accidentDetails: window.state.accidentDetails,
                locationBefore: window.state.locationBefore,
                processed: false,
                submissionLang: Translate.getLanguage()
            };

            // Save via JLM.StorageService
            Storage.saveSubmission(newSubmission);

            // Toast celebration
            const celebrationMsg = Translate.getLanguage() === 'en' ? "🎉 Request submitted successfully." : (Translate.getLanguage() === 'he' ? "🎉 הבקשה נשלחה בהצלחה." : "🎉 تم إرسال الطلب بنجاح.");
            if (typeof startCelebration === 'function') {
                startCelebration(celebrationMsg);
            }

            setTimeout(() => {
                this.addBotMsg(Translate.get('finalSuccess'));
            }, 800);
        },

        addBotMsg: function(text) {
            // Re-render latest bot message bubble on language switch to prevent duplicated bubbles
            if (lastBotMsgBubble && document.body.contains(lastBotMsgBubble) && chatArea.lastElementChild && chatArea.lastElementChild.contains(lastBotMsgBubble)) {
                // If it is just a language update, overwrite text
                lastBotMsgBubble.innerHTML = text;
                return;
            }

            const bubble = UI.createElement('div', { className: 'msg-bubble' });
            bubble.innerHTML = text;

            const time = UI.createElement('div', { className: 'msg-time' }, {}, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            const msgDiv = UI.createElement('div', { className: 'message bot' }, {}, [bubble, time]);
            chatArea.appendChild(msgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;

            lastBotMsgBubble = bubble;
        },

        addUserMsg: function(text) {
            const bubble = UI.createElement('div', { className: 'msg-bubble' }, {}, text);
            const time = UI.createElement('div', { className: 'msg-time' }, {}, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            const msgDiv = UI.createElement('div', { className: 'message user' }, {}, [bubble, time]);
            chatArea.appendChild(msgDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
            
            // Clear last bot bubble reference to force creation of a new bubble on next turn
            lastBotMsgBubble = null;
        }
    };

    // Load intake system on window load
    window.onload = function() {
        window.JLM.ClientIntakeController.init();
    };
})();