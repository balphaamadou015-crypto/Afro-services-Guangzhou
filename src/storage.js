import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Stocke/lit une valeur partagée par TOUS les visiteurs du site (catalogue, commandes, etc.)
// Chaque "key" correspond à un document dans la collection "afroData".

export async function getVal(key) {
  const ref = doc(db, "afroData", key);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().value;
}

export async function setVal(key, value) {
  const ref = doc(db, "afroData", key);
  await setDoc(ref, { value, updatedAt: new Date().toISOString() });
}
