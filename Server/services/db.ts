import mysql, { Connection } from "mysql2/promise";
import dotenv from 'dotenv'

dotenv.config()
const host = process.env.LOCAL_HOST
const port = Number(process.env.DB_PORT)
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const databaseName = process.env.DB_NAME 

export async function initDataBase(): Promise<Connection | null> {
    let connection: Connection | null = null;
  
    try {
        connection = await mysql.createConnection({
            host: host,
            port: port,
            user: user,
            password: password,
            database: databaseName,
        });
    } catch (e) {
        console.error(e);
        return null
    }
  
    console.log(`Connection to DB ProductsApplication established`);
    return connection;
}