import express from 'express'
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';

router.get("/", auth, user, async (request: Request, response: Response) => {
    try {
        const category = await prisma.category.findMany();
        response.status(200).json({
            status: 200,
            category: category
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
    try {
        const { category } = request.body;
        await prisma.category.create({
            data: { category }
        });
        response.status(200).json({
            status: 200,
            message: "Cateory Create Successfully..."
        })
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

router.get("/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const category = await prisma.category.findUnique({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            category: category
        })
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }

});
router.patch("/update/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { category } = request.body;
        const { id } = request.params;
        await prisma.category.update({
            where: { id: Number(id) },
            data: { category },
        });
        response.status(200).json({
            status: 200,
            message: "Cateory Update Successfully..."
        })
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }


});
router.delete("/delete/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        await prisma.category.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Cateory Delete Successfully..."
        })
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }


});

module.exports = router;