import './session-types'
import express, { Express } from 'express'
import { productsRouter } from './controllers/products.controller'
import layouts from 'express-ejs-layouts'
import bodyParser from "body-parser";
import { authRouter, validateSession } from './controllers/auth.controller';
import session from 'express-session';

export default function (): Express {
    const app = express()

    app.use(session({
        secret: process.env.SESSION_SECRET ?? 'abcde',
        saveUninitialized: false,
        resave: false
    }))

    app.use(express.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.set("view engine", "ejs");
    app.set("views", "Shop-admin/views");
    app.set("layout", "layouts");

    app.use(express.static(__dirname + "/public"))
    app.use(layouts)
    app.use((req, res, next) => {
        res.locals.isAuthSection = req.path === '/auth' || req.path.startsWith('/auth/')
        res.locals.isAdminRole = req.session.username === process.env.ADMIN_ROLE
        next()
    })
    app.use(validateSession)
    app.use('/', productsRouter)
    app.use('/auth', authRouter)
    
    return app
}