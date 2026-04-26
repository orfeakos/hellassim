"use client";
import { useState } from "react";
import { generateAgent } from "./AgentEngine";

// Όλες οι διαθέσιμες κατηγορίες
const ALL_ATTRIBUTES = [
  { key: "age", label: "Ηλικία" },
  { key: "sex", label: "Φύλο" },
  { key: "archetype", label: "Αρχέτυπο" },
  { key: "education", label: "Εκπαίδευση" },
  { key: "employment", label: "Εργασία" },
  { key: "income", label: "Εισόδημα" },
  { key: "marital", label: "Οικογενειακή κατάσταση" },
  { key: "household", label: "Σύνθεση νοικοκυριού" },
  { key: "children_count", label: "Αριθμός παιδιών" },
  { key: "neighborhood", label: "Γειτονιά" },
  { key: "municipality", label: "Δήμος" },
  { key: "smoking", label: "Κάπνισμα" },
  { key: "health", label: "Υγεία" },
  { key: "bmi_bracket", label: "ΔΜΣ" },
  { key: "exercise", label: "Άσκηση" },
  { key: "gym", label: "Γυμναστήριο" },
  { key: "internet", label: "Χρήση internet" },
  { key: "social_media", label: "Social media" },
  { key: "delivery", label: "Delivery" },
  { key: "online_shopping", label: "Online αγορές" },
  { key: "supermarket_frequency", label: "Συχνότητα supermarket" },
  { key: "car", label: "Αυτοκίνητο" },
  { key: "tenure", label: "Ιδιοκτησία σπιτιού" },
  { key: "savings_behavior", label: "Αποταμίευση" },
  { key: "stress_level", label: "Επίπεδο άγχους" },
  { key: "sleep_quality", label: "Ποιότητα ύπνου" },
  { key: "work_hours", label: "Ώρες εργασίας" },
  { key: "politics", label: "Πολιτικές πεποιθήσεις" },
  { key: "religiosity", label: "Θρησκευτικότητα" },
  { key: "price_sensitivity_score", label: "Score τιμής" },
  { key: "digital_affinity_score", label: "Score ψηφιακής" },
  { key: "health_risk_score", label: "Score υγείας" },
  { key: "disposable_income", label: "Διαθέσιμο εισόδημα" },
  { key: "time_availability", label: "Διαθεσιμότητα χρόνου" },
  { key: "social_influence_score", label: "Score κοινωνικής επιρροής" },
];

const DEFAULT_SELECTED = [
  "age", "archetype", "income", "employment", "neighborhood",
  "price_sensitivity_score", "disposable_income", "digital_affinity_score",
  "household", "education", "smoking", "stress_level", "savings_behavior",
  "delivery", "social_media", "exercise", "marital", "children_count",
  "health", "work_hours"
];

