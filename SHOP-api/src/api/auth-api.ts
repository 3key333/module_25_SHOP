import { Router, Request, Response } from "express";
import { IUserRequisitesEntity } from "../../types";
import { connection } from "../..";
import { body, validationResult } from "express-validator";

const throwServerError = (res: Response, e: unknown) => {
    res.status(500).json({message: 'Something went wrong'})
}

export const authRouter = Router()

authRouter.post(
    '/',
    [ 
        // правила проверяются до основного кода 
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ], 
    async (req: Request<{}, {}, IUserRequisitesEntity>, res: Response) => {

    try {

        const errors = validationResult(req)
        
        if(!errors.isEmpty()){ // если НЕ isEmpty (то есть есть ошибки) 
        //errors.isEmpty() возвращает false (есть ошибки) → !false = true → условие выполняется
            res.status(400).json({error: errors.array()})
            return 
        }

        const { username, password } = req.body

        const [ data ] = await connection.query<IUserRequisitesEntity[]>(
            `SELECT * FROM users 
            WHERE username = ? AND password = ?`,
            [username, password]
        )

        if(!data.length){
            res.status(404)
            return
        }

        res.send()
        
    } catch (error) {
        throwServerError(res, error)
    }

})