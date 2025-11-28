import { ReactNode } from "react"
import { UserProvider } from "./UserContext"

const AppProvider = ({ children }: { children: ReactNode }) => {
    return (
        <UserProvider>
            {children}
        </UserProvider>
    )
}
export default AppProvider