import Link from "next/link";
import { servicesData } from "@/data/servicesData";

export default function ServicesPage() {
  return (
    <section className="min-h-screen bg-slate-50 py-20 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-slate-900 mb-14">
          Our Premium Services
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <Link
              key={index}
              href={`/services/${service.slug}`}
              className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {service.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}