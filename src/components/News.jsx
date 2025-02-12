import Calendar from "./Calendar";
import "./News.css";
import Weather from "./Weather";
import userImg from "../assets/images/user.jpg";
import noImg from "../assets/images/no-img.png";
import axios from "axios";
import { useEffect, useState } from "react";

import NewsModal from "./NewsModal";
import Bookmarks from "./Bookmarks";

const categories = [
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
];

const News = () => {
  const [headline, setHeadline] = useState(null);

  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("general");

  // CONTROL OF MODAL POPUP
  const [showModal, setShowModal] = useState(false);

  // HOLD DETAULS OF CURRENTLY SELECTED ARTICLE
  const [selectedArticle, setSelectedArticle] = useState(null);

  // HOLDS CURRENT VALUE OF THE SEARCH BAR AS THE USER TYPES
  const [searchInput, setSearchInput] = useState("");

  //  HOLDS THE VALUE THAT WILL BE ACTUALLY USED TO FETCH DATA FROM THE API
  const [searchQuery, setSearchQuery] = useState("");

  // KEEP TRACK OF BOOKMARKED ITEM
  const [bookmarks, setBookmarks] = useState([]);

  // CONTROL OF BOOKMARKS MODAL
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      let url = `https://newsapi.org/v2/top-headlines?country=us&language=en&category=${selectedCategory}&apiKey=${
        import.meta.env.VITE_REACT_APP_NEWS_API_KEY
      }`;

      if (searchQuery) {
        url = `https://newsapi.org/v2/everything?q=${searchQuery}&language=en&sortBy=popularity&apiKey=${
          import.meta.env.VITE_REACT_APP_NEWS_API_KEY
        }`;
      }
      const res = await axios.get(url);
      // console.log(res);

      const fetchedNews = res.data.articles;
      // console.log(fetchedNews);

      fetchedNews.forEach((article) => {
        // console.log(article);
        if (!article.urlToImage) {
          article.urlToImage = noImg;
        }
      });
      setNews(fetchedNews.slice(1, 7)); // GETTING 6 ARTICLES
      setHeadline(fetchedNews[0]);
      // console.log(news);

      // PARSE => USED TO CONVERT STRING TO JS OBJECT
      const savedBookmarks =
        JSON.parse(localStorage.getItem("bookmarks")) || [];
      setBookmarks(savedBookmarks);
    };

    fetchNews();
  }, [searchQuery, selectedCategory]);

  const handleCategoryClick = (e, category) => {
    e.preventDefault(); // e => EVENT OBJECT
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);

    // SET TO EMPTY STRING CLEAR SEARCH BAR
    setSearchInput("");
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
    // console.log(article);
  };

  const handleBookmarkClick = (article) => {
    setBookmarks((prevBookMarks) => {
      const updatedBookmarks = prevBookMarks.find(
        (bookmark) => bookmark.title === article.title
      )
        ? prevBookMarks.filter((bookmark) => bookmark.title !== article.title)
        : [...prevBookMarks, article];
      // ?JSON.stringify() => CONVERTS JS OBJECT TO STRING
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks)); // TODO: CHANGE IT TO MONGODB LATER
      return updatedBookmarks;
    });
  };

  return (
    <div className="news">
      <header className="news-header">
        <h1 className="logo">News & Blogs</h1>
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search News..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
      </header>
      <div className="news-content">
        {/* NAVBAR */}
        <div className="navbar">
          <div className="user">
            <img src={userImg} alt="User avatar" />
            <p>Swapnil&apos;s Blog</p>
          </div>
          <nav className="categories">
            <h1 className="nav-heading">Categories</h1>
            <div className="nav-links">
              {categories.map((category) => (
                <a
                  href="#"
                  key={category}
                  className="nav-link"
                  onClick={(e) => handleCategoryClick(e, category)}
                >
                  {category}
                </a>
              ))}
              <a
                href="#"
                className="nav-link"
                onClick={() => setShowBookmarksModal(true)}
              >
                Bookmarks <i className="fa-solid fa-bookmark"></i>
              </a>
            </div>
          </nav>
        </div>

        <div className="news-section">
          {headline && (
            <div
              className="headline"
              onClick={() => handleArticleClick(headline)}
            >
              <img src={headline?.urlToImage || noImg} alt={headline?.title} />
              <h2 className="headline-title">
                {headline?.title}
                <i
                  className={`${
                    bookmarks.some(
                      (bookmark) => bookmark.title === headline.title
                    )
                      ? "fa-solid"
                      : "fa-regular"
                  } fa-bookmark bookmark`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkClick(headline);
                  }}
                ></i>
              </h2>
            </div>
          )}
          <div className="news-grid">
            {news.map((article, index) => (
              <div
                key={index}
                className="news-grid-item"
                onClick={() => handleArticleClick(article)}
              >
                <img
                  src={article.urlToImage || noImg}
                  alt={article.title}
                  // !HANDLE BROKEN IMAGE LINKS
                  onError={(e) => (e.target.src = noImg)}
                />
                <h3>
                  {article.title}
                  <i
                    className={`${
                      bookmarks.some(
                        (bookmark) => bookmark.title === article.title
                      )
                        ? "fa-solid"
                        : "fa-regular"
                    } fa-bookmark bookmark`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkClick(article);
                    }}
                  ></i>
                </h3>
              </div>
            ))}
          </div>
        </div>
        <NewsModal
          show={showModal}
          article={selectedArticle}
          onClose={() => setShowModal(false)}
        />
        <Bookmarks
          // CONTROL MODAL VISIBILITY
          show={showBookmarksModal}
          // PASS BOOKMARKS
          bookmarks={bookmarks}
          // HANDLE CLOSE
          onClose={() => setShowBookmarksModal(false)}
          // HANDLE SELECTION OF ARTICLES FROM BOOKMARKS
          onSelectArticle={handleArticleClick}
          // HANDLE DELETE OF ARTICLE FROM BOOKMARKS
          onDeleteBookmark={handleBookmarkClick}
        />

        <div className="my-blogs">My Blogs</div>
        <div className="weather-calendar">
          <Weather />
          <Calendar />
        </div>
      </div>
      <footer className="news-footer">Footer</footer>
    </div>
  );
};

export default News;
