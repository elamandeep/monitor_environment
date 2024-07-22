import {  lazy, Suspense } from "react"


const App  = lazy(()=>import("../components/share/App"))

const SharePage = () => {



    return (
        <>
            <Suspense fallback={<>Loading ...</>}>
              
                <App/>
            </Suspense>
        </>
    )
}

export default SharePage