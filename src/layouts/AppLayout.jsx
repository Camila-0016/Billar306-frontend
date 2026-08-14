import { Outlet } from "react-router-dom";
import TabBar from "../components/TabBar";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div className="w-full h-screen overflow-hidden bg-marfil flex justify-center">
      <div className="w-full max-w-[480px] lg:max-w-none lg:w-full h-screen overflow-hidden bg-marfil flex relative shadow-md lg:shadow-none mx-auto">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
        <TabBar />
      </div>
    </div>
  );
}