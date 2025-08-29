import { expressjwt } from 'express-jwt';
import { CONFIG } from '../config';
import { Request } from 'express';
import { AuthCookie, IRefreshTokenPayload } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import logger from '../config/logger';

export default expressjwt({
    secret: CONFIG.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.find({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });

            return refreshToken === null;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            logger.error('Error while getting the refresh token ', {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    },
});
