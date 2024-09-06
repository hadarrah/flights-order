import AsyncRedis from 'async-redis';
import {Multi} from "redis";
import {Config} from "./config";

export class RedisClient {
    private static instance: RedisClient;
    private client;

    private constructor() {
        this.client = AsyncRedis.createClient(Config.getConfig());

        this.client.on('error', (err: Error) => {
            console.error('Redis Client Error:', err);
        });

    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    public async exists(key: string): Promise<number> {
        return await this.client.exists(key);
    }

    public async hset(key: string, field: string, value: string): Promise<number> {
        return await this.client.hset([key, field, value]);
    }


    public async hgetall(key: string): Promise<{[key: string]: string}> {
        return await this.client.hgetall(key);
    }

    public multi(): Multi {
        return this.client.multi();
    }

    public async keys(pattern: string): Promise<string[]> {
        return await this.client.keys(pattern);
    }

    public async watch(key: string): Promise<void> {
        await this.client.watch(key);
    }

    public async unwatch(): Promise<void> {
        await this.client.unwatch();
    }
    // Add other Redis operations as needed
}
