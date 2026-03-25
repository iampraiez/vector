import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

const APP_SCHEME = "vectordriver://";

export function DownloadApp() {
  const navigate = useNavigate();

  // Deep link: attempt to launch the installed app before falling through to APK
  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (!isAndroid) return;

    // Try to open the native app via custom scheme
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = APP_SCHEME;
    document.body.appendChild(iframe);

    // If the app opened, the page blurs; if not, fallthrough to APK after 2s
    const timer = setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timer);
        document.body.removeChild(iframe);
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans">
      {/* Top nav */}
      <nav className="shrink-0 px-6 py-4 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <LocalShippingIcon size={17} className="text-white" />
          </div>
          <span className="text-[16px] font-black tracking-[-0.5px] text-gray-900">
            VECTOR
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </nav>

      {/* Body — two column on md+ */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Left: branding panel */}
        <div className="hidden md:flex md:w-[42%] flex-col justify-between relative overflow-hidden p-10 xl:p-14">
          {/* Background photo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/landing_page.jpeg')" }}
          />
          {/* Gradient overlay: dark emerald so text is readable */}
          <div className="absolute inset-0 bg-linear-to-b from-emerald-900/85 via-emerald-900/75 to-emerald-950/90" />
          {/* Content above the overlay */}
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
              <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest mb-3">
              Driver App
            </p>
            <h1 className="text-[clamp(26px,3.5vw,36px)] font-extrabold text-white leading-tight tracking-tight">
              Deliver smarter.
              <br />
              Stay on track.
            </h1>
            <p className="mt-4 text-[15px] text-white/70 leading-relaxed max-w-xs">
              Turn-by-turn navigation, proof-of-delivery capture, and instant
              dispatch updates — built for the road.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              "Offline-ready navigation",
              "Photo & signature capture",
              "Real-time dispatch updates",
              "Company code onboarding",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[13px] text-white/80">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: download action */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm">
            {/* Mobile-only header */}
            <div className="md:hidden mb-8 text-center">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 items-center justify-center mb-4">
                <DevicePhoneMobileIcon className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Vector Driver App
              </h1>
              <p className="mt-1.5 text-[13px] text-gray-400">
                Available as a direct Android download
              </p>
            </div>

            {/* Download card */}
            <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm mb-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <LocalShippingIcon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">
                    Vector Driver
                  </p>
                  <p className="text-[12px] text-gray-400">
                    Android · Latest build
                  </p>
                </div>
              </div>

              <a
                href="https://www.dropbox.com/scl/fi/icn8jkm6cuqtu6lcc97eu/app-release.apk?rlkey=uwn32qlj1hnogfx8l7x0rvr5o&st=h9u7luaz&dl=1"
                download="vector-driver.apk"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl text-[14px] font-bold hover:bg-emerald-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-4.5 h-4.5" />
                Download APK
              </a>
            </div>

            {/* Install steps */}
            <div className="bg-white border border-black/5 rounded-xl p-5 mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                How to install
              </p>
              <ol className="space-y-3">
                {[
                  "Download the APK above",
                  'Open the file — allow "Unknown sources" if prompted',
                  "Install and launch Vector Driver",
                  "Enter your fleet manager's company code",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-gray-500 leading-snug">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Fleet manager link */}
            <p className="text-center text-[12px] text-gray-400">
              Fleet manager?{" "}
              <button
                type="button"
                onClick={() => navigate("/dashboard/signup")}
                className="font-bold text-emerald-600 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                Create a fleet <ArrowRightIcon className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
