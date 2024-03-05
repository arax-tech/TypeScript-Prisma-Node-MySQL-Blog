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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
const auth = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token = null;
        if (process.env.NODE_ENV === 'Development') {
            token = request.cookies.token;
        }
        else {
            token = (_a = request.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
        }
        if (token) {
            const authUser = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = yield client_1.default.user.findUnique({ where: { id: authUser.id } });
            if (user.role == "User") {
                next();
            }
            else {
                response.status(401).json({
                    status: 401,
                    message: "Only User can access this routes...",
                });
            }
        }
        else {
            response.status(401).json({
                status: 401,
                message: "Please login to Access...",
            });
        }
    }
    catch (error) {
        response.status(401).json({
            status: 401,
            message: error === null || error === void 0 ? void 0 : error.message,
        });
    }
});
exports.default = auth;
