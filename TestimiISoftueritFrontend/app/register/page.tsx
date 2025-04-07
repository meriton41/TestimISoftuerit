import RegisterForm from "@/components/register-form"

export default function Register() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1">
        <div className="flex flex-col w-full">
          <main className="flex min-h-screen">
            <RegisterForm />
          </main>
        </div>
      </div>
    </div>
  )
}

