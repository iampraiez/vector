import { useState, useEffect } from "react";
import Joyride, {
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
  TooltipRenderProps,
} from "react-joyride";
import { useNavigate, useLocation } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";

const steps: Step[] = [
  {
    target: "#tour-metrics-grid",
    title: "Welcome Overview",
    content: "Start here to monitor your daily core fleet metrics at a glance.",
    disableBeacon: true,
  },
  {
    target: "#tour-active-drivers",
    title: "Active Drivers",
    content: "Keep track of all drivers currently on a delivery route.",
    disableBeacon: true,
  },
  {
    target: "#tour-recent-orders",
    title: "Recent Orders",
    content: "Quickly view the latest deliveries and their current status.",
    disableBeacon: true,
    placement: "auto",
  },
  {
    target: "#tour-new-order-btn",
    title: "Add Your First Delivery",
    content:
      "Add individual stops or use the CSV bulk uploader to build a route.",
    disableBeacon: true,
  },
  {
    target: "#tour-assign-col",
    title: "Assign a Driver",
    content: "Quickly connect pending deliveries to the best available driver.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: "#tour-live-map",
    title: "Live Telemetry map",
    content:
      "Track your entire workforce in real-time as they complete routes.",
    disableBeacon: true,
  },
  {
    target: "#tour-fleet-directory",
    title: "Active Fleet Directory",
    content:
      "View detailed statistics and current locations for all active drivers in a convenient board or list view.",
    disableBeacon: true,
  },
  {
    target: "#tour-drivers-heading",
    title: "Driver Management",
    content:
      "Add new personnel and monitor their individual completion rates and scores.",
    disableBeacon: true,
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, completeOnboarding } = useAuthStore();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Only mount tour if the database flag says the user hasn't completed it
    // and we haven't already started the tour run
    if (user && user.is_onboarded === false && !run) {
      // If we land on a deep page, move to overview first so the first target exists
      if (location.pathname == "/dashboard") {
        navigate("/dashboard");
      }
      // Delay starting slightly more so views and metric stores can load
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate, run, user]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Tour finished or skipped
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);

      // Opt-out from backend immediately
      try {
        await api.post("/auth/complete-onboarding");
        completeOnboarding();
      } catch (err) {
        console.error("Failed to mark onboarding as complete", err);
      }
      return;
    }

    // Force custom scroll behavior
    if (type === EVENTS.STEP_BEFORE || type === EVENTS.TOOLTIP) {
      const targetStr = steps[index]?.target as string;
      if (targetStr) {
        // Use requestAnimationFrame for smoother timing with React's render cycle
        requestAnimationFrame(() => {
          const el = document.querySelector(targetStr);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
    }

    if (type === "step:after") {
      const nextIndex = action === "prev" ? index - 1 : index + 1;

      // Update route based on upcoming step
      let targetPath = "";
      if (nextIndex >= 3 && nextIndex <= 4) {
        targetPath = "/dashboard/orders";
      } else if (nextIndex >= 5 && nextIndex <= 6) {
        targetPath = "/dashboard/tracking";
      } else if (nextIndex === 7) {
        targetPath = "/dashboard/drivers";
      } else if ((nextIndex >= 0 && nextIndex <= 2) || nextIndex > 8) {
        targetPath = "/dashboard";
      }

      if (targetPath && !location.pathname.includes(targetPath)) {
        navigate(targetPath);
      }

      // We give the router/store slightly more time, 800ms for a snappier feel
      setTimeout(() => {
        // Ensure the component is still running before updating state
        setStepIndex(nextIndex);
      }, 800);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep={false}
      disableScrolling
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightPadding={4}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "rgba(255, 255, 255, 0.95)",
        },
        overlay: {
          backgroundColor: "rgba(15, 23, 42, 0.6)", // Sleek dark slate tint
        },
        spotlight: {
          borderRadius: 16, // Beautiful rounded edges
        },
      }}
    />
  );
}

const CustomTooltip = ({
  index,
  step,
  tooltipProps,
  primaryProps,
  skipProps,
  backProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="max-w-[320px] sm:max-w-100 w-[90vw] mx-auto bg-white/95 backdrop-blur-md border border-black/8 rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-[17px] md:text-lg font-bold text-gray-900 tracking-tight leading-tight">
          {step.title}
        </h3>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
          {index + 1} of {steps.length}
        </span>
      </div>

      {/* Body */}
      <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed mb-6 font-medium">
        {step.content}
      </p>

      {/* Footer / Actions */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-black/5 gap-3">
        {/* Skip button logic */}
        <button
          {...skipProps}
          className="text-[13px] text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider cursor-pointer"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {index > 0 && (
            <button
              {...backProps}
              className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-gray-500 bg-gray-50 border border-black/5 hover:bg-gray-100 transition-colors hidden sm:block cursor-pointer"
            >
              Back
            </button>
          )}

          <div className="flex flex-col items-end relative">
            <button
              {...primaryProps}
              className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-emerald-600 shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
            >
              {isLastStep ? "Got it" : "Next"}
            </button>

            {/* Final wrapper checkout */}
            {isLastStep && (
              <div className="flex items-center gap-1.5 mt-2 opacity-50 absolute -bottom-10 right-0 whitespace-nowrap">
                <input
                  type="checkbox"
                  id="never-show"
                  className="w-3 h-3 text-emerald-600 rounded border-gray-300 pointer-events-none"
                  checked
                  readOnly
                />
                <label
                  htmlFor="never-show"
                  className="text-[10px] text-gray-400 font-bold"
                >
                  Don't show again
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
