import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  MapPinIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  BellAlertIcon,
  UsersIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";
import { LegalModal } from "../../../components/ui/LegalModal";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

const DELIVERY_IMAGE = "/landing_page.jpeg";
const MAP_IMAGE = "/gps.jpeg";

const features = [
  {
    icon: BoltIcon,
    title: "AI Route Optimization",
    desc: "Our engine calculates the fastest routes across hundreds of stops in seconds, saving up to 40% in drive time.",
  },
  {
    icon: MapPinIcon,
    title: "Live GPS Tracking",
    desc: "Track every driver on a live map. See ETAs, position, and delivery status updated in real time.",
  },
  {
    icon: DocumentCheckIcon,
    title: "Proof of Delivery",
    desc: "Drivers capture photos and signatures at each stop. Every delivery is verified and timestamped.",
  },
  {
    icon: BellAlertIcon,
    title: "Customer Notifications",
    desc: "Automatically send customers a tracking link so they know exactly when to expect their delivery.",
  },
  {
    icon: ChartBarIcon,
    title: "Fleet Analytics",
    desc: "Deep reports on performance, route completion, on-time rates, and driver efficiency — all in one dashboard.",
  },
  {
    icon: UsersIcon,
    title: "Simple Driver Onboarding",
    desc: "Drivers join using your unique company code. No admin overhead. They're ready to go in under 2 minutes.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your fleet account",
    desc: "Sign up in minutes. Get your unique company code and configure your first fleet.",
  },
  {
    number: "02",
    title: "Add drivers instantly",
    desc: "Share your company code with drivers. They download the app, enter the code, and they're on your fleet.",
  },
  {
    number: "03",
    title: "Build & assign routes",
    desc: "Create a route, add stops, optimise with one click, then assign it to any driver from the dashboard.",
  },
  {
    number: "04",
    title: "Track, verify & improve",
    desc: "Monitor deliveries live, receive proof-of-delivery photos, and use analytics to sharpen your operations.",
  },
];

const testimonials = [
  {
    name: "Marcus Webb",
    role: "Operations Manager",
    company: "SwiftBox Courier",
    rating: 5,
    text: "Vector cut our average delivery time by 35%. The dashboard is incredibly intuitive — our dispatchers were up to speed in a day.",
  },
  {
    name: "Priya Nair",
    role: "Founder",
    company: "GreenRun Logistics",
    rating: 5,
    text: "We scaled from 3 to 22 drivers without hiring an extra dispatcher. The company code system made onboarding painless.",
  },
  {
    name: "James Okoye",
    role: "Fleet Director",
    company: "CityLink Deliveries",
    rating: 5,
    text: "The proof-of-delivery feature alone saved us countless disputes. Customers love the real-time tracking link.",
  },
];

const plans = [
  {
    name: "Free",
    priceMonthly: "0",
    priceYearly: "0",
    desc: "Perfect for testing the platform",
    drivers: "Up to 2 drivers",
    features: [
      "Route optimization",
      "Live GPS tracking",
      "Proof of delivery",
      "Customer tracking links",
      "Email support",
    ],
    cta: "Start for free",
    highlighted: false,
    save: "",
  },
  {
    name: "Starter",
    priceMonthly: "20,000",
    priceYearly: "15,000",
    desc: "For small local fleets",
    drivers: "Up to 5 drivers",
    features: [
      "Everything in Free",
      "Advanced analytics",
      "Priority routing",
      "SMS notifications",
      "Priority support",
    ],
    cta: "Get started",
    highlighted: true,
    save: "Save 17%",
  },
  {
    name: "Growth",
    priceMonthly: "50,000",
    priceYearly: "40,000",
    desc: "For growing delivery operations",
    drivers: "Up to 20 drivers",
    features: [
      "Everything in Starter",
      "Custom reporting",
      "API access",
      "Multi-fleet support",
      "Dedicated account manager",
    ],
    cta: "Scale now",
    highlighted: false,
    save: "Save 17%",
  },
];

