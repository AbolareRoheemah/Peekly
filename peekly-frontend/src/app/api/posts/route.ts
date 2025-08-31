import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pagination parameters",
        },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const validSortFields = ["createdAt", "price", "likeCount"];
    const validSortOrders = ["asc", "desc"];

    if (
      !validSortFields.includes(sortBy) ||
      !validSortOrders.includes(sortOrder)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sort parameters",
        },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      posts,
      totalCount,
      currentPage: page,
      totalPages,
      message: `Retrieved ${posts.length} posts successfully`,
    });
  } catch (error) {
    console.error("Failed to retrieve posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve posts from database",
      },
      { status: 500 }
    );
  }
}
