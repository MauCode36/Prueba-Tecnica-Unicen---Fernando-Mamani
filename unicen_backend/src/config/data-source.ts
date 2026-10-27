import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "unicen_db",
  entities: [
    __dirname + "/../**/*.orm-entity{.ts,.js}",
    __dirname + "/../**/*.entity{.ts,.js}",
  ],
  migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
  synchronize: false,
});
