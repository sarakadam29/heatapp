import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Activity, Map, Clock, User } from "lucide-react";
import { motion } from "motion/react";
import { Toaster } from "sonner";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/predict", label: "Predict", icon: Activity },
  { path: "/map", label: "Map", icon: Map },
  { path: "/history", label: "History", icon: Clock },
  { path: "/profile", label: "Profile", icon: User },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="fw-app fw-desktop-bg min-h-screen w-full flex flex-col md:flex-row p-0"
      style={{ minHeight: "100dvh", background: "#111110" }}
    >
      <Toaster position="top-center" expand={false} richColors />
      
      {/* Desktop Sidebar Navigation */}
      <div 
        className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{
          background: "rgba(30, 28, 24, 0.4)",
          borderRight: "1px solid rgba(255,248,235,0.08)",
          padding: "32px 16px",
          height: "100dvh",
          position: "sticky",
          top: 0
        }}
      >
        <div className="mb-10 px-4">
          <h1 
            className="fw-display"
            style={{
              fontSize: "24px",
              background: "linear-gradient(135deg, #E8B94F, #F5EDD8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HeatGuard
          </h1>
        </div>
        
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 group w-full text-left"
                style={{
                  background: isActive ? "rgba(232, 185, 79, 0.12)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "16px",
                  borderRadius: "16px",
                  transition: "background 200ms ease",
                }}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center p-2 rounded-xl"
                  style={{
                    background: isActive ? "#E8B94F" : "transparent",
                  }}
                >
                  <Icon
                    size={22}
                    color={isActive ? "#111110" : "#9A9080"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.02em",
                    color: isActive ? "#E8B94F" : "#5C5548",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  className="group-hover:text-[#F5EDD8] transition-colors"
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative flex flex-col flex-1 min-w-0"
        style={{
          minHeight: "100dvh",
          height: "100%",
          overflowX: "hidden"
        }}
      >
        {/* Page Content */}
        <div
          className="flex-1 overflow-y-auto fw-scroll w-full mx-auto"
        >
          <div className="mx-auto w-full max-w-7xl pb-[100px] md:pb-8">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "600px",
            zIndex: 100,
          }}
        >
          <div
            className="flex items-center justify-around"
            style={{
              background: "rgba(30, 28, 24, 0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              padding: "10px 16px",
              border: "1px solid rgba(255,248,235,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 relative group"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 12px",
                  }}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      background: isActive ? "#E8B94F" : "transparent",
                      transition: "background 200ms ease",
                    }}
                  >
                    <Icon
                      size={20}
                      color={isActive ? "#111110" : "#9A9080"}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="group-hover:text-[#F5EDD8] transition-colors"
                    />
                  </motion.div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: isActive ? "#E8B94F" : "#5C5548",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}