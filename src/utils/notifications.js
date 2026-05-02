
export const getUnreadForumCount = (threads, userId) => {
  if (!threads || !userId) return 0;
  
  const stored = localStorage.getItem(`read_counts_${userId}`);
  const readCounts = stored ? JSON.parse(stored) : {};
  
  let totalUnread = 0;
  threads.forEach(thread => {
    const lastRead = readCounts[thread._id] || 0;
    const unreadInThread = (thread.postCount || 0) - lastRead;
    if (unreadInThread > 0) {
      totalUnread += unreadInThread;
    }
  });
  
  return totalUnread;
};

export const markThreadAsRead = (threadId, count, userId) => {
  if (!threadId || !userId) return;
  const stored = localStorage.getItem(`read_counts_${userId}`);
  const readCounts = stored ? JSON.parse(stored) : {};
  readCounts[threadId] = count;
  localStorage.setItem(`read_counts_${userId}`, JSON.stringify(readCounts));
};
