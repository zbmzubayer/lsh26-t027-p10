import { WelcomeForm } from "@/components/meter/welcome-form";

export default function WelcomePage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to P10 Meter Advisor
        </h1>
        <p className="text-muted-foreground">
          Create your household and import your meter history to see where the
          money went.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-xl">
        <WelcomeForm />
      </div>
    </div>
  );
}
