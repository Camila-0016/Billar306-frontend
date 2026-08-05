import { Outlet } from "react-router-dom";
import TabBar from "../components/TabBar";

export default function AppLayout() {
  return (
    <div className="w-full max-w-[480px] lg:max-w-3xl h-screen overflow-hidden bg-marfil flex flex-col relative shadow-md mx-auto">
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}