import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

// Define user roles
export type UserRole = "admin" | "counselor";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    role?: UserRole,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCounselor: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample admin user for demo purposes
const ADMIN_USER = {
  id: "1",
  email: "admin@example.com",
  password: "admin123", // In a real app, this would be hashed
  name: "Admin User",
  role: "admin" as UserRole,
  avatar: "https://i.pravatar.cc/150?img=68",
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function now checks Firestore for counselors
  const login = async (
    email: string,
    password: string,
    role?: UserRole,
    rememberMe = false
  ) => {
    setLoading(true);

    try {
      // If role is admin or no specific role, check admin credentials first
      if (!role || role === "admin") {
        if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
          const { password: _, ...userWithoutPassword } = ADMIN_USER;

          setUser(userWithoutPassword);

          if (rememberMe) {
            localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          }

          setLoading(false);
          navigate("/dashboard");
          return;
        }
      }

      // If role is counselor or no specific role was requested, check for counselor
      if (!role || role === "counselor") {
        // Query Firestore for counselors with matching email
        const counselorsRef = collection(db, "counselors");
        const q = query(counselorsRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const counselorDoc = snapshot.docs[0];
          const counselorData = counselorDoc.data();

          // Verify password (in a real app, we would use proper password hashing)
          if (counselorData.password === password) {
            const counselorUser: User = {
              id: counselorDoc.id,
              name: counselorData.name,
              email: counselorData.email,
              role: "counselor",
              avatar: counselorData.photoURL,
            };

            setUser(counselorUser);

            if (rememberMe) {
              localStorage.setItem("user", JSON.stringify(counselorUser));
            }

            setLoading(false);
            navigate("/counselor-dashboard");
            return;
          }
        }
      }

      // If we get here, authentication failed
      setLoading(false);
      throw new Error("Invalid email or password");
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      throw new Error("Invalid email or password");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isCounselor = user?.role === "counselor";

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isCounselor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
