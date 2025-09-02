import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../sign-in/action";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const result = await getUser(userId);

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        exists: true,
        user: result.user,
      });
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        error: result.error || "User not found",
      });
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
