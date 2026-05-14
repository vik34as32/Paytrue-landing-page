"use client";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 px-4 py-2 shadow-md">
            <span className="text-2xl font-extrabold text-white">
              Good<span className="text-white-400">Links</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#" className="font-semibold text-slate-800 hover:text-blue-900">Home</a>
          <a href="#" className="font-semibold text-slate-800 hover:text-blue-900">About</a>
          <a href="#" className="font-semibold text-slate-800 hover:text-blue-900">Products & Services</a>
          <a href="#" className="font-semibold text-slate-800 hover:text-blue-900">Contact</a>
        </nav>

        {/* Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white hover:bg-blue-900">
            Login
          </button>
          <button className="rounded-xl bg-slate-100 px-6 py-2 font-bold text-slate-900 hover:bg-slate-200">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;