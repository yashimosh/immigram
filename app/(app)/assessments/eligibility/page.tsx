import { EligibilityWizard } from "./eligibility-wizard";

export const metadata = { title: "Visa Eligibility Checker" };

export default function EligibilityPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Visa Eligibility Checker</h1>
        <p className="text-muted-foreground mt-1">
          Answer a few questions and our AI will recommend visa programs you may qualify for.
        </p>
      </div>
      <EligibilityWizard />
    </div>
  );
}
