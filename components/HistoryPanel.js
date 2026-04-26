"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPanel() {
  const [simulations, setSimulations] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [groundTruth, setGroundTruth] = useState({ churn: "", revenue: "", source: "owner_reported", notes: "" });
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    loadSimulations();
  }, []);

  async function loadSimulations() {
    const { data } = await supabase
      .from("simulations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setSimulations(data || []);
  }

  async function saveGroundTruth() {
    if (!selected || !groundTruth.churn) return;
    setSaving(true);

    await fetch("/api/save-ground-truth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        simulationId: selected.id,
        actualChurnPct: parseFloat(groundTruth.churn) / 100,
        actualRevenueDelta: parseFloat(groundTruth.revenue) / 100,
        source: groundTruth.source,
        notes: groundTruth.notes,
      }),
    });

    setSaving(false);
    setSaved(true);
    loadSimulations();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

      {/* Λίστα simulations */}
      <div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>ΠΡΟΗΓΟΥΜΕΝΑ SIMULATIONS</div>
        {simulations.map(sim => (
          <div
            key={sim.id}
            onClick={() => { setSelected(sim); setSaved(false); }}
            style={{
              background: selected?.id === sim.id ? "#1e293b" : "#111",
              border: `1px solid ${selected?.id === sim.id ? "#3b82f6" : "#222"}`,
              borderRadius: 8, padding: "1rem", marginBottom: 8, cursor: "pointer"
            }}
          >
            <div style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 4 }}>{sim.scenario_text}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#475569" }}>
              <span>{sim.business_name || sim.business_type}</span>
              <span>Churn: {Math.round((sim.predicted_churn_pct || 0) * 100)}%</span>
              <span>{new Date(sim.created_at).toLocaleDateString("el-GR")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ground truth form */}
      <div>
        {selected ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "1.5rem" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>ΚΑΤΑΓΡΑΦΗ ΠΡΑΓΜΑΤΙΚΟΥ ΑΠΟΤΕΛΕΣΜΑΤΟΣ</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, fontStyle: "italic" }}>"{selected.scenario_text}"</div>

            {/* Predicted vs actual */}
            <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "1rem", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>ΠΡΟΒΛΕΨΗ</div>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <span style={{ color: "#f87171" }}>Αρνητικοί: {Math.round((selected.predicted_negative_pct || 0) * 100)}%</span>
                <span style={{ color: "#facc15" }}>Churn: {Math.round((selected.predicted_churn_pct || 0) * 100)}%</span>
                <span style={{ color: "#818cf8" }}>P2A: {selected.predicted_mean_p2a?.toFixed(1)}</span>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΠΡΑΓΜΑΤΙΚΟ CHURN % (π.χ. 25)</label>
              <input
                type="number"
                value={groundTruth.churn}
                onChange={e => setGroundTruth(p => ({ ...p, churn: e.target.value }))}
                placeholder="25"
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΑΛΛΑΓΗ ΕΣΟΔΩΝ % (π.χ. -15 ή +5)</label>
              <input
                type="number"
                value={groundTruth.revenue}
                onChange={e => setGroundTruth(p => ({ ...p, revenue: e.target.value }))}
                placeholder="-15"
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΠΗΓΗ</label>
              <select
                value={groundTruth.source}
                onChange={e => setGroundTruth(p => ({ ...p, source: e.target.value }))}
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13 }}
              >
                <option value="owner_reported">Ιδιοκτήτης</option>
                <option value="pos_data">POS δεδομένα</option>
                <option value="survey">Έρευνα</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>ΣΗΜΕΙΩΣΕΙΣ</label>
              <textarea
                value={groundTruth.notes}
                onChange={e => setGroundTruth(p => ({ ...p, notes: e.target.value }))}
                placeholder="Τυχόν παρατηρήσεις..."
                style={{ width: "100%", minHeight: 60, background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "0.6rem", color: "#e2e8f0", fontSize: 13, resize: "vertical" }}
              />
            </div>

            <button
              onClick={saveGroundTruth}
              disabled={saving || !groundTruth.churn}
              style={{ background: "#065f46", border: "none", color: "#6ee7b7", padding: "0.7rem 1.5rem", borderRadius: 6, cursor: "pointer", fontSize: 13, width: "100%" }}
            >
              {saving ? "Αποθήκευση..." : "💾 Αποθήκευση Αποτελέσματος"}
            </button>

            {saved && (
              <div style={{ marginTop: 12, color: "#6ee7b7", fontSize: 12, textAlign: "center" }}>
                ✓ Αποθηκεύτηκε! Το σύστημα θα χρησιμοποιήσει αυτά τα δεδομένα για calibration.
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "2rem", textAlign: "center", color: "#475569", fontSize: 13 }}>
            Επίλεξε ένα simulation από αριστερά για να καταγράψεις το πραγματικό αποτέλεσμα.
          </div>
        )}
      </div>
    </div>
  );
}