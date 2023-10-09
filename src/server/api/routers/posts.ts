import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { blurImage } from "~/utils/blurImage";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    const postPromises = posts.map(async (post) => {
      const author = users.find((user) => user.id == post.authorId);
      if (!author || !author.username)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author for post not found",
        });

      const blurredUrl = await blurImage(author.imageUrl);

      if (!blurredUrl)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to return blurred profile image",
        });

      return {
        post,
        // needed since typescript auto-checking is stupid
        author: {
          ...author,
          username: author.username,
          blurredUrl,
        },
      };
    });

    const resolvedData = await Promise.all(postPromises);
    return resolvedData;
  }),
});
