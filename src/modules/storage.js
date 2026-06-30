// Storage Service for LocalStorage database access
export function getSubmissions() {
    return JSON.parse(localStorage.getItem('jlm_legal_submissions') || '[]');
}

export function saveSubmissions(submissions) {
    localStorage.setItem('jlm_legal_submissions', JSON.stringify(submissions));
}

export function clearSubmissions() {
    localStorage.removeItem('jlm_legal_submissions');
}
