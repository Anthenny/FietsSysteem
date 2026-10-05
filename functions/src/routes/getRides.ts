import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Ride } from "../types";
import { db } from "../config/firebase";

export const getRides = onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Alleen GET requests toegestaan");
    return;
  }

  try {
    const snapshot = await db.collection("rides").get();
    const rides: Ride[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Check of het document écht bestaat en meer dan 0 velden heeft:
      if (doc.exists && Object.keys(data).length > 0) {
        rides.push({
          rideId: doc.id,
          ...data,
        });
      }
    });

    res.status(200).json(rides);
  } catch (error) {
    logger.error("Fout bij ophalen ritten", error);
    res.status(500).json({ error: "Ophalen mislukt" });
  }
});