export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  company_id: string;
  device_id: string;
  iat?: number;
  exp?: number;
}

export interface UserWithCompany {
  id: string;
  email: string;
  role: string;
  company_id: string;
  company: {
    id: string;
    name: string;
    company_code: string;
  };
}
