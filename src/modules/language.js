// Language Management Service
import { ar } from '../lang/ar.js';
import { he } from '../lang/he.js';
import { en } from '../lang/en.js';

export const translations = { ar, he, en };

let currentLang = 'ar';

export function getCurrentLang() {
    return currentLang;
}

export function setCurrentLang(lang) {
    currentLang = lang;
    localStorage.setItem('jlm_lawyer_lang', lang); // sync settings
}

export function updateDirectionAndLang(lang) {
    const dir = (lang === 'en') ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.style.direction = dir;
}
