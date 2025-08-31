# API Integration Guide for Peekly Frontend

This document explains how to use the mock API service and how to integrate with real backend APIs.

## Overview

The API service (`src/lib/api.ts`) provides a complete mock implementation that simulates backend API calls. When you have the real backend, you can simply replace the mock implementations with actual HTTP requests while keeping the same function signatures.

## API Structure

### Types

```typescript
interface Post {
  id: number
  thumbnail: string
  caption: string
  price: string
  creator: string
  creatorId: string
  isPurchased: boolean
  createdAt: string
  sales?: number
  purchaseDate?: string
  fileType: 'image' | 'video' | 'audio' | 'document'
  fileSize: string
}

interface User {
  id: string
  name: string
  profilePicture: string
  totalPosts: number
  totalPurchases: number
  totalEarnings: string
  bio?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}
```

### API Functions

#### Posts API (`api.posts`)

```typescript
// Get all posts with pagination
const result = await api.posts.getAll(page: number, limit: number)
// Returns: { posts: Post[], total: number, hasMore: boolean }

// Get posts by creator
const posts = await api.posts.getByCreator(creatorId: string)
// Returns: Post[]

// Get purchased posts by user
const purchased = await api.posts.getPurchasedByUser(userId: string)
// Returns: Post[]

// Purchase a post
const result = await api.posts.purchase(postId: number, userId: string)
// Returns: { success: boolean, transactionHash?: string }
```

#### Create Post API (`api.create`)

```typescript
// Create a new post
const result = await api.create.createPost({
  file: File,
  caption: string,
  price: string,
  creatorId: string
})
// Returns: { success: boolean, postId: number }

// Upload file to storage
const result = await api.create.uploadFile(file: File)
// Returns: { url: string, fileId: string }
```

#### Profile API (`api.profile`)

```typescript
// Get user profile
const user = await api.profile.getUserProfile(userId: string)
// Returns: User

// Update user profile
const result = await api.profile.updateProfile(userId: string, data: Partial<User>)
// Returns: { success: boolean }

// Get user's owned posts
const posts = await api.profile.getOwnedPosts(userId: string)
// Returns: Post[]

// Get user's purchased posts
const posts = await api.profile.getPurchasedPosts(userId: string)
// Returns: Post[]
```

#### Setup Profile API (`api.setup`)

```typescript
// Create initial profile
const result = await api.setup.createProfile(data: SetupProfileData, userId: string)
// Returns: { success: boolean, user: User }

// Upload profile image
const result = await api.setup.uploadProfileImage(file: File)
// Returns: { url: string }
```

## Integration with Real Backend

When you have the real backend API, follow these steps:

### 1. Replace Mock Data with HTTP Requests

Instead of using mock data, replace the API functions with actual HTTP requests:

```typescript
// Example: Replace mock posts.getAll with real API call
async getAll(page: number = 1, limit: number = 10) {
  const response = await fetch(`/api/posts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  return response.json()
}
```

### 2. Update Environment Variables

Add your backend API URLs to environment variables:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_UPLOAD_URL=https://your-upload-service.com
```

### 3. Create API Client

Create a proper API client with error handling:

```typescript
// src/lib/api-client.ts
class ApiClient {
  private baseUrl: string
  private getAuthToken: () => string | null

  constructor(baseUrl: string, getAuthToken: () => string | null) {
    this.baseUrl = baseUrl
    this.getAuthToken = getAuthToken
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getAuthToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  // Posts
  async getPosts(page: number, limit: number) {
    return this.request(`/posts?page=${page}&limit=${limit}`)
  }

  async createPost(data: FormData) {
    return this.request('/posts', {
      method: 'POST',
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  // Add more methods...
}
```

### 4. Update API Service

Replace the mock implementations with real API calls:

```typescript
// src/lib/api.ts
import { ApiClient } from './api-client'

const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL!,
  () => localStorage.getItem('auth_token') // Or get from your auth context
)

export const api = {
  posts: {
    async getAll(page: number = 1, limit: number = 10) {
      return apiClient.getPosts(page, limit)
    },
    
    async createPost(data: CreatePostData) {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('caption', data.caption)
      formData.append('price', data.price)
      formData.append('creatorId', data.creatorId)
      
      return apiClient.createPost(formData)
    },
    
    // ... other methods
  },
  // ... other API sections
}
```

## Error Handling

The current implementation includes basic error handling. For production, consider:

1. **Retry Logic**: Implement exponential backoff for failed requests
2. **Offline Support**: Cache data for offline viewing
3. **Loading States**: Show appropriate loading indicators
4. **Error Boundaries**: Catch and display errors gracefully

## Authentication Integration

Currently, the mock uses a hardcoded user ID (`"user_1"`). In production:

1. **Get User ID from Auth Context**: Use your authentication provider (Privy, Auth0, etc.)
2. **Token Management**: Handle token refresh and expiration
3. **Protected Routes**: Ensure API calls are made only when authenticated

## File Upload Integration

For file uploads, consider:

1. **Direct Upload**: Upload files directly to cloud storage (AWS S3, Cloudinary, etc.)
2. **Progress Tracking**: Show upload progress to users
3. **File Validation**: Validate file types and sizes on frontend and backend
4. **Image Optimization**: Resize and compress images before upload

## Example: Real API Integration

Here's how to replace a mock function with a real API call:

```typescript
// Before (Mock)
async getAll(page: number = 1, limit: number = 10) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedPosts = mockPosts.slice(startIndex, endIndex)
  return {
    posts: paginatedPosts,
    total: mockPosts.length,
    hasMore: endIndex < mockPosts.length
  }
}

// After (Real API)
async getAll(page: number = 1, limit: number = 10) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`)
  }
  
  return response.json()
}
```

## Testing

The mock API makes testing easier. For integration tests:

1. **Mock API Responses**: Use tools like MSW (Mock Service Worker)
2. **Test API Calls**: Verify correct endpoints and parameters
3. **Test Error Handling**: Ensure errors are handled gracefully
4. **Test Loading States**: Verify loading indicators work correctly

## Performance Considerations

1. **Pagination**: Implement infinite scroll or pagination
2. **Caching**: Cache frequently accessed data
3. **Optimistic Updates**: Update UI immediately, sync with server later
4. **Debouncing**: Debounce search and filter inputs

## Security

1. **Input Validation**: Validate all user inputs
2. **CSRF Protection**: Include CSRF tokens in requests
3. **Rate Limiting**: Handle rate limiting gracefully
4. **Secure File Uploads**: Validate file types and scan for malware

This API service provides a solid foundation for your Peekly frontend. When you're ready to integrate with the real backend, you can replace the mock implementations while keeping the same interface, making the transition smooth and maintainable.