export default function SimulationRunner() {
  const [scenario, setScenario] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("cafe");
  const [agents, setAgents] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [simulationId, setSimulationId] = useState(null);
  const [selectedAttrs, setSelectedAttrs] = useState(DEFAULT_SELECTED);
  const [showAttrPicker, setShowAttrPicker] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState(null);

  // Toggle attribute selection
  function toggleAttr(key) {
    setSelectedAttrs(prev => {
      if (prev.includes(key)) {
        if (prev.length <= 5) return prev; // minimum 5
        return prev.filter(k => k !== key);
      } else {
        if (prev.length >= 20) return prev; // maximum 20
        return [...prev, key];
      }
    });
  }

  // Δημιουργία agents
  function generateAgents() {
    const newAgents = Array.from({ length: 20 }, (_, i) => ({
      ...generateAgent(),
      id: `agent_${i}`,
    }));
    setAgents(newAgents);
    setResults(null);
    setSaved(false);
  }

  // Regenerate μόνο έναν agent
  function regenerateOne(index) {
    const newAgent = { ...generateAgent(), id: `agent_${index}` };
    setAgents(prev => {
      const updated = [...prev];
      updated[index] = newAgent;
      return updated;
    });
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
        body: JSON.stringify({ agents, scenario, selectedAttributes: selectedAttrs }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Σφάλμα: " + err.message);
    }
    setLoading(false);
  }

  // Αποθήκευση
  async function saveSimulation() {
    if (!results) return;
    const res = await fetch("/api/save-simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario, businessType, businessName, summary: results.summary }),
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

        {/* Attribute picker */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: "#64748b" }}>ΚΑΤΗΓΟΡΙΕΣ AGENTS ({selectedAttrs.length}/20)</label>
            <button
              onClick={() => setShowAttrPicker(p => !p)}
              style={{ fontSize: 11, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "0.3rem 0.8rem", borderRadius: 6, cursor: "pointer" }}
            >
              {showAttrPicker ? "▲ Κλείσιμο" : "▼ Επεξεργασία"}
            </button>
          </div>

          {showAttrPicker && (
            <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8, padding: "1rem" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>
                Επίλεξε ακριβώς 20 κατηγορίες. Επιλεγμένες: {selectedAttrs.length}/20
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_ATTRIBUTES.map(attr => {
                  const isSelected = selectedAttrs.includes(attr.key);
                  return (
                    <button
                      key={attr.key}
                      onClick={() => toggleAttr(attr.key)}
                      style={{
                        fontSize: 11,
                        padding: "0.3rem 0.7rem",
                        borderRadius: 20,
                        border: `1px solid ${isSelected ? "#3b82f6" : "#333"}`,
                        background: isSelected ? "#1e40af" : "#111",
                        color: isSelected ? "#fff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {attr.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              ✓ Αποθηκεύτηκε
            </span>
          )}
        </div>
      </div>

      {/* Agents πριν simulation */}
      {agents.length > 0 && !results && (
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>20 AGENTS ΕΤΟΙΜΟΙ — πάτα σε agent για λεπτομέρειες, 🔄 για αναγέννηση</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {agents.map((a, i) => (
              <div
                key={a.id}
                style={{ background: "#1e293b", borderRadius: 6, padding: "0.6rem", fontSize: 11, color: "#94a3b8", cursor: "pointer", border: "1px solid #334155", position: "relative" }}
              >
                <div onClick={() => setExpandedAgent(expandedAgent?.id === a.id ? null : a)}>
                  <div style={{ color: "#e2e8f0", marginBottom: 2 }}>{a.archetype}</div>
                  <div>{a.age} χρ. · {a.neighborhood}</div>
                  <div style={{ color: "#475569" }}>{a.income}</div>
                </div>
                <button
                  onClick={() => regenerateOne(i)}
                  title="Αναγέννηση"
                  style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14 }}
                >
                  🔄
                </button>

                {/* Expanded details */}
                {expandedAgent?.id === a.id && (
                  <div style={{ marginTop: 8, borderTop: "1px solid #334155", paddingTop: 8 }}>
                    {ALL_ATTRIBUTES.map(attr => (
                      a[attr.key] !== undefined && (
                        <div key={attr.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ color: "#475569" }}>{attr.label}:</span>
                          <span style={{ color: "#cbd5e1", textAlign: "right", maxWidth: "55%" }}>{String(a[attr.key])}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Αποτελέσματα */}
      {results && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "ΘΕΤΙΚΟΙ",      value: `${Math.round(results.summary.positive_pct * 100)}%`,         color: "#4ade80" },
              { label: "ΑΡΝΗΤΙΚΟΙ",    value: `${Math.round(results.summary.negative_pct * 100)}%`,         color: "#f87171" },
              { label: "ΕΚΤΙΜ. CHURN", value: `${Math.round(results.summary.predicted_churn_pct * 100)}%`, color: "#facc15" },
              { label: "ΜΕΣΟ P2A",     value: `${results.summary.mean_p2a?.toFixed(1)}/10`,                color: "#818cf8" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.2rem" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {results.agentResults.map((r, i) => (
              <div
                key={i}
                style={{ background: "#111", border: `1px solid ${sentimentColor[r.sentiment] ?? "#333"}`, borderRadius: 10, padding: "1rem", cursor: "pointer" }}
                onClick={() => setExpandedAgent(expandedAgent?.agentId === r.agentId ? null : r)}
              >
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

                    {/* Expanded agent details μετά από simulation */}
                    {expandedAgent?.agentId === r.agentId && agents[i] && (
                      <div style={{ marginTop: 12, borderTop: "1px solid #222", paddingTop: 12 }}>
                        <div style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>ΠΛΗΡΕΣ ΠΡΟΦΙΛ</div>
                        {ALL_ATTRIBUTES.map(attr => (
                          agents[i][attr.key] !== undefined && (
                            <div key={attr.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                              <span style={{ color: "#475569" }}>{attr.label}:</span>
                              <span style={{ color: "#cbd5e1", textAlign: "right", maxWidth: "55%" }}>{String(agents[i][attr.key])}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
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