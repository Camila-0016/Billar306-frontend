import { Outlet } from "react-router-dom";
import TabBar from "../components/TabBar";
import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}