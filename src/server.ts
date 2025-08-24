import app from './app';
import { CONFIG } from './config';
import logger from './config/logger';

const startServer = () => {
    const PORT = CONFIG.PORT;
    try {
        app.listen(PORT, () => {
            logger.info(`Server started on PORT ${PORT}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

void startServer();
