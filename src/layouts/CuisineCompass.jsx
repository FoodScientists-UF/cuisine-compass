import React from "react";
import { Container, Card, Image } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import MenuBar from "./MenuBar";
import img1 from "./images/Img1.jpg";
import img2 from "./images/Img2.jpg";
import img3 from "./images/Img3.jpg";
import img4 from "./images/Img4.jpg";
import img5 from "./images/Img5.jpg";
import "./CuisineCompass.css"; // Import external CSS for better layout control

const recipes = [
  { id: 1, title: "Spaghetti Carbonara", image: img1 },
  { id: 2, title: "Avocado Toast", image: img2 },
  { id: 3, title: "Sushi Rolls", image: img3 },
  { id: 4, title: "Grilled Steak", image: img4 },
  { id: 5, title: "Smoothie Bowl", image: img5 },
];

const CuisineCompass = () => {
  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="pinterest-card">
            <Image src={recipe.image} className="pinterest-image" />
            <Card.Content>
              <Card.Header>{recipe.title}</Card.Header>
            </Card.Content>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default CuisineCompass;
