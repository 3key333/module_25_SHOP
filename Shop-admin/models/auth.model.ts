import axios from "axios";
import { host } from "./const";
import { IAuthRequisites } from "@Shared/types";
import { NextFunction, Response } from "express";

export async function verifyRequisetes(requisetes: IAuthRequisites): Promise<boolean> {

    try {

        const { status } = await axios.post(`${host}/auth`, requisetes)
        
        return status === 200

    } catch (error) {
        return false
    }

}

export function checkAdminRole (req: Request, res: Response, next: NextFunction) {

    try {

        
        
    } catch (error) {
        
    }

}