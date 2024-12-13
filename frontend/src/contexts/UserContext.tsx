import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";

type UserContextType = {
  name: string | null;
  email: string | null;
  avatar: string | null;
  token: string | null;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: PropsWithChildren) {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("user-info");
      if (data) {
        const userInfo = JSON.parse(data);
        setName(userInfo.name);
        setEmail(userInfo.email);
        setAvatar(userInfo.avatar);
        setToken(userInfo.token);
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ name, email, avatar, token, setName, setEmail, setAvatar }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
}
