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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = __importDefault(require("../../middleware/user"));
const client_1 = __importDefault(require("../../client"));
router.get("/", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield client_1.default.user.findMany({
            include: {
                posts: true,
                comments: true,
                likes: true
            }
        });
        response.status(200).json({
            status: 200,
            users: users
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.post("/store", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = request.body;
    const user = yield client_1.default.user.findUnique({ where: { email } });
    if (user) {
        response.status(500).json({
            status: 500,
            message: "Email is already taken, Please use another email...",
        });
    }
    else {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield client_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            },
        });
        response.status(200).json({
            status: 200,
            message: "User Create Successfully..."
        });
    }
}));
router.get("/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const user = yield client_1.default.user.findUnique({ where: { id: Number(id) } });
    response.status(200).json({
        status: 200,
        user: user
    });
}));
router.patch("/update/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = request.body;
    const { id } = request.params;
    yield client_1.default.user.update({
        where: { id: Number(id) },
        data: {
            name,
            email,
        },
    });
    response.status(200).json({
        status: 200,
        message: "User Update Successfully..."
    });
}));
router.delete("/delete/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    yield client_1.default.user.delete({ where: { id: Number(id) } });
    response.status(200).json({
        status: 200,
        message: "User Delete Successfully..."
    });
}));
module.exports = router;
