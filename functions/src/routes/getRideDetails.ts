import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { RideDetails, Sample } from "../types";
import { db } from "../config/firebase";

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