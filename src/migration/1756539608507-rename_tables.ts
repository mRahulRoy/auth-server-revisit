import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserToUsers1756539608507 implements MigrationInterface {
    name = 'RenameUserToUsers1756539608507';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop existing FK from refreshTokens → user
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
        );

        // 2. Rename user → users (safe, data preserved)
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);

        // 3. Re-add FK pointing to new table
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop FK from refreshTokens → users
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
        );

        // 2. Rename users → user
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);

        // 3. Re-add FK pointing back to old table
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
