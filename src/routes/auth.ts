import express from 'express'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import JWT from "jsonwebtoken";
import prisma from '../client';
import auth from '../middleware/auth';
const router = express.Router();

router.post("/register", async (request: Request, response: Response) => {
    try {
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
                message: "Registration Successfully..."
            })
        }
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }

});


router.post("/login", async (request: Request, response: Response) => {
    try {
        const { email, password } = request.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            response.status(500).json({
                status: 500,
                message: "Invalid Email OR Password..."
            });
        } else {
            const isMatch = await bcrypt.compare(password, user?.password as string);
            if (!isMatch) {
                response.status(500).json({
                    status: 500,
                    message: "Invalid Email OR Password..."
                })
            };

            // Generate JsonWebToken
            const token = await JWT.sign({ id: user?.id }, process.env.JWT_SECRET as string, {
                expiresIn: process.env.JWT_EXPIRE
            });

            response.cookie("token", token, {
                expires: new Date(Date.now() + Number(process.env.JWT_EXPIRE_TOKEN) * 24 * 60 * 60 * 1000),
                httpOnly: true
            });

            response.status(200).json({
                status: 200,
                message: "Login Successfully...",
                token: token,
                user: user,
            })
        }


    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        })
    }



})


router.get("/logout", async (request, response) => {
    try {
        response.clearCookie("token");
        response.status(200).json({
            status: 200,
            message: "Logout Successfully..."
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
})

module.exports = router;