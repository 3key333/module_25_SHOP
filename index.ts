import express, { Express } from "express";
import path from "path";
import { Connection } from "mysql2/promise";
import { initDataBase } from "./Server/services/db";
import { initServer } from "./Server/services/server";
import dotenv from 'dotenv'
import SHOPApi from "./SHOP-api";
import ShopAdmin from "./Shop-admin";

dotenv.config()

export let server: Express;
export let connection: Connection | null = null;

const ROOT_PATH = "/api";

async function launchApplication() {
    server = initServer();
    connection = await initDataBase();

    if(connection === null){
        throw new Error('Database connection failed')
    }
    
    initRouter(connection);
}

function initRouter(dbConnection: Connection) {
    const shopApi = SHOPApi(dbConnection)
    server.use('/api', shopApi)

    const shopAdmin = ShopAdmin()
    server.use('/admin', shopAdmin)

    // Подключение react приложения:
    const clientDist = path.join(__dirname, 'Shop-client', 'shop-client', 'dist') //получаем путь до папки dist

    server.use(express.static(clientDist)) // раздаем все файлы из dist в статику

    //обрабатываем все GET запросы: 
    server.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            next() // если запрос POST/PUT и т.д - передаем в другие middleware
            return
        }
        res.sendFile(path.join(clientDist, 'index.html'), (err) => next(err))
    })
}

launchApplication();