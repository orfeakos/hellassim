"use client";
import { useState } from "react";
import SimulationRunner from "@/components/SimulationRunner";
import HistoryPanel from "@/components/HistoryPanel";

export default function Home() {
  const [activeTab, setActiveTab] = useState("simulate");

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "monospace" }}>
      
      {/* Header */}
      <div style={{ borderBottom: "1px solid #222", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 18 }}>HellasSim</span>
          <span style={{ color: "#475569", fontSize: 12, marginLeft: 12 }}>v1.1 · Θεσσαλονίκη</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["simulate", "history"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#1e40af" : "transparent",
                border: "1px solid #333",
                color: activeTab === tab ? "#fff" : "#64748b",
                padding: "0.4rem 1rem",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {tab === "simulate" ? "Simulation" : "Ιστορικό"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "2rem" }}>
        {activeTab === "simulate" && <SimulationRunner />}
        {activeTab === "history" && <HistoryPanel />}
      </div>

    </main>
  );
}