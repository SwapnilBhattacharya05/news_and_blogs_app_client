import Calendar from "./Calendar";
import "./News.css";
import Weather from "./Weather";
import userImg from "../assets/images/user.jpg";
import noImg from "../assets/images/no-img.png";
import axios from "axios";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchNews = async () => {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${
        import.meta.env.VITE_REACT_APP_NEWS_API_KEY
      }`;
      const res = await axios.get(url);
      // console.log(res);

      const fetchedNews = res.data.articles;
      // console.log(fetchedNews);

      fetchedNews.forEach((article) => {
        if (!article.image) {
          article.image = noImg;
        }
      });

      setHeadline(fetchedNews[0]);
      setNews(fetchedNews.slice(1, 7)); // GETTING 6 ARTICLES
      // console.log(news);
    };

    fetchNews();
  }, [selectedCategory]);

  const handleCategoryClick = (e, category) => {
    e.preventDefault(); // e => EVENT OBJECT
    setSelectedCategory(category);
  };

  return (
    <div className="news">
      <header className="news-header">
        <h1 className="logo">News & Blogs</h1>
        <div className="search-bar">
          <form>
            <input type="text" placeholder="Search News..." name="" id="" />
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
              <a href="" className="nav-link">
                Bookmarks <i className="fa-regular fa-bookmark"></i>
              </a>
            </div>
          </nav>
        </div>

        <div className="news-section">
          {headline && (
            <div className="headline">
              <img src={headline?.urlToImage || noImg} alt={headline?.title} />
              <h2 className="headline-title">
                {headline?.title}
                <i className="fa-regular fa-bookmark bookmark"></i>
              </h2>
            </div>
          )}
          <div className="news-grid">
            {news.map((article, index) => (
              <div key={index} className="news-grid-item">
                <img src={article.urlToImage || noImg} alt={article.title} />
                <h3>
                  {article.title}
                  <i className="fa-regular fa-bookmark bookmark"></i>
                </h3>
              </div>
            ))}
          </div>
        </div>

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
