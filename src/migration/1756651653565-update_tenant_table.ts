import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTenantTable1756651653565 implements MigrationInterface {
    name = 'UpdateTenantTable1756651653565';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tenants" 
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tenants"
            DROP COLUMN "createdAt",
            DROP COLUMN "updatedAt"
        `);
    }
}
