export const AUTH_METHODS = {
    STANDARD_AUTH: 'STANDARD_AUTH',
    //add auth methods
} as const;

export type AuthMethod = typeof AUTH_METHODS[keyof typeof AUTH_METHODS] | undefined;