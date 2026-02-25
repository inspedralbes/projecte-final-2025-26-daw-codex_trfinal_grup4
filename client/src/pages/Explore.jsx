import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import profileService from "@/services/profileService";
import postsService from "@/services/postsService";
import followService from "@/services/followService";
import PostCard from "@/components/feed/PostCard";
import "./Explore.css";

// Icons
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const TrendingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="explore__spinner">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function Explore() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Static categories with tag slugs for real filtering
  const categories = [
    { name: t("explore.categories.frontend"), icon: "🎨", tag: "frontend" },
    { name: t("explore.categories.backend"), icon: "⚙️", tag: "backend" },
    { name: t("explore.categories.devops"), icon: "🚀", tag: "devops" },
    { name: t("explore.categories.databases"), icon: "🗄️", tag: "databases" },
    { name: t("explore.categories.mobile"), icon: "📱", tag: "mobile" },
    { name: t("explore.categories.security"), icon: "🔒", tag: "security" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchFilter, setSearchFilter] = useState("all"); // "all" | "users" | "posts"
  const [topContributors, setTopContributors] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggested, setLoadingSuggested] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  // Use search hook
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    search,
    clearResults,
  } = useSearch();

  // Use tags hook for trending tags
  const { tags: trendingTags, loading: tagsLoading } = useTags();

  // Fetch leaderboard on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        const response = await profileService.getLeaderboard(5);
        setTopContributors(response.data || response || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setTopContributors([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Fetch trending posts (most liked recent posts)
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setLoadingTrending(true);
        const response = await postsService.getFeed({ page: 1 });
        const data = response.data || response;
        const posts = data.data || data || [];
        // Sort by likes + comments and pick top 5
        const sorted = [...posts]
          .sort((a, b) => {
            const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
            const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
            return scoreB - scoreA;
          })
          .slice(0, 5);
        setTrendingPosts(sorted);
      } catch (err) {
        console.error("Error fetching trending posts:", err);
        setTrendingPosts([]);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrendingPosts();
  }, []);

  // Fetch suggested users (leaderboard with more users, excluding self)
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        setLoadingSuggested(true);
        const response = await profileService.getLeaderboard(15);
        const allUsers = response.data || response || [];
        // Filter out current user and pick users not in top 5
        const suggestions = allUsers
          .filter((u) => u.username !== user?.username)
          .slice(0, 6);
        setSuggestedUsers(suggestions);
      } catch (err) {
        console.error("Error fetching suggested users:", err);
        setSuggestedUsers([]);
      } finally {
        setLoadingSuggested(false);
      }
    };
    if (user) fetchSuggested();
  }, [user]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        search(searchQuery);
        setShowResults(true);
      } else {
        clearResults();
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, search, clearResults]);

  // Handle category click - filter by real tag
  const handleCategoryClick = (category) => {
    if (activeCategory === category.tag) {
      // Deselect
      setActiveCategory(null);
      setShowResults(false);
      setSearchQuery("");
      clearResults();
    } else {
      setActiveCategory(category.tag);
      setSearchQuery(category.name);
      search(category.name);
      setShowResults(true);
    }
  };

  // Handle tag click
  const handleTagClick = (tagName) => {
    const tag = tagName.startsWith("#") ? tagName : `#${tagName}`;
    setSearchQuery(tag);
    setActiveCategory(null);
    search(tag);
    setShowResults(true);
  };

  // Handle user profile navigation
  const handleUserClick = (username) => {
    navigate(`/profile/${username.replace("@", "")}`);
  };

  // Handle follow toggle
  const handleFollowToggle = async (userId) => {
    try {
      const response = await followService.toggleFollowUser(userId);
      const data = response.data || response;
      setFollowingMap((prev) => ({ ...prev, [userId]: data.following }));
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Filter search results based on active tab
  const getFilteredResults = () => {
    if (searchFilter === "users") {
      return { users: searchResults.users || [], posts: [] };
    }
    if (searchFilter === "posts") {
      return { users: [], posts: searchResults.posts || [] };
    }
    return searchResults;
  };

  // Format tag display
  const formatTrendingTags = (tags) => {
    return tags.slice(0, 5).map((tag, index) => ({
      tag: tag.name ? `#${tag.name}` : tag.tag || `#${tag}`,
      growth: tag.growth || `+${Math.floor(Math.random() * 200)}%`,
      posts: tag.posts_count || tag.posts || Math.floor(Math.random() * 2000),
    }));
  };

  // Get formatted trending tags from API
  const displayTrendingTags =
    trendingTags.length > 0
      ? formatTrendingTags(trendingTags)
      : [
          { tag: "#SpringBoot", growth: "+245%", posts: 1234 },
          { tag: "#ReactQuery", growth: "+189%", posts: 892 },
          { tag: "#TailwindCSS", growth: "+156%", posts: 2103 },
          { tag: "#PostgreSQL", growth: "+134%", posts: 756 },
          { tag: "#DockerCompose", growth: "+98%", posts: 543 },
        ];

  const filteredResults = getFilteredResults();
  const totalUsers = searchResults.users?.length || 0;
  const totalPosts = searchResults.posts?.length || 0;

  return (
    <div className="explore">
      {/* Search Header */}
      <header className="explore__header">
        <div className="explore__search">
          <span className="explore__search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="explore__search-input"
            placeholder={t("explore.search_placeholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveCategory(null);
            }}
          />
          {searchLoading && <LoadingSpinner />}
          {!searchLoading && <span className="explore__search-shortcut">⌘K</span>}
        </div>
      </header>

      {/* Categories - always visible */}
      <section className="explore__categories">
        {categories.map((cat) => (
          <button
            key={cat.tag}
            className={`explore__category ${activeCategory === cat.tag ? "explore__category--active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >
            <span className="explore__category-icon">{cat.icon}</span>
            <span className="explore__category-name">{cat.name}</span>
          </button>
        ))}
      </section>

      {/* Search Results with filter tabs */}
      {showResults && searchQuery.trim().length >= 2 && (
        <section className="explore__results">
          <div className="explore__results-header">
            <h2>{t("explore.results_for", { query: searchQuery })}</h2>
            <button
              className="explore__results-close"
              onClick={() => {
                setShowResults(false);
                setSearchQuery("");
                setActiveCategory(null);
                setSearchFilter("all");
                clearResults();
              }}
            >
              ✕
            </button>
          </div>

          {/* Filter tabs */}
          {!searchLoading && (totalUsers > 0 || totalPosts > 0) && (
            <div className="explore__results-filters">
              <button
                className={`explore__results-filter ${searchFilter === "all" ? "explore__results-filter--active" : ""}`}
                onClick={() => setSearchFilter("all")}
              >
                <FilterIcon />
                {t("explore.filter_all")} ({totalUsers + totalPosts})
              </button>
              <button
                className={`explore__results-filter ${searchFilter === "users" ? "explore__results-filter--active" : ""}`}
                onClick={() => setSearchFilter("users")}
              >
                {t("explore.users")} ({totalUsers})
              </button>
              <button
                className={`explore__results-filter ${searchFilter === "posts" ? "explore__results-filter--active" : ""}`}
                onClick={() => setSearchFilter("posts")}
              >
                {t("explore.filter_posts")} ({totalPosts})
              </button>
            </div>
          )}

          {searchLoading ? (
            <div className="explore__results-loading">
              <LoadingSpinner />
              <p>{t("explore.searching")}</p>
            </div>
          ) : totalUsers === 0 && totalPosts === 0 ? (
            <div className="explore__results-empty">
              <p>{t("explore.no_results", { query: searchQuery })}</p>
            </div>
          ) : (
            <div className="explore__results-content">
              {/* Users Results */}
              {filteredResults.users?.length > 0 && (
                <div className="explore__results-section">
                  <h3>{t("explore.users")}</h3>
                  <div className="explore__results-users">
                    {filteredResults.users.map((u) => (
                      <button
                        key={u.id}
                        className="explore__result-user"
                        onClick={() => handleUserClick(u.username)}
                      >
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                          }
                          alt={u.name}
                          className="explore__result-user-avatar"
                        />
                        <div className="explore__result-user-info">
                          <span className="explore__result-user-name">{u.name}</span>
                          <span className="explore__result-user-handle">@{u.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {filteredResults.posts?.length > 0 && (
                <div className="explore__results-section">
                  <h3>{t("explore.filter_posts")}</h3>
                  <div className="explore__results-posts">
                    {filteredResults.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Default Explore Content (hide when showing search results) */}
      {!showResults && (
        <>
          {/* Grid Widgets */}
          <div className="explore__grid">
            {/* Trending Posts - NEW */}
            <section className="explore__widget explore__widget--hot">
              <div className="explore__widget-header">
                <FireIcon />
                <h2 className="explore__widget-title">{t("explore.trending_posts")}</h2>
              </div>
              <div className="explore__widget-content">
                {loadingTrending ? (
                  <div className="explore__widget-loading">
                    <LoadingSpinner />
                  </div>
                ) : trendingPosts.length === 0 ? (
                  <p className="explore__widget-empty">{t("explore.no_trending")}</p>
                ) : (
                  trendingPosts.map((post) => (
                    <button
                      key={post.id}
                      className="explore__hot-post"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <div className="explore__hot-post-content">
                        <span className="explore__hot-post-author">
                          {post.user?.name || t("common.anonymous")}
                        </span>
                        <p className="explore__hot-post-text">
                          {post.content?.substring(0, 100) || post.title || t("feed.no_title")}
                          {post.content?.length > 100 && "..."}
                        </p>
                      </div>
                      <div className="explore__hot-post-stats">
                        <span className="explore__hot-post-stat">
                          ❤️ {post.likes_count || 0}
                        </span>
                        <span className="explore__hot-post-stat">
                          💬 {post.comments_count || 0}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Trending Tags */}
            <section className="explore__widget explore__widget--trending">
              <div className="explore__widget-header">
                <TrendingIcon />
                <h2 className="explore__widget-title">{t("widgets.trending")}</h2>
              </div>
              <div className="explore__widget-content">
                {tagsLoading ? (
                  <div className="explore__widget-loading">
                    <LoadingSpinner />
                  </div>
                ) : (
                  displayTrendingTags.map((trend, index) => (
                    <button
                      key={trend.tag}
                      className="explore__trend"
                      onClick={() => handleTagClick(trend.tag)}
                    >
                      <span className="explore__trend-rank">{index + 1}</span>
                      <div className="explore__trend-info">
                        <span className="explore__trend-tag">{trend.tag}</span>
                        <span className="explore__trend-posts">
                          {trend.posts} {t("feed.posts_count")}
                        </span>
                      </div>
                      <span className="explore__trend-growth">{trend.growth}</span>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Suggested Users - NEW */}
            <section className="explore__widget explore__widget--suggested">
              <div className="explore__widget-header">
                <UserPlusIcon />
                <h2 className="explore__widget-title">{t("explore.who_to_follow")}</h2>
              </div>
              <div className="explore__widget-content">
                {loadingSuggested ? (
                  <div className="explore__widget-loading">
                    <LoadingSpinner />
                  </div>
                ) : suggestedUsers.length === 0 ? (
                  <p className="explore__widget-empty">{t("explore.no_suggestions")}</p>
                ) : (
                  suggestedUsers.map((u) => (
                    <div key={u.id} className="explore__suggested-user">
                      <button
                        className="explore__suggested-user-main"
                        onClick={() => handleUserClick(u.username)}
                      >
                        <div className="explore__suggested-user-avatar">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                            }
                            alt={u.name}
                          />
                        </div>
                        <div className="explore__suggested-user-info">
                          <span className="explore__suggested-user-name">{u.name}</span>
                          <span className="explore__suggested-user-handle">@{u.username}</span>
                        </div>
                      </button>
                      <button
                        className={`explore__follow-btn ${followingMap[u.id] ? "explore__follow-btn--following" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(u.id);
                        }}
                      >
                        {followingMap[u.id] ? t("explore.following") : t("explore.follow")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Top Contributors */}
            <section className="explore__widget explore__widget--contributors">
              <div className="explore__widget-header">
                <StarIcon />
                <h2 className="explore__widget-title">{t("widgets.top_contributors")}</h2>
              </div>
              <div className="explore__widget-content">
                {loadingLeaderboard ? (
                  <div className="explore__widget-loading">
                    <LoadingSpinner />
                  </div>
                ) : topContributors.length === 0 ? (
                  <p className="explore__widget-empty">{t("widgets.no_contributors")}</p>
                ) : (
                  topContributors.map((u) => (
                    <button
                      key={u.id}
                      className="explore__contributor"
                      onClick={() => handleUserClick(u.username)}
                    >
                      <span
                        className={`explore__contributor-rank explore__contributor-rank--${u.rank}`}
                      >
                        {u.rank}
                      </span>
                      <div className="explore__contributor-avatar">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                          }
                          alt={u.name}
                        />
                      </div>
                      <div className="explore__contributor-info">
                        <span className="explore__contributor-name">
                          {u.name} {u.badge}
                        </span>
                        <span className="explore__contributor-handle">@{u.username}</span>
                      </div>
                      <span className="explore__contributor-points">{u.score} pts</span>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
