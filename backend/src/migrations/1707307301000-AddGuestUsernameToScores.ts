import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGuestUsernameToScores1707307301000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add guestUsername column
        await queryRunner.addColumn(
            "scores",
            new TableColumn({
                name: "guestUsername",
                type: "varchar",
                length: "50",
                isNullable: true
            })
        );

        // Make userId nullable for existing records
        await queryRunner.changeColumn(
            "scores",
            "userId",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert userId to non-nullable
        await queryRunner.changeColumn(
            "scores",
            "userId",
            new TableColumn({
                name: "userId",
                type: "int",
                isNullable: false
            })
        );

        // Remove guestUsername column
        await queryRunner.dropColumn("scores", "guestUsername");
    }
} 