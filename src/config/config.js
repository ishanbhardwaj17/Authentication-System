import dotenv from "dotenv";
dotenv.config()

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

if(!process.env.JWT_EXPIRES_IN){
    throw new Error("JWT_EXPIRES_IN is not defined in environment variables")
}

if(!process.env.REDIS_HOST){
    throw new Error("REDIS_HOST is not defined in environment variables")
}

if(!process.env.REDIS_PORT){
    throw new Error("REDIS_PORT is not defined in environment variables")
}

if(!process.env.REDIS_PASSWORD){
    throw new Error("REDIS_PASSWORD is not defined in environment variables")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_SECRET is not defined in environment variables")
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables")
}

if(!process.env.GOOGLE_USER){
    throw new Error("GOOGLE_USER is not defined in environment variables")
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new Error("GOOGLE_USER is not defined in environment variables")
}


const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_USER: process.env.GOOGLE_USER,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN
}

export default config