"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_COUNTRIES, VISA_TYPES, EDUCATION_LEVELS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2, ClipboardCheck } from "lucide-react";

const STEPS = [
  "Personal Info",
  "Target",
  "Education & Work",
  "Languages",
  "Situation",
  "Review",
];

export function EligibilityWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    nationality: "",
    age: 25,
    target_country: "",
    purpose: "work" as string,
    education_level: "bachelors",
    field_of_study: "",
    occupation: "",
    years_of_work_experience: 0,
    language_skills: [{ language: "English", proficiency: "fluent" }],
    financial_status: "moderate" as string,
    marital_status: "single",
    dependents_count: 0,
    has_job_offer: false,
    has_family_in_target: false,
    criminal_record: false,
    health_issues: false,
  });

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Assessment failed");

      const result = await res.json();
      router.push(`/assessments/${result.id}`);
    } catch {
      setError("Failed to process assessment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-white/10"
              }`}
            />
            <p className={`text-xs mt-1.5 ${i === step ? "text-primary" : "text-muted-foreground"}`}>
              {s}
            </p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nationality</label>
              <select
                value={form.nationality}
                onChange={(e) => update("nationality", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select your nationality</option>
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Age</label>
              <input
                type="number"
                min={16}
                max={99}
                value={form.age}
                onChange={(e) => update("age", parseInt(e.target.value))}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Marital Status</label>
              <select
                value={form.marital_status}
                onChange={(e) => update("marital_status", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Number of Dependents</label>
              <input
                type="number"
                min={0}
                value={form.dependents_count}
                onChange={(e) => update("dependents_count", parseInt(e.target.value))}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Step 1: Target */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Where do you want to go?</h2>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Target Country</label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => update("target_country", c.code)}
                    className={`rounded-lg border px-4 py-3 text-sm text-left transition-colors ${
                      form.target_country === c.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-input text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {VISA_TYPES.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => update("purpose", v.value)}
                    className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      form.purpose === v.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-input text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education & Work */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Education & Work Experience</h2>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Education Level</label>
              <select
                value={form.education_level}
                onChange={(e) => update("education_level", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {EDUCATION_LEVELS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Field of Study</label>
              <input
                type="text"
                value={form.field_of_study}
                onChange={(e) => update("field_of_study", e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Years of Work Experience</label>
              <input
                type="number"
                min={0}
                value={form.years_of_work_experience}
                onChange={(e) => update("years_of_work_experience", parseInt(e.target.value))}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Step 3: Languages */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Language Skills</h2>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Primary Language</label>
              <input
                type="text"
                value={form.language_skills[0]?.language || ""}
                onChange={(e) =>
                  update("language_skills", [
                    { ...form.language_skills[0], language: e.target.value },
                    ...form.language_skills.slice(1),
                  ])
                }
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Proficiency</label>
              <select
                value={form.language_skills[0]?.proficiency || "fluent"}
                onChange={(e) =>
                  update("language_skills", [
                    { ...form.language_skills[0], proficiency: e.target.value },
                    ...form.language_skills.slice(1),
                  ])
                }
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="fluent">Fluent</option>
                <option value="native">Native</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Financial Status</label>
              <select
                value={form.financial_status}
                onChange={(e) => update("financial_status", e.target.value)}
                className="w-full rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="limited">Limited</option>
                <option value="moderate">Moderate</option>
                <option value="comfortable">Comfortable</option>
                <option value="wealthy">Wealthy</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Situation */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Situation</h2>
            {[
              { key: "has_job_offer", label: "Do you have a job offer in the target country?" },
              { key: "has_family_in_target", label: "Do you have family in the target country?" },
              { key: "criminal_record", label: "Do you have a criminal record?" },
              { key: "health_issues", label: "Do you have any significant health issues?" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm">{item.label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update(item.key, true)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                      form[item.key as keyof typeof form] === true
                        ? "bg-primary/10 text-primary border border-primary"
                        : "bg-input border border-border text-muted-foreground"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => update(item.key, false)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                      form[item.key as keyof typeof form] === false
                        ? "bg-primary/10 text-primary border border-primary"
                        : "bg-input border border-border text-muted-foreground"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review Your Information</h2>
            <div className="space-y-2 text-sm">
              {[
                ["Nationality", form.nationality || "Not set"],
                ["Age", String(form.age)],
                ["Target Country", form.target_country || "Not set"],
                ["Purpose", form.purpose],
                ["Education", form.education_level],
                ["Occupation", form.occupation || "Not set"],
                ["Experience", `${form.years_of_work_experience} years`],
                ["Job Offer", form.has_job_offer ? "Yes" : "No"],
                ["Family in Target", form.has_family_in_target ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><ClipboardCheck className="h-4 w-4" /> Get Results</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
