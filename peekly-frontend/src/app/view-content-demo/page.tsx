"use client";

import { useState } from "react";
import {
  createViewContent,
  getUserViewHistory,
  getPostViewStats,
  checkUserHasViewed,
} from "../actions/view-content";
import { ViewContentData } from "../actions/view-content";

export default function ViewContentDemo() {
  const [formData, setFormData] = useState<ViewContentData>({
    userId: "",
    postId: "",
    amount: 0,
    isBasePay: false,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "create" | "history" | "stats" | "check"
  >("create");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createViewContent(formData);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: "Failed to create view content" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetHistory = async () => {
    if (!formData.userId) {
      setResult({ success: false, error: "User ID is required" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await getUserViewHistory(formData.userId);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: "Failed to get view history" });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStats = async () => {
    if (!formData.postId) {
      setResult({ success: false, error: "Post ID is required" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await getPostViewStats(formData.postId);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: "Failed to get post stats" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckView = async () => {
    if (!formData.userId || !formData.postId) {
      setResult({
        success: false,
        error: "Both User ID and Post ID are required",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await checkUserHasViewed(
        formData.userId,
        formData.postId
      );
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: "Failed to check view status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            View Content Demo
          </h1>
          <p className="text-gray-600">
            Test the backend functionality for recording view content purchases
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                {
                  id: "create",
                  label: "Create View",
                  handler: () => setActiveTab("create"),
                },
                {
                  id: "history",
                  label: "View History",
                  handler: () => setActiveTab("history"),
                },
                {
                  id: "stats",
                  label: "Post Stats",
                  handler: () => setActiveTab("stats"),
                },
                {
                  id: "check",
                  label: "Check View",
                  handler: () => setActiveTab("check"),
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={tab.handler}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="postId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Post ID
                </label>
                <input
                  type="text"
                  id="postId"
                  value={formData.postId}
                  onChange={(e) =>
                    setFormData({ ...formData, postId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post ID"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBasePay"
                  checked={formData.isBasePay}
                  onChange={(e) =>
                    setFormData({ ...formData, isBasePay: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isBasePay"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Is Base Payment
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              {activeTab === "create" && (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create View Content"}
                </button>
              )}

              {activeTab === "history" && (
                <button
                  type="button"
                  onClick={handleGetHistory}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Get View History"}
                </button>
              )}

              {activeTab === "stats" && (
                <button
                  type="button"
                  onClick={handleGetStats}
                  disabled={loading}
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Get Post Stats"}
                </button>
              )}

              {activeTab === "check" && (
                <button
                  type="button"
                  onClick={handleCheckView}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Checking..." : "Check View Status"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>

            {result.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 font-medium">{result.message}</p>
                </div>

                {result.view && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Response Data:
                    </h4>
                    <pre className="text-sm text-gray-700 overflow-auto">
                      {JSON.stringify(result.view, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 font-medium">
                  Error: {result.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Use
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>
              <strong>Create View:</strong> Enter userId, postId, amount, and
              optionally mark as base payment to record a new view.
            </p>
            <p>
              <strong>View History:</strong> Enter userId to see all posts that
              user has viewed.
            </p>
            <p>
              <strong>Post Stats:</strong> Enter postId to see view statistics
              and revenue for a specific post.
            </p>
            <p>
              <strong>Check View:</strong> Enter both userId and postId to check
              if a user has viewed a specific post.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
