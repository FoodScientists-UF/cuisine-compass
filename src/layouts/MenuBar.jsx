import React, { Component, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Input, Button, Image, Container } from "semantic-ui-react";
// import logo from "../layouts/images/CuisineCompassLogo.png";
import title from "../layouts/images/CuisineCompass.png";
import { supabase, AuthContext } from "../AuthProvider";

const MenuBar = (props) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  
  const session = auth?.session || null;

  return <MenuBarComponent {...props} session={session} location={location} />;
};

class MenuBarComponent extends Component {
  state = { activeItem: "", pic: "" };
  debounceTimeout = null;

  componentDidMount() {
    this.fetchUserPicture();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.session?.user?.id == this.props.session?.user?.id) return;
    this.fetchUserPicture();
  }

  componentWillUnmount() {
    clearTimeout(this.debounceTimeout);
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

  handleSearchChange = (e) => {
    const { value } = e.target;

    clearTimeout(this.debounceTimeout);

    this.debounceTimeout = setTimeout(() => {
      this.props.setSearchValue(value);
      console.log("Debounced Search value:", value);
    }, 300);
  }

  render() {
    const { color } = this.props;
    const { activeItem } = this.state;
    const { location } = this.props;
    const pathname = location.pathname;

    const iconImg = this.state.pic ? this.state.pic : 'user';
    const logo = "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/collection-picture//default.png";

    return (
      <Container
        fluid
        style={{ paddingBottom: "10px" }}
      >
        {/* First Row: Logo, Title, Search Bar, Profile Button */}
        <Menu secondary>
          <Menu.Item as={Link} to="/explore">
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
              onChange={this.handleSearchChange}
            />
          </Menu.Item>
          <Menu.Item position="right">
            <Button
              circular
              onClick={() => (window.location.href = (this.props.session ? "/profile" : "/login"))}
              style={{
                width: "40px",
                height: "40px",
                backgroundImage: `url(${this.state.pic ? this.state.pic : "/default-avatar.png"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "none"
              }}
            />
          </Menu.Item>
        </Menu>

        {/* Second Row: Navigation Menu */}
        <Menu pointing secondary>
          <Menu.Item
            as={Link}
            to="/explore"
            name="Explore"
            active={pathname === "/explore"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}
            color={pathname === "/explore" ? "orange" : "black"}
          />
          <Menu.Item
            as={Link}
            to="/following"
            name="Following"
            active={pathname === "/following"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px" }}
            color={pathname === "/following" ? "orange" : "black"}
          />
          <Menu.Item
            as={Link}
            to="/about"
            name="About"
            active={pathname === "/about"}
            onClick={this.handleItemClick}
            style={{ fontFamily: '"Abhaya Libre", serif', fontWeight: 400, fontSize: "18px"}}
            color={pathname === "/about" ? "orange" : "black"}
          />
        </Menu>
      </Container>
    );
  }
}

export default MenuBar;
