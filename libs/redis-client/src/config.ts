

export class Config {
    private static host: string = process.env.REDIS_HOST || 'localhost';
    private static port: number = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    private static db: number = process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0;

    public static getConfig() {
        return {
            host: Config.host,
            port: Config.port,
            db: Config.db,
        }
    }
}