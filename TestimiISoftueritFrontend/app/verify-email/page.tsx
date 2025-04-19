'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`https://localhost:7234/api/account/verify-email?token=${encodeURIComponent(token)}`);

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    };

    verifyEmail();
  }, [token]);

  // ✅ Redirect to login after 3 seconds if successful
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <div>
          <h2 style={{ color: "green" }}>{message}</h2>
          <p>You’ll be redirected to the login page shortly...</p>
        </div>
      )}
      {status === "error" && <h2 style={{ color: "red" }}>{message}</h2>}
    </div>
  );
}
