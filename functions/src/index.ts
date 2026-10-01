import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore(); // Buiten de functie dit gebeurt een keer

export const upload = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Alleen POST");
    return;
  }

  // NOTE: WE MOETEN EEN ID MEEGEVEN OP ESP32 zorg dat dit altijd uniek is!!

  const { deviceId, rideId, samples } = req.body; // sla alle var op die je krijgt uti json body

  if (!deviceId || !rideId || !Array.isArray(samples)) {
    res.status(400).json({ error: "deviceId, rideId en samples zijn verplicht" });
    return;
  }

  try {
    const rideRef = db.collection("rides").doc(rideId); // onder wat willen we het opslaan?
    const batch = db.batch(); // Maak de lijst aan

    batch.set(rideRef, { deviceId, updatedAt: Date.now() }, { merge: true });

    for (const sample of samples) {
      batch.set(rideRef.collection("samples").doc(String(sample.t)), sample);
    }

    await batch.commit();
    logger.info("Upload opgeslagen", { deviceId, rideId, aantal: samples.length });
    res.status(200).json({ ok: true, received: samples.length });
  } catch (error) {
    logger.error("Opslaan mislukt", error);
    res.status(500).json({ error: "Opslaan mislukt" });
  }
});