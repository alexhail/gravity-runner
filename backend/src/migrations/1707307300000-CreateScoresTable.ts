import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateScoresTable1707307300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "scores",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "userId",
                        type: "int"
                    },
                    {
                        name: "score",
                        type: "int"
                    },
                    {
                        name: "gameTime",
                        type: "int",
                        comment: "Game time in seconds"
                    },
                    {
                        name: "collectibles",
                        type: "int"
                    },
                    {
                        name: "distance",
                        type: "int",
                        comment: "Distance traveled in game units"
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            "scores",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("scores");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("scores", foreignKey);
            }
        }
        await queryRunner.dropTable("scores");
    }
} 