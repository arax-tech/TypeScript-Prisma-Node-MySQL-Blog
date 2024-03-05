import { Request, Response, NextFunction } from 'express';
import JWT from "jsonwebtoken";
import prisma from '../client';
declare global {
    namespace Express {
        interface Request {
            token: any;
            user: any;
        }
    }
}
const auth = async (request: Request, response: Response, next: NextFunction) => {
    try {
        let token = null;
        if (process.env.NODE_ENV === 'Development') {
            token = request.cookies.token;
        } else {
            token = request.headers['authorization']?.split('Bearer ')[1];
        }

        

        if (token) {
            const authUser: any = JWT.verify(token, process.env.JWT_SECRET as string);
            const user: any = await prisma.user.findUnique({ where: { id: authUser.id } });

            request['token'] = token;
            request['user'] = user;
            next();
        }
        else {
            response.status(401).json({
                status: 401,
                message: "Please login to Access...",
            });
        }
    }
    catch (error: any) {
        response.status(401).json({
            status: 401,
            message: error?.message,
        });
    }

}

export default auth;