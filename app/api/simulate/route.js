import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { agents, scenario } = await request.json();

    // Στέλνουμε όλους τους agents ταυτόχρονα στο Groq
    const agentPromises = agents.map(async (agent) => {
      const profile = `
        Ηλικία: ${agent.age}
        Αρχέτυπο: ${agent.archetype}
        Εισόδημα: ${agent.income}
        Εργασία: ${agent.employment}
        Περιοχή: ${agent.neighborhood}
        Οικογενειακή κατάσταση: ${agent.marital}
        Εκπαίδευση: ${agent.education}
        Price Sensitivity Score: ${agent.price_sensitivity_score}
        Disposable Income: ${agent.disposable_income}€
      `;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Είσαι ένας σύνθετος Έλληνας καταναλωτής που ζει στη Θεσσαλονίκη. 
Αντιδράς σε επιχειρηματικές αποφάσεις με βάση το προφίλ σου. 
Απάντα ΠΑΝΤΑ σε αυτή την ΑΚΡΙΒΗ δομή:

RESPONSE: [1-2 προτάσεις πρώτο πρόσωπο στα ελληνικά]
SENTIMENT: [positive / negative / neutral]
REASON: [price / quality / convenience / habit / trust / necessity / social / health]
PROBABILITY_TO_ACT: [0-10]`,
          },
          {
            role: "user",
            content: `ΠΡΟΦΙΛ ΜΟΥ:\n${profile}\n\nΑΠΟΦΑΣΗ ΕΠΙΧΕΙΡΗΣΗΣ: ${scenario}\n\nΠώς αντιδράς;`,
          },
        ],
      });

      const text = completion.choices[0].message.content;

      // Διαβάζουμε την απάντηση
      const getField = (key) => {
        const match = text.match(new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, "is"));
        return match ? match[1].trim() : null;
      };

      const sentiment = getField("SENTIMENT")?.toLowerCase();
      const rawP2A = parseFloat(getField("PROBABILITY_TO_ACT"));

      return {
        agentId: agent.id,
        archetype: agent.archetype,
        age: agent.age,
        neighborhood: agent.neighborhood,
        response: getField("RESPONSE"),
        sentiment: ["positive", "negative", "neutral"].includes(sentiment) ? sentiment : "neutral",
        reason: getField("REASON")?.toLowerCase() ?? "unknown",
        probability_to_act: isNaN(rawP2A) ? 5 : Math.min(10, Math.max(0, rawP2A)),
      };
    });

    // Περιμένουμε όλους τους agents
    const results = await Promise.allSettled(agentPromises);

    const agentResults = results.map((r) =>
      r.status === "fulfilled" ? r.value : { error: r.reason?.message }
    );

    // Υπολογίζουμε συγκεντρωτικά
    const successful = agentResults.filter((r) => !r.error);
    const positive = successful.filter((r) => r.sentiment === "positive").length;
    const negative = successful.filter((r) => r.sentiment === "negative").length;
    const neutral = successful.filter((r) => r.sentiment === "neutral").length;
    const total = successful.length;
    const meanP2A = successful.reduce((s, r) => s + r.probability_to_act, 0) / total;
    const predictedChurn = (negative / total) * (meanP2A / 10);

    // Βρίσκουμε την κυρίαρχη αιτία
    const reasonCounts = {};
    successful.forEach((r) => {
      reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
    });
    const dominantReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return Response.json({
      agentResults,
      summary: {
        positive_pct: positive / total,
        negative_pct: negative / total,
        neutral_pct: neutral / total,
        mean_p2a: meanP2A,
        predicted_churn_pct: predictedChurn,
        dominant_reason: dominantReason,
        total_agents: total,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}