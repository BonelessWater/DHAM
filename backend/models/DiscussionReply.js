const db = require("../config/database");
const { randomUUID } = require("crypto");
const uuidv4 = () => randomUUID();


class DiscussionReply {
  // Base reference for replies in RTDB
  static ref() {
    return db.ref("discussionReplies");
  }

  /**
   * Create a new reply
   * data:
   *  - discussionId (string, required)
   *  - userId (string, required)
   *  - content (string, required)
   *  - parentReplyId? (string | null)
   *  - images? (string[])
   */
  static async create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const reply = {
      id,
      discussionId: data.discussionId,
      userId: data.userId,
      parentReplyId: data.parentReplyId || null,
      content: data.content,
      images: Array.isArray(data.images) ? data.images : [],
      likeCount:
        typeof data.likeCount === "number" ? data.likeCount : 0,
      isFlagged: !!data.isFlagged,
      createdAt: now,
      updatedAt: now,
    };

    await this.ref().child(id).set(reply);
    return reply;
  }

  // Find a reply by ID
  static async findById(id) {
    const snapshot = await this.ref().child(id).once("value");
    if (!snapshot.exists()) return null;
    return snapshot.val();
  }

  // Find all discussions by ID
  static async findByDiscussionId(discussionId) {
    const snapshot = await this.ref()
      .orderByChild("discussionId")
      .equalTo(discussionId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data);
  }

  
  static async findTopLevelByDiscussionId(discussionId) {
    const replies = await this.findByDiscussionId(discussionId);
    return replies.filter((r) => !r.parentReplyId);
  }

  // Get child replies for Discussion replies
  static async findChildren(parentReplyId) {
    const snapshot = await this.ref()
      .orderByChild("parentReplyId")
      .equalTo(parentReplyId)
      .once("value");

    const data = snapshot.val() || {};
    return Object.values(data);
  }

  // Update a reply by ID
  static async update(id, updates) {
    const existingSnap = await this.ref().child(id).once("value");
    if (!existingSnap.exists()) return null;

    const existing = existingSnap.val();

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.ref().child(id).set(merged);
    return merged;
  }

  // Delete a reply by ID
  static async delete(id) {
    await this.ref().child(id).remove();
    return true;
  }

  // Increment like count
  static async incrementLikeCount(id, delta = 1) {
    const ref = this.ref().child(id);

    await ref.transaction((reply) => {
      if (reply === null) return reply;
      reply.likeCount = (reply.likeCount || 0) + delta;
      reply.updatedAt = new Date().toISOString();
      return reply;
    });
  }
}

module.exports = DiscussionReply;
