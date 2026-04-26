"use client";
import { useState } from "react";
import { generateAgent } from "./AgentEngine";

export default function SimulationRunner() {
  const [scenario, setScenario]       = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("cafe");
  const [agents, setAgents]           = useState([]);
  const [results, setResults]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [simulationId, setSimulationId] = useState(null);

  // Δημιουργία 20 agents
  function generateAgents() {
    const newAgents = Array.from({ length: 20 }, (_, i) => ({
      ...generateAgent(),
      id: `agent_${i}`,
    }));
    setAgents(newAgents);
    setResults(null);
    setSaved(false);
  }

  // Εκτέλεση simulation
  async function runSimulation() {
    if (!scenario.trim() || agents.length === 0) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agents, scenario }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Σφάλμα: " + err.message);
    }

    setLoading(false);
  }

  // Αποθήκευση στο Supabase
  async function saveSimulation() {
    if (!results) return;

    const res = await fetch("/api/save-simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario,
        businessType,
        businessName,
        summary: results.summary,
      }),
    });
    const data = await res.json();
    setSimulationId(data.simulationId);
    setSaved(true);
  }

  const sentimentColor = { positive: "#4ade80", negative: "#f87171", neutral: "#94a3b8" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* Φόρμα εισόδου */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΟΝΟΜΑ ΕΠΙΧΕΙΡΗΣΗΣ</label>
            <input
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="π.χ. Καφέ Αριστοτέλους"
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΤΥΠΟΣ ΕΠΙΧΕΙΡΗΣΗΣ</label>
            <select
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13 }}
            >
              <option value="cafe">Καφέ</option>
              <option value="restaurant">Εστιατόριο</option>
              <option value="gym">Γυμναστήριο</option>
              <option value="retail">Κατάστημα</option>
              <option value="other">Άλλο</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΣΕΝΑΡΙΟ ΑΠΟΦΑΣΗΣ</label>
          <textarea
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            placeholder="π.χ. Αυξάνουμε την τιμή του καφέ από 2.00€ σε 2.20€"
            style={{ width: "100%", minHeight: 80, background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={generateAgents}
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "0.6rem 1.2rem", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
          >
            🎲 Δημιουργία 20 Agents
          </button>
          <button
            onClick={runSimulation}
            disabled={loading || agents.length === 0 || !scenario.trim()}
            style={{ background: "#2563eb", border: "none", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: 6, cursor: "pointer", fontSize: 12, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Εκτέλεση..." : "▶ Εκτέλεση Simulation"}
          </button>
          {results && !saved && (
            <button
              onClick={saveSimulation}
              style={{ background: "#065f46", border: "none", color: "#6ee7b7", padding: "0.6rem 1.2rem", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
            >
              💾 Αποθήκευση
            </button>
          )}
          {saved && (
            <span style={{ color: "#6ee7b7", fontSize: 12, display: "flex", alignItems: "center" }}>
              ✓ Αποθηκεύτηκε — ID: {simulationId?.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* Agents που δημιουργήθηκαν */}
      {agents.length > 0 && !results && (
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>20 AGENTS ΕΤΟΙΜΟΙ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {agents.map(a => (
              <div key={a.id} style={{ background: "#1e293b", borderRadius: 6, padding: "0.4rem 0.8rem", fontSize: 11, color: "#94a3b8" }}>
                {a.archetype} · {a.age}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Αποτελέσματα */}
      {results && (
        <>
          {/* Συγκεντρωτικά */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "ΘΕΤΙΚΟΙ",      value: `${Math.round(results.summary.positive_pct * 100)}%`,      color: "#4ade80" },
              { label: "ΑΡΝΗΤΙΚΟΙ",    value: `${Math.round(results.summary.negative_pct * 100)}%`,      color: "#f87171" },
              { label: "ΕΚΤΙΜ. CHURN", value: `${Math.round(results.summary.predicted_churn_pct * 100)}%`, color: "#facc15" },
              { label: "ΜΕΣΟ P2A",     value: `${results.summary.mean_p2a?.toFixed(1)}/10`,              color: "#818cf8" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.2rem" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Κάρτες agents */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {results.agentResults.map((r, i) => (
              <div key={i} style={{ background: "#111", border: `1px solid ${sentimentColor[r.sentiment] ?? "#333"}`, borderRadius: 10, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{r.archetype}</span>
                  <span style={{ fontSize: 11, color: "#475569" }}>{r.age} χρ. · {r.neighborhood}</span>
                </div>
                {r.error ? (
                  <div style={{ color: "#f87171", fontSize: 12 }}>Σφάλμα agent</div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "#cbd5e1", fontStyle: "italic", marginBottom: 8 }}>"{r.response}"</p>
                    <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                      <span style={{ color: sentimentColor[r.sentiment] }}>{r.sentiment}</span>
                      <span style={{ color: "#64748b" }}>λόγος: {r.reason}</span>
                      <span style={{ color: "#facc15" }}>P2A: {r.probability_to_act}/10</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}