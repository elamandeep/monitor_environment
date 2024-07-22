import { Fragment, useEffect, useState } from "react"
import useAppStore from "../utils/store"
import Draw from 'ol/interaction/Draw'
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import toast from "react-hot-toast";
import BaseLayer from "ol/layer/Base";
import {  useLocation } from "react-router-dom";


let polygonSource = new VectorSource({ wrapX: false });
let draw: Draw;

const CheckBox = ({ layer, setCurrentLayer }: { layer: BaseLayer, setCurrentLayer: React.Dispatch<React.SetStateAction<BaseLayer | undefined>> }) => {
    console.log(layer)
    const [checked, setChecked] = useState(layer?.getVisible())


    function handleChange(checked: boolean, layer: BaseLayer): void {
        setCurrentLayer(layer)
        layer.setVisible(!checked)
        setChecked(!checked)
    }


    return (
        <>
            <div className="form-control">
                <label className="label cursor-pointer">
                    <input type="checkbox" value={layer.getClassName()} onChange={() => handleChange(checked, layer)} checked={checked} className="checkbox" />
                    <span className="label-text">{layer.getClassName()}</span>
                </label>
            </div>
        </>
    )
}


const Legend = ({ currentLayer }: { currentLayer: BaseLayer }) => {
    console.log(currentLayer.getClassName())
    return (
        <>
            <div className="card bg-base-200 w-64 shadow-xl fixed bottom-5 right-5 z-[999]">
                {currentLayer.getClassName() === "ndvi" && (
                    <>
                        {currentLayer.getVisible() && (
                            <>

                                <div className="card-body">
                                    <div className="flex gap-2">
                                        <div className="bg-[#800000] w-5 h-5"></div>
                                        <span className="label-text">Very low or no vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#A52A2A] w-5 h-5"></div>
                                        <span className="label-text">Sparse vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#F5F5DC] w-5 h-5"></div>
                                        <span className="label-text">Low vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#FFFF00] w-5 h-5"></div>
                                        <span className="label-text">Moderate vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#7FFF00] w-5 h-5"></div>
                                        <span className="label-text">Good  vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#008000] w-5 h-5"></div>
                                        <span className="label-text"> Dense vegetation</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-[#006400] w-5 h-5"></div>
                                        <span className="label-text"> Very dense vegetation</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
                {currentLayer.getClassName() === "co" && (

                    <>
                        {currentLayer.getVisible() && (
                            <>
                                <div className="card-body">
                                    <div className="flex gap-2">
                                        <div className="bg-black w-5 h-5"></div>
                                        <span className="label-text">Lowest concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:blue] w-5 h-5"></div>
                                        <span className="label-text"> Low concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:purple] w-5 h-5"></div>
                                        <span className="label-text">Moderate concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:Cyan] w-5 h-5"></div>
                                        <span className="label-text">Higher concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:Green] w-5 h-5"></div>
                                        <span className="label-text"> High concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:yellow] w-5 h-5"></div>
                                        <span className="label-text"> Very high concentration</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="[background-color:red] w-5 h-5"></div>
                                        <span className="label-text"> Highest concentration</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </>

                )}



            </div>
        </>
    )
}




const SideMenu = () => {
    const location = useLocation()
    const [path] = useState(location.pathname)
    const [layersArr, setLayersArr] = useState<BaseLayer[]>([])
    const [currentLayer, setCurrentLayer] = useState<BaseLayer>()
    const { Map, option, setOption, setFeatures, isReload, setQueryString, queryString } = useAppStore((state) => ({
        Map: state.Map,
        option: state.option,
        setOption: state.setOption,
        setFeatures: state.setFeature,
        isReload: state.isReload,
        setQueryString: state.setQueryString,
        queryString: state.queryString
    }))

    let layerArr = Map?.getLayers().getArray()
    useEffect(() => {
        if (layerArr === undefined) return
        console.log("inside", layersArr)
        let tempArr = layerArr?.filter(elem => elem.getClassName() === "ndvi" || elem.getClassName() === "co")
        setLayersArr(tempArr)
        setCurrentLayer(tempArr[tempArr.length - 1])
    }, [layerArr, isReload])



    function addInteraction(type: "Polygon", source: VectorSource<Feature<Geometry>>) {
        polygonSource.clear()
        draw = new Draw({
            source: source,
            type: type,
        });

        Map?.addInteraction(draw);
        console.log(draw)
        draw.on("drawend", function (event) {
            console.log(draw)
            let geom = event.feature.getGeometry();

            // @ts-ignore
            let coords_clone: Array<Array<Array<number>>> = geom.clone().transform("EPSG:3857", "EPSG:4326").getCoordinates();
            console.log(coords_clone)
            // Todo 
            toast.success("geometry added")
            setFeatures(coords_clone[0])
            setQueryString("geom=" + coords_clone[0] + "")
            setOption(null)
        })

    }



    useEffect(() => {
        if (option === "pen") {

            let polygonVector = new VectorLayer({
                source: polygonSource,
                style: new Style({
                    stroke: new Stroke({
                        color: "blue",
                        width: 4,
                    }),
                }),
            });


            Map?.addLayer(polygonVector)
            addInteraction("Polygon", polygonSource)

        }
        else if (option === "clear") {
            Map?.removeInteraction(draw)
            Map?.getLayers().getArray().forEach((elm) => {
                let className = elm.getClassName()
                if (className !== "osm" && className !== "carto") {
                    Map.removeLayer(elm)
                }
            })
        }
        else {
            Map?.removeInteraction(draw)
        }
    }, [option])


    return (
        <>
            <ul className="menu bg-base-200 rounded-box z-[999] fixed top-5 right-5">
                <li className={option === "layers" ? "active" : "" + "tooltip tooltip-left"} onClick={() => setOption("layers")} data-tip="Layers" >

                    <div className="dropdown  dropdown-left dropdown-bottom  ">

                        <a tabIndex={0} >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"></path></svg>
                        </a>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-6 shadow mx-6">

                            {
                                layersArr?.length !== 0 && (
                                    <>
                                        {layersArr?.map((layer, index) => (<Fragment key={index}>
                                            <CheckBox layer={layer} setCurrentLayer={setCurrentLayer} />
                                        </Fragment>))}
                                    </>
                                )
                            }


                        </ul>
                    </div>
                </li>
                {path === '/' && (
                    <>
                        <li>
                            <a className={option === "pen" ? "active" : "" + "tooltip tooltip-left"} onClick={() => setOption("pen")} data-tip="Stats">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M230.64,49.36a32,32,0,0,0-45.26,0h0a31.9,31.9,0,0,0-5.16,6.76L152,48.42A32,32,0,0,0,97.37,25.36h0a32.06,32.06,0,0,0-5.76,37.41L57.67,93.32a32.05,32.05,0,0,0-40.31,4.05h0a32,32,0,0,0,42.89,47.41l70,51.36a32,32,0,1,0,47.57-14.69l27.39-77.59q1.38.12,2.76.12a32,32,0,0,0,22.63-54.62Zm-122-12.69h0a16,16,0,1,1,0,22.64A16,16,0,0,1,108.68,36.67Zm-80,94.65a16,16,0,0,1,0-22.64h0a16,16,0,1,1,0,22.64Zm142.65,88a16,16,0,0,1-22.63-22.63h0a16,16,0,1,1,22.63,22.63Zm-8.55-43.18a32,32,0,0,0-23,7.08l-70-51.36a32.17,32.17,0,0,0-1.34-26.65l33.95-30.55a32,32,0,0,0,45.47-10.81L176,71.56a32,32,0,0,0,14.12,27Zm56.56-92.84A16,16,0,1,1,196.7,60.68h0a16,16,0,0,1,22.63,22.63Z"></path></svg>
                            </a>
                        </li>
                        <li>
                            <a className={option === "clear" ? "active" : "" + "tooltip tooltip-left"} onClick={() => setOption("clear")} data-tip="Clear">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path></svg>
                            </a>
                        </li>
                        <li>
                            <div className="dropdown dropdown-end">
                                <a tabIndex={0} className={option === "share" ? "active" : "" + "tooltip tooltip-left"} onClick={() => setOption("share")} data-tip="Share">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M237.66,106.35l-80-80A8,8,0,0,0,144,32V72.35c-25.94,2.22-54.59,14.92-78.16,34.91-28.38,24.08-46.05,55.11-49.76,87.37a12,12,0,0,0,20.68,9.58h0c11-11.71,50.14-48.74,107.24-52V192a8,8,0,0,0,13.66,5.65l80-80A8,8,0,0,0,237.66,106.35ZM160,172.69V144a8,8,0,0,0-8-8c-28.08,0-55.43,7.33-81.29,21.8a196.17,196.17,0,0,0-36.57,26.52c5.8-23.84,20.42-46.51,42.05-64.86C99.41,99.77,127.75,88,152,88a8,8,0,0,0,8-8V51.32L220.69,112Z"></path></svg>
                                </a>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-76 p-2 mr-16 shadow">
                                    <label className="input input-bordered flex items-center gap-2 ">
                                        <input type="text" value={import.meta.env.VITE_APP_BASE_URL+"/share/" + queryString} className="grow" placeholder="share" />
                                    </label>
                                </ul>
                            </div>

                        </li></>
                )}


            </ul>



            {typeof currentLayer !== "undefined" && <Legend currentLayer={currentLayer} />}
        </>
    )
}

export default SideMenu