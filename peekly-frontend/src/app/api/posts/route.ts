import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const loggedInUserId = searchParams.get("userId"); // Assuming userId is passed as a query parameter

    let skip = 0;
    if (cursor) {
      skip = 1;
    }

    const whereClause: any = {}; // TODO: Find a more specific Prisma type for PostWhereInput
    if (cursor) {
      whereClause.id = {
        lt: cursor,
      };
    }

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
        _count: {
          select: {
            View: true,
            Like: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const postsWithPurchaseInfo = await Promise.all(
      posts.map(async (post) => {
        const hasBought = loggedInUserId
          ? (await prisma.view.count({
              where: {
                userId: loggedInUserId,
                postId: post.id,
              },
            })) > 0
          : false;

        const distinctBuyers = await prisma.view.groupBy({
          by: ["userId"],
          where: {
            postId: post.id,
          },
        });
        const buyersCount = distinctBuyers.length;

        const isLiked = loggedInUserId
          ? (await prisma.like.count({
              where: {
                userId: loggedInUserId,
                postId: post.id,
              },
            })) > 0
          : false;

        const likeCount = await prisma.like.count({
          where: {
            postId: post.id,
          },
        });

        const { _count, ...postWithoutCount } = post;

        return {
          ...postWithoutCount,
          hasBought,
          buyersCount,
          isLiked,
          likeCount,
        };
      })
    );

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    return NextResponse.json({
      success: true,
      posts: postsWithPurchaseInfo,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts." },
      { status: 500 }
    );
  }
}
