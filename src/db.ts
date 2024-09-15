import { MongoClient } from "mongodb";
import { MONGO_DB_URL } from "./config";

const client = new MongoClient(MONGO_DB_URL);
export const db = client.db();
