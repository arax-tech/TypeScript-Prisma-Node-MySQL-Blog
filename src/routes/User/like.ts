import express from 'express'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';



router.get("/:post_id", auth, user, async (request: Request, response: Response) => {
    try {
        const { post_id } = request.params;
        await prisma.like.create({
            data: {
                user_id: Number(request.user.id),
                post_id: Number(post_id),
            },
        });
        response.status(200).json({
            status: 200,
            message: "Like Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }

});



router.get("/remove/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        await prisma.like.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Unlike Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }


});

module.exports = router;