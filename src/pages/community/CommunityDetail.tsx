import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Send,
  Trash,
  Edit,
  Loader,
  User,
  Calendar,
  Tag as TagIcon,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getCommunityById,
  toggleCommunityLike,
  deleteCommunity,
  FirebaseCommunity,
} from "../../services/communityService";
import {
  getCommunityMessages,
  sendCommunityMessage,
  updateCommunityMessage,
  deleteCommunityMessage,
  CommunityMessage,
} from "../../services/communityMessageService";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  formatDate,
  formatDateTime,
  getRelativeTimeString,
} from "../../utils/dateUtils";

const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isCounselor, user } = useAuth();
  const [community, setCommunity] = useState<FirebaseCommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [needsIndex, setNeedsIndex] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const communityData = await getCommunityById(id);
        setCommunity(communityData);
        setError(null);
      } catch (err) {
        console.error("Error fetching community details:", err);
        setError("Failed to load community details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;
      try {
        setMessagesLoading(true);
        setMessagesError(null);
        setNeedsIndex(false);

        const messageData = await getCommunityMessages(id);
        setMessages(messageData);
      } catch (err: any) {
        console.error("Error fetching community messages:", err);
        setMessagesError("Could not load the chat messages");

        if (err?.message?.includes("The query requires an index")) {
          setNeedsIndex(true);
        }
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLike = async () => {
    if (!id || !user) {
      toast.error("You must be logged in to like posts");
      return;
    }

    try {
      await toggleCommunityLike(id, !liked);
      setLiked(!liked);

      if (community) {
        setCommunity({
          ...community,
          likes: liked ? community.likes - 1 : community.likes + 1,
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!id || !user) {
      toast.error("You must be logged in to delete posts");
      return;
    }

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteCommunity(id, user.id);
        toast.success("Post deleted successfully");
        window.location.href = "/community";
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post. Please try again.");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!id || !user || !messageInput.trim()) return;

    try {
      setSendingMessage(true);
      await sendCommunityMessage(id, messageInput.trim(), user);
      setMessageInput("");

      const messageData = await getCommunityMessages(id);
      setMessages(messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartEdit = (message: CommunityMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      await updateCommunityMessage(editingMessageId, editContent.trim());

      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessageId
          ? { ...msg, content: editContent.trim() }
          : msg
      );
      setMessages(updatedMessages);

      setEditingMessageId(null);
      setEditContent("");

      toast.success("Message updated");
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!messageId) return;

    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteCommunityMessage(messageId);

        setMessages(messages.filter((msg) => msg.id !== messageId));
        toast.success("Message deleted");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const displayMessageTime = (message: CommunityMessage) => {
    if (message.timestamp && message.timestamp instanceof Timestamp) {
      return getRelativeTimeString(message.timestamp.toDate());
    }

    if (message.timestamp && typeof message.timestamp === "string") {
      try {
        return getRelativeTimeString(new Date(message.timestamp));
      } catch (e) {
        console.error("Error parsing date string:", e);
        return message.timestamp;
      }
    }

    if (message.createdAt) {
      if (typeof message.createdAt === "string") {
        try {
          return getRelativeTimeString(new Date(message.createdAt));
        } catch (e) {
          console.error("Error parsing date:", e);
          return "Unknown time";
        }
      } else if (message.createdAt instanceof Timestamp) {
        return getRelativeTimeString(message.createdAt.toDate());
      }
    }

    if (message.clientTimestamp) {
      return getRelativeTimeString(new Date(message.clientTimestamp));
    }

    return "Unknown time";
  };

  const canManageMessage = (message: CommunityMessage) => {
    if (!user) return false;

    if (message.userId === user.id) return true;

    if (isAdmin) return true;

    if (isCounselor && community?.author?.id === user.id) return true;

    return false;
  };

  const canEdit =
    isAdmin || (isCounselor && community?.author?.id === user?.id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading post details...</span>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="rounded-lg bg-error-50 p-6 text-center dark:bg-error-900/30">
        <h2 className="text-xl font-semibold text-error-800 dark:text-error-200">
          {error || "Post not found"}
        </h2>
        <p className="mt-2 text-error-600 dark:text-error-300">
          Could not load the post data. Please try again later.
        </p>
        <Link
          to="/community"
          className="mt-4 inline-block rounded-md bg-white px-4 py-2 font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <Link
            to="/community"
            className="mr-4 rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-white">
            Community Post
          </h1>
        </motion.div>
        {canEdit && (
          <div className="relative">
            <button
              className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800">
                <div className="py-1">
                  <Link
                    to={`/community/edit/${id}`}
                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    <Edit className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    Edit Post
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-neutral-100 dark:text-error-400 dark:hover:bg-neutral-700"
                  >
                    <Trash className="mr-3 h-4 w-4" />
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-800"
          >
            <div className="border-b border-neutral-200 p-6 dark:border-neutral-700">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {community.title}
                {community.pinned && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                    Pinned
                  </span>
                )}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    {community.author && community.author.avatar ? (
                      <img
                        src={community.author.avatar}
                        alt={community.author.name || "Author"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-full w-full p-2 text-neutral-500 dark:text-neutral-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {community.author?.name || "Unknown Author"}
                    </p>
                    <p className="text-xs text-neutral-500 capitalize dark:text-neutral-400">
                      {community.author?.role || "Unknown Role"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="mr-1 h-4 w-4" />
                  {community.createdAt &&
                    formatDate(community.createdAt.toDate())}
                </div>

                {community.category && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                      <TagIcon className="mr-1 h-3 w-3" />
                      {community.category}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <Eye className="mr-1 h-4 w-4" />
                  {community.views} views
                </div>
              </div>
            </div>

            {community.image && (
              <div className="border-b border-neutral-200 dark:border-neutral-700">
                <img
                  src={community.image}
                  alt={community.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            )}

            <div className="p-6">
              <div className="prose max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap">{community.description}</p>
              </div>

              {community.tags && community.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex border-t border-neutral-200 p-4 dark:border-neutral-700">
              <button
                onClick={handleLike}
                className={`mr-4 flex items-center rounded-md px-3 py-1.5 text-sm ${
                  liked
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                }`}
              >
                <Heart className="mr-2 h-4 w-4" />
                {community.likes} Likes
              </button>
              <button className="mr-4 flex items-center rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700">
                <MessageSquare className="mr-2 h-4 w-4" />
                {community.comments} Comments
              </button>
            </div>
          </motion.div>
        </div>

        <div className="lg:w-1/3 sticky top-4 self-start">
          <motion.div
            className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xl h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-t-2xl px-6 py-4 flex items-center justify-between shadow-sm">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 tracking-tight">
                Community Chat
              </h3>
              <button
                onClick={() => setShowChat(!showChat)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition"
              >
                {showChat ? "Hide" : "Show"}
              </button>
            </div>

            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                  {messagesLoading ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <Loader className="h-8 w-8 animate-spin text-primary-600" />
                      <span className="mt-2 text-sm text-neutral-500">
                        Loading messages...
                      </span>
                    </div>
                  ) : messagesError ? (
                    <div className="flex h-full flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <MessageSquare className="mb-2 h-12 w-12 opacity-30" />
                      <p>{messagesError}</p>
                      {needsIndex && (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            The database needs to be indexed to display messages
                            efficiently.
                          </p>
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            Please check the console for a link to create the
                            required index.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <MessageSquare className="mb-2 h-12 w-12 opacity-30" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.userId === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                              message.userId === user?.id
                                ? "bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100"
                                : "bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-800"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600">
                                  {message.userPhoto ? (
                                    <img
                                      src={message.userPhoto}
                                      alt={message.userName || "User"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-full w-full p-1 text-neutral-500 dark:text-neutral-400" />
                                  )}
                                </div>
                                <span className="ml-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                  {message.userName || "Unknown User"}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                {displayMessageTime(message)}
                              </span>
                            </div>

                            {editingMessageId === message.id ? (
                              <div className="mt-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="w-full rounded-md border border-neutral-300 p-2 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
                                  rows={2}
                                />
                                <div className="mt-2 flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="rounded-md bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="rounded-md bg-primary-500 px-2 py-1 text-xs font-medium text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </p>
                                <div className="mt-1 text-right">
                                  <span className="text-xs text-neutral-300 dark:text-neutral-600">
                                    {message.clientTimestamp &&
                                      `ID: ${message.communityId?.substring(
                                        0,
                                        8
                                      )}...`}
                                  </span>
                                </div>
                                {canManageMessage(message) && (
                                  <div className="mt-1 flex justify-end space-x-2">
                                    <button
                                      onClick={() => handleStartEdit(message)}
                                      className="rounded-full p-1 text-xs text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(message.id)
                                      }
                                      className="rounded-full p-1 text-xs text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                    >
                                      <Trash className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 my-0" />

                <div className="px-6 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-b-2xl">
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-white shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage}
                        className="rounded-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500 shadow"
                      >
                        {sendingMessage ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-md bg-neutral-200 p-3 text-center text-sm text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                      Please log in to participate in the conversation
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
