
export enum UserCategory {
    User = 'user',
    GYS_USER = 'GYS_USER',
    SUPER_ADMIN = 'SAMSARA_SUPER_ADMIN',
}

export enum accountStatus {
    Approved = 'approved',
    Rejected = 'rejected',
    Pending = 'pending',
    Blocked='blocked'
}

export enum otpPurpose {
    LOGIN = 'authorisation',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

export const meetingTypes = [
    { value: 'consultation', label: '15-min Consultation' },
    { value: 'demo', label: 'Product Demo' },
    { value: 'support', label: 'Technical Support' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'blockhain', label: 'Web3 Development' },
    { value: 'ai', label: 'Ai Development' },
    { value: 'app', label: 'App Development' },
    { value: 'ui', label: 'UI/UX Development' },
  ];