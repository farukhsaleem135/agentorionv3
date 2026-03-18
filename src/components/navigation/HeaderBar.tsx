import { useLocation } from "react-router-dom";
import { ROUTE_TITLES } from "./NavData";
import ProfileAvatarDropdown from "./ProfileAvatarDropdown";

const HeaderBar = () => {
  const { pathname } = useLocation();

  // Match longest prefix first for nested routes like /leads/123
  const title = ROUTE_TITLES[pathname] ??
    Object.entries(ROUTE_TITLES)
      .filter(([p]) => p !== "/" && pathname.startsWith(p))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "AgentOrion";

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{
        height: "56px",
        backgroundColor: "#0A0E1A",
        borderBottom: "1px solid rgba(45,107,228,0.2)",
      }}
    >
      <h1 className="text-white font-bold text-base truncate">{title}</h1>
      <ProfileAvatarDropdown />
    </header>
  );
};

export default HeaderBar;
