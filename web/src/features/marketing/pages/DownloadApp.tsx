import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { Download, Smartphone } from "lucide-react";

const APP_SCHEME = "vectordriver://";

// Android SVG Icon
const AndroidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.415.415 0 00-.1511-.5677.4162.4162 0 00-.568.1511l-2.022 3.502C15.602 8.3516 13.882 8 12 8s-3.602.3516-5.1378.9484L4.84 5.4465a.415.415 0 00-.568-.1511.415.415 0 00-.1511.5677l1.9969 3.4592C2.6565 11.237 0 15.19 0 19.8696h24c0-4.6796-2.656-8.6326-6.1185-10.5483" />
  </svg>
);

export function DownloadApp() {
  const navigate = useNavigate();

  // Deep link: attempt to launch the installed app before falling through to APK
  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (!isAndroid) return;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = APP_SCHEME;
    document.body.appendChild(iframe);

    // If the app opened, the page blurs; if not, fallthrough to APK after 2s
    const timer = setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 2000);

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timer);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange, {
      once: true,
    });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    };
  }, []);

  const apkUrl = import.meta.env.VITE_APK_URL!;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-200">
      <Helmet>
        <title>Download Driver App | Vector</title>
        <meta
          name="description"
          content="Download the Vector driver app to receive optimized routes, capture proof of delivery, and manage your stops with ease."
        />
        <link rel="canonical" href="https://vector-fleet.vercel.app/download" />
        <meta
          property="og:image"
          content="https://vector-fleet.vercel.app/icon.png"
        />
        <meta
          property="twitter:image"
          content="https://vector-fleet.vercel.app/icon.png"
        />
      </Helmet>
      {/* Top nav */}
      <nav className="shrink-0 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between sticky top-0 z-50">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
            <LocalShippingIcon size={17} className="text-white" />
          </div>
          <span className="text-[17px] font-black tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[14px] font-bold text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </nav>

      {/* Body — 2-column layout on Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-400 mx-auto">
        {/* Left: Branding & Hero Panel */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between relative overflow-hidden bg-gray-900 m-4 xl:m-6 rounded-3xl shadow-2xl isolate">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: "url('/landing_page.jpeg')" }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-emerald-900/90 via-gray-900/80 to-black/90" />

          <div className="relative z-10 p-12 xl:p-16 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-10 border border-white/10 shadow-lg">
                <Smartphone className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-[13px] font-extrabold text-emerald-400 uppercase tracking-[0.2em] mb-4">
                Vector Fleet Network
              </p>
              <h1 className="text-[clamp(32px,4vw,56px)] font-black text-white leading-[1.05] tracking-tight mb-6">
                Deliver smarter.
                <br />
                Stay on track.
              </h1>
              <p className="text-[17px] text-gray-300 leading-relaxed max-w-md font-medium">
                Turn-by-turn navigation, proof-of-delivery capture, and instant
                dispatch updates — engineered for the modern road.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Offline-ready navigation module",
                "Advanced photo & signature capture",
                "Real-time low-latency synchronization",
                "Secure enterprise onboarding",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[15px] font-medium text-gray-200">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Download Actions */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-115">
            {/* Mobile-only header */}
            <div className="lg:hidden mb-10 text-center">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-emerald-50 items-center justify-center mb-6 shadow-sm">
                <Smartphone className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Vector Driver
              </h1>
              <p className="mt-3 text-[15px] text-gray-500 font-medium">
                Download the official app for Android.
              </p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                Download the App
              </h2>
              <p className="text-[16px] text-gray-500 font-medium">
                Get started by installing the Vector Driver APK.
              </p>
            </div>

            {/* Download Options */}
            <div className="space-y-4 mb-10">
              {/* Android Card */}
              <div className="bg-white rounded-2xl p-2 border border-black/5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <AndroidIcon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900 mb-0.5">
                        Android
                      </h3>
                      <p className="text-[13px] text-gray-500 font-medium">
                        Direct APK Download
                      </p>
                    </div>
                  </div>
                  <a
                    href={apkUrl}
                    download="vector_driver.apk"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[14px] font-bold hover:bg-black transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>

                {/* Expandable Install steps */}
                <div className="px-4 pb-4 pt-4 border-t border-gray-100 mt-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Quick Install
                  </p>
                  <ol className="space-y-2">
                    {[
                      "Download the APK and open the file",
                      'Allow "Unknown sources" if prompted in settings',
                      "Install, open, and enter your company code",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-[13px] text-gray-600 font-medium leading-snug">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Fleet manager link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-[13px] text-gray-500 font-medium">
                Are you a Fleet Manager?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/signup")}
                  className="font-bold text-gray-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Create your workspace{" "}
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
