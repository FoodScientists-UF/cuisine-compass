import React, { useState } from "react";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import "semantic-ui-css/semantic.min.css";
import img1 from "../layouts/images/Img1.jpg";
import img2 from "../layouts/images/Img2.jpg";
import img3 from "../layouts/images/Img3.jpg";
import img4 from "../layouts/images/Img4.jpg";
import img5 from "../layouts/images/Img5.jpg";
import "./Explore.css";

const recipes = [
  { id: 1, title: "Spaghetti Carbonara", chef: "@ju_chancey", image: img1, cost: "$$", likes: 25, time: "30 minutes", tags: [] },
  { id: 2, title: "Avocado Toast", chef: "@sydaurelius", image: img2, cost: "$", likes: 40, time: "10 minutes", tags: ["Vegetarian"] },
  { id: 3, title: "Sushi Rolls", chef: "@julian.ubico", image: img3, cost: "$$$", likes: 15, time: "50 minutes", tags: [] },
  { id: 4, title: "Grilled Steak", chef: "@alexa.gonz", image: img4, cost: "$$", likes: 35, time: "45 minutes", tags: [] },
  { id: 5, title: "Smoothie Bowl", chef: "@cam_cimber", image: img5, cost: "$", likes: 50, time: "15 minutes", tags: ["Gluten-Free"] },
];

const ExplorePage = () => {
  const [bookmarked, setBookmarked] = useState({});

  const toggleBookmark = (id) => {
    setBookmarked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image} className="pinterest-image" />
              <div className="bookmark-icon" onClick={() => toggleBookmark(recipe.id)}>
                {bookmarked[recipe.id] ? <FaBookmark size={20} color="white" /> : <FaRegBookmark size={20} color="white" />}
              </div>
              <div className="overlay">
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.chef}</p>
                  {recipe.tags.length > 0 && (
                    <div className="tags">
                      {recipe.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p>{recipe.cost}</p>
                  <p>❤ {recipe.likes}</p>
                  <p>🕒 {recipe.time}</p>
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
