export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  company_id: string;
  device_id: string;
  email_verified: boolean;
  is_onboarded: boolean;
  full_name?: string;
  iat?: number;
  exp?: number;
}

export interface UserWithCompany {
  id: string;
  email: string;
  role: string;
  company_id: string;
  email_verified: boolean;
  full_name: string;
  company: {
    id: string;
    name: string;
    company_code: string;
  };
}
