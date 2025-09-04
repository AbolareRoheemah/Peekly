import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { likePost, unlikePost } from "@/app/actions/posts";


// --- POST: Like a post ---
export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { postId, userId, action } = body;
  
      if (!postId || !userId || !action) {
        return NextResponse.json(
          { success: false, error: "postId, userId, and action are required" },
          { status: 400 }
        );
      }
  
      if (action === "like") {
        const result = await likePost(
          postId,
          userId);
    
        if (result.success) {
          return NextResponse.json(result);
        } else {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 500 }
          );
        }
      } else if (action === "unlike") {
        const result = await unlikePost(
          postId,
          userId);
    
        if (result.success) {
          return NextResponse.json(result);
        } else {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid action. Use 'like' or 'unlike'." },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error in like/unlike post:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to like/unlike the post",
        },
        { status: 500 }
      );
    }
  }