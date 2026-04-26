import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { scenario, businessType, businessName, summary } = await request.json();

    // Αποθηκεύουμε το simulation
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        scenario_text: scenario,
        business_type: businessType,
        business_name: businessName,
        predicted_positive_pct: summary.positive_pct,
        predicted_negative_pct: summary.negative_pct,
        predicted_neutral_pct: summary.neutral_pct,
        predicted_mean_p2a: summary.mean_p2a,
        predicted_churn_pct: summary.predicted_churn_pct,
        engine_version: "v1.1",
      })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, simulationId: data.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}