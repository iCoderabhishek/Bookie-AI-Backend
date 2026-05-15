import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};
// it is done to prevent creating multiple prisma client instances in development mode
declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

//if the environment is development mode then create a new prisma client instance
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;