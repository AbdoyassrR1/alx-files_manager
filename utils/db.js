#!/usr/bin/node
import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_URI = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(DB_URI, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.log(err.message);
        this.db = false;
      } else {
        console.log('Connected successfully to DB server');
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.usersCollection.countDocuments();
  }

  async nbFiles() {
    return this.filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
