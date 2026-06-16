
"use client";

import {
  Plane,
  Train,
  Hotel,
  Bus,
  ShieldCheck,
  Clock,
  Globe,
  Bell,
} from "lucide-react";

const benefits = [
  {
    icon: Plane,
    title: "Flight Ticket Booking",
    desc: "Book domestic and international flight tickets instantly with competitive fares and quick confirmation.",
  },
  {
    icon: Train,
    title: "Railway Ticket Booking",
    desc: "Book train tickets across India with real-time seat availability and secure booking.",
  },
  {
    icon: Clock,
    title: "Tatkal Ticket Service",
    desc: "Get quick Tatkal booking assistance for urgent and last-minute travel plans.",
  },
  {
    icon: Hotel,
    title: "Hotel Reservations",
    desc: "Choose from budget, premium, and luxury hotels at your preferred destination.",
  },
  {
    icon: Bus,
    title: "Bus Ticket Booking",
    desc: "Book AC, Sleeper, and Luxury buses with instant confirmation and easy cancellations.",
  },
  {
    icon: Globe,
    title: "Holiday Packages",
    desc: "Explore domestic and international tour packages designed for families and businesses.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Travel Payments",
    desc: "Enjoy safe and encrypted transactions with multiple payment options and instant receipts.",
  },
  {
    icon: Bell,
    title: "Travel Alerts & Updates",
    desc: "Receive booking confirmations, travel reminders, departure alerts, and journey updates.",
  },
];

export default function TravelBenefitsSection() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="mb-14 text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Travel Services
          </span>

          <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-5xl">
            Travel Services &
            <span className="text-blue-600"> Benefits</span>
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
            Book flights, railway tickets, Tatkal reservations, hotels,
            buses, and holiday packages from a single platform with secure
            payments and instant confirmations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Icon size={26} />
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm leading-7 text-gray-600">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
