import { Outlet } from "react-router-dom";

export default function Onboarding() {
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

      {/* Main content centered */}
      <div className="flex justify-center items-center flex-1">
        <Outlet />
      </div>
    </div>
  );
}