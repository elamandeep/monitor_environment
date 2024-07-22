import { Toaster } from "react-hot-toast"
import Map from "../components/Map"
import Menu from "../components/Menu"
import SideMenu from "../components/SideMenu"


const IndexPage = () => {
    return (
        <>
            <Map />
            <SideMenu />
            <Menu />
            <Toaster />
        </>
    )
}

export default IndexPage