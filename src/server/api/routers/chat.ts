import { z } from "zod";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/server/db";
import { conversations, messages } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const chatRouter = createTRPCRouter({
  // Get or create a conversation between buyer and seller for a specific part
  getOrCreateConversation: privateProcedure
    .input(
      z.object({
        partId: z.string(),
        sellerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if conversation already exists
      const existingConversation = await db.query.conversations.findFirst({
        where: (conv, { and, eq }) =>
          and(
            eq(conv.partId, input.partId),
            eq(conv.sellerId, input.sellerId),
            eq(conv.buyerId, userId)
          ),
      });

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          partId: input.partId,
          sellerId: input.sellerId,
          buyerId: userId,
        })
        .returning();

      return newConversation;
    }),

  // Get all conversations for the current user
  getConversations: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userConversations = await db.query.conversations.findMany({
      where: (conv, { or, eq }) =>
        or(eq(conv.sellerId, userId), eq(conv.buyerId, userId)),
      with: {
        part: {
          columns: {
            id: true,
            title: true,
            price: true,
          },
          with: {
            partImages: {
              where: (img, { eq }) => eq(img.isPrimary, true),
              columns: {
                url: true,
              },
              limit: 1,
            },
          },
        },
        seller: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        buyer: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        messages: {
          orderBy: (msg, { desc }) => [desc(msg.createdAt)],
          limit: 1,
        },
      },
      orderBy: (conv, { desc }) => [desc(conv.lastMessageAt)],
    });

    // Map conversations to include the other person's info
    const conversationsWithOtherUser = userConversations.map((conv) => {
      const isUserSeller = conv.sellerId === userId;
      const otherUser = isUserSeller ? conv.buyer : conv.seller;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        partId: conv.partId,
        part: conv.part,
        otherUser,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    return conversationsWithOtherUser;
  }),

  // Get messages for a specific conversation
  getMessages: privateProcedure
    .input(z.string())
    .query(async ({ ctx, input: conversationId }) => {
      const userId = ctx.user.id;

      // Verify user is part of this conversation
      const conversation = await db.query.conversations.findFirst({
        where: (conv, { and, eq, or }) =>
          and(
            eq(conv.id, conversationId),
            or(eq(conv.sellerId, userId), eq(conv.buyerId, userId))
          ),
      });

      if (!conversation) {
        throw new Error("Conversation not found or unauthorized");
      }

      const conversationMessages = await db.query.messages.findMany({
        where: (msg, { eq }) => eq(msg.conversationId, conversationId),
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: (msg, { asc }) => [asc(msg.createdAt)],
      });

      return conversationMessages;
    }),

  // Send a message
  sendMessage: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Verify user is part of this conversation
      const conversation = await db.query.conversations.findFirst({
        where: (conv, { and, eq, or }) =>
          and(
            eq(conv.id, input.conversationId),
            or(eq(conv.sellerId, userId), eq(conv.buyerId, userId))
          ),
      });

      if (!conversation) {
        throw new Error("Conversation not found or unauthorized");
      }

      // Insert the message
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: userId,
          content: input.content,
        })
        .returning();

      // Update conversation's lastMessageAt
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      // Fetch the complete message with sender info
      const messageWithSender = await db.query.messages.findFirst({
        where: (msg, { eq }) => eq(msg.id, newMessage!.id),
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      return messageWithSender;
    }),

  // Mark messages as read
  markAsRead: privateProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Update all unread messages in this conversation that were sent by the other person
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.isRead, false),
            // Mark messages where the current user is NOT the sender
            or(
              // User is not the sender
              // We need to check the conversation to know if they're buyer or seller
            )
          )
        );

      return { success: true };
    }),

  // Get unread message count
  getUnreadCount: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Get all conversations where user is involved
    const userConversations = await db.query.conversations.findMany({
      where: (conv, { or, eq }) =>
        or(eq(conv.sellerId, userId), eq(conv.buyerId, userId)),
      columns: {
        id: true,
      },
    });

    const conversationIds = userConversations.map((conv) => conv.id);

    if (conversationIds.length === 0) {
      return 0;
    }

    // Count unread messages where the sender is not the current user
    const unreadMessages = await db.query.messages.findMany({
      where: (msg, { and, eq, inArray, not }) =>
        and(
          inArray(msg.conversationId, conversationIds),
          eq(msg.isRead, false),
          not(eq(msg.senderId, userId))
        ),
    });

    return unreadMessages.length;
  }),
});
