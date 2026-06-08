export const AUTH_METHODS = {
  STANDARD_AUTH: "STANDARD_AUTH",
  AUTH0: "AUTH0",
  //add auth methods
} as const;

export type AuthMethod =
  | (typeof AUTH_METHODS)[keyof typeof AUTH_METHODS]
  | undefined;

export type UserData = {
  userName: string;
  password: string;
};

export type SsoUserData = {
  tokenId: string;
};

export type LoginOptions = {
  userName?: string;
  password?: string;
  onError?: () => void;
};

export type LogoutOptions = {
  onError?: () => void;
};

export type AuthService = {
  loading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  role: string;
  initials: string;
  email: string;
  login: (options: LoginOptions) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  softLogout: () => Promise<void>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  completeAuthentication: () => void;
};

export type AuthInstance = {
  type: string;
  instance: any;
};
