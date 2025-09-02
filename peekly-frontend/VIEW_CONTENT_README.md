# View Content Functionality

This document describes the backend functionality for storing view content data, including the userId of the user who buys the content, postId, and the amount they pay for the post.

## Overview

The view content system allows users to purchase access to premium posts and tracks:
- **userId**: The user who purchases/view the content
- **postId**: The post being viewed
- **amount**: The amount paid for the post
- **isBasePay**: Boolean flag to distinguish base payments from additional payments
- **createdAt/updatedAt**: Timestamps for when the view was recorded

## Database Schema

The system uses the existing `View` model in the Prisma schema:

```prisma
model View {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  amount    Float
  isBasePay Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  post      Post     @relation(fields: [postId], references: [id])
}
```

## Files Created

### 1. Server Actions (`src/app/actions/view-content.ts`)
Contains server-side functions for:
- `createViewContent()` - Record a new view purchase
- `getUserViewHistory()` - Get user's view history
- `getPostViewStats()` - Get post analytics and revenue
- `checkUserHasViewed()` - Check if user has viewed a specific post

### 2. Server Actions (`src/app/actions/posts.ts`)
Contains server-side functions for:
- `getAllPosts()` - Retrieve all posts with pagination, search, and sorting
- `getPostById()` - Get a specific post by ID
- `getPostsByUser()` - Get posts by a specific user

### 3. API Routes (`src/app/api/view-content/route.ts`)
RESTful API endpoints:
- `POST /api/view-content` - Create new view record
- `GET /api/view-content?userId=X` - Get user's view history
- `GET /api/view-content?postId=Y` - Get post view statistics
- `GET /api/view-content?userId=X&postId=Y` - Check specific user-post view status

### 4. API Routes (`src/app/api/posts/route.ts`)
RESTful API endpoints:
- `GET /api/posts` - Get all posts with search, pagination, and sorting

### 5. Utility Functions (`src/lib/view-content-utils.ts`)
Helper functions for common operations:
- `handleViewContentPurchase()` - Process view content purchases
- `hasUserViewedPost()` - Check view status
- `getUserPurchasedContent()` - Get user's purchased content
- `getPostAnalytics()` - Get post analytics
- `getPostAccessStatus()` - Determine if user can access post
- `formatAmount()` - Format currency amounts
- `isPostFree()` - Check if post is free

### 6. Components (`src/components/all-posts-display.tsx`)
Frontend component for displaying all posts with:
- Responsive grid layout
- Search functionality
- Sorting options (latest, price, popularity)
- Pagination
- Purchase buttons
- Visual indicators for purchased content

### 7. Demo Pages
- `/view-content-demo` - Test view content functionality
- `/all-posts` - Display all posts
- `/posts-with-purchase-demo` - Complete demo with purchase flow

## Usage Examples

### Retrieving All Posts

```typescript
import { getAllPosts } from "@/app/actions/posts";

const response = await getAllPosts({
  page: 1,
  limit: 12,
  search: "tutorial",
  sortBy: "price",
  sortOrder: "asc"
});

if (response.success) {
  console.log(`Found ${response.posts?.length} posts`);
  console.log(`Total pages: ${response.totalPages}`);
}
```

### Recording a View Purchase

```typescript
import { handleViewContentPurchase } from "@/lib/view-content-utils";

const result = await handleViewContentPurchase({
  userId: "user-uuid",
  postId: "post-uuid", 
  amount: 9.99,
  isBasePay: true
});

if (result.success) {
  console.log("View recorded successfully:", result.view);
} else {
  console.error("Failed to record view:", result.error);
}
```

### Checking if User Can Access Post

```typescript
import { getPostAccessStatus } from "@/lib/view-content-utils";

const accessStatus = await getPostAccessStatus(userId, postId, postPrice);

if (accessStatus.canAccess) {
  // Show post content
  showPostContent();
} else {
  // Show paywall
  showPaywall(postPrice);
}
```

### Getting User's Purchased Content

```typescript
import { getUserPurchasedContent } from "@/lib/view-content-utils";

const purchasedContent = await getUserPurchasedContent(userId);

if (purchasedContent.success) {
  console.log(`User has purchased ${purchasedContent.count} posts`);
  purchasedContent.views.forEach(view => {
    console.log(`Post: ${view.post.description}, Amount: ${view.amount}`);
  });
}
```

### Getting Post Analytics

