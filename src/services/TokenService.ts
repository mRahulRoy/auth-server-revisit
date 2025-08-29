import JWT, { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { CONFIG } from '../config';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entity/RefreshToken';

class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, '../../certs/private.pem'),
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const err = createHttpError(500, 'Error reading private key');
            throw err;
        }
        return JWT.sign(payload, privateKey!, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });
    }
    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = JWT.sign(payload, CONFIG.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
        return refreshToken;
    }
    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const rewRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return rewRefreshToken;
    }
    async deleteRefreshToken(id: number) {
        return await this.refreshTokenRepository.delete({ id: id });
    }
}

export default TokenService;
