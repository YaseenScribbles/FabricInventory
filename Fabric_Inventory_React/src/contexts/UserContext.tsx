import React, { createContext, useContext, useState } from "react";

interface User {
    id : number,
    name: string,
    email :string,
    role: string
}

export type UserContextType = {
    user: User | null;
    setUser: (user:User) => void;
    removeUser: () => void;
}

const UserContext = createContext<UserContextType>({
    user : null,
    setUser: () => {},
    removeUser: () => {}
});

export const useUserContext = () => useContext(UserContext);

interface User  {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const UserContextProvider:React.FC<{children: React.ReactNode}> = ({ children }) => {

    const getUser = () => {
        const savedUser = localStorage.getItem('fab_inv_user');
        let user: User| null = null;
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
        return user;
    }

    const [ user, _setUser ] = useState<User | null>(getUser());

    const setUser = ( user:User ) => {
        _setUser(user);
        localStorage.setItem('fab_inv_user',JSON.stringify(user));
    }

    const removeUser = () => {
        _setUser(null);
        localStorage.removeItem('fab_inv_user');
    }

    return <UserContext.Provider value={{ user, setUser,removeUser}}>
        {children}
    </UserContext.Provider>
}
