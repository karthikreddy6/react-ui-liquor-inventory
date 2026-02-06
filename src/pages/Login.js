import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Wine, Loader } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    let result;
    if (isAdminMode) {
      result = await adminLogin(username, password);
    } else {
      result = await login(username, password);
    }
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="icon-circle">
            <Wine size={24} color={isAdminMode ? "#ef4444" : "#6366f1"} />
          </div>
          <h2>{isAdminMode ? "Admin Console" : "Royal Wines"}</h2>
          <p>{isAdminMode ? "System administration access" : "Sign in to your inventory console"}</p>
        </div>

        <div className="login-mode-toggle">
            <button 
                className={!isAdminMode ? "active" : ""} 
                onClick={() => { setIsAdminMode(false); setError(""); }}
            >
                Staff Login
            </button>
            <button 
                className={isAdminMode ? "active admin" : ""} 
                onClick={() => { setIsAdminMode(true); setError(""); }}
            >
                Admin Login
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="flex-center"><Loader size={16} className="spin"/> Signing in...</span> : "Sign In"}
          </button>
        </form>
        
       
      </div>
    </div>
  );
};

export default Login;
