// Validation Service for Form Inputs
export function validateIsraeliPhone(phone) {
    const phoneRegex = /^05\d-?\d{7}$/;
    return phoneRegex.test(phone);
}
