import { useState } from "react";
import { useNavigate } from "react-router";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  ArrowLeftIcon,
  UserIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolid } from "@heroicons/react/24/solid";

const plans = [
  {
    id: "starter",
    name: "Starter Tier",
    price: "$29",
    period: "/mo",
    drivers: "Up to 5 active drivers",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth Tier",
    price: "$89",
    period: "/mo",
    drivers: "Up to 20 active drivers",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Tier",
    price: "Custom",
    period: "",
    drivers: "Unlimited active drivers",
    highlight: false,
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
    plan: "growth",
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
      <nav className="px-6 py-5 md:px-12 md:py-6 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/10 group-hover:scale-110 transition-transform">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/signin")}
          className="text-[14px] font-bold text-gray-400 hover:text-gray-900 transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-12 px-6 md:px-12">
        <div className="w-full max-w-120">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12 px-4 relative">
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
          <div className="bg-white border border-black/8 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- STEP 1: ACCOUNT --- */}
            {step === "account" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Create Workspace
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                    Let's start with your account administrator details.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full h-14 pl-12 pr-4 bg-white border border-black/10 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="Alex Rivera"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Work Email
                    </label>
                    <div className="relative group">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full h-14 pl-12 pr-12 bg-white border rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none transition-all ${
                          emailValid
                            ? "border-emerald-600 ring-4 ring-emerald-600/5"
                            : "border-black/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5"
                        }`}
                        placeholder="you@company.com"
                      />
                      {emailValid && (
                        <CheckCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 animate-in zoom-in" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <div className="relative group">
                      <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full h-14 pl-12 pr-14 bg-white border border-black/10 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!step1Valid}
                    className={`w-full h-14 mt-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      step1Valid
                        ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    Continue to Workspace
                    <ArrowRightIcon className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: COMPANY --- */}
            {step === "company" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setStep("account")}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-300 hover:text-gray-900 mb-8 transition-colors group"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  BACK TO ACCOUNT
                </button>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Fleet Details
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                    Tell us about the operations you'll be managing.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Fleet Workspace Name
                    </label>
                    <div className="relative group">
                      <BuildingOffice2Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full h-14 pl-12 pr-4 bg-white border border-black/10 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                        placeholder="e.g. Acme Logistics"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Active Fleet Size
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["1–3", "4–10", "11–25", "26–50", "50+"].map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            setFormData({ ...formData, companySize: size })
                          }
                          className={`h-12 rounded-xl text-[13px] font-bold border transition-all cursor-pointer ${
                            formData.companySize === size
                              ? "bg-emerald-50 border-emerald-600 text-emerald-600 shadow-sm"
                              : "bg-white border-black/10 text-gray-500 hover:border-emerald-600/30"
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
                    className={`w-full h-14 mt-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      step2Valid
                        ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    Select Operating Plan
                    <ArrowRightIcon className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: PLAN --- */}
            {step === "plan" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <button
                  onClick={() => setStep("company")}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-300 hover:text-gray-900 mb-8 transition-colors group"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  BACK TO FLEET
                </button>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Activation
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                    Choose your workspace tier. All include a 14-day trial.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFormData({ ...formData, plan: p.id })}
                      className={`w-full p-5 rounded-2xl border-2 text-left relative transition-all group cursor-pointer ${
                        formData.plan === p.id
                          ? "bg-emerald-50 border-emerald-600 ring-4 ring-emerald-600/5 shadow-xl shadow-emerald-600/10"
                          : "bg-white border-black/5 hover:border-emerald-600/30"
                      }`}
                    >
                      {p.highlight && (
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          Recommended
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
                  className="w-full h-16 bg-gray-900 text-white rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-black/20 hover:bg-black hover:-translate-y-1 active:translate-y-0"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Launch Workspace →</>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 font-medium text-center mt-6 leading-relaxed">
                  By launching, you agree to VECTOR's{" "}
                  <a href="#" className="underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline">
                    Privacy Ops Policy
                  </a>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Bottom Branding */}
          <div className="mt-12 text-center">
            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[4px]">
              VECTOR v2.5.0 Production
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
