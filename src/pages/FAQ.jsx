import React from "react";
import { Header, Container } from "semantic-ui-react";

const FAQ = () => {
  return (
    <Container className="px-4 py-8 max-w-4xl mx-auto">

        <Header as="h2" textAlign="center" color="orange" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "2em"}}>
          How to Use Cuisine Compass
        </Header>

      <section className="mb-12">
        <Header as="p" style={{ textAlign: "left", fontSize: "1.8em", fontFamily: '"Abhaya Libre", serif', fontWeight: 400 }} color="orange">
        Getting Started
        </Header>
        <ul style={{ textAlign: "left", fontSize: "1.3em", fontFamily: '"Abhaya Libre", serif', fontWeight: 400 }}>
          <li>Create an account or log in to get started.</li>
          <li>Set up your profile with dietary preferences and goals.</li>
          <li>Explore recipes tailored to your tastes and nutritional needs.</li>
          <li>Save your favorite recipes to personalized collections.</li>
          <li>Track your meals with our built-in Nutrient Tracker.</li>
        </ul>
      </section>

      <section>
        <Header as="h2" className="text-2xl font-bold mb-4" style={{ textAlign: "left", fontSize: "1.8em", fontFamily: '"Abhaya Libre", serif', fontWeight: 400 }} color="orange">Frequently Asked Questions</Header>
        <div className="space-y-6 text-gray-700" style={{ textAlign: "left", fontSize: "1.3em", fontFamily: '"Abhaya Libre", serif', fontWeight: 400 }} color="orange">
          <div>
            <h3 className="font-semibold">Can I create my own recipes?</h3>
            <p>Yes! Head to the "Create a Recipe" page under your profile to build and save your own creations.</p>
          </div>
          <div>
            <h3 className="font-semibold">How do I follow other users?</h3>
            <p>Use the onboarding or "Following" page to search and follow chefs or friends whose recipes you love.</p>
          </div>
          <div>
            <h3 className="font-semibold">Is my nutrition data saved?</h3>
            <p>Yes, your daily logs are stored securely and can be reviewed at any time through the Nutrient Tracker page.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I share recipes with others?</h3>
            <p>Absolutely! Each recipe has a unique link you can copy and send to friends, or share within the platform.</p>
          </div>
          <div>
            <h3 className="font-semibold">How are recommendations personalized?</h3>
            <p>We take your dietary preferences, goals, and previous interactions into account to suggest recipes that match your profile.</p>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default FAQ;
