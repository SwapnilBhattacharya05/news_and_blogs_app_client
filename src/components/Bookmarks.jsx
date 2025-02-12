import "./Bookmarks.css";
import "./Modal.css";
import noImg from "../assets/images/no-img.png";

const Bookmarks = ({
  show,
  bookmarks,
  onClose,
  onSelectArticle,
  onDeleteBookmark,
}) => {
  if (!show) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </span>
        <h2 className="booksmarks-heading">Bookmarked News</h2>
        <div className="bookmarks-list">
          {bookmarks.map((article, index) => (
            <div
              key={index}
              onClick={() => {
                onSelectArticle(article);
                onClose();
              }}
              className="bookmark-item"
            >
              <img
                src={article.urlToImage || noImg}
                alt={article.title}
                onError={(e) => (e.target.src = noImg)}
              />
              <h3>
                {article.title.length > 50
                  ? article.title.slice(0, 50) + "..."
                  : article.title}
              </h3>
              <span
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBookmark(article);
                }}
              >
                <i className="fa-regular fa-circle-xmark"></i>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
