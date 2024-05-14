import React, {  createContext, useContext, useState } from "react";

type NotificationContextType = {
    notifications: Notification[] ,
    setNotifications: ( notification: Notification ) => void,
}

interface Notification {
    result : 'success'|'failure',
    message: 'string'
}

const NotificationContext = createContext<NotificationContextType>({
    notifications:[],
    setNotifications:() => {}
})

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationContextProvider:React.FC<{children: React.ReactNode}> = ({children}) => {

    const [ notifications , _setNotifications ] = useState<Notification[]>([]);

    const setNotifications = (notification: Notification) => {
        _setNotifications((prev) => [notification,...prev])

        setTimeout(() => {
             notifications.pop();
            _setNotifications(notifications);
        },3000)
    }

    return <NotificationContext.Provider value={{ notifications,setNotifications  }}>
        {children}
    </NotificationContext.Provider>
}

