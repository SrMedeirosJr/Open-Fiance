import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtColumn1740249312804 implements MigrationInterface {
    name = 'AddDeletedAtColumn1740249312804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shortened_urls\` ADD \`deletedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shortened_urls\` DROP COLUMN \`deletedAt\``);
    }

}
