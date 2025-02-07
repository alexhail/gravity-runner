import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveEmailFromUsers1707307300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "email");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "email",
                type: "varchar",
                length: "255",
                isUnique: true
            })
        );
    }
} 