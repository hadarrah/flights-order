import mysql, { PoolConnection, RowDataPacket} from "mysql2/promise";
import { QueryResult} from "mysql2/typings/mysql/lib/protocol/packets";
import {Config} from "./config";

export class MysqlClient {
    private static instance: MysqlClient;
    private db: mysql.Pool;

    private constructor() {
        this.db = mysql.createPool(Config.getConfig());

        this.db.on('connection', (connection: PoolConnection) => {
            console.log('MySQL Connection Established');
            connection.on('error', (err: Error) => {
                console.error('MySQL Connection Error:', err);
            });
        });

    }

    public static getInstance(): MysqlClient {
        if (!MysqlClient.instance) {
            MysqlClient.instance = new MysqlClient();
        }
        return MysqlClient.instance;
    }

    // Query Method
    async query<T extends RowDataPacket[]>(sql: string, values?: any[]): Promise<T> {

        const [rows] = await this.db.execute<T>(sql, values);
        return rows;
    }

    // Execute Method
    async execute(sql: string, values?: any[]): Promise<QueryResult> {
        const [result] = await this.db.execute(sql, values);
        return result;
    }


    async getConnection(): Promise<PoolConnection> {
        return await this.db.getConnection();
    }

    // Close the pool connection
    async close(): Promise<void> {
        await this.db.end();
        console.log('MySQL Connection Closed');
    }
}

