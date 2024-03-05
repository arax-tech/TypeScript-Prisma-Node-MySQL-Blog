import express from 'express'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';



router.post("/store", auth, user, async (request: Request, response: Response) => {
    try {
        request.body.ratings = Number(request.body.ratings);
        const { post_id, comment, ratings } = request.body;
        await prisma.comment.create({
            data: {
                user_id: Number(request.user.id),
                post_id: Number(post_id),
                comment,
                ratings,
            },
        });
        response.status(200).json({
            status: 200,
            message: "Comment Create Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }
});

router.patch("/update/:id", auth, user, async (request: Request, response: Response) => {
    try {
        request.body.ratings = Number(request.body.ratings);
        const { comment, ratings } = request.body;
        const { id } = request.params;
        await prisma.comment.update({
            where: { id: Number(id) },
            data: {
                comment,
                ratings,
            },
        });
        response.status(200).json({
            status: 200,
            message: "Comment Update Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }


});
router.delete("/delete/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        await prisma.comment.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Comment Delete Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }


});

module.exports = router;