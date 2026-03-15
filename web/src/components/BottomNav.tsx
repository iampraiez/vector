import { useNavigate, useLocation } from "react-router";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  ClockIcon as ClockSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: "/home", icon: HomeIcon, iconSolid: HomeIconSolid, label: "Today" },
    {
      path: "/assignments",
      icon: ClipboardDocumentListIcon,
      iconSolid: ClipboardSolid,
      label: "Deliveries",
    },
    {
      path: "/history",
      icon: ClockIcon,
      iconSolid: ClockSolid,
      label: "History",
    },
    {
      path: "/profile",
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
      label: "Profile",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "64px",
          padding: "0 8px",
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = active ? tab.iconSolid : tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "8px 4px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "12px",
                transition: "all 200ms cubic-bezier(0.2,0,0,1)",
                position: "relative",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.93)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = "scale(0.93)";
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {/* Active pill behind icon */}
              {active && (
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "36px",
                    height: "30px",
                    borderRadius: "10px",
                    background: "#ECFDF5",
                  }}
                />
              )}
              <Icon
                style={{
                  width: "22px",
                  height: "22px",
                  color: active ? "#059669" : "#BDBDBD",
                  position: "relative",
                  zIndex: 1,
                  transition: "color 200ms",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: active ? "700" : "500",
                  color: active ? "#059669" : "#BDBDBD",
                  letterSpacing: active ? "0.01em" : "0",
                  transition: "all 200ms",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
