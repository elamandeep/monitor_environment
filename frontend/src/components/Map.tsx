import * as ol from 'ol'
import { useEffect, useRef } from 'react'
import TileLayer from 'ol/layer/Tile'
import { OSM, XYZ } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import useAppStore from '../utils/store'


const Map = () => {

    const setMap = useAppStore((state) => state.setMap)

    const mapRef = useRef<React.ElementRef<"div">>(null)
    useEffect(() => {
        if (mapRef.current === null) return;
        const map = new ol.Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    className: "osm",
                    source: new OSM()
                }),
                new TileLayer({
                    className: "carto",
                    source: new XYZ({
                        url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png",
                        attributions: '© <a href="https://carto.com/attributions">CARTO</a>'
                    })

                })
            ],
            // Todo setView on the basis of user current location
            view: new ol.View({
                center: fromLonLat([78.82267823570697, 23.079463270758126]),
                zoom: 6
            })
        })

        setMap(map)
      
    })

    return (
        <>
            <div ref={mapRef} id='map'></div>
        </>
    )
}

export default Map