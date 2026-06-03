import {
  collection,
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

function repliesCollection(commentId) {
  return collection(db, "comments", commentId, "replies");
}

function replyLikesCollection(commentId, replyId) {
  return collection(db, "comments", commentId, "replies", replyId, "likes");
}

async function getReplyLikeState(commentId, replyId, userId) {
  const metaRef = doc(
    db,
    "comments",
    commentId,
    "replies",
    replyId,
    "likes",
    "metadata",
  );
  const userLikeRef = userId
    ? doc(db, "comments", commentId, "replies", replyId, "likes", userId)
    : null;

  const [metaSnap, userLikeSnap] = await Promise.all([
    getDoc(metaRef),
    userLikeRef ? getDoc(userLikeRef) : Promise.resolve(null),
  ]);

  return {
    likeCount: metaSnap.exists() ? (metaSnap.data().likes ?? 0) : 0,
    likedByUser: userLikeSnap ? userLikeSnap.exists() : false,
  };
}

function sortRepliesByLikeCount(replies) {
  return replies.sort((a, b) => {
    const likeDiff = (b.likeCount || 0) - (a.likeCount || 0);

    if (likeDiff !== 0) return likeDiff;

    const aSeconds = a.createdAt?.seconds ?? 0;
    const bSeconds = b.createdAt?.seconds ?? 0;

    return aSeconds - bSeconds;
  });
}

async function getRepliesByCommentId(commentId, userId) {
  if (!commentId) throw new Error("commentId is required");

  const repliesQuery = query(
    repliesCollection(commentId),
    where("commentId", "==", commentId),
  );
  const snapshot = await getDocs(repliesQuery);

  const replies = await Promise.all(
    snapshot.docs.map(async (replyDoc) => {
      const replyData = replyDoc.data();
      const { likeCount, likedByUser } = await getReplyLikeState(
        commentId,
        replyDoc.id,
        userId,
      );

      return {
        id: replyDoc.id,
        ...replyData,
        likeCount,
        likedByUser,
      };
    }),
  );

  return sortRepliesByLikeCount(replies);
}

async function postReply({ commentId, userId, text }) {
  if (!commentId || !userId || !text) {
    throw new Error("commentId, userId and text are required");
  }

  const replyData = {
    commentId,
    userId,
    text,
    createdAt: serverTimestamp(),
  };

  const replyRef = doc(collection(db, "comments", commentId, "replies"));
  const likesMetaRef = doc(collection(replyRef, "likes"), "metadata");
  const batch = writeBatch(db);

  batch.set(replyRef, replyData);
  batch.set(likesMetaRef, { likes: 0, createdAt: serverTimestamp() });

  await batch.commit();

  const [replySnap, metaSnap] = await Promise.all([
    getDoc(replyRef),
    getDoc(likesMetaRef),
  ]);

  const created = replySnap.exists() ? replySnap.data() : replyData;
  const likeCount = metaSnap.exists() ? (metaSnap.data().likes ?? 0) : 0;

  return {
    id: replyRef.id,
    ...created,
    likeCount,
    likedByUser: false,
  };
}

async function editReply({ commentId, replyId, userId, text }) {
  if (!commentId || !replyId || !userId || !text) {
    throw new Error("commentId, replyId, userId and text are required");
  }

  const replyRef = doc(db, "comments", commentId, "replies", replyId);
  let authorizedReply = null;

  await runTransaction(db, async (tx) => {
    const replySnap = await tx.get(replyRef);
    if (!replySnap.exists()) {
      throw new Error("Reply not found");
    }

    const replyData = replySnap.data();
    if (replyData.userId !== userId) {
      throw new Error("You can only edit your own reply");
    }

    authorizedReply = { id: replyId, ...replyData, text };
    tx.update(replyRef, { text, updatedAt: serverTimestamp() });
  });

  const [replySnap, likeState] = await Promise.all([
    getDoc(replyRef),
    getReplyLikeState(commentId, replyId, userId),
  ]);

  const replyData = replySnap.exists()
    ? replySnap.data()
    : (authorizedReply ?? {});

  return {
    id: replyId,
    ...replyData,
    ...likeState,
  };
}

async function deleteReply({ commentId, replyId, userId }) {
  if (!commentId || !replyId || !userId) {
    throw new Error("commentId, replyId and userId are required");
  }

  const replyRef = doc(db, "comments", commentId, "replies", replyId);
  const likesMetaRef = doc(
    db,
    "comments",
    commentId,
    "replies",
    replyId,
    "likes",
    "metadata",
  );
  let replyData = null;

  await runTransaction(db, async (tx) => {
    const replySnap = await tx.get(replyRef);
    if (!replySnap.exists()) {
      throw new Error("Reply not found");
    }

    const data = replySnap.data();
    if (data.userId !== userId) {
      throw new Error("You can only delete your own reply");
    }

    replyData = { id: replyId, ...data };
  });

  const likesSnapshot = await getDocs(replyLikesCollection(commentId, replyId));
  const batch = writeBatch(db);

  likesSnapshot.docs.forEach((likeDoc) => {
    batch.delete(likeDoc.ref);
  });

  batch.delete(likesMetaRef);
  batch.delete(replyRef);

  await batch.commit();

  return replyData;
}

async function likeReply(commentId, replyId, userId) {
  if (!commentId || !replyId || !userId) {
    throw new Error("commentId, replyId and userId are required");
  }

  const replyRef = doc(db, "comments", commentId, "replies", replyId);
  const likeRef = doc(
    db,
    "comments",
    commentId,
    "replies",
    replyId,
    "likes",
    userId,
  );
  const metaRef = doc(
    db,
    "comments",
    commentId,
    "replies",
    replyId,
    "likes",
    "metadata",
  );

  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);
    const metaSnap = await tx.get(metaRef);

    if (likeSnap.exists()) {
      if (metaSnap.exists()) {
        const current = metaSnap.data().likes ?? 0;
        tx.update(metaRef, { likes: Math.max(0, current - 1) });
      }
      tx.delete(likeRef);
      return;
    }

    if (!metaSnap.exists()) {
      tx.set(metaRef, { likes: 1, createdAt: serverTimestamp() });
    } else {
      tx.update(metaRef, { likes: (metaSnap.data().likes ?? 0) + 1 });
    }

    tx.set(likeRef, { createdAt: serverTimestamp() });
  });

  const [replySnap, likeState] = await Promise.all([
    getDoc(replyRef),
    getReplyLikeState(commentId, replyId, userId),
  ]);

  const replyData = replySnap.exists() ? replySnap.data() : {};

  return {
    id: replyId,
    ...replyData,
    ...likeState,
  };
}

export { getRepliesByCommentId, postReply, editReply, deleteReply, likeReply };
