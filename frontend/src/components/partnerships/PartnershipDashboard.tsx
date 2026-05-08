"use client";

export default function PartnershipDashboard() {
  return (
    <div className="w-full h-full bg-[#0a0f1a] overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <span>🤝</span> Partnership Broker
          </h2>
          <p className="text-slate-400">Manage brand deals, comped stays, and creator collaborations for your Bali trip.</p>
        </div>

        {/* Brand Deals Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Brand Deal Prospects</h3>
            <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              + Generate New Pitch
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Active Pitch Card */}
            <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00d4aa]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00d4aa]"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">The St. Regis Bali Resort</h4>
                  <p className="text-sm text-[#00d4aa]">Target: PR Director • Status: Draft Ready</p>
                </div>
                <div className="bg-[#00d4aa]/20 text-[#00d4aa] px-3 py-1 rounded-full text-xs font-bold">
                  High Match
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-4 text-sm text-slate-300">
                <span className="text-white font-medium mb-2 block">Tuna&rsquo;s Intelligence:</span>
                &ldquo;They just launched a new Ayurvedic spa last week. I&rsquo;ve drafted a pitch offering 2 dedicated Reels focusing on wellness, in exchange for a 2-night comped stay. I linked your media kit filtered for your past luxury content.&rdquo;
              </div>

              <div className="flex gap-3">
                <button className="bg-[#00d4aa] text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#00e6b8] transition-colors">
                  Review & Send Email
                </button>
                <button className="bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                  View Custom Media Kit URL
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Collab Radar Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              📡 Collab Radar
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-2"></span>
            </h3>
            <span className="text-xs text-slate-500">Scanning dates: Oct 10 - Oct 24</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator Match 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                  📸
                </div>
                <div>
                  <h4 className="text-md font-bold text-white">Sarah Explores</h4>
                  <p className="text-xs text-slate-400">120k Subs • Food/Culture</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                Sarah just posted she&rsquo;ll be in Ubud at the exact same time as you.
              </p>
              <div className="bg-black/40 rounded p-3 mb-4">
                <p className="text-xs text-[#0ea5e9] font-medium mb-1">Tuna&rsquo;s Collab Idea:</p>
                <p className="text-xs text-slate-300">&ldquo;$10 vs $1000 Balinese Feast&rdquo; — Leverages her food audience and your luxury angle.</p>
              </div>
              <button className="w-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-indigo-500/30">
                Generate DM Draft
              </button>
            </div>

            {/* Creator Match 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-xl shadow-lg">
                  🏄‍♂️
                </div>
                <div>
                  <h4 className="text-md font-bold text-white">Bali Surf Life</h4>
                  <p className="text-xs text-slate-400">Local Creator • 45k IG</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                Local drone pilot and surfer. Great for getting high-quality B-roll you can&rsquo;t shoot yourself.
              </p>
              <div className="bg-black/40 rounded p-3 mb-4">
                <p className="text-xs text-[#0ea5e9] font-medium mb-1">Tuna&rsquo;s Collab Idea:</p>
                <p className="text-xs text-slate-300">Offer to tag him as a co-collaborator on IG for access to his hidden surf break spots.</p>
              </div>
              <button className="w-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-rose-500/30">
                Generate DM Draft
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
