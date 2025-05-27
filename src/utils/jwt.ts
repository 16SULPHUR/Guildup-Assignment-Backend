import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}
export const signToken = (userId: string): string => {
    const expiresIn = parseInt(JWT_EXPIRES_IN) || 30 * 24 * 60 * 60;
    return jwt.sign({ id: userId }, JWT_SECRET!, { expiresIn });
};
export const verifyToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET!, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
};
