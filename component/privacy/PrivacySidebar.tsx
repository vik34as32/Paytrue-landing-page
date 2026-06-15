const sections = [
  "Introduction",
  "Information We Collect",
  "How We Use Information",
  "Legal Basis",
  "Sharing Information",
  "Data Retention",
  "Data Security",
  "Your Rights",
  "Cookies",
  "Policy Updates",
];

export default function PrivacySidebar() {
  return (
    <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-xl border">
      <h3 className="mb-5 text-xl font-bold" style={{color:"gray"}}>
        Contents
      </h3>

      <div className="space-y-2">
        {sections.map((item) => (
          <div
            key={item}
            className="rounded-xl px-4 py-3 hover:bg-blue-50 cursor-pointer"
            style={{color:"grey"}}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}