"use client";

import Image from "next/image";
import { Plane, Hotel, Bus, Train, ArrowRight } from "lucide-react";

export default function TravelHeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-28">
      
      {/* Background Blur */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col-reverse items-center gap-16 lg:flex-row">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">

            <div className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Smart Travel Booking Solutions
            </div>

            <h1 className="text-5xl font-black leading-tight text-slate-900 md:text-6xl">
              Best
              <span className="text-blue-600"> Travel Booking </span>
              Services
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Book flights, hotels, trains, and buses instantly through
              PayTrue. Enjoy secure payments, real-time confirmations,
              and exclusive travel deals for every journey.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">

              <button className="group flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700">
                Book Now
                <ArrowRight size={18} />
              </button>

              <button className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                View Plans
              </button>

            </div>

            {/* Service Icons */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Plane className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-gray-400">Flights</h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Hotel className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-gray-400">Hotels</h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Train className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-gray-400">Train</h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Bus className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-gray-400">Bus</h4>
              </div>

            </div>
          </div>

          {/* Right Image */}
          <div className="flex flex-1 justify-center">
            <div className="relative">

              <Image
                src="/images/travel-hero.png"
                alt="Travel Booking"
                width={650}
                height={650}
                priority
                className="h-auto w-full max-w-[600px] object-contain"
              />

              {/* Floating Card */}
              <div className="absolute -left-8 top-10 rounded-2xl bg-white p-4 shadow-xl">
                <h4 className="text-3xl font-bold text-blue-600">5000+</h4>
                <p className="text-sm text-slate-500">
                  Daily Bookings
                </p>
              </div>

              {/* Floating Card */}
              <div className="absolute -right-6 bottom-16 rounded-2xl bg-blue-600 p-4 text-white shadow-xl">
                <h4 className="text-xl font-bold">
                  Instant
                </h4>
                <p className="text-xs">
                  Booking Confirmation
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}