export function WebLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [legalModalType, setLegalModalType] = useState<
    "terms" | "privacy" | null
  >(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav
        className={clsx(
          "absolute top-0 left-0 right-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-black/5"
            : "bg-transparent",
        )}
      >
        <div className="max-w-300 mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-emerald-600 transition-all duration-300 group-hover:bg-emerald-700 shadow-[0_2px_8px_rgba(5,150,105,0.35),0_0_0_1px_rgba(5,150,105,0.1)]">
              <LocalShippingIcon size={20} className="text-white" />
            </div>
            <span className="text-[17px] font-black tracking-[-0.5px] text-[#121212]">
              VECTOR
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "Demo"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-gray-500 hover:text-[#121212] transition-colors duration-200 no-underline"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/signin")}
              className="px-4.5 py-2 bg-transparent border border-black/12 rounded-lg text-sm font-semibold text-[#212121] cursor-pointer transition-all duration-200 hover:border-emerald-600 hover:text-emerald-600"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/dashboard/signup")}
              className="px-4.5 py-2 bg-emerald-600 border-none rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(5,150,105,0.3)] hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(5,150,105,0.35)]"
            >
              Get started free
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden bg-none border-none cursor-pointer p-1"
          >
            <Bars3Icon className="w-6 h-6 text-[#212121]" />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex justify-end"
            >
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-70 max-w-[80vw] bg-white h-full flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.1)]"
              >
                <div className="p-5 px-6 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-emerald-600 shadow-[0_2px_8px_rgba(5,150,105,0.35),0_0_0_1px_rgba(5,150,105,0.1)]">
                      <LocalShippingIcon size={20} className="text-white" />
                    </div>
                    <span className="text-[17px] font-black tracking-[-0.5px] text-[#121212]">
                      VECTOR
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-none border-none cursor-pointer p-1"
                  >
                    <XMarkIcon className="w-6 h-6 text-[#212121]" />
                  </button>
                </div>
                <div className="px-6 pb-6 flex flex-col gap-5">
                  {["Features", "How it works", "Pricing", "Demo"].map(
                    (item) => (
                      <a
                        key={item}
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-semibold text-[#212121] no-underline"
                      >
                        {item}
                      </a>
                    ),
                  )}
                  <div className="h-px bg-black/5 my-3" />
                  <div className="mt-auto flex flex-col gap-3">
                    <button
                      onClick={() => {
                        navigate("/dashboard/signin");
                        setMobileMenuOpen(false);
                      }}
                      className="p-3.5 rounded-xl border border-black/12 bg-transparent text-base font-semibold text-[#212121] cursor-pointer"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => {
                        navigate("/dashboard/signup");
                        setMobileMenuOpen(false);
                      }}
                      className="p-3.5 rounded-xl bg-emerald-600 border-none text-base font-semibold text-white cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      Get started free
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-30 pb-20 max-w-300 mx-auto px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 bg-emerald-50/50 backdrop-blur-sm border border-emerald-600/10 rounded-full px-4 py-1.5 mb-8 shadow-sm"
        >
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
            Vector Open Beta — Free for up to 2 drivers
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[clamp(36px,5vw,60px)] font-extrabold leading-[1.08] tracking-tight text-[#121212] mb-6">
              Route smarter.{" "}
              <span className="bg-linear-to-br from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Deliver faster.
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-gray-500 mb-10 max-w-120">
              Vector is the all-in-one fleet management platform that optimises
              routes, tracks drivers live, and keeps customers informed — built
              for local delivery businesses.
            </p>

            <div className="flex gap-3 flex-wrap mb-10">
              <button
                onClick={() => navigate("/dashboard/signup")}
                className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 border-none rounded-xl text-[15px] font-bold text-white cursor-pointer shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all duration-250 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(5,150,105,0.35)] tap-scale"
              >
                Start free trial
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/driver")}
                className="flex items-center gap-2 px-7 py-3.5 bg-transparent border border-black/12 rounded-xl text-[15px] font-semibold text-[#212121] cursor-pointer transition-all duration-250 hover:border-emerald-600 hover:text-emerald-600"
              >
                <LocalShippingIcon size={18} className="text-current" />
                Driver app
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-5 flex-wrap">
              {[
                "No credit card required",
                "14-day free trial",
                "Cancel anytime",
              ].map((text) => (
                <div key={text} className="flex items-center gap-1.5">
                  <CheckSolid className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[13px] text-gray-500 font-medium">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-black/6 aspect-4/3">
              <img
                src={DELIVERY_IMAGE}
                alt="Delivery fleet on city route"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-[14px] p-3.5 px-4.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/6"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#121212] leading-none">
                    40%
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Faster deliveries
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute top-5 -right-4 bg-white rounded-[14px] p-3 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/6"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_0_3px_rgba(5,150,105,0.2)]" />
                <span className="text-[13px] font-bold text-[#121212] tracking-tight">
                  8 active drivers
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="border-t border-b border-black/6 bg-gray-50 py-10 px-6"
      >
        <div className="max-w-250 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10,000+", label: "Deliveries optimised daily" },
            { value: "40%", label: "Average time saved" },
            { value: "99.9%", label: "Platform uptime" },
            { value: "500+", label: "Active fleet accounts" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-[clamp(28px,4vw,36px)] font-extrabold text-[#121212] tracking-tight leading-none mb-1.5">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-300 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Features
          </div>
          <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-[#121212] mb-4">
            Everything your fleet needs
          </h2>
          <p className="text-[17px] text-gray-500 max-w-135 mx-auto leading-relaxed">
            From route planning to proof of delivery, Vector handles the full
            delivery lifecycle so you can focus on growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border border-black/8 rounded-2xl p-7 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] cursor-default hover:shadow-2xl hover:shadow-black/10 hover:border-emerald-600/20"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4.5">
                  <Icon className="w-5.5 h-5.5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-[#121212] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="bg-[#F8FAF9] py-24 px-6 border-t border-b border-black/5"
      >
        <div className="max-w-275 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              How it works
            </div>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-[#121212] mb-4">
              Up and running in minutes
            </h2>
            <p className="text-[17px] text-gray-500 max-w-120 mx-auto leading-relaxed">
              No complex setup. No IT team required. Your fleet is live and
              optimised in under an hour.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white border border-black/7 rounded-2xl p-7 h-full shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-600/20">
                  <div className="text-4xl font-black text-emerald-600/12 tracking-tighter mb-4 leading-none">
                    {step.number}
                  </div>
                  <h3 className="text-base font-bold text-[#121212] mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────────────── */}
      <section id="demo" className="py-24 max-w-300 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
              Fleet Dashboard
            </div>
            <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold tracking-tight text-[#121212] mb-4.5">
              Complete visibility over your entire fleet
            </h2>
            <p className="text-base text-gray-500 leading-relaxed mb-7">
              One clean dashboard to manage routes, monitor drivers live, review
              analytics, and handle billing — without switching between a dozen
              tools.
            </p>
            <div className="flex flex-col gap-3.5">
              {[
                "Assign routes to drivers in seconds",
                "View live GPS positions on a map",
                "Review delivery proof photos & signatures",
                "Export detailed reports for any date range",
              ].map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-2.5"
                >
                  <CheckSolid className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500 leading-snug">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.1)] border border-black/5"
          >
            <img
              src={MAP_IMAGE}
              alt="Route optimization map"
              className="w-full aspect-4/3 object-cover block"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* ── For Drivers Section ────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-20 px-6 overflow-hidden"
      >
        <div className="max-w-225 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/12 border border-white/15 rounded-full px-4 py-1.25 mb-6"
          >
            <LocalShippingIcon size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
              For Drivers
            </span>
          </motion.div>
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-white mb-4">
            Drivers love the mobile app
          </h2>
          <p className="text-[17px] text-white/70 leading-relaxed mb-9 max-w-140 mx-auto">
            Turn-by-turn navigation, offline mode, proof-of-delivery capture,
            and instant communication with dispatch — all in one app.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/driver")}
              className="flex items-center gap-2 px-7 py-3 bg-emerald-400 border-none rounded-xl text-[15px] font-bold text-emerald-900 cursor-pointer transition-all duration-250 hover:bg-emerald-300 hover:-translate-y-0.5 tap-scale"
            >
              <LocalShippingIcon size={18} className="text-emerald-900" />
              Open driver app
            </button>
            <button
              onClick={() => navigate("/driver")}
              className="px-7 py-3 bg-transparent border border-white/25 rounded-xl text-[15px] font-semibold text-white cursor-pointer transition-all duration-250 hover:border-white/60 hover:bg-white/10 tap-scale"
            >
              Sign up as driver
            </button>
          </div>
          <p className="text-xs text-white/45 mt-6">
            Drivers register using a company code provided by their fleet
            manager
          </p>
        </div>
      </motion.section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-24 max-w-275 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-block bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Customer stories
          </div>
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-[#121212]">
            Trusted by delivery teams worldwide
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-black/8 rounded-2xl p-7 shadow-sm transition-all duration-300 hover:border-emerald-600/20 hover:shadow-md"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, s) => (
                  <StarSolid key={s} className="w-3.5 h-3.5 text-amber-400" />
                ))}
              </div>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-5 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9.5 h-9.5 rounded-full bg-linear-to-br from-emerald-600 to-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white text-[13px] font-bold uppercase">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#121212]">{t.name}</p>
                  <p className="text-[12px] text-gray-400 font-medium">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="bg-[#F8FAF9] py-24 px-6 border-t border-black/5"
      >
        <div className="max-w-275 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-emerald-50 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              Pricing
            </div>
            <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-[#121212] mb-3.5">
              Simple, transparent pricing
            </h2>
            <p className="text-[17px] text-gray-500">
              Start free, scale as you grow. No hidden fees.
            </p>

            {/* Billing Toggle – premium UX upgrade */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center mt-8"
            >
              <div className="inline-flex rounded-full bg-white border border-black/10 p-1 shadow-sm">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={clsx(
                    "px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200",
                    billingPeriod === "monthly"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={clsx(
                    "px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200",
                    billingPeriod === "yearly"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  Yearly{" "}
                  <span className="text-[10px] opacity-70">
                    (save up to 17%)
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => {
              const price =
                billingPeriod === "monthly"
                  ? plan.priceMonthly
                  : plan.priceYearly;
              const periodText =
                billingPeriod === "monthly" ? "/mo" : "/mo billed yearly";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`rounded-[20px] p-8 relative transition-all duration-300 text-center ${
                    plan.highlighted
                      ? "bg-emerald-600 border-none shadow-[0_20px_60px_rgba(5,150,105,0.3)] scale-[1.03] z-10"
                      : "bg-white border border-black/8 shadow-sm"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-emerald-900 px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap">
                      Most popular
                    </div>
                  )}
                  <div className="mb-6">
                    <p
                      className={`text-sm font-bold uppercase tracking-widest mb-1.5 ${
                        plan.highlighted ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span
                        className={`text-base font-semibold ${
                          plan.highlighted ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        ₦
                      </span>
                      <span
                        className={`text-[42px] font-black tracking-tighter leading-none ${
                          plan.highlighted ? "text-white" : "text-[#121212]"
                        }`}
                      >
                        {price}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.highlighted ? "text-white/60" : "text-gray-400"
                        }`}
                      >
                        {periodText}
                      </span>
                    </div>

                    {billingPeriod === "yearly" && plan.save && (
                      <div
                        className={`inline-block text-xs font-bold px-3 py-0.5 rounded-full mb-2 ${
                          plan.highlighted
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {plan.save}
                      </div>
                    )}

                    <p
                      className={`text-[13px] ${
                        plan.highlighted ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {plan.drivers}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard/signup")}
                    className={`w-full py-3 rounded-xl text-sm font-bold cursor-pointer mb-6 transition-all duration-200 hover:opacity-90 tap-scale ${
                      plan.highlighted
                        ? "bg-white text-emerald-600"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="flex flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon
                          className={`w-3.75 h-3.75 shrink-0 ${
                            plan.highlighted
                              ? "text-emerald-300"
                              : "text-emerald-600"
                          }`}
                        />
                        <span
                          className={`text-[13px] font-medium ${
                            plan.highlighted ? "text-white/85" : "text-gray-600"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 max-w-225 mx-auto px-6 text-center"
      >
        <div className="bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-600/15 rounded-4xl py-16 px-10 shadow-sm relative overflow-hidden">
          <h2 className="text-[clamp(26px,4vw,42px)] font-extrabold tracking-tight text-emerald-900 mb-4 relative z-10">
            Ready to optimise your fleet?
          </h2>
          <p className="text-[17px] text-emerald-800 leading-relaxed mb-9 max-w-125 mx-auto relative z-10">
            Join hundreds of delivery businesses already saving time and money
            with Vector. Set up your fleet in under 10 minutes.
          </p>
          <div className="flex gap-3 justify-center flex-wrap relative z-10">
            <button
              onClick={() => navigate("/dashboard/signup")}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 border-none rounded-xl text-base font-bold text-white cursor-pointer shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all duration-250 hover:bg-emerald-700 hover:-translate-y-0.5 tap-scale"
            >
              Start for free
              <ArrowRightIcon className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => navigate("/dashboard/signin")}
              className="px-8 py-3.5 bg-transparent border border-emerald-600/30 rounded-xl text-base font-semibold text-emerald-600 cursor-pointer transition-all duration-250 hover:bg-emerald-600/5 tap-scale"
            >
              Sign in
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 py-20 px-6 bg-white">
        <div className="max-w-300 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-600">
                  <LocalShippingIcon size={20} className="text-white" />
                </div>
                <span className="text-[18px] font-bold text-[#121212] tracking-tight">
                  Vector
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-60">
                The all-in-one route optimisation and fleet management platform
                built for modern delivery businesses.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold text-[#121212] uppercase tracking-widest mb-6">
                Product
              </p>
              <div className="flex flex-col gap-3.5">
                {["Features", "Pricing"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors no-underline"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold text-[#121212] uppercase tracking-widest mb-6">
                Contact
              </p>
              <div className="flex flex-col gap-3.5">
                <a
                  href="mailto:himpraise571@gmail.com"
                  className="text-sm text-gray-500 hover:text-emerald-600 transition-colors no-underline"
                >
                  Email
                </a>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <p className="text-xs font-bold text-[#121212] uppercase tracking-widest mb-6">
                Documentation
              </p>
              <div className="flex flex-col gap-3.5">
                <a
                  href="https://github.com/iampraiez/vector"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-500 hover:text-emerald-600 transition-colors no-underline"
                >
                  GitHub Repo
                </a>
              </div>
            </div>

            {/* About Me */}
            <div>
              <p className="text-xs font-bold text-[#121212] uppercase tracking-widest mb-6">
                About Me
              </p>
              <div className="flex flex-col gap-3.5">
                <a
                  href="https://iampraiez.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-500 hover:text-emerald-600 transition-colors no-underline"
                >
                  Portfolio
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Vector. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLegalModalType("privacy")}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setLegalModalType("terms")}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal
        type={legalModalType}
        open={legalModalType !== null}
        onOpenChange={(open) => !open && setLegalModalType(null)}
      />
    </div>
  );
}
