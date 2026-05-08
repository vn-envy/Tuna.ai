"use client";
import { useState } from "react";
import CompanionChat from "@/components/chat/CompanionChat";
import MapView from "@/components/map/MapView";
import PartnershipDashboard from "@/components/partnerships/PartnershipDashboard";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState("map");
  const navItems = [
    { id: "map", label: "Map View", icon: "🗺️" },
    { id: "itinerary", label: "Itinerary", icon: "📋" },
    { id: "budget", label: "Budget", icon: "💰" },
    { id: "partnerships", label: "Partnerships", icon: "🤝" },
  ];

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-white overflow-hidden font-sans">
      
      {/* Left Panel - Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0">
        
        {/* Navigation Header */}
        <header className="h-16 border-b border-white/10 flex items-center px-6 bg-[#0f172a] shadow-md z-10 shrink-0">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4aa] to-[#0ea5e9] mr-8">
            Tuna Workspace
          </h1>
          <nav className="flex space-x-2 md:space-x-6" aria-label="Workspace sections">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={activeTab === item.id ? "page" : undefined}
                className={`pb-4 pt-4 border-b-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4aa] ${activeTab === item.id ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-slate-300 hover:text-white'}`}
              >
                <span aria-hidden="true">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Content Area */}
        <section aria-label="Workspace content" className="flex-1 overflow-auto bg-[#0a0f1a] relative">
          {activeTab === "map" && <MapView />}
          {activeTab === "partnerships" && <PartnershipDashboard />}
          {activeTab === "itinerary" && (
            <div className="p-8 flex items-center justify-center h-full text-slate-500">
              <p>Itinerary Board Mockup (Coming Soon)</p>
            </div>
          )}
          {activeTab === "budget" && (
            <div className="p-8 flex items-center justify-center h-full text-slate-500">
              <p>Budget Tracker Mockup (Coming Soon)</p>
            </div>
          )}
        </section>
      </main>

      {/* Right Panel - Companion Chat (30%, fixed width on larger screens) */}
      <aside className="w-[400px] h-full shrink-0 flex flex-col bg-white/[0.02]" aria-label="Tuna companion chat">
        <CompanionChat />
      </aside>
    </div>
  );
}
