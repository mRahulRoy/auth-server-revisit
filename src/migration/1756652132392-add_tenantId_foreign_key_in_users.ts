import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantIdForeignKeyInUsers1756652132392
    implements MigrationInterface
{
    name = 'AddTenantIdForeignKeyInUsers1756652132392';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" integer`);

        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`,
        );

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`);
    }
}
