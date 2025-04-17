import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (process.env.NODE_ENV === 'production' 
          ? '?connection_limit=10' 
          : '')
      }
    }
  });

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