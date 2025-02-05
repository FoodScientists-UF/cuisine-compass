import React, { Component } from "react";
import { Menu, Input, Button, Image, Container } from "semantic-ui-react";
import logo from "../layouts/images/CuisineCompassLogo.png";
import title from "../layouts/images/CuisineCompass.png";

class MenuBar extends Component {
    state = { activeItem: 'Explore' }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { color } = this.props
        const { activeItem } = this.state

  return (
    <Container fluid style={{ paddingBottom: "10px", borderBottom: "2px solid #ddd" }}>
      {/* First Row: Logo, Title, Search Bar, Profile Button */}
      <Menu secondary>
        <Menu.Item>
          <Image src={logo} size="tiny" />
        </Menu.Item>
        <Menu.Item>
            <Image src={title} size="medium" />
        </Menu.Item>
        <Menu.Item style={{ flexGrow: 1 }}>
          <Input icon="search" placeholder="What would you like to cook?" fluid />
        </Menu.Item>
        <Menu.Item position="right">
            <Button circular icon='user'>
            </Button>
        </Menu.Item>
      </Menu>

      {/* Second Row: Navigation Menu */}
      <Menu pointing secondary >
        <Menu.Item 
            name='Explore' 
            active={activeItem === 'Explore'}
            onClick={this.handleItemClick}
            color={ activeItem === 'Explore' ? 'orange' : 'black'}
        />
        <Menu.Item 
            name='Following' 
            active={activeItem === 'Following'}
            onClick={this.handleItemClick}
            color={ activeItem === 'Following' ? 'orange' : 'black'}
        />
        <Menu.Item 
            name='About' 
            active={activeItem === 'About'}
            onClick={this.handleItemClick}
            color={ activeItem === 'About' ? 'orange' : 'black'}
        />
      </Menu>
    </Container>
  );
};
};

export default MenuBar;
