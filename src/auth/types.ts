export type DuckerEnv = {
  enabled: string | undefined;
  issuer: string | undefined;
  clientId: string | undefined;
  scope: string | undefined;
  profilePath: string | undefined;
};

export type DuckerConfig = {
  issuer: string;
  clientId: string;
  scope: string;
  profileUrl: string;
};

export type DuckerProfile = {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string | null;
};

export type PendingAuth = {
  state: string;
  verifier: string;
  returnTo: string;
};

export type CallbackResult = {
  code?: string;
  verifier?: string;
  error?: string;
  returnTo?: string;
};

export type AuthStatus = 'idle' | 'loading' | 'signed-in' | 'signed-out';

export type AuthSnapshot = {
  status: AuthStatus;
  profile: DuckerProfile | null;
};
