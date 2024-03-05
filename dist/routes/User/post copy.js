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
            include: {
                user: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                name: true,
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
router.get("/search", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword } = request.query;
        const posts = yield client_1.default.post.findMany({
            where: {
                OR: [
                    { title: { search: keyword } },
                    { description: { search: keyword } },
                ],
            },
        });
        response.status(200).json({
            status: 200,
            posts: posts
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.post("/store", auth_1.default, user_1.default, upload.single('image'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.file) {
        request.body.image = `/images/post/${request.file.filename}`;
    }
    const { title, description, image } = request.body;
    yield client_1.default.post.create({
        data: {
            user_id: Number(request.user.id),
            title,
            description,
            image,
        },
    });
    response.status(200).json({
        status: 200,
        message: "Post Create Successfully..."
    });
}));
router.get("/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const post = yield client_1.default.post.findUnique({
        where: { id: Number(id) }, include: {
            user: true,
            comments: true,
            likes: true
        }
    });
    response.status(200).json({
        status: 200,
        post: post
    });
}));
router.patch("/update/:id", auth_1.default, user_1.default, upload.single('image'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { title, description, image } = request.body;
    yield client_1.default.post.update({
        where: { id: Number(id) },
        data: {
            title,
            description,
            image
        },
    });
    response.status(200).json({
        status: 200,
        message: "Post Update Successfully..."
    });
}));
router.delete("/delete/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
module.exports = router;
