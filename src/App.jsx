import Blogs from "./components/Blogs";
import News from "./components/News";

const App = () => {
  return (
    <div className="container">
      <div className="news-blogs-app">
        {/* <News /> */}
        <Blogs />
      </div>
    </div>
  );
};

export default App;
