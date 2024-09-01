#!/usr/bin/node
import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const DB_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

class DBClient {
  constructor() {
    this.db = null;
    this.usersCollection = null;
    this.filesCollection = null;

    this.init();
  }

  async init() {
    try {
      const client = await MongoClient.connect(DB_URI);
      console.log('Connected successfully to DB server');
      this.db = client.db(DB_DATABASE);
      this.usersCollection = this.db.collection('users');
      this.filesCollection = this.db.collection('files');
    } catch (err) {
      console.error('Error connecting to DB:', err.message);
    }
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    if (this.isAlive()) {
      return this.usersCollection.countDocuments();
    }
    return 0;
  }

  async nbFiles() {
    if (this.isAlive()) {
      return this.filesCollection.countDocuments();
    }
    return 0;
  }
}

const dbClient = new DBClient();
export default dbClient;
