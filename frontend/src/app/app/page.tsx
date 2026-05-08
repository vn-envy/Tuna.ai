"use client";
import { useState } from "react";
import CompanionChat from "@/components/chat/CompanionChat";
import MapView from "@/components/map/MapView";
import PartnershipDashboard from "@/components/partnerships/PartnershipDashboard";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-white overflow-hidden font-sans">
      
      {/* Left Panel - Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0">
        
        {/* Navigation Header */}
        <header className="h-16 border-b border-white/10 flex items-center px-6 bg-[#0f172a] shadow-md z-10 shrink-0">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4aa] to-[#0ea5e9] mr-8">
            Tuna Workspace
          </h1>
          <nav className="flex space-x-6">
            <button 
              onClick={() => setActiveTab("map")}
              className={`pb-4 pt-4 border-b-2 font-medium transition-colors ${activeTab === 'map' ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              🗺️ Map View
            </button>
            <button 
              onClick={() => setActiveTab("itinerary")}
              className={`pb-4 pt-4 border-b-2 font-medium transition-colors ${activeTab === 'itinerary' ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              📋 Itinerary
            </button>
            <button 
              onClick={() => setActiveTab("budget")}
              className={`pb-4 pt-4 border-b-2 font-medium transition-colors ${activeTab === 'budget' ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              💰 Budget
            </button>
            <button 
              onClick={() => setActiveTab("partnerships")}
              className={`pb-4 pt-4 border-b-2 font-medium transition-colors ${activeTab === 'partnerships' ? 'border-[#00d4aa] text-[#00d4aa]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              🤝 Partnerships
            </button>
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
      <aside className="w-[400px] h-full shrink-0 flex flex-col bg-white/[0.02]">
        <CompanionChat />
      </aside>
    </div>
  );
}
