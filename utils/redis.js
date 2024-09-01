#!/usr/bin/node
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client); // Optional: Promisify setex
    this.delAsync = promisify(this.client.del).bind(this.client); // Optional: Promisify del

    this.client.on('error', (error) => {
      console.log('Redis Client Failed To Connect: ', error);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected Successfully');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error('Error getting key from Redis:', error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.setexAsync(key, duration, value); // Awaiting setex
    } catch (error) {
      console.error('Error setting key in Redis:', error);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key); // Awaiting del
    } catch (error) {
      console.error('Error deleting key from Redis:', error);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
