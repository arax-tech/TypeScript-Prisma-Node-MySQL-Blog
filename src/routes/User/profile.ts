import express from 'express'
import { Request, Response } from 'express'
const router = express.Router();

import auth from '../../middleware/auth';
import user from '../../middleware/user';
import prisma from '../../client';

import multer from 'multer';
import fs from "fs"
import path from "path"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/user')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];

        cb(null, "profile" + '-' + Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })


router.get("/profile", auth, user, async (request: Request, response: Response) => {
    try {

        let user = await prisma.user.findFirst({
            where: { id: Number(request.user.id) },
            include: {
                posts: true,
                comments: true,
                likes: true,
                followers:true,
                followings:true,
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        likes: true,
                    }
                }
            },
            
        });
        response.status(200).json({
            status: 200,
            user: user
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});


router.patch("/profile", auth, user, upload.single('image'), async (request: Request, response: Response) => {

    try {
        const id = request.user.id;
        const user = await prisma.user.findFirst({ where: { id } });
        
        if (request.file) {
            if (user?.image && user.image.length > 0) {
                const oldImage = `images${user.image.split("/images")[1]}`
                fs.unlinkSync(path.join(__dirname, "../../../public/" + oldImage))
            }
            request.body.image = `/images/user/${request.file.filename}`;
        } else {
            request.body.image = user?.image

        }
        await prisma.user.update({
            where: { id },
            data: {
                name: request.body.name,
                email: request.body.email,
                image: request.body.image,
            }
        });
        response.status(200).json({
            status: 200,
            message: "Profile Updated Successfully..."
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