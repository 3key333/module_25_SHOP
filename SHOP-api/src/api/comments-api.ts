import { Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { CommentCreatePayload, ICommentEntity } from '../../types';
import { IComment } from '@Shared/types';
import { validateComment } from '../comment-validator';
import { connection } from '../..';
import { mapCommentsEntity } from '../services/mapping';
import { ResultSetHeader } from 'mysql2/promise'
import { param, validationResult } from 'express-validator'

export const commentsRouter = Router()

const PATH = '/';

commentsRouter.get(PATH, async (_req: Request, res: Response) => {

    try {

        const [ comments ] = await connection.query<ICommentEntity[]>(
            `SELECT * FROM comments`
        )
    
        res.status(200).json({message: 'ok', data: mapCommentsEntity(comments)})
        
    } catch (error) {   
        console.log(error)
        res.status(500).json({message: 'Something went wrong'})
    }
    
});

commentsRouter.get(
    `${PATH}:id`,
    [
        param('id').isUUID().withMessage('Comment id is not UUID')
    ], 
    async (req: Request<{ id: string }>, res: Response) => {

    try {

        const errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
            return
        }

        const id = req.params.id

        const [ comment ] = await connection.query<ICommentEntity[]>(
            `SELECT * FROM comments
            WHERE id = ?`,
            [id]
        )

        if(!comment[0]){
            res.status(404).json({message: 'Comment not found'})
            return
        }

        res.status(200).json({message: 'ok', data: comment[0]})

    } catch (error) {
        res.status(500).json({message: 'Something went wrong'})
    }

})

commentsRouter.post(PATH, async (req: Request<{}, {}, CommentCreatePayload>, res: Response) => {

    const { name, email, body, productId } = req.body;

    const findDuplicateQuery = `
        SELECT * FROM comments c
        WHERE LOWER(c.email) = ?
        AND LOWER(c.name) = ?
        AND LOWER(c.body) = ?
        AND c.product_id = ?
    `;
   
    const [sameResult] = await connection.query<ICommentEntity[]>(
        findDuplicateQuery,
        [email.toLowerCase(), name.toLowerCase(), body.toLowerCase(), productId]
    );

    if (sameResult.length) {
        res.status(422);
        res.send("Comment with the same fields already exists");
        return;
    }

    const id = uuidv4();

    const insertQuery = `
        INSERT INTO comments
        (id, email, name, body, product_id)
        VALUES
        (?, ?, ?, ?, ?)
    `;
   
    await connection.query(
    insertQuery,
      [ id, email, name, body, productId ]
    );
   
   res.status(201).json({message:`Comment id:${id} has been added!`})

});

commentsRouter.patch('/', async (req: Request<{}, {}, Partial<IComment>>, res: Response) => {
        try {
            let updateQuery = "UPDATE comments SET ";

            const valuesToUpdate = [];

            const editableFields: Array<keyof IComment> = ["name", "body", "email"];
            
            editableFields.forEach((fieldName) => {
                if (Object.prototype.hasOwnProperty.call(req.body, fieldName)) {
                if (valuesToUpdate.length) updateQuery += ", ";
                updateQuery += `${fieldName} = ?`;
                valuesToUpdate.push(req.body[fieldName]);
                }
            });

            updateQuery += " WHERE id = ?";
            valuesToUpdate.push(req.body.id);

            const [info] = await connection.query<ResultSetHeader>(updateQuery, valuesToUpdate);

            if (info.affectedRows === 1) {
                res.status(200);
                res.end();
                return;
            }

            const newComment = req.body as CommentCreatePayload;
            const validationResult = validateComment(newComment);

            if (validationResult) {
                res.status(400);
                res.send(validationResult);
                return;
            }

            const INSERT_COMMENT_QUERY = 
            `INSERT INTO comments (id, email, name, body, product_id)
            VALUES (?, ?, ?, ?, ?)`

            const id = uuidv4();
            await connection.query(
                INSERT_COMMENT_QUERY,
                [id, newComment.email, newComment.name, newComment.body, newComment.productId]
            );

            res.status(201);
            res.send({ ...newComment, id })
        } catch (e) {
            
            res.status(500).json({message: 'Something went wrong'})
            
        }
});

commentsRouter.delete(`${PATH}:id`, async (req: Request<{ id: string }>, res: Response) => {

    try {

        const id = req.params.id

        const [ commentForDelete ] = await connection.query<ResultSetHeader>(
            `DELETE from comments
            WHERE id = ?`,
            [id]
        )

        if(commentForDelete.affectedRows === 0){
            res.status(404).json({message: 'Comment not found'})
            return
        }

        res.status(200)
        res.end()

    } catch (error) {
        res.status(500).json({message: 'Something went wrong'})
    }

});