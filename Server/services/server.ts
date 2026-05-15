import express, { Express } from "express";
import dotenv from 'dotenv'

dotenv.config()

const port = Number(process.env.LOCAL_PORT);
const host = String(process.env.LOCAL_HOST);

export function initServer(): Express {
    const app = express();
    app.use(express.json());
  
    app.listen(port, host, () => {
      console.log(`Server running on port 3000`);
    });
  
    return app;
}