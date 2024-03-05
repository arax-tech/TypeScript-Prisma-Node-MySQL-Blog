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
router.post("/store", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        request.body.ratings = Number(request.body.ratings);
        const { post_id, comment, ratings } = request.body;
        yield client_1.default.comment.create({
            data: {
                user_id: Number(request.user.id),
                post_id: Number(post_id),
                comment,
                ratings,
            },
        });
        response.status(200).json({
            status: 200,
            message: "Comment Create Successfully..."
        });
    }
    catch (error) {
        response.status(500).json({
            status: 500,
            message: error.message
        });
    }
}));
router.patch("/update/:id", auth_1.default, user_1.default, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        request.body.ratings = Number(request.body.ratings);
        const { comment, ratings } = request.body;
        const { id } = request.params;
        yield client_1.default.comment.update({
            where: { id: Number(id) },
            data: {
                comment,
                ratings,
            },
        });
        response.status(200).json({
            status: 200,
            message: "Comment Update Successfully..."
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
        yield client_1.default.comment.delete({ where: { id: Number(id) } });
        response.status(200).json({
            status: 200,
            message: "Comment Delete Successfully..."
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
