import { AppDataSource } from "../data-source";
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

export async function initializeDatabase(): Promise<boolean> {
    try {
        // First, create the database if it doesn't exist
        const connection = await createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "3306"),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || "mark4320",
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.end();

        // Initialize TypeORM connection
        await AppDataSource.initialize();
        console.log("Database connection has been initialized!");

        // Run migrations
        await AppDataSource.runMigrations();
        console.log("Migrations have been executed successfully.");

        return true;
    } catch (error) {
        console.error("Error during database initialization:", error);
        throw error;
    }
} 