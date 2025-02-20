import React from "react";
import { Container, Header, Segment, Grid, Image, Card } from "semantic-ui-react";
import sydney from "../layouts/images/sydney.jpeg";
import alexa from "../layouts/images/alexa.jpeg";
import julia from "../layouts/images/julia.jpeg";
import julian from "../layouts/images/julian.jpeg";
import camryn from "../layouts/images/camryn.jpeg";
import img1 from "../layouts/images/Img1.jpg";

const About = () => {
  return (
    <Container>
      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange">
          Meet the Team
        </Header>
        <Grid columns={5} stackable centered>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={sydney} alt="Sydney Aurelius" />
              <Header as="h4">Sydney Aurelius</Header>
              <p>Project Manager</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={alexa} alt="Alexa Gonzalez" />
              <Header as="h4">Alexa Gonzalez</Header>
              <p>Frontend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={julia} alt="Julia Chancey" />
              <Header as="h4">Julia Chancey</Header>
              <p>Backend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={julian} alt="Julian Ubico" />
              <Header as="h4">Julian Ubico</Header>
              <p>Backend Developer</p>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Image centered circular size="small" src={camryn} alt="Camryn Cimber" />
              <Header as="h4">Camryn Cimber</Header>
              <p>Frontend Developer</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>

      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange">
          Our Mission
        </Header>
        <p style={{ textAlign: "left", fontSize: "1.2em" }}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
          industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </p>
      </Segment>

      <Segment padded="very" vertical>
        <Header as="h2" textAlign="left" color="orange">
          Our Values
        </Header>
        <Card.Group centered itemsPerRow={3}>
          <Card>
            <Image src={img1} alt="Value 1" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header>Lorem Ipsum</Card.Header>
              <Card.Description>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Image src={img1} alt="Value 2" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header>Lorem Ipsum</Card.Header>
              <Card.Description>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card>
            <Image src={img1} alt="Value 3" wrapped ui={false} />
            <Card.Content textAlign="center">
              <Card.Header>Lorem Ipsum</Card.Header>
              <Card.Description>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Segment>
    </Container>
  );
};

export default About;
