import Calendar from "./Calendar";
import "./News.css";
import Weather from "./Weather";
import userImg from "../assets/images/user.jpg";
import noImg from "../assets/images/no-img.png";
import axios from "axios";
import { useEffect, useState } from "react";

import NewsModal from "./NewsModal";
import Bookmarks from "./Bookmarks";

import blogImg1 from "../assets/images/blog1.jpg";
import blogImg2 from "../assets/images/blog2.jpg";
import blogImg3 from "../assets/images/blog3.jpg";
import blogImg4 from "../assets/images/blog4.jpg";
import BlogsModal from "./BlogsModal";

const categories = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
];

const News = ({ onShowBlogs, blogs, onEditBlog, onDeleteBlog }) => {
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

  const [selectedPost, setSelectedPost] = useState(null);

  const [showBlogModal, setShowBlogModal] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      let url = `https://gnews.io/api/v4/top-headlines?category=${selectedCategory}&lang=en&country=us&max=10&apikey=${
        import.meta.env.VITE_REACT_APP_GNEWS_API_KEY
      }`;

      if (searchQuery) {
        url = `https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&country=us&max=10&apikey=${
          import.meta.env.VITE_REACT_APP_GNEWS_API_KEY
        }`;
      }
      const res = await axios.get(url);
      // console.log(res);

      const fetchedNews = res.data.articles;
      // console.log(fetchedNews);

      fetchedNews.forEach((article) => {
        // console.log(article);
        if (!article.image) {
          article.image = noImg;
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

  const handleBlogClick = (blog) => {
    setSelectedPost(blog);
    setShowBlogModal(true);
  };

  const closeBlogModal = () => {
    setShowBlogModal(false);
    setSelectedPost(null);
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
          <div className="user" onClick={onShowBlogs}>
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
              <img src={headline?.image || noImg} alt={headline?.title} />
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
                  src={article.image || noImg}
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

        <div className="my-blogs">
          <h1 className="my-blogs-heading">My Blogs</h1>
          <div className="blog-posts">
            {blogs.map((blog, index) => (
              <div
                key={index}
                className="blog-post"
                onClick={() => handleBlogClick(blog)}
              >
                <img src={blog.image || noImg} alt={blog.title} />
                <h3>{blog.title}</h3>
                {/* <p>{blog.content}</p> */}
                <div className="post-buttons">
                  <button
                    className="edit-post"
                    onClick={() => onEditBlog(blog)}
                  >
                    <i className="bx bxs-edit"></i>
                  </button>
                  <button
                    className="delete-post"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBlog(blog);
                    }}
                  >
                    <i className="bx bxs-x-circle"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {selectedPost && showBlogModal && (
            <BlogsModal
              show={showBlogModal}
              blog={selectedPost}
              onClose={closeBlogModal}
            />
          )}
        </div>
        <div className="weather-calendar">
          <Weather />
          <Calendar />
        </div>
      </div>
      <footer className="news-footer">
        <p>
          <span>News & Blogs App</span>
        </p>
        <p>&copy; All Rights Reserved. By Swapnil Bhattacharya</p>
      </footer>
    </div>
  );
};

export default News;
