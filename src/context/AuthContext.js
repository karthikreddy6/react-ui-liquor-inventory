import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../apiConfig";

const AuthContext = createContext(null);

const encodeBasicAuth = (username, password) => {
  const value = `${username}:${password}`;
  return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem("inventory_user");
    const storedToken = localStorage.getItem("inventory_token");
    
    if (storedUserRaw && storedToken) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        // Ensure token has a prefix. If not, it's an old Bearer token.
        let tokenValue = storedToken;
        if (!tokenValue.startsWith("Bearer ") && !tokenValue.startsWith("Basic ")) {
          tokenValue = `Bearer ${tokenValue}`;
        }
        
        setUser(storedUser);
        setToken(tokenValue);
      } catch (err) {
        console.error("Invalid stored auth payload, resetting session", err);
        localStorage.removeItem("inventory_user");
        localStorage.removeItem("inventory_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) return { success: false, message: "Username and password are required" };
    setToken(null); // Clear stale token before new attempt
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
        let role = data.role || "seller";
        if (!data.role) {
          if (lowerUser === "owner") role = "owner";
          else if (lowerUser === "supervisor") role = "supervisor";
        }

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
    setToken(null); // Clear stale token before new attempt
    try {
      const basicAuth = encodeBasicAuth(username, password);
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
