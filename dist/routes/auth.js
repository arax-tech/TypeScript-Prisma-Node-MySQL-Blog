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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
const router = express_1.default.Router();
router.post("/register", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
                message: "Registration Successfully..."
            });
        }
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.post("/login", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = request.body;
        const user = yield client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            response.status(500).json({
                status: 500,
                message: "Invalid Email OR Password..."
            });
        }
        else {
            const isMatch = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isMatch) {
                response.status(500).json({
                    status: 500,
                    message: "Invalid Email OR Password..."
                });
            }
            ;
            // Generate JsonWebToken
            const token = yield jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user.id }, process.env.JWT_SECRET, {
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
            });
        }
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.get("/logout", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        response.clearCookie("token");
        response.status(200).json({
            status: 200,
            message: "Logout Successfully..."
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
