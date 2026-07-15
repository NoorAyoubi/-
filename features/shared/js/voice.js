/**
 * 🎙️ voice.js - Shared Voice Recognition Service
 * Abstracts Web Speech API to separate voice interface logic from DOM UI details.
 */
(function() {
    window.JLM = window.JLM || {};

    let recognition = null;
    let isListening = false;

    window.JLM.VoiceService = {
        isSupported: function() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            return !!SpeechRecognition;
        },

        startListening: function(langCode, callbacks = {}) {
            if (isListening) {
                this.stopListening();
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                if (callbacks.onError) callbacks.onError("Speech recognition not supported in this browser.");
                return false;
            }

            try {
                recognition = new SpeechRecognition();
                recognition.lang = langCode;
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onstart = () => {
                    isListening = true;
                    if (callbacks.onStart) callbacks.onStart();
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

                    if (callbacks.onResult) {
                        callbacks.onResult(finalTranscript, interimTranscript);
                    }
                };

                recognition.onerror = (event) => {
                    console.error("Speech Recognition Error:", event.error);
                    if (callbacks.onError) callbacks.onError(event.error);
                };

                recognition.onend = () => {
                    isListening = false;
                    recognition = null;
                    if (callbacks.onEnd) callbacks.onEnd();
                };

                recognition.start();
                return true;
            } catch (e) {
                console.error("Failed to start Speech Recognition:", e);
                if (callbacks.onError) callbacks.onError(e);
                return false;
            }
        },

        stopListening: function() {
            if (recognition && isListening) {
                try {
                    recognition.stop();
                } catch (e) {
                    console.error("Error stopping Speech Recognition:", e);
                }
                isListening = false;
                recognition = null;
            }
        },

        isCurrentlyListening: function() {
            return isListening;
        }
    };
})();
