import CuisineCompass from "./pages/Explore Page/CuisineCompass.jsx";
// import PageWrapper from "./components/PageWrapper";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import MenuBar from "./components/MenuBar"; 

function App() {
  return (
    <>
      {/* <PageWrapper> */}
        <MenuBar />
        <CuisineCompass />
      {/* </PageWrapper> */}
    </>
  );
}

export default App;
