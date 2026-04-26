import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { simulationId, actualChurnPct, actualRevenueDelta, source, notes } = await request.json();

    // Βρίσκουμε το αρχικό simulation για να υπολογίσουμε το λάθος
    const { data: sim } = await supabase
      .from("simulations")
      .select("predicted_churn_pct")
      .eq("id", simulationId)
      .single();

    const errorChurn = actualChurnPct - sim.predicted_churn_pct;

    // Αποθηκεύουμε την πραγματικότητα
    const { error } = await supabase
      .from("ground_truth")
      .insert({
        simulation_id: simulationId,
        actual_churn_pct: actualChurnPct,
        actual_revenue_delta: actualRevenueDelta,
        source: source,
        notes: notes,
        error_churn: errorChurn,
      });

    if (error) throw error;

    return Response.json({ success: true, error_churn: errorChurn });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}