import express from 'express'
import bcrypt from 'bcryptjs'
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
        cb(null, 'public/images/post')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];

        cb(null, "post" + '-' + Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })
router.get("/", auth, user, async (request: Request, response: Response) => {
    try {
        // Pagination
        let page = Number(request.query.page) || 1;
        let limit = Number(request.query.limit) || 2;
        if (page < 0) { page = 1 }
        if (limit < 0 || limit > 100) { limit = 2 }
        let skip = (page - 1) * limit;
        const totalPosts = await prisma.post.count();
        const totalPages = Math.ceil(totalPosts / limit);


        const posts = await prisma.post.findMany({
            skip: skip,
            take: limit,
            orderBy: { id: "desc" },
            where: { user_id: Number(request.user.id) },
            include: {
                category: {
                    select: {
                        id: true,
                        category: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        comment: true,
                        ratings: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                likes: {
                    select: {
                        id: true,
                        created_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
            }
        });

        response.status(200).json({
            status: 200,
            posts: posts,
            currentPage: page,
            limit: limit,
            totalPages: totalPages,
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});


router.get("/following/posts", auth, user, async (request: Request, response: Response) => {
    try {
        // Pagination
        let page = Number(request.query.page) || 1;
        let limit = Number(request.query.limit) || 2;
        if (page < 0) { page = 1 }
        if (limit < 0 || limit > 100) { limit = 2 }
        let skip = (page - 1) * limit;




        const followedUsers = await prisma.user.findUnique({
            where: { id: request.user.id },
            include: {
                followings: {
                    include: {
                        posts: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                image: true,
                                created_at: true,
                                category: {
                                    select: {
                                        id: true,
                                        category: true,
                                    },
                                },
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                    },
                                },
                                tags: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                comments: {
                                    select: {
                                        id: true,
                                        comment: true,
                                        ratings: true,
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                image: true,
                                            },
                                        },
                                    },
                                },
                                likes: {
                                    select: {
                                        id: true,
                                        created_at: true,
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                image: true,
                                            },
                                        },
                                    },
                                },
                            },
                            // Add pagination options
                            skip: skip,
                            take: limit,
                        },
                    },
                },
            },
        });

        const posts = followedUsers?.followings.flatMap((user) => user.posts);
        const totalPosts1 = followedUsers?.followings.flatMap((user) => user.posts).length;
        const totalPosts = Math.ceil(totalPosts1 as number / limit);

        response.status(200).json({
            status: 200,
            posts: posts,
            currentPage: page,
            limit: limit,
            // totalPages: totalPages && totalPosts,
        });
    }
    catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

// router.get("/search", auth, user, async (request: Request, response: Response) => {
//     try {
//         const { keyword } = request.query;
//         const posts = await prisma.post.findMany({
//             where: {
//                 OR: [
//                     { title: { search: keyword as string } },
//                     { description: { search: keyword as string } },
//                 ],
//             },
//         });

//         response.status(200).json({
//             status: 200,
//             posts: posts
//         });
//     }
//     catch (error: any) {
//         response.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

router.post("/store", auth, user, upload.single('image'), async (request: Request, response: Response) => {
    try {
        if (request.file) {
            request.body.image = `/images/post/${request.file.filename}`;
        }
        const { category_id, title, description, image, tags } = request.body;

        await prisma.post.create({
            data: {
                user_id: Number(request.user.id),
                category_id: Number(category_id),
                title,
                description,
                image,
                tags: {
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
        });

        response.status(200).json({
            status: 200,
            message: "Post Created Successfully..."
        });
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
});




router.get("/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        comment: true,
                        ratings: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                likes: {
                    select: {
                        id: true,
                        created_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
            }
        });
        response.status(200).json({
            status: 200,
            post: post
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }

});


router.patch("/update/:id", auth, user, upload.single('image'), async (request: Request, response: Response) => {

    try {
        const { id } = request.params;
        const post = await prisma.post.findFirst({ where: { id: Number(id) } });
        if (request.file) {
            if (post?.image && post.image.length > 0) {
                const oldImage = `images${post.image.split("/images")[1]}`
                fs.unlinkSync(path.join(__dirname, "../../../public/" + oldImage))
            }
            request.body.image = `/images/post/${request.file.filename}`;
        } else {
            request.body.image = post?.image

        }

        const { category_id, title, description, image, tags } = request.body;

        await prisma.post.update({
            where: { id: Number(id) },
            data: {
                category_id: Number(category_id),
                title,
                description,
                image,
                tags: {
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
        });
        response.status(200).json({
            status: 200,
            message: "Post Update Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }

});
router.delete("/delete/:id", auth, user, async (request: Request, response: Response) => {
    try {
        const { id } = request.params;

        const post = await prisma.post.findFirst({ where: { id: Number(id) } });
        if (post?.image && post.image.length > 0) {
            const oldImage = `images${post.image.split("/images")[1]}`
            fs.unlinkSync(path.join(__dirname, "../../../public/" + oldImage))
        }

        await prisma.post.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Post Delete Successfully..."
        })
    } catch (error: any) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }

});

module.exports = router;