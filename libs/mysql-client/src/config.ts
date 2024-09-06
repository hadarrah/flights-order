

export class Config {
    private static host: string = process.env.MYSQL_HOST || 'localhost';
    private static user: string = process.env.MYSQL_USER || 'user';
    private static password: string = process.env.MYSQL_PASSWORD || 'password';
    private static database: string = process.env.MYSQL_DATABASE || 'db';

    public static getConfig() {
        return {
            host: Config.host,
            user: Config.user,
            password: Config.password,
            database: Config.database,
        }
    }
}