import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useTags } from "@/hooks/useTags";
import profileService from "@/services/profileService";
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

export default function Explore() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Static categories for browsing
  const categories = [
    { name: t("explore.categories.frontend"), icon: "🎨" },
    { name: t("explore.categories.backend"), icon: "⚙️" },
    { name: t("explore.categories.devops"), icon: "🚀" },
    { name: t("explore.categories.databases"), icon: "🗄️" },
    { name: t("explore.categories.mobile"), icon: "📱" },
    { name: t("explore.categories.security"), icon: "🔒" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [topContributors, setTopContributors] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

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

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    setSearchQuery(categoryName);
    search(categoryName);
    setShowResults(true);
  };

  // Handle tag click
  const handleTagClick = (tagName) => {
    const tag = tagName.startsWith("#") ? tagName : `#${tagName}`;
    setSearchQuery(tag);
    search(tag);
    setShowResults(true);
  };

  // Handle user profile navigation
  const handleUserClick = (username) => {
    navigate(`/profile/${username.replace("@", "")}`);
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchLoading && <LoadingSpinner />}
          {!searchLoading && <span className="explore__search-shortcut">⌘K</span>}
        </div>
      </header>

      {/* Search Results */}
      {showResults && searchQuery.trim().length >= 2 && (
        <section className="explore__results">
          <div className="explore__results-header">
            <h2>{t("explore.results_for", { query: searchQuery })}</h2>
            <button
              className="explore__results-close"
              onClick={() => {
                setShowResults(false);
                setSearchQuery("");
                clearResults();
              }}
            >
              ✕
            </button>
          </div>

          {searchLoading ? (
            <div className="explore__results-loading">
              <LoadingSpinner />
              <p>{t("explore.searching")}</p>
            </div>
          ) : searchResults.posts?.length === 0 && searchResults.users?.length === 0 ? (
            <div className="explore__results-empty">
              <p>{t("explore.no_results", { query: searchQuery })}</p>
            </div>
          ) : (
            <div className="explore__results-content">
              {/* Users Results */}
              {searchResults.users?.length > 0 && (
                <div className="explore__results-section">
                  <h3>{t("explore.users")}</h3>
                  <div className="explore__results-users">
                    {searchResults.users.map((user) => (
                      <button
                        key={user.id}
                        className="explore__result-user"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <img
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                          }
                          alt={user.name}
                          className="explore__result-user-avatar"
                        />
                        <div className="explore__result-user-info">
                          <span className="explore__result-user-name">{user.name}</span>
                          <span className="explore__result-user-handle">@{user.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {searchResults.posts?.length > 0 && (
                <div className="explore__results-section">
                  <h3>{t("feed.posts_count")}</h3>
                  <div className="explore__results-posts">
                    {searchResults.posts.map((post) => (
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
          {/* Categories */}
          <section className="explore__categories">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="explore__category"
                onClick={() => handleCategoryClick(cat.name)}
              >
                <span className="explore__category-icon">{cat.icon}</span>
                <span className="explore__category-name">{cat.name}</span>
              </button>
            ))}
          </section>

          {/* Grid Widgets */}
          <div className="explore__grid">
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
                  topContributors.map((user) => (
                    <button
                      key={user.id}
                      className="explore__contributor"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <span
                        className={`explore__contributor-rank explore__contributor-rank--${user.rank}`}
                      >
                        {user.rank}
                      </span>
                      <div className="explore__contributor-avatar">
                        <img
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                          }
                          alt={user.name}
                        />
                      </div>
                      <div className="explore__contributor-info">
                        <span className="explore__contributor-name">
                          {user.name} {user.badge}
                        </span>
                        <span className="explore__contributor-handle">@{user.username}</span>
                      </div>
                      <span className="explore__contributor-points">{user.score} pts</span>
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
