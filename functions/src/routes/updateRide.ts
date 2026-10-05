import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { rideService } from "../services/rideService";
import { UpdateRideInput } from "../types";

export const updateRide = onRequest(async (req, res) => {
  if (req.method !== "PUT" && req.method !== "PATCH") {
    res.status(405).send("Alleen PUT of PATCH methode toegestaan");
    return;
  }

  const rideId = req.query.rideId as string;
  if (!rideId) {
    res.status(400).json({ success: false, error: "rideId is verplicht" });
    return;
  }

  const { title, deviceId, notes } = req.body;

  try {
    const { rideDoc } = await rideService.getRideDoc(rideId);

    if (!rideDoc.exists) {
      res.status(404).json({ success: false, error: "Rit niet gevonden" });
      return;
    }

    const updateData: UpdateRideInput = {
      updatedAt: Date.now(),
    };

    if (title !== undefined) updateData.title = title;
    if (deviceId !== undefined) updateData.deviceId = deviceId;
    if (notes !== undefined) updateData.notes = notes;

    await rideService.updateRide(rideId, updateData);

    logger.info(`Rit ${rideId} succesvol bijgewerkt`, updateData);

    res.status(200).json({
      success: true,
      message: `Rit ${rideId} succesvol bijgewerkt`,
      updatedFields: updateData,
    });
  } catch (error) {
    logger.error("Fout bij bijwerken van rit", error);
    res.status(500).json({ success: false, error: "Bijwerken mislukt" });
  }
});
