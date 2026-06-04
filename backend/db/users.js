import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";

const usersCollection = collection(db, "users");
const allowedRoles = new Set(["user", "admin"]);

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const userQuery = query(
    usersCollection,
    where("email", "==", normalizedEmail),
  );
  const snapshot = await getDocs(userQuery);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return {
    id: userDoc.id,
    ...userDoc.data(),
  };
}

async function createUser({ name, email, password, role = "user" }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");
  const cleanRole = String(role || "user").toLowerCase();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    throw new Error("name, email and password are required");
  }

  if (!allowedRoles.has(cleanRole)) {
    throw new Error('role must be "user" or "admin"');
  }

  const existingUser = await getUserByEmail(cleanEmail);
  if (existingUser) {
    throw new Error("An account with that email already exists");
  }

  const userRef = doc(collection(db, "users"));
  const userData = {
    uid: userRef.id,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: cleanRole,
  };

  await setDoc(userRef, userData);

  return {
    uid: userRef.id,
    name: cleanName,
    email: cleanEmail,
    role: cleanRole,
  };
}

async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");

  if (!cleanEmail || !cleanPassword) {
    throw new Error("email and password are required");
  }

  const user = await getUserByEmail(cleanEmail);
  if (!user || user.password !== cleanPassword) {
    throw new Error("Invalid email or password");
  }

  return {
    uid: user.uid ?? user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
  };
}

async function getUsersCount() {
  const snapshot = await getDocs(usersCollection);
  return snapshot.size;
}

async function getUserById(userId) {
  if (!userId) {
    return null;
  }

  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function attachUsernames(items) {
  if (!items?.length) {
    return items ?? [];
  }

  const userIds = [
    ...new Set(items.map((item) => item.userId).filter(Boolean)),
  ];
  const nameByUserId = new Map();

  await Promise.all(
    userIds.map(async (id) => {
      const user = await getUserById(id);
      nameByUserId.set(id, user?.name ?? "Unknown user");
    }),
  );

  return items.map((item) => ({
    ...item,
    username: nameByUserId.get(item.userId) ?? "Unknown user",
  }));
}

export { createUser, loginUser, getUserById, attachUsernames, getUsersCount };
