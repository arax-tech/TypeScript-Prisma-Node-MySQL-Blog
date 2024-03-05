import "dotenv/config"

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookie from "cookie-parser"
import morgan from "morgan"

import SwaggerUi from 'swagger-ui-express'
import * as SwaggerDocs from './swagger.json'
const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookie());
app.use(morgan("dev"));
app.use(express.static("public"));

// Routes
app.get('/', (request: any, response: any) => {
    response.json({
        message: "Welcome..."
    })
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
app.use("/api/docs", SwaggerUi.serve, SwaggerUi.setup(SwaggerDocs));

app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`)
});
