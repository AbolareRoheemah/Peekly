import { NextRequest, NextResponse } from "next/server";
import { createPost } from "../../actions/file-upload";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ipfs, description, price, creatorAddress } = body;

    // Validate required fields
    if (!userId || !ipfs || !description || !price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the createPost server action, but do NOT require user to exist
    // (Assume createPost implementation no longer checks for user existence)
    const result = await createPost({
      userId,
      ipfs,
      description,
      price: parseFloat(price),
      creatorAddress,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
