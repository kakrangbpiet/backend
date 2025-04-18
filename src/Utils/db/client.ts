import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const isDatabaseHealthy = async (): Promise<boolean> => {
    try {
        await prisma.$connect();
        console.log("Prisma Database Connected");
        return true;
    } catch (error) {
        console.log("Prisma Database Not Connected");
        return false
    }
};
