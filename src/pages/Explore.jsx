import React from "react";
import { Container, Card, Image } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import img1 from "../layouts/images/Img1.jpg";
import img2 from "../layouts/images/Img2.jpg";
import img3 from "../layouts/images/Img3.jpg";
import img4 from "../layouts/images/Img4.jpg";
import img5 from "../layouts/images/Img5.jpg";
import "./Explore.css";

const recipes = [
  { id: 1, title: "Spaghetti Carbonara", image: img1, cost: "$$", likes: 25, time: "30 minutes" },
  { id: 2, title: "Avocado Toast", image: img2, cost: "$", likes: 40, time: "10 minutes" },
  { id: 3, title: "Sushi Rolls", image: img3, cost: "$$$", likes: 15, time: "50 minutes" },
  { id: 4, title: "Grilled Steak", image: img4, cost: "$$", likes: 35, time: "45 minutes" },
  { id: 5, title: "Smoothie Bowl", image: img5, cost: "$", likes: 50, time: "15 minutes" },
];

const ExplorePage = () => {
  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image} className="pinterest-image" />
              <div className="overlay">
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.cost}</p>
                  <p>❤ {recipe.likes}</p>
                  <p>{recipe.time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ExplorePage;
