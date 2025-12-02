import SearchIcon from "@mui/icons-material/Search"
import "./Navbar.css"

const Navbar = () => {
  return (
    <div className="navbar">
      <img src="logo2.png" alt="logo" />
      <div className="navbar-right">
        <a href="/login" className="login-link">
          Login
        </a>
        <a href="/Register" className="signin-link">
          Sign In
        </a>
        <div className="SearchContainer">
          <SearchIcon />

          <input
            placeholder="Search..."
            id="input"
            className="input"
            name="text"
            type="text"
          />
        </div>
      </div>
    </div>
  )
}

export default Navbar
