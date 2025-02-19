import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();

  {/* Find where to go when hitting back button*/}
  const getBackPath = () => {
    switch (location.pathname) {
      case "/onboarding/dietary":
        return "/onboarding";
      case "/onboarding/allergies":
        return "/onboarding/dietary";
      case "/onboarding/goals":
        return "/onboarding/allergies";
      case "/onboarding/friends":
        return "/onboarding/goals";
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Container for logo & title */}
      <div className="flex items-center gap-3">
        {/* Container for logo*/}
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
        </div>
        {/* Container for title*/}
        <div className="flex items-center">
          <h1 className="text-2xl bevan-regular text-[#D75600] leading-none">Cuisine Compass</h1>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(getBackPath())}
        className="absolute top-26 left-8 mt-16">
        <img 
          src="/back_arrow.png" 
          alt="Back" 
          className="w-10 h-10 hover:opacity-60 transition"
        />
      </button>


      {/* Main content centered */}
      <div className="flex justify-center items-center flex-1">
        <Outlet />
      </div>
    </div>
  );
}