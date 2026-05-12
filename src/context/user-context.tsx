"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextValue {
  selectedUserId: string | null;
  selectedUserName: string | null;
  setSelectedUser: (id: string, name: string) => void;
  clearSelectedUser: () => void;
}

const UserContext = createContext<UserContextValue>({
  selectedUserId: null,
  selectedUserName: null,
  setSelectedUser: () => {},
  clearSelectedUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setId] = useState<string | null>(null);
  const [selectedUserName, setName] = useState<string | null>(null);

  function setSelectedUser(id: string, name: string) {
    setId(id);
    setName(name);
  }

  function clearSelectedUser() {
    setId(null);
    setName(null);
  }

  return (
    <UserContext.Provider value={{ selectedUserId, selectedUserName, setSelectedUser, clearSelectedUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useSelectedUser = () => useContext(UserContext);
