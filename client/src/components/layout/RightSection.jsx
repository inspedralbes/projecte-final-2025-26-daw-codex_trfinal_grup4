import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useTags } from "@/hooks/useTags";
import profileService from "@/services/profileService";
import postsService from "@/services/postsService";
import "./RightSection.css";

const SYMBOLS = "{}[]<>=>/*+-|\\;:!?#@&$%^~_.01";

const GlitchText = ({ children }) => {
  const [displayText, setDisplayText] = useState(children);
  const targetText = String(children);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => {
        return targetText
          .split("")
          .map((char, index) => {
            if (index < iteration) return targetText[index];
            if (char === " ") return " ";
            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          })
          .join("");
      });
      
      iteration += 1;
      if (iteration > targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [children]);

  return <span>{displayText}</span>;
};

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="widget__spinner">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

const TrendingTags = () => {
  const { t } = useTranslation();
  const { tags, loading } = useTags();
  const navigate = useNavigate();
  return (
    <div className="widget">
      <h3 className="widget__title"><GlitchText>{t("widgets.trending")}</GlitchText></h3>
      <div className="widget__list">
        {loading ? <LoadingSpinner /> : tags.length === 0 ? <p className="widget__empty">{t("widgets.no_trends")}</p> : (
          tags.slice(0, 5).map((tag, index) => (
            <button key={tag.id || index} onClick={() => navigate(`/explore?q=${encodeURIComponent(tag.name)}`)} className="trend-item">
              <span className="trend-item__rank">{index + 1}</span>
              <div className="trend-item__content">
                <span className="trend-item__tag">#<GlitchText>{tag.name}</GlitchText></span>
                <span className="trend-item__posts">{tag.posts_count || 0} {t("feed.posts_count")}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const TopContributors = () => {
  const { t } = useTranslation();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await profileService.getLeaderboard(3);
        setContributors(response.data || response || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);
  return (
    <div className="widget">
      <h3 className="widget__title"><GlitchText>{t("widgets.top_contributors")}</GlitchText></h3>
      <div className="widget__list">
        {loading ? <LoadingSpinner /> : contributors.map((user) => (
          <button key={user.id} onClick={() => navigate(`/profile/${user.username}`)} className="user-item">
            <div className="user-item__avatar"><img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.name} /></div>
            <div className="user-item__info">
              <span className="user-item__name"><GlitchText>{user.name}</GlitchText></span>
              <span className="user-item__handle"><GlitchText>@{user.username}</GlitchText></span>
            </div>
            <span className="user-item__points">{user.score} pts</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RecentQuestions = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await postsService.getFeed({ type: "question" });
        const posts = response.data?.data || response.data || response || [];
        setQuestions(Array.isArray(posts) ? posts.slice(0, 3) : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchQuestions();
  }, []);
  return (
    <div className="widget">
      <h3 className="widget__title"><GlitchText>{t("widgets.recent_questions")}</GlitchText></h3>
      <div className="widget__list">
        {loading ? <LoadingSpinner /> : questions.map((q) => (
          <button key={q.id} onClick={() => navigate(`/post/${q.id}`)} className="question-item">
            <span className={`question-item__status ${q.is_solved ? "question-item__status--solved" : ""}`}>{q.is_solved ? "✓" : "?"}</span>
            <div className="question-item__content">
              <span className="question-item__title"><GlitchText>{q.content?.slice(0, 30)}...</GlitchText></span>
              <span className="question-item__author"><GlitchText>@{q.user?.username}</GlitchText></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function RightSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [pageGlitch, setPageGlitch] = useState(false);

  useEffect(() => {
    setPageGlitch(true);
    const timer = setTimeout(() => setPageGlitch(false), 600);
    return () => clearTimeout(timer);
  }, [i18n.language]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/explore?q=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <aside 
      key={i18n.language}
      className={`right-section ${pageGlitch ? 'right-section--glitch' : ''}`}
    >
      <div className="right-section__container">
        <div className="search-box">
          <span className="search-box__icon"><SearchIcon /></span>
          <input type="text" className="search-box__input" placeholder={t("common.search_placeholder_codex")} onKeyDown={handleSearch} />
          <span className="search-box__shortcut">⌘K</span>
        </div>
        <TrendingTags />
        <TopContributors />
        <RecentQuestions />
        <footer className="right-section__footer">
          <a href="#"><GlitchText>{t("footer.terms")}</GlitchText></a>
          <a href="#"><GlitchText>{t("footer.privacy")}</GlitchText></a>
          <a href="#"><GlitchText>{t("footer.cookies")}</GlitchText></a>
          <a href="#"><GlitchText>{t("footer.help")}</GlitchText></a>
          <span>© 2026 Codex</span>
        </footer>
      </div>
    </aside>
  );
}
