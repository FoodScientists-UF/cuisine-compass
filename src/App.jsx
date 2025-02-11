import CuisineCompass from "./layouts/CuisineCompass";
import PageWrapper from "./components/PageWrapper";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import MenuBar from "./layouts/MenuBar";

function App() {
  return (
    <>
      <PageWrapper>
        <MenuBar />
        <CuisineCompass />
      </PageWrapper>
    </>
  );
}

export default App;
