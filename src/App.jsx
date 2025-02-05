import { useState } from "react";
import CuisineCompass from "./layouts/CuisineCompass";
import PageWrapper from "./components/PageWrapper";
import 'semantic-ui-css/semantic.min.css'
import "./App.css";
import MenuBar from "./layouts/MenuBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <PageWrapper>
      <MenuBar />
      <CuisineCompass />
    </PageWrapper>
  );
}

export default App;
