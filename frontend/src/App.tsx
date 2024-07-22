import { Route, Routes } from "react-router-dom"

import { lazy, Suspense } from "react"


const IndexPage = lazy(() => import("./pages/Index"))
const SharePage = lazy(() => import("./pages/Share"))

function App() {


  return (
    <>
    <Suspense fallback={<>Loading...</>}>

      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/share/" element={<SharePage />} />
      </Routes>
    </Suspense>
    </>
  )
}

export default App


//  <Route path="/share/:geom/ndvi/:startyear/:endyear/co/:startyear/:endyear/precipitation/:startyear/:endyear/" element={<SharePage />} />