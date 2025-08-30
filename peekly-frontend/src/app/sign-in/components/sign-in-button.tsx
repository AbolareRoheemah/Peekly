"use client";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUser } from "../action";

export function SignInButton() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  console.log("🎯 SignInButton component rendered");
  console.log("Current state:", { ready, authenticated, isCreatingUser });

  const { login } = useLogin({
    onComplete: async (user) => {
      console.log("🎉 LOGIN COMPLETED!");
      console.log("Full response object:", user);
      console.log("User object:", user.user);
      console.log("User ID:", user.user?.id);
      console.log("Is new user:", user.isNewUser);
      console.log("Login method:", user.loginMethod);

      if (user.isNewUser) {
        try {
          setIsCreatingUser(true);
          await createUser(user.user.id);
          console.log("✅ User created successfully in database");
        } catch (err) {
          console.error("❌ Failed to create user:", err);
        } finally {
          setIsCreatingUser(false);
        }
      } else {
        console.log("👤 User already exists in database");
      }

      console.log("🚀 Redirecting to home page...");
      router.push("/");
    },
    onError: (err) => {
      console.error("login error", err);
    },
  });

  const disableLogin = !ready || (ready && authenticated);

  useEffect(() => {
    console.log("=== SIGN-IN BUTTON DEBUG ===");
    console.log("ready", ready);
    console.log("authenticated", authenticated);
    console.log("isCreatingUser", isCreatingUser);

    if (ready && !authenticated) {
      console.log("🔐 User not authenticated, calling login()");
      login();
    } else if (ready && authenticated && !isCreatingUser) {
      console.log("✅ User already authenticated, redirecting to /");
      router.push("/");
    } else {
      console.log("⏳ Waiting for state to be ready...");
    }
  }, [ready, authenticated, isCreatingUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      {authenticated ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">✅ You are already signed in!</p>
          <button
            onClick={() => {
              console.log("🔓 Signing out...");
              logout();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-blue-600 mb-4">🔐 Please sign in</p>
          <button
            onClick={() => {
              console.log("🔑 Manual login triggered");
              login();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}
