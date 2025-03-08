import { useEffect, useState } from "react";
import Blogs from "./components/Blogs";
import News from "./components/News";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation, useNavigate } from "react-router-dom";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [showNews, setShowNews] = useState(true);
  const [showBlogs, setShowBlogs] = useState(false);

  // LIST OF BLOGS AND DEFINE FUNCTION TO ADD BLOGS
  const [blogs, setBlogs] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
    setBlogs(savedBlogs);
  }, []);

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
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (location.pathname === "/logout") {
      setShowNews(true);
      setShowBlogs(false);
      setIsEditing(false);
      setSelectedPost(null);

      // Redirect back to the home page ("/") after handling logout
      navigate("/");
    }
  }, [location, navigate]);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs`
      ); // Change to your actual backend URL
      setBlogs(response.data); // Assuming response contains the list of blogs
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };
  // FETCHING ALL THE BLOGS
  useEffect(() => {
    if (isAuthenticated) return fetchBlogs();
  }, [isAuthenticated]); // FETCHES BLOGS WHEN USER IS LOGGED IN

  const handleCreateBlog = async (newBlog, isEdit) => {
    try {
      let response;

      if (isEdit) {
        response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs/${
            selectedPost._id
          }`,
          newBlog
        );

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === selectedPost._id ? response.data : blog
          )
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs`,
          newBlog
        );

        setBlogs((prevBlogs) => [response.data, ...prevBlogs]);
      }

      // Fetch the latest blogs from the backend after update/create
      fetchBlogs();
    } catch (error) {
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
    } catch (error) {
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
