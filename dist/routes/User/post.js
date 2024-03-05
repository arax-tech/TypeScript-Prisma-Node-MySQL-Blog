"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = __importDefault(require("../../middleware/user"));
const client_1 = __importDefault(require("../../client"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/post');
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, "post" + '-' + Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.get("/", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination
        let page = Number(request.query.page) || 1;
        let limit = Number(request.query.limit) || 2;
        if (page < 0) {
            page = 1;
        }
        if (limit < 0 || limit > 100) {
            limit = 2;
        }
        let skip = (page - 1) * limit;
        const totalPosts = yield client_1.default.post.count();
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = yield client_1.default.post.findMany({
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
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.get("/following/posts", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Pagination
        let page = Number(request.query.page) || 1;
        let limit = Number(request.query.limit) || 2;
        if (page < 0) {
            page = 1;
        }
        if (limit < 0 || limit > 100) {
            limit = 2;
        }
        let skip = (page - 1) * limit;
        const followedUsers = yield client_1.default.user.findUnique({
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
        const posts = followedUsers === null || followedUsers === void 0 ? void 0 : followedUsers.followings.flatMap((user) => user.posts);
        const totalPosts1 = followedUsers === null || followedUsers === void 0 ? void 0 : followedUsers.followings.flatMap((user) => user.posts).length;
        const totalPosts = Math.ceil(totalPosts1 / limit);
        response.status(200).json({
            status: 200,
            posts: posts,
            currentPage: page,
            limit: limit,
            // totalPages: totalPages && totalPosts,
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
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
router.post("/store", auth_1.default, user_1.default, upload.single('image'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (request.file) {
            request.body.image = `/images/post/${request.file.filename}`;
        }
        const { category_id, title, description, image, tags } = request.body;
        yield client_1.default.post.create({
            data: {
                user_id: Number(request.user.id),
                category_id: Number(category_id),
                title,
                description,
                image,
                tags: {
                    connectOrCreate: tags.map((tag) => ({
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
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.get("/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const post = yield client_1.default.post.findUnique({
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
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.patch("/update/:id", auth_1.default, user_1.default, upload.single('image'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const post = yield client_1.default.post.findFirst({ where: { id: Number(id) } });
        if (request.file) {
            if ((post === null || post === void 0 ? void 0 : post.image) && post.image.length > 0) {
                const oldImage = `images${post.image.split("/images")[1]}`;
                fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../../public/" + oldImage));
            }
            request.body.image = `/images/post/${request.file.filename}`;
        }
        else {
            request.body.image = post === null || post === void 0 ? void 0 : post.image;
        }
        const { category_id, title, description, image, tags } = request.body;
        yield client_1.default.post.update({
            where: { id: Number(id) },
            data: {
                category_id: Number(category_id),
                title,
                description,
                image,
                tags: {
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
            },
        });
        response.status(200).json({
            status: 200,
            message: "Post Update Successfully..."
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.delete("/delete/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = request.params;
        const post = yield client_1.default.post.findFirst({ where: { id: Number(id) } });
        if ((post === null || post === void 0 ? void 0 : post.image) && post.image.length > 0) {
            const oldImage = `images${post.image.split("/images")[1]}`;
            fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../../public/" + oldImage));
        }
        yield client_1.default.post.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Post Delete Successfully..."
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
module.exports = router;
