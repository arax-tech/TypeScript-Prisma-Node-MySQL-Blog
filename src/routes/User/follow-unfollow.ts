import express from 'express'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';

router.get("/follow/:follow_id", auth, user, async (request: Request, response: Response) => {
    try {
        await prisma.user.update({
            where: { id: request.user.id },
            data: {
                followings: {
                    connect: { id: Number(request.params.follow_id) },
                },
            },
        });

        response.status(200).json({
            status: 200,
            message: "Follow Successfully..."
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});
router.get("/unfollow/:unfollow_id", auth, user, async (request: Request, response: Response) => {
    try {
        await prisma.user.update({
            where: { id: request.user.id },
            data: {
                followings: {
                    disconnect: { id: Number(request.params.unfollow_id) },
                },
            },
        });

        response.status(200).json({
            status: 200,
            message: "UnFollow Successfully..."
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});



module.exports = router;