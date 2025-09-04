import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, postId, amount, isBasePay = false } = body;

    // Validate input data
    if (!userId || !postId || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid input data. userId, postId, and positive amount are required.",
        },
        { status: 400 }
      );
    }

    // Verify the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: `User with ID ${userId} not found in database`,
        },
        { status: 404 }
      );
    }

    // Verify the post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: `Post with ID ${postId} not found in database`,
        },
        { status: 404 }
      );
    }

    // Check if user has already viewed this post (optional - you might want to allow multiple views)
    const existingView = await prisma.view.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (existingView) {
      return NextResponse.json(
        {
          success: false,
          error: "User has already viewed this post",
        },
        { status: 409 }
      );
    }

    // Create the view record
    const view = await prisma.view.create({
      data: {
        userId,
        postId,
        amount,
        isBasePay,
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

    return NextResponse.json({
      success: true,
      view,
      message: "View content recorded successfully!",
    });
  } catch (error) {
    console.error("Failed to create view content:", error);

    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "User or post not found in database. Please verify the data.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record view content in database",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const postId = searchParams.get("postId");

    if (userId && postId) {
      // Check if specific user has viewed specific post
      const view = await prisma.view.findFirst({
        where: {
          userId,
          postId,
        },
      });

      return NextResponse.json({
        success: true,
        hasViewed: !!view,
        view: view || null,
      });
    } else if (userId) {
      // Get user's view history
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

      return NextResponse.json({
        success: true,
        views,
        count: views.length,
      });
    } else if (postId) {
      // Get post view stats
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

      return NextResponse.json({
        success: true,
        views,
        totalRevenue,
        viewCount: views.length,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either userId or postId must be provided",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to retrieve view data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve view data",
      },
      { status: 500 }
    );
  }
}
