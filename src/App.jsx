import { useEffect, useState } from "react";
import Blogs from "./components/Blogs";
import News from "./components/News";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";
import noImg from "./assets/images/no-img.png";
import { toast } from "react-toastify";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [showNews, setShowNews] = useState(true);
  const [showBlogs, setShowBlogs] = useState(false);

  // LIST OF BLOGS AND DEFINE FUNCTION TO ADD BLOGS
  const [blogs, setBlogs] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      axios
        .post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/users/login`,
          {
            auth0Id: user.sub,
            name: user.name,
            email: user.email,
            picture: user.picture,
          }
        )
        .then((res) => console.log("User logged in:", res.data))
        .catch((err) => console.error("Error logging in:", err));
      navigate("/", { replace: true });
      window.history.replaceState(null, "", "/");

      setTimeout(() => {
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = () => {
          window.history.pushState(null, "", window.location.href);
        };
      }, 0);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location.pathname === "/logout") {
      setShowNews(true);
      setShowBlogs(false);
      setIsEditing(false);
      setSelectedPost(null);

      // Redirect back to the home page ("/") after handling logout
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs`
      );
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };
  // FETCHING ALL THE BLOGS
  useEffect(() => {
    const fetchData = async () => {
      await fetchBlogs();
    };
    fetchData();
  }, []);

  const handleCreateBlog = async (newBlog, isEdit) => {
    try {
      let response;

      if (isEdit) {
        // ENSURE UPDATED BLOG RETAINS OR UPDATES THE IMAGE
        const updatedBlog = {
          ...selectedPost,
          ...newBlog,
          image: newBlog.image || selectedPost.image || noImg,
        };
        response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs/${
            selectedPost._id
          }`,
          updatedBlog
        );

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === selectedPost._id ? response.data : blog
          )
        );
      } else {
        // ENSURE NEW BLOG HAS AN IMAGE
        const newBlogWithImage = { ...newBlog, image: newBlog.image || noImg };
        response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs`,
          newBlogWithImage
        );

        setBlogs((prevBlogs) => [response.data, ...prevBlogs]);
      }

      // FETCH LATEST BLOG FROM BACKEND
      fetchBlogs();
    } catch (error) {
      toast.error("Error creating blog");
      console.error("Error creating blog:", error);
    }
    setIsEditing(false);
    setSelectedPost(null);
  };

  const handleEditBlog = (blog) => {
    setSelectedPost(blog);
    setIsEditing(true);
    setShowNews(false);
    setShowBlogs(true);
  };

  const handleDeleteBlog = async (blogToDelete) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs/${
          blogToDelete._id
        }`,
        {
          headers: {
            Authorization: `Bearer ${user.sub}`, // Pass Auth0 ID for user association
          },
        }
      );
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog._id !== blogToDelete._id)
      );
      toast.warn("Blog deleted successfully");
    } catch (error) {
      toast.error("Error deleting blog");
      console.error("Error deleting blog:", error);
    }
  };

  const handleShowBlogs = () => {
    setShowNews(false);
    setShowBlogs(true);
  };

  const handleBackToNews = () => {
    setShowNews(true);
    setShowBlogs(false);
    setIsEditing(false);
    setSelectedPost(null);
    fetchBlogs();
  };

  return (
    <div className="container">
      <div className="news-blogs-app">
        {showNews && (
          <News
            onShowBlogs={handleShowBlogs}
            blogs={blogs}
            onEditBlog={handleEditBlog}
            onDeleteBlog={handleDeleteBlog}
          />
        )}
        {showBlogs && (
          <Blogs
            onBack={handleBackToNews}
            onCreateBlog={handleCreateBlog}
            editPost={selectedPost}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default App;
