import { NewCaseForm } from "./new-case-form";

export const metadata = { title: "New Case" };

export default function NewCasePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Case</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new immigration case to track your application.
        </p>
      </div>
      <NewCaseForm />
    </div>
  );
}
