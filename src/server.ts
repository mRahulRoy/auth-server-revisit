import app from './app';
import { CONFIG } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    const PORT = CONFIG.PORT;
    try {
        await AppDataSource.initialize();
        logger.info('Database connected successfully!');
        app.listen(PORT, () => {
            logger.info(`Server started on PORT ${PORT}`);
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

void startServer();
