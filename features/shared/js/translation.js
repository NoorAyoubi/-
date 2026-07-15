/**
 * 🌐 translation.js - Shared Translation Service
 * Implements a pub-sub model for language switching and provides a centralized translator API.
 * Rebuilt to include automatic browser language detection and choice persistence.
 */
(function () {
    window.JLM = window.JLM || {};

    let currentLang = 'ar';
    let dictionary = {};
    const callbacks = [];

    window.JLM.TranslationService = {
        init: function (translationsDict, defaultLang = 'ar') {
            dictionary = translationsDict;
            currentLang = defaultLang;
        },

        detectLanguage: function (supportedLangs = ['ar', 'he', 'en'], defaultLang = 'ar') {
            // 1. Check URL parameters (?lang=he)
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const urlLang = urlParams.get('lang');
                if (urlLang && supportedLangs.includes(urlLang)) {
                    return urlLang;
                }
            } catch (e) { }

            // 2. Check LocalStorage persistence
            try {
                const savedLang = localStorage.getItem('jlm_active_language');
                if (savedLang && supportedLangs.includes(savedLang)) {
                    return savedLang;
                }
            } catch (e) { }

            // 3. Detect browser language
            try {
                const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
                const matched = supportedLangs.find(lang => browserLang.startsWith(lang));
                if (matched) {
                    return matched;
                }
            } catch (e) { }

            return defaultLang;
        },

        setLanguage: function (lang) {
            currentLang = lang;

            // Persist manually selected language
            try {
                localStorage.setItem('jlm_active_language', lang);
            } catch (e) { }

            // Update document attributes
            const dir = (lang === 'en') ? 'ltr' : 'rtl';
            document.documentElement.lang = lang;
            document.documentElement.dir = dir;
            document.body.style.direction = dir;

            // Notify subscribers
            callbacks.forEach(callback => {
                try {
                    callback(lang);
                } catch (e) {
                    console.error("Error in translation change callback:", e);
                }
            });
        },

        getLanguage: function () {
            return currentLang;
        },

        onLanguageChange: function (callback) {
            if (typeof callback === 'function') {
                callbacks.push(callback);
            }
        },

        get: function (key, ...args) {
            const langDict = dictionary[currentLang] || dictionary.ar;
            if (!langDict) {
                return key;
            }

            const val = langDict[key];
            if (val === undefined) {
                return key;
            }

            if (typeof val === 'function') {
                return val(...args);
            }
            return val;
        }
    };
})();

