import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE = "http://192.168.1.114:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("inventory_user");
    const storedToken = localStorage.getItem("inventory_token");
    
    if (storedUser && storedToken) {
      // Ensure token has a prefix. If not, it's an old Bearer token.
      let tokenValue = storedToken;
      if (!tokenValue.startsWith("Bearer ") && !tokenValue.startsWith("Basic ")) {
        tokenValue = `Bearer ${tokenValue}`;
      }
      
      setUser(JSON.parse(storedUser));
      setToken(tokenValue);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) return { success: false, message: "Username and password are required" };
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, message: data.message || "Invalid credentials" };
      }

      if (data.access_token) {
        const lowerUser = username.toLowerCase();
        let role = "seller";
        if (lowerUser === "owner") role = "owner";
        else if (lowerUser === "supervisor") role = "supervisor";

        const userData = { 
          username, 
          role, 
          name: username,
          summary: data.summary 
        };

        const fullToken = `Bearer ${data.access_token}`;
        setUser(userData);
        setToken(fullToken);
        
        localStorage.setItem("inventory_user", JSON.stringify(userData));
        localStorage.setItem("inventory_token", fullToken);
        return { success: true };
      }
      return { success: false, message: "Authentication failed" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Server unreachable. Please check your connection." };
    }
  };

  const adminLogin = async (username, password) => {
    if (!username || !password) return { success: false, message: "Admin credentials required" };
    try {
      // Safe base64 encoding for Basic Auth
      const basicAuth = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
      const res = await fetch(`${API_BASE}/admin`, {
        method: "GET",
        headers: { 
          "Authorization": `Basic ${basicAuth}`,
          "Accept": "application/json"
        },
      });

      if (res.status === 401) {
        return { success: false, message: "Invalid admin credentials" };
      }
      
      if (!res.ok) {
        return { success: false, message: `System error: ${res.status}` };
      }

      const userData = { 
        username, 
        role: "admin", 
        name: "Administrator",
        isAdmin: true 
      };

      setUser(userData);
      const adminToken = `Basic ${basicAuth}`;
      setToken(adminToken);
      
      localStorage.setItem("inventory_user", JSON.stringify(userData));
      localStorage.setItem("inventory_token", adminToken);
      return { success: true };
    } catch (err) {
      console.error("Admin Login error:", err);
      return { success: false, message: "Admin portal unreachable" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("inventory_user");
    localStorage.removeItem("inventory_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, adminLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
