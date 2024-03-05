"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const SwaggerDocs = __importStar(require("./swagger.json"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.static("public"));
// Routes
app.get('/', (request, response) => {
    response.json({
        message: "Welcome..."
    });
});
// Auth Routes
app.use("/api/auth", require("./routes/auth"));
// User Routes
app.use("/api/user", require("./routes/User/profile"));
app.use("/api/user", require("./routes/User/follow-unfollow"));
app.use("/api/user/user", require("./routes/User/user"));
app.use("/api/user/category", require("./routes/User/category"));
app.use("/api/user/post", require("./routes/User/post"));
app.use("/api/user/post/comment", require("./routes/User/comment"));
app.use("/api/user/post/like", require("./routes/User/like"));
// Doc
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(SwaggerDocs));
app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`);
});
