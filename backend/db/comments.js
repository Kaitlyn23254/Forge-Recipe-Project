import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";

const commentsCollection = collection(db, "comments");

// { recipeId: "recipeId",
// userId: "userId",
// text: "Comment text",
// rating: 5,
// likeCount: 0}

async function getCommentsByRecipeId(recipeId, userId) {
  const commentsQuery = query(
    commentsCollection,
    where("recipeId", "==", recipeId),
  );

  const snapshot = await getDocs(commentsQuery);
  const comments = snapshot.docs.map((commentDoc) => ({
    id: commentDoc.id,
    ...commentDoc.data(),
  }));

  // Get like count from the likes subcollection
  const withLikes = await Promise.all(
    comments.map(async (c) => {
      try {
        const metaRef = doc(db, "comments", c.id, "likes", "metadata");
        const userLikeRef = userId
          ? doc(db, "comments", c.id, "likes", userId)
          : null;
        const metaSnap = await getDoc(metaRef);
        const userLikeSnap = userLikeRef ? await getDoc(userLikeRef) : null;
        const likeCount = metaSnap.exists() ? (metaSnap.data().likes ?? 0) : 0;
        return {
          ...c,
          likeCount,
          likedByUser: userLikeSnap ? userLikeSnap.exists() : false,
        };
      } catch (err) {
        return { ...c, likeCount: 0, likedByUser: false };
      }
    }),
  );

  // Sort by descending likes
  withLikes.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));

  return withLikes;
}

async function postComment({ recipeId, userId, text, rating }) {
  const commentData = {
    recipeId,
    userId,
    text,
    rating,
    createdAt: serverTimestamp(),
  };
  // create comment doc and initialize likes metadata in a batch
  const commentRef = doc(collection(db, "comments"));
  const likesMetaRef = doc(collection(commentRef, "likes"), "metadata");
  const batch = writeBatch(db);

  batch.set(commentRef, commentData);
  batch.set(likesMetaRef, { likes: 0, createdAt: serverTimestamp() });

  await batch.commit();

  const [commentSnap, metaSnap] = await Promise.all([
    getDoc(commentRef),
    getDoc(likesMetaRef),
  ]);

  const created = commentSnap.exists() ? commentSnap.data() : commentData;
  const likes = metaSnap.exists() ? (metaSnap.data().likes ?? 0) : 0;

  return {
    id: commentRef.id,
    ...created,
    likes,
  };
}

async function likeComment(commentId, userId) {
  if (!commentId || !userId)
    throw new Error("commentId and userId are required");

  const commentRef = doc(db, "comments", commentId);
  const likeRef = doc(db, "comments", commentId, "likes", userId);
  const metaRef = doc(db, "comments", commentId, "likes", "metadata");

  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    const metaSnap = await tx.get(metaRef);
    if (likeSnap.exists()) {
      if (metaSnap.exists()) {
        const current = metaSnap.data().likes ?? 0;
        const next = Math.max(0, current - 1);
        tx.update(metaRef, { likes: next });
      }
      tx.delete(likeRef);
    } else {
      if (!metaSnap.exists()) {
        tx.set(metaRef, { likes: 1, createdAt: serverTimestamp() });
      } else {
        tx.update(metaRef, { likes: (metaSnap.data().likes ?? 0) + 1 });
      }
      tx.set(likeRef, { createdAt: serverTimestamp() });
    }
  });

  const [commentSnap, metaSnap, likeSnap] = await Promise.all([
    getDoc(commentRef),
    getDoc(metaRef),
    getDoc(likeRef),
  ]);

  const commentData = commentSnap.exists() ? commentSnap.data() : {};
  const likeCount = metaSnap.exists() ? (metaSnap.data().likes ?? 0) : 0;

  return {
    id: commentId,
    ...commentData,
    likeCount,
    likedByUser: likeSnap.exists(),
  };
}

export { getCommentsByRecipeId, postComment, likeComment };
