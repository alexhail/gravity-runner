import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProfilesTable1707307400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "profiles",
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
                        type: "int",
                        isUnique: true
                    },
                    {
                        name: "displayName",
                        type: "varchar",
                        length: "50",
                        isNullable: true
                    },
                    {
                        name: "avatar",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "preferences",
                        type: "json",
                        isNullable: true
                    },
                    {
                        name: "achievements",
                        type: "json",
                        isNullable: true
                    },
                    {
                        name: "stats",
                        type: "json",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP"
                    }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            "profiles",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );

        // Set default values for JSON columns after table creation
        await queryRunner.query(`
            UPDATE profiles 
            SET preferences = '{}',
                achievements = '[]',
                stats = '{}'
            WHERE preferences IS NULL
               OR achievements IS NULL
               OR stats IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("profiles");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("userId") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("profiles", foreignKey);
            }
        }
        await queryRunner.dropTable("profiles");
    }
} 