"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `https://localhost:7176/api/account/verify-email?token=${token}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          setStatus("error");
          setMessage(errorData.message || "Email verification failed.");
          return;
        }

        const data = await res.json();
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    };

    verifyEmail();
  }, [token]);

  // Redirect to login after 3 seconds if successful
  // Removed redirect as per user request
  // useEffect(() => {
  //   if (status === "success") {
  //     const timer = setTimeout(() => {
  //       router.push("/");
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}
        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              {message}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              If you have successfully verified your email, you can go back to
              your register form !
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              {message}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please try registering again or contact support if the problem
              persists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
