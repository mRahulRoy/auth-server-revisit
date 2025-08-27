import { DataSource } from 'typeorm';

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export function isJwt(token: string | null): boolean {
    if (token == null) return false;
    const parts = token.split('.');
    if (parts.length != 3) return false;
    try {
        parts.forEach((part: string) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
}
