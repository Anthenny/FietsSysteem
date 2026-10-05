import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "../config/firebase";

export const deleteRide = onRequest(async (req, res) => {
  // 1. Alleen DELETE-requests toestaan
  if (req.method !== "DELETE") {
    res.status(405).send("Alleen DELETE methode toegestaan");
    return;
  }

  // 2. rideId ophalen uit de query parameters (bijv. ?rideId=test-99)
  const rideId = req.query.rideId as string;

  if (!rideId) {
    res.status(400).json({ success: false, error: "rideId is verplicht" });
    return;
  }

  try {
    const rideRef = db.collection("rides").doc(rideId);
    const rideDoc = await rideRef.get();

    // Check of de rit überhaupt bestaat
    if (!rideDoc.exists) {
      res.status(404).json({ success: false, error: "Rit niet gevonden" });
      return;
    }

    // 3. Haal alle samples uit de subcollectie op
    const samplesSnapshot = await rideRef.collection("samples").get();

    // 4. Gebruik een batch om alles netjes en in één keer op te ruimen
    const batch = db.batch();

    // Voeg alle losse sample-documenten toe aan de verwijder-batch
    samplesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Voeg als laatste het hoofddocument (de rit zelf) toe aan de batch
    batch.delete(rideRef);

    // Voer de verwijdering uit in de database
    await batch.commit();

    logger.info("Rit " + rideId + " en samples succesvol verwijderd");

    // 5. Stuur een duidelijke respons terug
    res.status(200).json({
      success: true,
      message: `Rit ${rideId} en bijbehorende metingen succesvol verwijderd`,
      deletedSamplesCount: samplesSnapshot.size,
    });
  } catch (error) {
    logger.error("Fout bij verwijderen van rit", error);
    res.status(500).json({ success: false, error: "Verwijderen mislukt" });
  }
});