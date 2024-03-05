import express from 'express'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';

router.get("/", auth, user, async (request: Request, response: Response) => {
    try {
        const users = await prisma.user.findMany({
            include:{
                posts:true,
                comments:true,
                likes:true
            }
        });
        response.status(200).json({
            status: 200,
            users: users
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});
router.post("/store", auth, user, async (request: Request, response: Response) => {
    const { name, email, password } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        response.status(500).json({
            status: 500,
            message: "Email is already taken, Please use another email...",
        });
    } else {

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            },
        });
        response.status(200).json({
            status: 200,
            message: "User Create Successfully..."
        })
    }
});

router.get("/:id", auth, user, async (request: Request, response: Response) => {
    const { id } = request.params;
    const user = await prisma.user.findUnique({where: { id: Number(id) }});
    response.status(200).json({
        status: 200,
        user: user
    })

});
router.patch("/update/:id", auth, user, async (request: Request, response: Response) => {
    const { name, email } = request.body;
    const { id } = request.params;
    await prisma.user.update(
        {
            where: { id: Number(id) },
            data: {
                name,
                email,
            },
        });
    response.status(200).json({
        status: 200,
        message: "User Update Successfully..."
    })

});
router.delete("/delete/:id", auth, user, async (request: Request, response: Response) => {
    const { id } = request.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    response.status(200).json({
        status: 200,
        message: "User Delete Successfully..."
    })

});

module.exports = router;