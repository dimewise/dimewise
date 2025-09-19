export const SOCIAL_AUTHS = ['facebook', 'google', 'apple', 'line'] as const;
export type SocialAuthType = (typeof SOCIAL_AUTHS)[number];
