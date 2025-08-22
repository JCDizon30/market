import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const NavigationBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="farm-navbar navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand brand-text" to="/">
          FARMARKET
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link nav-link-custom" to="/marketplace">
                Marketplace
              </Link>
            </li>

            {user ? (
              <>
                {/* Admin link */}
                {user.role === "Admin" && (
                  <li className="nav-item">
                    <Link className="nav-link nav-link-custom" to="/admin-dashboard">
                      Admin Dashboard
                    </Link>
                  </li>
                )}

                {/* Farmer Dashboard (only approved) */}
                {user.role === "Farmer" && user.isApproved && (
                  <li className="nav-item">
                    <Link className="nav-link nav-link-custom" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                )}

                {/* Profile link for all logged-in users */}
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/profile">
                    Profile
                  </Link>
                </li>

                {/* Logout button */}
                <li className="nav-item">
                  <button
                    className="nav-link nav-link-custom btn btn-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
