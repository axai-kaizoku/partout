import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { addressSchema } from "@/components/seller/address-form/validations";
import { db } from "@/server/db";
import { addresses } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const sellerRouter = createTRPCRouter({
})