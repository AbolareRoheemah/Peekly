import {
  createViewContent,
  getUserViewHistory,
  getPostViewStats,
  checkUserHasViewed,
} from "../app/actions/view-content";

export interface ViewContentData {
  userId: string;
  postId: string;
  amount: number;
  isBasePay?: boolean;
}

/**
 * Utility function to handle view content purchase
 * This can be called from any component when a user wants to view paid content
 */
export async function handleViewContentPurchase(data: ViewContentData) {
  try {
    const response = await createViewContent(data);

    if (response.success) {
      return {
        success: true,
        view: response.view,
        message: response.message,
      };
    } else {
      return {
        success: false,
        error: response.error,
      };
    }
  } catch (error) {
    console.error("Failed to handle view content purchase:", error);
    return {
      success: false,
      error: "Failed to process view content purchase",
    };
  }
}

/**
 * Utility function to check if a user has already viewed a post
 * Useful for showing/hiding paywall or view buttons
 */
export async function hasUserViewedPost(
  userId: string,
  postId: string
): Promise<boolean> {
  try {
    const response = await checkUserHasViewed(userId, postId);
    return response.success && response.view === true;
  } catch (error) {
    console.error("Failed to check user view status:", error);
    return false;
  }
}

/**
 * Utility function to get user's view history
 * Useful for showing user's purchased content
 */
export async function getUserPurchasedContent(userId: string) {
  try {
    const response = await getUserViewHistory(userId);

    if (response.success) {
      return {
        success: true,
        views: response.view,
        count: response.view?.length || 0,
      };
    } else {
      return {
        success: false,
        error: response.error,
        views: [],
        count: 0,
      };
    }
  } catch (error) {
    console.error("Failed to get user purchased content:", error);
    return {
      success: false,
      error: "Failed to retrieve purchased content",
      views: [],
      count: 0,
    };
  }
}

/**
 * Utility function to get post view statistics
 * Useful for showing creator analytics
 */
export async function getPostAnalytics(postId: string) {
  try {
    const response = await getPostViewStats(postId);

    if (response.success) {
      return {
        success: true,
        views: response.view?.views || [],
        totalRevenue: response.view?.totalRevenue || 0,
        viewCount: response.view?.viewCount || 0,
      };
    } else {
      return {
        success: false,
        error: response.error,
        views: [],
        totalRevenue: 0,
        viewCount: 0,
      };
    }
  } catch (error) {
    console.error("Failed to get post analytics:", error);
    return {
      success: false,
      error: "Failed to retrieve post analytics",
      views: [],
      totalRevenue: 0,
      viewCount: 0,
    };
  }
}

/**
 * Utility function to format amount for display
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Utility function to check if a post is free
 */
export function isPostFree(price: number): boolean {
  return price <= 0;
}

/**
 * Utility function to get post access status
 * Returns whether user can access the post content
 */
export async function getPostAccessStatus(
  userId: string,
  postId: string,
  postPrice: number
): Promise<{
  canAccess: boolean;
  reason?: string;
  hasPaid?: boolean;
}> {
  // If post is free, user can always access
  if (isPostFree(postPrice)) {
    return {
      canAccess: true,
      reason: "Post is free",
      hasPaid: false,
    };
  }

  // Check if user has paid for this post
  const hasViewed = await hasUserViewedPost(userId, postId);

  if (hasViewed) {
    return {
      canAccess: true,
      reason: "User has already paid for this post",
      hasPaid: true,
    };
  }

  return {
    canAccess: false,
    reason: "User needs to pay to access this post",
    hasPaid: false,
  };
}
