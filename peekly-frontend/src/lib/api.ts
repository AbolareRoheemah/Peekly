// API Service for Peekly Frontend
// This file contains mock API functions that simulate backend calls
// When you have the real backend, just replace the URLs and keep the same function signatures

// Types
export interface Post {
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

export interface User {
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

export interface CreatePostData {
  file: File
  caption: string
  price: string
  creatorId: string
}

export interface SetupProfileData {
  name: string
  profileImage: File | null
  bio?: string
  website?: string
}

// Mock Data
const mockPosts: Post[] = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    caption: "Exclusive digital artwork - Limited edition NFT collection",
    price: "0.05 ETH",
    creator: "artist_crypto",
    creatorId: "user_1",
    isPurchased: false,
    createdAt: "2024-01-15T10:30:00Z",
    fileType: "image",
    fileSize: "2.4 MB"
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
    caption: "Unreleased track from my upcoming album 🎵",
    price: "0.02 ETH",
    creator: "musicmaker_eth",
    creatorId: "user_2",
    isPurchased: false,
    createdAt: "2024-01-14T15:45:00Z",
    fileType: "audio",
    fileSize: "8.7 MB"
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    caption: "Behind the scenes content from my latest photoshoot",
    price: "0.01 ETH",
    creator: "photographer_pro",
    creatorId: "user_3",
    isPurchased: true,
    createdAt: "2024-01-13T09:20:00Z",
    purchaseDate: "2024-01-16T14:30:00Z",
    fileType: "image",
    fileSize: "3.1 MB"
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
    caption: "Tutorial: Advanced trading strategies revealed",
    price: "0.08 ETH",
    creator: "crypto_trader",
    creatorId: "user_4",
    isPurchased: false,
    createdAt: "2024-01-12T16:15:00Z",
    fileType: "video",
    fileSize: "45.2 MB"
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    caption: "My complete guide to DeFi investing (50+ pages)",
    price: "0.03 ETH",
    creator: "defi_expert",
    creatorId: "user_5",
    isPurchased: false,
    createdAt: "2024-01-11T11:00:00Z",
    fileType: "document",
    fileSize: "1.8 MB"
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    caption: "Exclusive behind-the-scenes from my latest project",
    price: "0.06 ETH",
    creator: "content_creator",
    creatorId: "user_6",
    isPurchased: false,
    createdAt: "2024-01-10T13:25:00Z",
    fileType: "video",
    fileSize: "32.1 MB"
  }
]

const mockUsers: User[] = [
  {
    id: "user_1",
    name: "Alex Chen",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    totalPosts: 12,
    totalPurchases: 8,
    totalEarnings: "2.4 ETH",
    bio: "Digital artist and NFT creator. Passionate about blockchain art.",
    website: "https://alexchen.art",
    socialLinks: {
      twitter: "@alexchen_art",
      instagram: "@alexchen.art"
    }
  },
  {
    id: "user_2",
    name: "Sarah Kim",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    totalPosts: 8,
    totalPurchases: 15,
    totalEarnings: "1.8 ETH",
    bio: "Music producer and sound designer. Creating unique audio experiences.",
    website: "https://sarahkim.music",
    socialLinks: {
      twitter: "@sarahkim_music",
      instagram: "@sarahkim_music"
    }
  }
]

// API Functions
export const api = {
  // Posts API
  posts: {
    // Get all posts (with pagination)
    async getAll(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number, hasMore: boolean }> {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPosts = mockPosts.slice(startIndex, endIndex)
      
      return {
        posts: paginatedPosts,
        total: mockPosts.length,
        hasMore: endIndex < mockPosts.length
      }
    },

    // Get posts by creator
    async getByCreator(creatorId: string): Promise<Post[]> {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockPosts.filter(post => post.creatorId === creatorId)
    },

    // Get purchased posts by user
    async getPurchasedByUser(userId: string): Promise<Post[]> {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockPosts.filter(post => post.isPurchased)
    },

    // Purchase a post
    async purchase(postId: number, userId: string): Promise<{ success: boolean, transactionHash?: string }> {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const postIndex = mockPosts.findIndex(post => post.id === postId)
      if (postIndex !== -1) {
        mockPosts[postIndex].isPurchased = true
        mockPosts[postIndex].purchaseDate = new Date().toISOString()
        return { 
          success: true, 
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` 
        }
      }
      
      throw new Error("Post not found")
    }
  },

  // Create Post API
  create: {
    // Create a new post
    async createPost(data: CreatePostData): Promise<{ success: boolean, postId: number }> {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate file upload
      const newPost: Post = {
        id: mockPosts.length + 1,
        thumbnail: URL.createObjectURL(data.file), // In real app, this would be the uploaded file URL
        caption: data.caption,
        price: `${data.price} ETH`,
        creator: "Current User", // This would come from auth context
        creatorId: data.creatorId,
        isPurchased: false,
        createdAt: new Date().toISOString(),
        fileType: data.file.type.startsWith('image/') ? 'image' : 
                 data.file.type.startsWith('video/') ? 'video' : 
                 data.file.type.startsWith('audio/') ? 'audio' : 'document',
        fileSize: `${(data.file.size / (1024 * 1024)).toFixed(1)} MB`
      }
      
      mockPosts.unshift(newPost)
      
      return { success: true, postId: newPost.id }
    },

    // Upload file to storage (simulated)
    async uploadFile(file: File): Promise<{ url: string, fileId: string }> {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        url: URL.createObjectURL(file),
        fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }
  },

  // Profile API
  profile: {
    // Get user profile
    async getUserProfile(userId: string): Promise<User> {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error("User not found")
      }
      
      return user
    },

    // Update user profile
    async updateProfile(userId: string, data: Partial<User>): Promise<{ success: boolean }> {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data }
        return { success: true }
      }
      
      throw new Error("User not found")
    },

    // Get user's owned posts
    async getOwnedPosts(userId: string): Promise<Post[]> {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockPosts.filter(post => post.creatorId === userId)
    },

    // Get user's purchased posts
    async getPurchasedPosts(userId: string): Promise<Post[]> {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockPosts.filter(post => post.isPurchased)
    }
  },

  // Setup Profile API
  setup: {
    // Create initial profile
    async createProfile(data: SetupProfileData, userId: string): Promise<{ success: boolean, user: User }> {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newUser: User = {
        id: userId,
        name: data.name,
        profilePicture: data.profileImage ? URL.createObjectURL(data.profileImage) : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        totalPosts: 0,
        totalPurchases: 0,
        totalEarnings: "0 ETH",
        bio: data.bio,
        website: data.website
      }
      
      mockUsers.push(newUser)
      
      return { success: true, user: newUser }
    },

    // Upload profile image
    async uploadProfileImage(file: File): Promise<{ url: string }> {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        url: URL.createObjectURL(file)
      }
    }
  },

  // Auth API (for future use)
  auth: {
    // Get current user
    async getCurrentUser(): Promise<User | null> {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Simulate getting current user from auth context
      return mockUsers[0] || null
    },

    // Check if user exists
    async userExists(userId: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockUsers.some(user => user.id === userId)
    }
  }
}

// Utility functions
export const formatPrice = (price: string): string => {
  return `${price} ETH`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return date.toLocaleDateString()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
