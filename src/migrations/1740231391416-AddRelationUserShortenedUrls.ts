import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationUserShortenedUrls1740231391416 implements MigrationInterface {
    name = 'AddRelationUserShortenedUrls1740231391416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`shortened_urls\` (\`id\` int NOT NULL AUTO_INCREMENT, \`shortCode\` varchar(255) NOT NULL, \`originalUrl\` varchar(255) NOT NULL, \`clickCount\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, UNIQUE INDEX \`IDX_c4ec4ec8d1c6f3c7a6ead0eec8\` (\`shortCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`shortened_urls\` ADD CONSTRAINT \`FK_a6ddf97863e5c4fe074fe19cfcb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shortened_urls\` DROP FOREIGN KEY \`FK_a6ddf97863e5c4fe074fe19cfcb\``);
        await queryRunner.query(`DROP INDEX \`IDX_c4ec4ec8d1c6f3c7a6ead0eec8\` ON \`shortened_urls\``);
        await queryRunner.query(`DROP TABLE \`shortened_urls\``);
    }

}
