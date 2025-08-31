import { Request } from 'express';
export interface UserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: number;
}

export interface TokenPayload {
    sub: string;
    role: string;
}

export default interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id?: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface ITenants {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenants;
}
export interface CreateUserRequest extends Request {
    body: UserData;
}
export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    tenantId: number;
}
export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}
export interface UserQueryParams {
    perPage: number;
    currentPage: number;
    role: string;
    q: string;
}
