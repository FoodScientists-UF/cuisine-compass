import React, { Component, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Input, Button, Image, Container } from "semantic-ui-react";
import logo from "../layouts/images/CuisineCompassLogo.png";
import title from "../layouts/images/CuisineCompass.png";
import { supabase, AuthContext } from "../AuthProvider";

const MenuBar = (props) => {
  const auth = useContext(AuthContext);
  
  const session = auth?.session || null;
  
  return <MenuBarComponent {...props} session={session} />;
};
class MenuBarComponent extends Component {
  state = { activeItem: "Explore", pic: "" };

  componentDidMount() {
    this.fetchUserPicture();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.session?.user?.id == this.props.session?.user?.id) return;
    this.fetchUserPicture();
  }

  fetchUserPicture = async () => {
    const { session } = this.props;
    if (!session?.user?.id) return;
    
    const userId = session.user.id;
    const { data, error } = await supabase.storage.from("profile_pictures").getPublicUrl(userId);
    
    if (error) {
      console.error("Error downloading profile picture:", error.message);
      return;
    }
    
    this.setState({ pic: data.publicUrl });
  };

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  };

  render() {
    const { color } = this.props;
    const { activeItem } = this.state;

    return (
      <Container
        fluid
        style={{ paddingBottom: "10px", borderBottom: "2px solid #ddd" }}
      >
        {/* First Row: Logo, Title, Search Bar, Profile Button */}
        <Menu secondary>
          <Menu.Item>
            <Image src={logo} size="tiny" />
          </Menu.Item>
          <Menu.Item>
            <Image src={title} size="medium" />
          </Menu.Item>
          <Menu.Item style={{ flexGrow: 1 }}>
            <Input
              icon="search"
              placeholder="What would you like to cook?"
              fluid
            />
          </Menu.Item>
          <Menu.Item position="right">
            <Button
              circular
              icon="user"
              onClick={() => (window.location.href = (this.props.session ? "/profile" : "/login"))}
              style={{
                backgroundImage: `url(${
                  this.state.pic ? this.state.pic : "/profile_placeholder.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></Button>
          </Menu.Item>
        </Menu>

        {/* Second Row: Navigation Menu */}
        <Menu pointing secondary>
          <Menu.Item
            as={Link}
            to="/explore"
            name="Explore"
            active={activeItem === "Explore"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}
            color={activeItem === "Explore" ? "orange" : "black"}
          />
          <Menu.Item
            as={Link}
            to="/following"
            name="Following"
            active={activeItem === "Following"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}
            color={activeItem === "Following" ? "orange" : "black"}
          />
          <Menu.Item
            as={Link}
            to="/about"
            name="About"
            active={activeItem === "About"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px"}}
            color={activeItem === "About" ? "orange" : "black"}
          />
        </Menu>
      </Container>
    );
  }
}

export default MenuBar;
