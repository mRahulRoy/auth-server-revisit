import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantTable1756651201344 implements MigrationInterface {
    name = 'CreateTenantTable1756651201344';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tenants" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "address" character varying NOT NULL,
                CONSTRAINT "PK_tenants_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenants"`);
    }
}
