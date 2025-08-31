"use client";

import { useState } from "react";
import AllPostsDisplay from "../../components/all-posts-display";

export default function PostsWithPurchaseDemo() {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    if (currentUserId.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserId("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Posts with Purchase Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demo shows how to display all posts and allow users to
            purchase/view content. The purchase action creates a record in the
            View table.
          </p>

          {/* User Authentication Demo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              Demo User Authentication
            </h3>

            {!isLoggedIn ? (
              <div className="flex gap-4 items-end">
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-blue-800 mb-1"
                  >
                    Enter User ID (for demo purposes)
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={currentUserId}
                    onChange={(e) => setCurrentUserId(e.target.value)}
                    placeholder="Enter any user ID to simulate login"
                    className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={!currentUserId.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simulate Login
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium">
                    Logged in as: {currentUserId}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}

            <p className="text-sm text-blue-700 mt-2">
              <strong>Note:</strong> This is a demo. In a real app, user
              authentication would be handled by your auth system.
            </p>
          </div>
        </div>
      </div>

      {/* Posts Display */}
      <AllPostsDisplay currentUserId={isLoggedIn ? currentUserId : undefined} />

      {/* Demo Instructions */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How This Demo Works
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Backend Functions
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <code>getAllPosts()</code> - Retrieves all posts with
                  pagination
                </li>
                <li>
                  • <code>handleViewContentPurchase()</code> - Records purchase
                  in View table
                </li>
                <li>
                  • <code>hasUserViewedPost()</code> - Checks if user already
                  purchased
                </li>
                <li>• Search, sorting, and pagination support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Frontend Features
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsive grid layout for posts</li>
                <li>• Search functionality with debouncing</li>
                <li>• Sort by latest, price, or popularity</li>
                <li>• Purchase buttons that create View records</li>
                <li>• Visual indicators for purchased content</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">
              Testing the Purchase Flow
            </h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Enter a user ID above and click "Simulate Login"</li>
              <li>Browse the posts displayed below</li>
              <li>Click "Purchase" on any post you want to view</li>
              <li>The purchase will be recorded in the View table</li>
              <li>The post will show as "Viewed" after purchase</li>
              <li>Check the View table in your database to see the records</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium text-yellow-900 mb-2">
              Database Integration
            </h4>
            <p className="text-sm text-yellow-800">
              When you purchase a post, it creates a record in the{" "}
              <code>View</code> table with:
              <br />• <strong>userId:</strong> Your user ID
              <br />• <strong>postId:</strong> The post you purchased
              <br />• <strong>amount:</strong> The price you paid
              <br />• <strong>isBasePay:</strong> true (indicating initial
              purchase)
              <br />• <strong>createdAt:</strong> Timestamp of purchase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
