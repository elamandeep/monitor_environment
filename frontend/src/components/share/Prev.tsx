import { SetURLSearchParams, useSearchParams } from "react-router-dom"
import useAppStore, { IMergedValue } from "../../utils/store"
import { useEffect } from "react"
import { useShareStore } from "../../utils/store"


const Pre = () => {
    const { setFeatures } = useAppStore((state) => ({ setFeatures: state.setFeature }))
    const params = useSearchParams()
    const setMergedValue = useShareStore((state) => state.setMergedValue)

    const convertURLStringIntoData = (params: [URLSearchParams, SetURLSearchParams]) => {
        let mergedParams: Record<string, any> = {}
        params[0].forEach((value, key) => {
            if (!mergedParams[key]) {
                mergedParams[key] = [];
            }
            if (key === 'geom') {

                let parsedValue = value.split(",").map((i) => parseFloat(i));

                let groupedPairs = [];
                for (let i = 0; i < parsedValue.length; i += 2) {
                    groupedPairs.push([parsedValue[i], parsedValue[i + 1]]);
                }

                console.log(groupedPairs)
                setFeatures(groupedPairs)
                mergedParams[key].push(groupedPairs);
            }

            else if (value !== "") {
                mergedParams[key].push(value);
            }

        })

        setMergedValue(mergedParams as IMergedValue)
    }

    useEffect(() => {
        convertURLStringIntoData(params)
    }, [])


    return (<>

    </>)
}


export default Pre