```typescript
import { getPostAnalytics } from "@/lib/view-content-utils";

const analytics = await getPostAnalytics(postId);

if (analytics.success) {
  console.log(`Total revenue: $${analytics.totalRevenue}`);
  console.log(`Total views: ${analytics.viewCount}`);
}
```

## API Endpoints

### Create View Record
```http
POST /api/view-content
Content-Type: application/json

{
  "userId": "user-uuid",
  "postId": "post-uuid",
  "amount": 9.99,
  "isBasePay": true
}
```

### Get User View History
```http
GET /api/view-content?userId=user-uuid
```

### Get Post View Stats
```http
GET /api/view-content?postId=post-uuid
```

### Check Specific View Status
```http
GET /api/view-content?userId=user-uuid&postId=post-uuid
```

### Get All Posts
```http
GET /api/posts?page=1&limit=12&search=tutorial&sortBy=price&sortOrder=asc
```

## Frontend Integration

### Using the AllPostsDisplay Component

```tsx
import AllPostsDisplay from "@/components/all-posts-display";

export default function MyPage() {
  const currentUserId = "user-uuid"; // Get from your auth context
  
  return (
    <div>
      <h1>Discover Content</h1>
      <AllPostsDisplay currentUserId={currentUserId} />
    </div>
  );
}
```

### Custom Post Display

```tsx
import { getAllPosts } from "@/app/actions/posts";
import { handleViewContentPurchase } from "@/lib/view-content-utils";

const [posts, setPosts] = useState([]);

useEffect(() => {
  const loadPosts = async () => {
    const response = await getAllPosts({ page: 1, limit: 10 });
    if (response.success) {
      setPosts(response.posts || []);
    }
  };
  loadPosts();
}, []);

const handlePurchase = async (post) => {
  const result = await handleViewContentPurchase({
    userId: currentUserId,
    postId: post.id,
    amount: post.price,
    isBasePay: true
  });
  
  if (result.success) {
    // Handle successful purchase
  }
};
```

## Error Handling

All functions return consistent response objects:

```typescript
interface ViewContentResponse {
  success: boolean;
  view?: any;
  error?: string;
  message?: string;
}

interface GetAllPostsResponse {
  success: boolean;
  posts?: PostWithUser[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  error?: string;
  message?: string;
}
```

Common error scenarios:
- Invalid input data (missing userId, postId, or amount)
- User not found in database
- Post not found in database
- User has already viewed the post
- Database constraint violations
- Invalid pagination or sorting parameters

## Security Considerations

- All functions validate input data before processing
- Foreign key constraints ensure data integrity
- User and post existence is verified before creating views
- Amount must be positive
- Duplicate views are prevented (configurable)
- Pagination limits prevent excessive data retrieval
- Input sanitization for search queries

## Integration Points

The view content system integrates with:
- **User Authentication**: Requires valid userId
- **Post Management**: Requires valid postId
- **Payment Processing**: Records amount paid
- **Content Access Control**: Determines if user can view content
- **Analytics**: Provides revenue and view statistics
- **Search & Discovery**: Enables finding and browsing content
- **Pagination**: Handles large numbers of posts efficiently

## Testing

Use the demo pages to test all functionality:

1. **View Content Demo** (`/view-content-demo`):
   - Create view records with different parameters
   - Check user view history
   - View post analytics
   - Verify view status checks

2. **Posts with Purchase Demo** (`/posts-with-purchase-demo`):
   - Browse all posts with search and sorting
   - Simulate user login
   - Purchase posts and verify View table records
   - Test pagination and filtering

3. **All Posts Page** (`/all-posts`):
   - Display posts without authentication
   - Test responsive layout and UI components

## Performance Features

- **Pagination**: Load posts in chunks to handle large datasets
- **Search Debouncing**: Prevents excessive API calls during typing
- **Efficient Queries**: Uses Prisma's optimized database queries
- **Lazy Loading**: Only loads necessary data for current page
- **Caching**: View status is checked once per session

## Future Enhancements

Potential improvements:
- Support for multiple view types (preview, full access, etc.)
- Subscription-based access models
- Refund handling
- Advanced analytics and reporting
- Integration with external payment processors
- Rate limiting and abuse prevention
- Real-time notifications for purchases
- Social features (sharing, recommendations)
- Advanced search filters (price range, category, etc.)
- Bulk purchase options
- Gift purchases
