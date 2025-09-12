"use client";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUser } from "../action";

export function SignInButton() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const { login } = useLogin({
    onComplete: async (user) => {
      try {
        setIsCreatingUser(true);
        const userAddress = user.user.wallet?.address || "";
        
        console.log("Sign-in onComplete - User ID:", user.user.id);
        console.log("Sign-in onComplete - User Address:", userAddress);
        
        // Always try to create user (will handle duplicates gracefully)
        try {
          const createdUser = await createUser(user.user.id, userAddress);
          console.log("User created/updated successfully:", createdUser);
        } catch (err) {
          // User might already exist, which is fine
          console.log("User might already exist:", err);
        }
      } catch (err) {
        console.error("Error in sign-in flow:", err);
      } finally {
        setIsCreatingUser(false);
      }
      router.push("/posts");
    },
    onError: (err) => {
      // Optionally handle error
      console.error("login error", err);
    },
  });

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    } else if (ready && authenticated && !isCreatingUser) {
      router.push("/posts");
    }
  }, [ready, authenticated, isCreatingUser]);

  return (
    <main className="min-h-screen bg-black flex pt-16 justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="flex justify-center mb-6">
          <img src="/peekly-logo.png" alt="Peekly Logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-white mb-8">Monetize your posts</h1>

        <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto border border-purple-500/20">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign in to Peekly</h2>

          <div className="space-y-4">
            {authenticated ? (
              <div className="text-center">
                <p className="text-green-500 mb-4">✅ You are already signed in!</p>
                <button
                  onClick={logout}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={login}
                  disabled={!ready || isCreatingUser}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-colors disabled:opacity-60"
                >
                  {isCreatingUser ? "Signing In..." : "Sign In with Privy"}
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
                  onClick={login}
                  disabled={!ready || isCreatingUser}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                  {isCreatingUser ? "Connecting..." : "Connect Wallet"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}