import Map from "../../components/Map"

import { Toaster } from "react-hot-toast"

import SideMenu from "../SideMenu"
import Menu from "../share/Menu"
import Pre from "./Prev"
const App = () => {
    return (
        <>
            <Pre/>
            <Map />
            <SideMenu />
            <Menu />
            <Toaster />
        </>
    )
}

export default App