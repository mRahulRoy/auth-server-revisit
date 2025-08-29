export interface UserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface TokenPayload {
    sub: string;
    role: string;
}

export default interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: number;
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
