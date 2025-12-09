export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">
          HireFlow
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Resume Screening & Interview Scheduling
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/auth/login" className="btn-primary">
            Sign In
          </a>
          <a href="/auth/signup" className="btn-secondary">
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
