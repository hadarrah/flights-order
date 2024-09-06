import {RedisClient} from "./redis-client";

async function init_cache() {
    console.info('Initializing cache');
    const redisClient = RedisClient.getInstance();

    const flightKeys = await redisClient.keys('flight:*')
    for (const key of flightKeys) {
        console.log(`delete key: ${key}`);
        await redisClient.del(key);
    }

    const bookingKeys = await redisClient.keys('booking:*')
    for (const key of bookingKeys) {
        console.log(`delete key: ${key}`);
        await redisClient.del(key);
    }


    console.info('Cache initialized');

}

init_cache();