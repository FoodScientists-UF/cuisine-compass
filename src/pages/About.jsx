import React from "react";
import { Container, Header, Segment, Grid, Image, Card } from "semantic-ui-react";
import sydney from "../layouts/images/sydney.jpeg";
import alexa from "../layouts/images/alexa.jpeg";
import julia from "../layouts/images/julia.jpeg";
import julian from "../layouts/images/julian.jpeg";
import camryn from "../layouts/images/camryn.jpeg";
import value1 from "../layouts/images/value1.jpg";
import value2 from "../layouts/images/value2.jpg";
import value3 from "../layouts/images/value3.jpg";

const About = () => {
  return (
    <Container>
      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "2em"}}>
          Meet the Team
        </Header>
        <Grid columns={5} stackable centered>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={sydney} alt="Sydney Aurelius" />
              <Header as="h4" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "1.5em"}}>Sydney Aurelius</Header>
              <p style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "1.3em"}}>Project Manager</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={alexa} alt="Alexa Gonzalez" />
              <Header as="h4" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "1.5em"}}>Alexa Gonzalez</Header>
              <p style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "1.3em"}}>Frontend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={julia} alt="Julia Chancey" />
              <Header as="h4" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "1.5em"}}>Julia Chancey</Header>
              <p style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "1.3em"}}>Backend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={julian} alt="Julian Ubico" />
              <Header as="h4" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "1.5em"}}>Julian Ubico</Header>
              <p style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "1.3em"}}>Backend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={camryn} alt="Camryn Cimber" />
              <Header as="h4" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "1.5em"}}>Camryn Cimber</Header>
              <p style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "1.3em"}}>Frontend Developer</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>

      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "2em"}}>
          Our Mission
        </Header>
        <p style={{ textAlign: "left", fontSize: "1.5em", fontFamily: '"Abhaya Libre", serif', fontWeight: 400 }}>
        Cuisine Compass empowers individuals to discover, share, and create meals that fit their dietary needs, budget, and lifestyle. Our platform fosters a supportive community where users can exchange recipes, track nutrition, and find inspiration, all while addressing food insecurity—particularly among students. Whether you're navigating dietary restrictions, cooking on a budget, or simply looking to expand your culinary skills, Cuisine Compass is your guide to accessible and inclusive home cooking.
        </p>
      </Segment>

      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange" style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "2em"}}>
          Our Values
        </Header>
        <Card.Group centered itemsPerRow={3}>
          <Card>
            <Image src={value1} alt="Value 1" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "25px" }}>Inclusivity & Accessibility</Card.Header>
              <Card.Description style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}>
              We believe that everyone deserves access to delicious, nutritious meals, regardless of dietary restrictions, budget, or experience level. Cuisine Compass is designed to provide a diverse range of recipes that cater to various lifestyles and needs.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Image src={value2} alt="Value 2" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "25px" }}>Community & Connection</Card.Header>
              <Card.Description style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}>
              Food brings people together, and we are committed to creating a space where users can support one another, share their cooking experiences, and celebrate their culinary creativity.
                </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Image src={value3} alt="Value 3" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 800, fontSize: "25px" }}>Sustainability & Impact</Card.Header>
              <Card.Description style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}>
                
              Cuisine Compass recognizes the role of food in both personal well-being and social responsibility. By helping users make the most of their ingredients and plan meals effectively, we aim to reduce food waste and promote mindful consumption.
                </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Segment>
    </Container>
  );
};

export default About;
