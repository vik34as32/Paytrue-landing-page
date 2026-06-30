"use client";

export default function PasswordStrengthMeter({ password = "" }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase", valid: /[A-Z]/.test(password) },
    { label: "Lowercase", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) },
    { label: "Special char", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.valid).length;
  const strength =
    score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";
  const barColor =
    score <= 2 ? "bg-red-500" : score <= 4 ? "bg-amber-500" : "bg-emerald-500";

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Password strength</span>
        <span
          className={`font-semibold ${
            score <= 2 ? "text-red-500" : score <= 4 ? "text-amber-500" : "text-emerald-600"
          }`}
        >
          {strength}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all ${barColor}`}
          style={{ width: `${(score / checks.length) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              check.valid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
