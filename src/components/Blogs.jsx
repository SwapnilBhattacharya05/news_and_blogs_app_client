import { useEffect, useState } from "react";
import userImg from "../assets/images/user.jpg";
import noImg from "../assets/images/no-img.png";
import "./Blogs.css";

import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

import { IKContext, IKUpload } from "imagekitio-react";

import { toast } from "react-toastify";

const Blogs = ({ onBack, onCreateBlog, editPost, isEditing }) => {
  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setUploading] = useState(false);

  const { user, logout } = useAuth0();

  useEffect(() => {
    if (isEditing && editPost) {
      setImage(editPost.image);
      setTitle(editPost.title);
      setContent(editPost.content);
      setShowForm(true);
    } else {
      setImage(null);
      setTitle("");
      setContent("");
      setShowForm(false);
    }
  }, [isEditing, editPost]);

  // TRACK OF VALIDATION STATUS
  const [titleValid, setTitleValid] = useState(true);
  const [contentValid, setContentValid] = useState(true);

  // const handleImageChange = (e) => {
  //   // CHECK IF ANY FILES SELECTED BY USER
  //   // LIST OF ALL THE FILES SELECTED BY USER AND GET THE FIRST ONE
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const maxSize = 1 * 1024 * 1024;

  //     if (file.size > maxSize) {
  //       alert("File size exceeds 1 MB");
  //       return;
  //     }

  //     // READ THE FILE'S CONTENT SELECTED BY USER
  //     const reader = new FileReader();

  //     // EVENT TRIGGERED WHEN FILE READING OPERATION COMPLETED
  //     reader.onload = () => {
  //       // CONTAINS THE BASE64 ENCODED FILE CONTENT
  //       setImage(reader.result);
  //     };

  //     // READ THE FILE CONTENT AND CONVERTS IT TO BASE64 ENCODED STRING
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleUploadSuccess = (res) => {
    setUploading(false);
    toast.success("Image uploaded successfully");
    console.log(`Upload Success URL: ${JSON.stringify(res, null, 2)}`);
    setImage(res.url); // STORE THE URL OF UPLOADED IMAGE
  };

  const handleUploadError = (err) => {
    setUploading(false);
    toast.error("Image upload failed!");
    console.log(`Upload Error: ${err}`);
  };

  const authenticator = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/images/auth`
      );
      console.log("Auth Response:", response.data);
      const { expire, signature, token } = response.data.data;
      return { expire, signature, token };
    } catch (error) {
      console.error("Error authenticating with ImageKit:", error);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setTitleValid(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setContentValid(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      if (!title) setTitleValid(false);
      if (!content) setContentValid(false);
      return;
    }

    const newBlog = {
      image: image || noImg,
      title,
      content,
      auth0Id: user.sub, // Pass Auth0 ID for user association
    };

    try {
      if (isEditing && editPost) {
        // If editing, send PUT request to update existing blog
        await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs/${
            editPost._id
          }`,
          newBlog
        );
      } else {
        // If creating, send POST request to create new blog
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/blogs`,
          newBlog
        );
      }

      setImage(null);
      setTitle("");
      setContent("");
      setShowForm(false);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        onBack();
      }, 3000);
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  return (
    <div className="blogs">
      <div className="blogs-left">
        <img src={user.picture || userImg} alt="user" />

        {/* Logout Button */}
        <button
          className="logout-btn"
          onClick={() => logout({ returnTo: window.location.origin })}
          disabled={isUploading}
        >
          Logout
        </button>
      </div>
      <div className="blogs-right">
        {!showForm && !submitted && (
          <button className="post-btn" onClick={() => setShowForm(true)}>
            Create New Post
          </button>
        )}
        {submitted && (
          <p className="submission-message">
            {isEditing ? "Post Updated!" : "Post Published!"}
          </p>
        )}
        <div className={`blogs-right-form ${showForm ? "visible" : "hidden"}`}>
          <h1>{isEditing ? "Edit Post" : "New Post"}</h1>
          <form onSubmit={handleSubmit}>
            <div className="img-upload">
              <label htmlFor="file-upload" className="file-upload">
                <i className="bx bx-upload"></i> Upload Image
              </label>
              <IKContext
                publicKey={import.meta.env.VITE_REACT_APP_IMAGEKIT_PUBLIC_KEY}
                urlEndpoint={
                  import.meta.env.VITE_REACT_APP_IMAGEKIT_URL_ENDPOINT
                }
                authenticator={authenticator}
              >
                <IKUpload
                  className="file-input"
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  multiple={false}
                  type="image/*"
                  name="image"
                  id="file-upload"
                  folder="blog_app/images"
                  onUploadStart={() => setUploading(true)}
                />
              </IKContext>
            </div>
            <input
              type="text"
              placeholder="Add Title (Max 60 Characters)"
              className={`title-input ${!titleValid ? "invalid" : ""}`}
              value={title}
              onChange={handleTitleChange}
              maxLength={60}
            />
            <textarea
              className={`text-input ${!contentValid ? "invalid" : ""}`}
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
            />
            <button type="submit" className="submit-btn" disabled={isUploading}>
              {isEditing ? "Update Post" : "Publish Post"}
            </button>
          </form>
        </div>

        <button
          className="blogs-close-btn"
          onClick={onBack}
          disabled={isUploading}
        >
          Back <i className="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Blogs;
