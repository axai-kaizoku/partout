import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { addressRouter } from "./routers/address";
import { chatRouter } from "./routers/chat";
import { imageRouter } from "./routers/image";
import { partRouter } from "./routers/part";
import { partInfoRouter } from "./routers/part-info";
import { sellerRouter } from "./routers/seller";
import { shippingRouter } from "./routers/shipping";
import { userRouter } from "./routers/user";
import { orderRouter } from "./routers/order";
import { shipmentRouter } from "./routers/shipment";
import { paymentRouter } from "./routers/payment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  part: partRouter,
  seller: sellerRouter,
  user: userRouter,
  image: imageRouter,
  address: addressRouter,
  shipping: shippingRouter,
  partInfo: partInfoRouter,
  chat: chatRouter,
  order: orderRouter,
  shipment: shipmentRouter,
  payment: paymentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
