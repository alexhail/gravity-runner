import { DataSource } from "typeorm";
import { join } from 'path';
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "mark4320",
    database: process.env.DB_NAME || "gravity_runner",
    synchronize: false,
    logging: isProduction ? false : true,
    entities: [isProduction ? "dist/models/**/*.js" : "src/models/**/*.ts"],
    migrations: [isProduction ? "dist/migrations/**/*.js" : "src/migrations/**/*.ts"],
    subscribers: [isProduction ? "dist/subscribers/**/*.js" : "src/subscribers/**/*.ts"]
}); 