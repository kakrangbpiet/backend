import dotenv from 'dotenv';
import path from 'path';
import 'dotenv/config'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`)
});

export default {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 5000,
    JWT_SECRET:process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET,

};