import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1">
        <div className="flex flex-col w-full">
          <main className="flex min-h-screen">
            <LoginForm />
          </main>
        </div>
      </div>
    </div>
  )
}

