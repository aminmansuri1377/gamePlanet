import { z } from "zod";
// import axios from "axios";
import { procedure, router } from "../trpc";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const gameRouter = router({
  ///////////////////////////////////////////////
  createProduct: procedure
    .input(
      z.object({
        name: z.string(),
        info: z.string().optional(),
        initialPrice: z.number(),
        everyNight: z.number(),
        everyController: z.number(),
        installation: z.number(),
        packages: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            inventory: z.number(), // Include inventory in package input
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const {
        name,
        info,
        initialPrice,
        everyNight,
        everyController,
        installation,
        packages,
      } = input;

      return await prisma.product.create({
        data: {
          name,
          info,
          initialPrice,
          everyNight,
          everyController,
          installation,
          packages: {
            create: packages.map((pkg) => ({
              name: pkg.name,
              price: pkg.price,
              inventory: pkg.inventory,
            })),
          },
        },
      });
    }),
  getProducts: procedure.input(z.undefined()).query(async () => {
    return await prisma.product.findMany({
      include: {
        packages: true,
      },
    });
  }),
  getProductByName: procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return await prisma.product.findUnique({
        where: {
          name: input.name,
        },
        include: {
          packages: true,
        },
      });
    }),
  deletePackage: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      await prisma.package.delete({
        where: { id },
      });
      return { success: true, message: "Package deleted successfully" };
    }),
  // Add this to `gameRouter` in your routes file
  updateProduct: procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        info: z.string().optional(),
        initialPrice: z.number().optional(),
        everyNight: z.number().optional(),
        everyController: z.number().optional(),
        installation: z.number().optional(),
        packages: z
          .array(
            z.object({
              id: z.number().optional(), // include id for existing packages
              name: z.string().optional(),
              price: z.number().optional(),
              inventory: z.number().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        id,
        name,
        info,
        initialPrice,
        everyNight,
        everyController,
        installation,
        packages,
      } = input;

      // Update only the fields that are provided in the input
      return await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(info && { info }),
          ...(initialPrice !== undefined && { initialPrice }),
          ...(everyNight !== undefined && { everyNight }),
          ...(everyController !== undefined && { everyController }),
          ...(installation !== undefined && { installation }),
          ...(packages && {
            packages: {
              upsert: packages.map((pkg) => ({
                where: { id: pkg.id ?? 0 }, // assuming id is used to check existing package
                update: {
                  ...(pkg.name && { name: pkg.name }),
                  ...(pkg.price !== undefined && { price: pkg.price }),
                  ...(pkg.inventory !== undefined && {
                    inventory: pkg.inventory,
                  }),
                },
                create: {
                  name: pkg.name ?? "", // Required fields for creation
                  price: pkg.price ?? 0,
                  inventory: pkg.inventory ?? 0,
                },
              })),
            },
          }),
        },
      });
    }),
  deleteProduct: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // First, delete related packages
      await prisma.package.deleteMany({
        where: { productId: id },
      });

      // Then, delete the product
      await prisma.product.delete({
        where: { id },
      });

      return { success: true };
    }),

  createOrder: procedure
    .input(
      z.object({
        productName: z.string(),
        productId: z.number(),
        finalPrice: z.number(),
        nights: z.number(),
        controllers: z.number(),
        installation: z.boolean(),
        packageId: z.number(),
        userId: z.number(),
        username: z.string(),
        userEmail: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Start a transaction to ensure data consistency
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            productName: input.productName,
            productId: input.productId,
            finalPrice: input.finalPrice,
            nights: input.nights,
            cotrollers: input.controllers,
            installation: input.installation,
            packageId: input.packageId,
            userId: input.userId,
            username: input.username,
            userEmail: input.userEmail,
            status: "waiting for confirmation",
          },
        });

        await tx.package.update({
          where: { id: input.packageId },
          data: {
            inventory: {
              decrement: 1,
            },
          },
        });

        return newOrder;
      });

      return order;
    }),
  // getOrders: procedure.query(async () => {
  //   return await prisma.order.findMany();
  // }),
  // getUsers: procedure.query(async () => {
  //   return await prisma.users.findMany();
  // }),
  getUsers: procedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const orders = await prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const totalOrders = await prisma.users.count();
      const totalPages = Math.ceil(totalOrders / limit);

      return { orders, totalPages };
    }),
  getOrders: procedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, searchQuery } = input;
      const skip = (page - 1) * limit;

      const orders = await prisma.order.findMany({
        where: searchQuery
          ? {
              OR: [
                { username: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : undefined,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const totalOrders = await prisma.order.count({
        where: searchQuery
          ? {
              OR: [
                { username: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : undefined,
      });

      const totalPages = Math.ceil(totalOrders / limit);

      return { orders, totalPages };
    }),

  updateOrderStatus: procedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "waiting for confirmation",
          "confirmed and sent",
          "delivered",
          "taken back",
          "denied",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const { id, status } = input;
      return await prisma.order.update({
        where: { id },
        data: { status },
      });
    }),
  getOrdersById: procedure
    .input((val: any) => val as { userId: number })
    .query(async ({ input }) => {
      return await prisma.order.findMany({
        where: {
          userId: input.userId,
        },
      });
    }),
  addLocation: procedure
    .input(
      z.object({
        userId: z.number(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.location.create({
        data: {
          userId: input.userId,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });
    }),
});

export type GameRouter = typeof gameRouter;
