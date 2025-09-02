"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/setup-profile")
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="flex justify-center mb-6">
          <img src="/peekly-logo.png" alt="Peekly Logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-white mb-8">Monetize your posts</h1>

        <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto border border-purple-500/20">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign in to Peekly</h2>

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-colors"
            >
              Sign In
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-gray-800 border border-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
