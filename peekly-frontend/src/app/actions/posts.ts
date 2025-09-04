"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";

export interface GetAllPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "price" | "likeCount";
  sortOrder?: "asc" | "desc";
}

export interface PostWithUser {
  id: string;
  ipfs: string;
  description: string;
  price: number;
  creatorAddress: string | null;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string | null;
    address: string | null;
  };
}

export interface GetAllPostsResponse {
  success: boolean;
  posts?: PostWithUser[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  error?: string;
  message?: string;
}

export async function getAllPosts(
  params: GetAllPostsParams = {}
): Promise<GetAllPostsResponse> {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { user: { username: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: whereClause,
    });

    // Get posts with user information
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      posts,
      totalCount,
      currentPage: page,
      totalPages,
      message: `Retrieved ${posts.length} posts successfully`,
    };
  } catch (error) {
    console.error("Failed to retrieve posts:", error);
    return {
      success: false,
      error: "Failed to retrieve posts from database",
    };
  }
}

export async function getPostById(
  postId: string
): Promise<GetAllPostsResponse> {
  try {
    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
      },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    return {
      success: true,
      posts: [post],
      message: "Post retrieved successfully",
    };
  } catch (error) {
    console.error("Failed to retrieve post:", error);
    return {
      success: false,
      error: "Failed to retrieve post from database",
    };
  }
}

export async function getPostsByUser(
  userId: string,
  params: GetAllPostsParams = {}
): Promise<GetAllPostsResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: { userId },
    });

    // Get posts by specific user
    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      posts,
      totalCount,
      currentPage: page,
      totalPages,
      message: `Retrieved ${posts.length} posts by user successfully`,
    };
  } catch (error) {
    console.error("Failed to retrieve user posts:", error);
    return {
      success: false,
      error: "Failed to retrieve user posts from database",
    };
  }
}

export async function likePost(postId: string, userId: string) {
  try {
    const isLiked = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (isLiked) {
      return {
        success: false,
        error: "You have already liked this matcha coin",
      };
    }
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        LikeCount: {
          increment: 1,
        },
      },
    });

    await prisma.like.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      post,
      message: "Post liked!",
    };
  } catch (error) {
    console.error("Error liking matcha coin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to like the post",
    };
  }
}

export async function unlikePost(postId: string, userId: string) {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    if (!existingLike) {
      return {
        success: false,
        error: "You haven't liked this post",
      };
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        LikeCount: {
          decrement: 1,
        },
      },
    });

    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      post,
      message: "Post unliked!",
    };
  } catch (error) {
    console.error("Error unliking the post:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unlike the post",
    };
  }
}
