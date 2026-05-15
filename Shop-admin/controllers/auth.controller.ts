import { Router, Request, Response, NextFunction } from "express";
import { throwServerError } from "./helper";
import { IAuthRequisites } from '@Shared/types'
import { verifyRequisetes } from "../models/auth.model";

export const authRouter = Router()

authRouter.get('/login', async (req: Request, res: Response) => {

    try{

        res.render('login')     

    }catch(error){
        throwServerError(res, error)
    }

})

authRouter.post('/authenticate', async (req: Request<{}, {}, IAuthRequisites>, res: Response) => {

    try {

        const verified = await verifyRequisetes(req.body)

        if(verified){
            req.session.username = req.body.username
            res.redirect(`/${process.env.ADMIN_PATH}`)
        }else{
            res.redirect(`/${process.env.ADMIN_PATH}/auth/login`)
        }
        
    } catch (error) {
        throwServerError(res, error)
    }

})

export const validateSession = (req: Request, res: Response, next:NextFunction) => {

    if(req.path.includes('/login') || req.path.includes('/authenticate') || req.path.includes('/logout')){
        next() // продолжает выполнение запроса
        return
    }

    if(req.session?.username){
        next()
    }else{
        res.redirect(`/${process.env.ADMIN_PATH}/auth/login`)
    }
}

authRouter.get('/logout', (req: Request, res: Response) => {

    req.session.destroy((error) => {
        if(error){
            throwServerError(res, error)
            return
        }

        res.redirect(`/${process.env.ADMIN_PATH}/auth/login`)
    })

})