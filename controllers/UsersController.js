#!/usr/bin/node
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }

    const emailExists = await dbClient.usersCollection.findOne({ email });
    if (emailExists) {
      return response.status(400).send({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    let result;
    try {
      result = await dbClient.usersCollection.insertOne({
        email,
        password: hashedPassword,
      });
    } catch (err) {
      await userQueue.add({});
      return response.status(500).send({ error: 'Error creating user.' });
    }

    const user = {
      id: result.insertedId,
      email,
    };

    await userQueue.add({
      userId: result.insertedId.toString(),
    });

    return response.status(201).send(user);
  }

  static async getMe(request, response) {
    const getUserIdAndKey = async (request) => {
      const obj = { userId: null, key: null };

      const xToken = request.header('X-Token');

      if (!xToken) {
        return obj;
      }

      obj.key = `auth_${xToken}`;

      obj.userId = await redisClient.get(obj.key);

      return obj;
    };
    const { userId } = await getUserIdAndKey(request);

    const user = await dbClient.usersCollection.findOne({
      _id: ObjectId(userId),
    });
    if (!user) {
      return response.status(401).send({ error: 'Unauthorized' });
    }

    const processedUser = { id: user._id, ...user };
    delete processedUser._id;
    delete processedUser.password;

    return response.status(200).send(processedUser);
  }
}

export default UsersController;
