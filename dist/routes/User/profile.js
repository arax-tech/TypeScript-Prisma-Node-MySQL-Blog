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
        cb(null, 'public/images/user');
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, "profile" + '-' + Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.get("/profile", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield client_1.default.user.findFirst({
            where: { id: Number(request.user.id) },
            include: {
                posts: true,
                comments: true,
                likes: true,
                followers: true,
                followings: true,
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
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.patch("/profile", auth_1.default, user_1.default, upload.single('image'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = request.user.id;
        const user = yield client_1.default.user.findFirst({ where: { id } });
        if (request.file) {
            if ((user === null || user === void 0 ? void 0 : user.image) && user.image.length > 0) {
                const oldImage = `images${user.image.split("/images")[1]}`;
                fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../../public/" + oldImage));
            }
            request.body.image = `/images/user/${request.file.filename}`;
        }
        else {
            request.body.image = user === null || user === void 0 ? void 0 : user.image;
        }
        yield client_1.default.user.update({
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
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
module.exports = router;
