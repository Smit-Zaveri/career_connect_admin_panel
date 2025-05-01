import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ArrowUpDown,
  ThumbsUp,
  MessageCircle,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Tag,
  RefreshCw,
  Loader,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getCommunities,
  deleteCommunity,
  FirebaseCommunity,
  toggleCommunityLike,
  restoreCommunity,
} from "../../services/communityService";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { formatDate, getRelativeTimeString } from "../../utils/dateUtils";

const CommunityList: React.FC = () => {
  const { isAdmin, isCounselor, user } = useAuth();
  const [posts, setPosts] = useState<FirebaseCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  // New state to track which action dropdown is open
  const [activeActionDropdown, setActiveActionDropdown] = useState<
    string | null
  >(null);

  // Pagination
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchPosts();
  }, [filterStatus, filterCategory, filterFeatured]);

  const fetchPosts = async (loadMore = false) => {
    try {
      setLoading(true);

      // Create filter object based on current filter states
      const filters: any = {};

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      if (filterCategory !== "all") {
        filters.category = filterCategory;
      }

      if (filterFeatured) {
        filters.featured = true;
      }

      const lastDoc = loadMore ? lastVisible : null;
      const result = await getCommunities(filters, pageSize, lastDoc);

      if (result) {
        if (loadMore) {
          setPosts([...posts, ...result.communities]);
        } else {
          setPosts(result.communities);
        }

        setLastVisible(result.lastVisible);
        setHasMore(result.communities.length === pageSize);

        // Extract unique categories for the filter dropdown
        if (!loadMore) {
          const uniqueCategories = Array.from(
            new Set(result.communities.map((post) => post.category))
          ).filter(Boolean) as string[];
          setCategories(uniqueCategories);
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const statusBtn = document.getElementById("status-filter-btn");
      const statusMenu = document.getElementById("status-filter-menu");
      const categoryBtn = document.getElementById("category-filter-btn");
      const categoryMenu = document.getElementById("category-filter-menu");

      if (
        statusDropdownOpen &&
        statusBtn &&
        statusMenu &&
        !statusBtn.contains(e.target as Node) &&
        !statusMenu.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }

      if (
        categoryDropdownOpen &&
        categoryBtn &&
        categoryMenu &&
        !categoryBtn.contains(e.target as Node) &&
        !categoryMenu.contains(e.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }

      // Close action dropdown when clicking outside
      if (
        activeActionDropdown &&
        !(e.target as Element).closest(".action-dropdown-container")
      ) {
        setActiveActionDropdown(null);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [statusDropdownOpen, categoryDropdownOpen, activeActionDropdown]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(filteredPosts.map((post) => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((postId) => postId !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteCommunity(id, user.id);
        toast.success("Post deleted successfully");

        // Refresh the list
        fetchPosts();

        // Clear from selected if it's selected
        setSelectedPosts(selectedPosts.filter((postId) => postId !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post. Please try again.");
      }
    }
  };

  const deleteSelectedPosts = async () => {
    if (!user) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedPosts.length} selected posts?`
      )
    ) {
      try {
        const deletePromises = selectedPosts.map((postId) =>
          deleteCommunity(postId, user.id)
        );
        await Promise.all(deletePromises);

        toast.success(`${selectedPosts.length} posts deleted successfully`);

        // Refresh the list and clear selected
        fetchPosts();
        setSelectedPosts([]);
      } catch (error) {
        console.error("Error deleting posts:", error);
        toast.error("Failed to delete some posts. Please try again.");
      }
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Make search case-insensitive and trim whitespace
    const search = searchTerm.toLowerCase().trim();

    // If no search term, just check other filters
    if (!search) {
      const matchesStatus =
        filterStatus === "all" || post.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || post.category === filterCategory;
      const matchesFeatured = !filterFeatured || post.featured;
      return matchesStatus && matchesCategory && matchesFeatured;
    }

    // Search in title
    const titleMatch = post.title?.toLowerCase().includes(search);

    // Search in author name (with null checks)
    const authorMatch =
      post.author?.name?.toLowerCase().includes(search) || false;

    // Search in category (with null check)
    const categoryMatch =
      post.category?.toLowerCase().includes(search) || false;

    // Search in description (with null check)
    const descriptionMatch =
      post.description?.toLowerCase().includes(search) || false;

    // Search in tags
    const tagsMatch =
      post.tags?.some((tag) => tag.toLowerCase().includes(search)) || false;

    // Combine search results
    const matchesSearch =
      titleMatch ||
      authorMatch ||
      categoryMatch ||
      descriptionMatch ||
      tagsMatch;

    // Apply other filters
    const matchesStatus =
      filterStatus === "all" || post.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || post.category === filterCategory;
    const matchesFeatured = !filterFeatured || post.featured;

    return matchesSearch && matchesStatus && matchesCategory && matchesFeatured;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortKey === "likes") {
      return sortDirection === "asc" ? a.likes - b.likes : b.likes - a.likes;
    }

    if (sortKey === "views") {
      return sortDirection === "asc" ? a.views - b.views : b.views - a.views;
    }

    if (sortKey === "comments") {
      return sortDirection === "asc"
        ? a.comments - b.comments
        : b.comments - a.comments;
    }

    if (sortKey === "createdAt") {
      const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt ? b.createdAt.toMillis() : 0;

      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    }

    if (sortKey === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    return 0;
  });

  // Get status badge element
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-900/30 dark:text-success-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-700/50 dark:text-neutral-300">
            <Edit className="mr-1 h-3 w-3" />
            Draft
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-900/30 dark:text-warning-300">
            <AlertCircle className="mr-1 h-3 w-3" />
            Flagged
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Community Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Create, edit, and manage community content
          </p>
        </motion.div>

        {(isAdmin || isCounselor) && (
          <motion.div
            className="mt-4 flex space-x-2 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/community/new-post"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>New Post</span>
            </Link>
          </motion.div>
        )}
      </div>

      <motion.div
        className="rounded-lg bg-white shadow-sm dark:bg-neutral-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button
                  id="status-filter-btn"
                  type="button"
                  className="hidden inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Status: {filterStatus === "all" ? "All" : filterStatus}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {statusDropdownOpen && (
                  <div
                    id="status-filter-menu"
                    className="absolute right-0 mt-2 w-36 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("published");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Published
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("draft");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Draft
                      </button>
                      <button
                        onClick={() => {
                          setFilterStatus("flagged");
                          setStatusDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        Flagged
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  id="category-filter-btn"
                  type="button"
                  className="hidden inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  <Filter className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Category: {filterCategory === "all" ? "All" : filterCategory}
                  <ChevronDown className="ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                {categoryDropdownOpen && (
                  <div
                    id="category-filter-menu"
                    className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setFilterCategory("all");
                          setCategoryDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setFilterCategory(category);
                            setCategoryDropdownOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFilterFeatured(!filterFeatured)}
                className={`hidden inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium ${
                  filterFeatured
                    ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Featured Only
              </button>

              <button
                type="button"
                onClick={() => fetchPosts()}
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin text-neutral-500 dark:text-neutral-400" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {selectedPosts.length > 0 && (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900/50">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {selectedPosts.length} items selected
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
              >
                Publish Selected
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-error-50 px-3 py-1 text-xs font-medium text-error-700 hover:bg-error-100 dark:bg-error-900/20 dark:text-error-400 dark:hover:bg-error-900/30"
                onClick={deleteSelectedPosts}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 rounded-full bg-error-100 p-3 dark:bg-error-900/30">
              <AlertCircle className="h-6 w-6 text-error-500 dark:text-error-400" />
            </div>
            <h3 className="mb-1 text-base font-medium text-error-600 dark:text-error-400">
              {error}
            </h3>
            <button
              onClick={() => fetchPosts()}
              className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                        onChange={handleSelectAll}
                        checked={
                          selectedPosts.length === filteredPosts.length &&
                          filteredPosts.length > 0
                        }
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("title")}
                    >
                      Post Title
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("views")}
                    >
                      Stats
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                  >
                    <button
                      className="group inline-flex items-center"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date
                      <ArrowUpDown className="ml-1 h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </button>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
                {loading && posts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center">
                        <Loader className="mb-4 h-8 w-8 animate-spin text-primary-500 dark:text-primary-400" />
                        <h3 className="mb-1 text-base font-medium text-neutral-900 dark:text-white">
                          Loading communities...
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : sortedPosts.length > 0 ? (
                  sortedPosts.map((post) => (
                    <tr
                      key={post.id}
                      onClick={() =>
                        (window.location.href = `/community/${post.id}`)
                      }
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => handleSelectPost(post.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {post.title}
                              {post.pinned && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300">
                                  Pinned
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {post.tags?.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags && post.tags.length > 3 && (
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                            {post.author && post.author.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
                                <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {post.author ? post.author.name : "Unknown User"}
                            </div>
                            <div className="text-xs text-neutral-500 capitalize dark:text-neutral-400">
                              {post.author ? post.author.role : "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {post.category && (
                          <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                            <Tag className="mr-1 h-3 w-3" />
                            {post.category}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                          <div className="flex items-center">
                            <Eye className="mr-1 h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                          <Calendar className="mr-2 h-4 w-4" />
                          {post.createdAt
                            ? formatDate(post.createdAt.toDate())
                            : "—"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <div className="relative action-dropdown-container">
                            <button
                              type="button"
                              className="flex items-center rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                              onClick={() =>
                                setActiveActionDropdown(
                                  activeActionDropdown === post.id
                                    ? null
                                    : post.id
                                )
                              }
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {activeActionDropdown === post.id && (
                              <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800 z-10">
                                <div className="py-1">
                                  <Link
                                    to={`/community/${post.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                  >
                                    <Eye className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                    View
                                  </Link>
                                  {(isAdmin ||
                                    (isCounselor &&
                                      post.author?.id === user?.id)) && (
                                    <>
                                      <Link
                                        to={`/community/edit/${post.id}`}
                                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                      >
                                        <Edit className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => {
                                          handleDeletePost(post.id);
                                          setActiveActionDropdown(null); // Close dropdown after delete
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-neutral-100 dark:text-error-400 dark:hover:bg-neutral-700"
                                      >
                                        <Trash className="mr-3 h-4 w-4" />
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 rounded-full bg-neutral-100 p-3 dark:bg-neutral-700">
                          <MessageSquare className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <h3 className="mb-1 text-base font-medium text-neutral-900 dark:text-white">
                          No posts found
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {searchTerm
                            ? "Try adjusting your search or filters"
                            : "Create your first community post"}
                        </p>
                        {(isAdmin || isCounselor) && !searchTerm && (
                          <Link
                            to="/community/new-post"
                            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="mb-4 flex items-center text-sm text-neutral-500 dark:text-neutral-400 sm:mb-0">
              Showing{" "}
              <span className="mx-1 font-medium text-neutral-900 dark:text-white">
                {sortedPosts.length}
              </span>{" "}
              of{" "}
              <span className="mx-1 font-medium text-neutral-900 dark:text-white">
                {posts.length}
              </span>{" "}
              posts
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={loading} // Disable when loading
                onClick={() => fetchPosts()}
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                disabled={!hasMore || loading} // Disable when no more posts or loading
                onClick={() => fetchPosts(true)} // true for load more
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityList;
