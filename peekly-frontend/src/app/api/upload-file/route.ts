import { NextRequest, NextResponse } from "next/server";
import { uploadFileToFilecoin } from "../../actions/file-upload";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileData, description, price, userId, creatorAddress } = body;

    // Validate required fields
    if (!fileData || !description || !price || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the existing server action
    const result = await uploadFileToFilecoin({
      fileData,
      description,
      price: parseFloat(price),
      userId,
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
