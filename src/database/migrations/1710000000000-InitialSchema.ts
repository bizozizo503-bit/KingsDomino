import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema bootstrap. The schema builder uses the registered entity
 * metadata, making this migration include indexes/relations added over time
 * while remaining safe to run against an empty database.
 */
export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.driver.createSchemaBuilder().build();
  }

  async down(): Promise<void> {
    // The initial schema is intentionally not destructively rolled back.
  }
}
