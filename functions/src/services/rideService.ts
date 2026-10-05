import { db } from "../config/firebase";
import { UpdateRideInput } from "../types";

export const rideService = {
  // Controleer of een rit bestaat
  async getRideDoc(rideId: string) {
    const rideRef = db.collection("rides").doc(rideId);
    const rideDoc = await rideRef.get();
    return { rideRef, rideDoc };
  },

  // Update een rit
  async updateRide(rideId: string, updateData: UpdateRideInput) {
    const rideRef = db.collection("rides").doc(rideId);
    await rideRef.update(updateData);
  },

  // Verwijder een rit inclusief de subcollectie 'samples'
  async deleteRideWithSamples(rideId: string) {
    const rideRef = db.collection("rides").doc(rideId);
    const samplesRef = rideRef.collection("samples");
    const samplesSnapshot = await samplesRef.get();

    const batch = db.batch();
    samplesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(rideRef);
    await batch.commit();
  },
};