import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1760697873924 implements MigrationInterface {
  name = 'Init1760697873924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."history_action_enum" AS ENUM('purchase', 'deposit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "history" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "action" "public"."history_action_enum" NOT NULL, "amount" numeric(18,2) NOT NULL, "ts" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ADD CONSTRAINT "FK_7d339708f0fa8446e3c4128dea9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history" DROP CONSTRAINT "FK_7d339708f0fa8446e3c4128dea9"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "history"`);
    await queryRunner.query(`DROP TYPE "public"."history_action_enum"`);
  }
}
