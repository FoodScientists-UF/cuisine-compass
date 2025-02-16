import React from "react";
import { Container, Card, Image } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
// import MenuBar from "../../components/MenuBar";
import "./CuisineCompass.css"; // Import external CSS for better layout control

const recipes = [
  { id: 1, title: "Spaghetti Carbonara", image: "/images/Img1.jpg" },
  { id: 2, title: "Avocado Toast", image: "/images/Img2.jpg" },
  { id: 3, title: "Sushi Rolls", image: "/images/Img3.jpg" },
  { id: 4, title: "Grilled Steak", image: "/images/Img4.jpg" },
  { id: 5, title: "Smoothie Bowl", image: "/images/Img5.jpg" },
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
