
export enum UserCategory {
    User = 'user',
    GYS_USER = 'GYS_USER',
    SUPER_ADMIN = 'SAMSARA_SUPER_ADMIN',
    SAMSARA_OPERATION = 'GYS_OPERATION',
    SAMSARA_MARKETING = 'GYS_MARKETING',
}

export const Permission = {
    MANAGE_USERS: "manage_users",
    CREATE_TRAVEL_PACKAGE: "create_travel_package",
    UPDATE_TRAVEL_PACKAGE: "update_travel_package",
    DELETE_TRAVEL_PACKAGE: "delete_travel_package",
    VIEW_TRAVEL_PACKAGES: "view_travel_packages",
    MANAGE_ROLES: "manage_roles",
    ASSIGN_PERMISSIONS: "assign_permissions",
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

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