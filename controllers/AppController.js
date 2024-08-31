#!/usr/bin/node
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200).send(status);
  }

  static getStats(request, response) {
    const stats = {
      users: dbClient.usersCollection,
      files: dbClient.filesCollection,
    };
    response.status(200).send(stats);
  }
}

export default AppController;
