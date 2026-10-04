import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore(); // Buiten de functie dit gebeurt een keer

// === 1. INTERFACES (TypeScript Blauwdrukken) ===
interface Ride {
  rideId: string;
  deviceId?: string;
  updatedAt?: number;
  [key: string]: unknown; // Index signature zit alleen hier
}

interface Sample {
  t: number;
  [key: string]: unknown;
}

// Geen 'extends Ride' en geen dubbele index signature nodig
interface RideDetails {
  rideId: string;
  deviceId?: string;
  updatedAt?: number;
  samplesCount: number;
  samples: Sample[];
  [key: string]: unknown;
}

// Create
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

// Read
export const getRides = onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Alleen GET requests toegestaan");
    return;
  }

  try {
    const snapshot = await db.collection("rides").get();
    const rides: Ride[] = [];

    snapshot.forEach((doc) => {
      rides.push({
        rideId: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(rides);
  } catch (error) {
    logger.error("Fout bij ophalen ritten", error);
    res.status(500).json({ error: "Ophalen mislukt" });
  }
});

// Read one
// === 4. READ: Details + Samples van 1 rit ophalen ===
export const getRideDetails = onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Alleen GET toegestaan");
    return;
  }

  const rideId = req.query.rideId as string | undefined;

  if (!rideId) {
    res.status(400).json({ error: "rideId is verplicht in de query string" });
    return;
  }

  try {
    const rideDoc = await db.collection("rides").doc(rideId).get();

    if (!rideDoc.exists) {
      res.status(404).json({ error: "Rit niet gevonden" });
      return;
    }

    const samplesSnapshot = await db
      .collection("rides")
      .doc(rideId)
      .collection("samples")
      .get();

    const samples: Sample[] = [];
    samplesSnapshot.forEach((doc) => {
      samples.push(doc.data() as Sample);
    });

    const responseData: RideDetails = {
      rideId: rideDoc.id,
      ...rideDoc.data(), // zorgt dat er geen extra sub json map komt maar updated etc eronder
      samplesCount: samples.length, // weet wat je kan verwachten in samples
      samples: samples,
    };

    res.status(200).json(responseData);
  } catch (error) {
    logger.error("Fout bij ophalen rit details", error);
    res.status(500).json({ error: "Ophalen details mislukt" });
  }
});

// DELETE ONE
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