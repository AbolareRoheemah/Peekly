"use server";
import { prisma } from "../../../lib/prisma";

export interface ViewContentData {
  userId: string;
  postId: string;
  amount: number;
  isBasePay?: boolean;
}

export interface ViewContentResponse {
  success: boolean;
  view?: any;
  error?: string;
  message?: string;
}

export async function createViewContent(
  data: ViewContentData
): Promise<ViewContentResponse> {
  try {
    // Validate input data
    if (!data.userId || !data.postId || data.amount <= 0) {
      return {
        success: false,
        error:
          "Invalid input data. userId, postId, and positive amount are required.",
      };
    }

    // Verify the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!existingUser) {
      return {
        success: false,
        error: `User with ID ${data.userId} not found in database`,
      };
    }

    // Verify the post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!existingPost) {
      return {
        success: false,
        error: `Post with ID ${data.postId} not found in database`,
      };
    }

    // Check if user has already viewed this post (optional - you might want to allow multiple views)
    const existingView = await prisma.view.findFirst({
      where: {
        userId: data.userId,
        postId: data.postId,
      },
    });

    if (existingView) {
      return {
        success: false,
        error: "User has already viewed this post",
      };
    }

    // Create the view record
    const view = await prisma.view.create({
      data: {
        userId: data.userId,
        postId: data.postId,
        amount: data.amount,
        isBasePay: data.isBasePay ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
        post: {
          select: {
            id: true,
            description: true,
            price: true,
            creatorAddress: true,
          },
        },
      },
    });

    return {
      success: true,
      view,
      message: "View content recorded successfully!",
    };
  } catch (error) {
    console.error("Failed to create view content:", error);

    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          error: "User or post not found in database. Please verify the data.",
        };
      }
    }

    return {
      success: false,
      error: "Failed to record view content in database",
    };
  }
}

export async function getUserViewHistory(
  userId: string
): Promise<ViewContentResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const views = await prisma.view.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            description: true,
            price: true,
            creatorAddress: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      view: views,
      message: "View history retrieved successfully!",
    };
  } catch (error) {
    console.error("Failed to get user view history:", error);
    return {
      success: false,
      error: "Failed to retrieve view history",
    };
  }
}

export async function getPostViewStats(
  postId: string
): Promise<ViewContentResponse> {
  try {
    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    const views = await prisma.view.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = views.reduce((sum, view) => sum + view.amount, 0);
    const viewCount = views.length;

    return {
      success: true,
      view: {
        views,
        totalRevenue,
        viewCount,
      },
      message: "Post view stats retrieved successfully!",
    };
  } catch (error) {
    console.error("Failed to get post view stats:", error);
    return {
      success: false,
      error: "Failed to retrieve post view stats",
    };
  }
}

export async function checkUserHasViewed(
  userId: string,
  postId: string
): Promise<ViewContentResponse> {
  try {
    if (!userId || !postId) {
      return {
        success: false,
        error: "Both userId and postId are required",
      };
    }

    const view = await prisma.view.findFirst({
      where: {
        userId,
        postId,
      },
    });

    return {
      success: true,
      view: view ? true : false,
      message: view
        ? "User has viewed this post"
        : "User has not viewed this post",
    };
  } catch (error) {
    console.error("Failed to check user view status:", error);
    return {
      success: false,
      error: "Failed to check user view status",
    };
  }
}
