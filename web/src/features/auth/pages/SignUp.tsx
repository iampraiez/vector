import { useState } from "react";
import { useNavigate } from "react-router";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  UserIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    drivers: "Up to 2 active drivers",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/mo",
    drivers: "Up to 5 active drivers",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$89",
    period: "/mo",
    drivers: "Up to 20 active drivers",
    highlight: true,
  },
];

type Step = "account" | "company" | "plan";

export function DashboardSignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("account");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    companySize: "",
    plan: "starter",
  });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const step1Valid =
    formData.fullName.trim().length >= 2 &&
    emailValid &&
    formData.password.length >= 8;
  const step2Valid =
    formData.companyName.trim().length >= 2 && formData.companySize !== "";

  const handleNext = () => {
    if (step === "account" && step1Valid) setStep("company");
    else if (step === "company" && step2Valid) setStep("plan");
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1800);
  };

  const steps: { id: Step; label: string; num: number }[] = [
    { id: "account", label: "Identity", num: 1 },
    { id: "company", label: "Company", num: 2 },
    { id: "plan", label: "Activation", num: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Nav */}
      <nav className="px-6 py-4 md:px-12 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800 group-hover:opacity-90 transition-opacity">
            <TruckIcon className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
          </div>
          <span className="text-[16px] font-extrabold tracking-[0.04em] text-gray-900">
            VECTOR
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/signin")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          Already have an account?
          <span className="font-bold text-emerald-600">Sign in</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-6 md:px-12">
        <div className="w-full max-w-md">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-10 px-4 relative">
            <div className="absolute top-[15.5px] left-0 right-0 h-0.5 bg-gray-100 -z-10 mx-10" />
            {steps.map((s, i) => {
              const isDone = currentStepIndex > i;
              const isCurrent = currentStepIndex === i;
              return (
                <div
                  key={s.id}
                  className="flex flex-col items-center gap-3 bg-gray-50 px-2 rounded-full relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 ring-4 ring-emerald-50"
                          : "bg-white border-2 border-gray-100 text-gray-300"
                    }`}
                  >
                    {isDone ? <CheckSolid className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isCurrent || isDone ? "text-emerald-600" : "text-gray-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div className="bg-white border border-black/8 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- STEP 1: ACCOUNT --- */}
            {step === "account" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium">
                    Start with your administrator details
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full h-12 pl-11 pr-4 bg-white border border-black/10 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="Alex Rivera"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Work Email
                    </label>
                    <div className="relative group">
                      <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full h-12 pl-11 pr-11 bg-white border rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none transition-all ${
                          emailValid
                            ? "border-emerald-500 ring-4 ring-emerald-600/5"
                            : "border-black/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5"
                        }`}
                        placeholder="you@company.com"
                      />
                      {emailValid && (
                        <CheckCircleIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-600 animate-in zoom-in" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative group">
                      <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full h-12 pl-11 pr-12 bg-white border border-black/10 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-4.5 h-4.5" />
                        ) : (
                          <EyeIcon className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!step1Valid}
                    className={`w-full h-12 mt-1 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      step1Valid
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Continue
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: COMPANY --- */}
            {step === "company" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setStep("account")}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-300 hover:text-gray-700 mb-7 transition-colors group cursor-pointer"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  BACK
                </button>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                    Fleet details
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium">
                    Tell us about the operations you'll be managing
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Fleet name
                    </label>
                    <div className="relative group">
                      <BuildingOffice2Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full h-12 pl-11 pr-4 bg-white border border-black/10 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="e.g. Acme Logistics"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Active fleet size
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {["1–3", "4–10", "11–25", "26–50", "50+"].map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setFormData({ ...formData, companySize: size })
                          }
                          className={`h-11 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                            formData.companySize === size
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                              : "bg-white border-black/10 text-gray-500 hover:border-emerald-400/40"
                          }`}
                        >
                          {size} drivers
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!step2Valid}
                    className={`w-full h-12 mt-1 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      step2Valid
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Choose Plan
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: PLAN --- */}
            {step === "plan" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setStep("company")}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-300 hover:text-gray-700 mb-7 transition-colors group cursor-pointer"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  BACK
                </button>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                    Choose your plan
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium">
                    All plans include a 14-day free trial
                  </p>
                </div>

                <div className="space-y-3 mb-7">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFormData({ ...formData, plan: p.id })}
                      className={`w-full p-4 rounded-xl border-2 text-left relative transition-all cursor-pointer ${
                        formData.plan === p.id
                          ? "bg-emerald-50 border-emerald-500 shadow-sm"
                          : "bg-white border-black/8 hover:border-emerald-400/40"
                      }`}
                    >
                      {p.highlight && (
                        <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                          Popular
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p
                            className={`text-[14px] font-bold ${formData.plan === p.id ? "text-emerald-900" : "text-gray-900"}`}
                          >
                            {p.name}
                          </p>
                          <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                            {p.drivers}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-black tracking-tight ${formData.plan === p.id ? "text-emerald-600" : "text-gray-900"}`}
                          >
                            {p.price}
                            <span className="text-[11px] font-bold text-gray-400">
                              {p.period}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Launch Workspace
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-300 font-medium text-center mt-5 leading-relaxed">
                  By launching, you agree to VECTOR's{" "}
                  <a href="#" className="underline text-gray-400">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline text-gray-400">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
