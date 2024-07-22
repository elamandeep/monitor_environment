import { useEffect, useMemo, useState } from "react"
import Chart from "../../components/Chart"
import useAppStore, { useShareStore } from "../../utils/store"
import { useMutation } from "@tanstack/react-query"
import { fetchPrecipitation, fetchPrecipitationTileUrl } from "../../utils/apiHandler"
import toast from "react-hot-toast"
import TileLayer from "ol/layer/Tile"
import XYZ from "ol/source/XYZ"







const ChartWidget3 = () => {
    const { feature, Map, setReload } = useAppStore((state) => ({ feature: state.feature, Map: state.Map, setReload: state.setReload }))
    const { precipitation } = useShareStore((state) => state.mergedValue)
    const [columns, setColumns] = useState<string[]>([])
    const [values, setValues] = useState<{
        label?: string,
        data: number[] | number,
        fill: boolean,
        tension?: number
    }[]>([])


    const yearRange = useMemo(() => {
        let parsedStartYear = parseInt(precipitation[0])
        let parsedEndYear = parseInt(precipitation[1])
        if (!isNaN(parsedStartYear) && !isNaN(parsedEndYear)) {
            let min = parsedStartYear;
            let max = parsedEndYear;
            let arr = []
            for (var i = max; i >= min; i--) {
                arr.push(i)
            }
            return arr
        }
        else if (!isNaN(parsedStartYear)) {
            return [parsedStartYear]
        }
        else if (!isNaN(parsedEndYear)) {
            return [parsedEndYear]
        }
        else {
            return []
        }
    }, [precipitation])




    const mutation = useMutation({
        mutationFn: ({ feature, yearRange }: { feature: number[][], yearRange: number[] }) => fetchPrecipitation(yearRange, feature), mutationKey: ["Precipitation"],
        onSuccess: (data: any) => {
            console.log(data)
            let columns = data.data.columns
            setColumns(columns)

            let tempArr = []

            for (const [index, value] of data.data.values.entries()) {
                console.log(value, index)
                let tempObj = {
                    label: columns[index],
                    data: [value],
                    fill: false
                }
                tempArr.push(tempObj)
            }
            setValues(tempArr)


        }
    })


    const mutation2 = useMutation({
        mutationFn: ({ feature, yearRange }: { feature: number[][], yearRange: number[] }) => fetchPrecipitationTileUrl(yearRange, feature), mutationKey: ["PRECP_TILE"], onSuccess(data) {
            let coTile = new TileLayer({
                source: new XYZ({
                    url: data.data.url,
                }),
                className: "co",
                properties: {
                    name: "co"
                }
            })
            Map?.addLayer(coTile)
            setReload()
        }
    })


    useEffect(() => {
        if (feature !== null) {
            toast.promise(
                mutation.mutateAsync({ feature, yearRange }),
                {
                    loading: "Loading ...",
                    success: "success ...",
                    error: "something went wrong.."
                }
            )

            mutation2.mutateAsync({ feature, yearRange })
        }
        else {
            toast.error("Geometry data is missing")
        }
    }, [feature])





    console.log(values)

    return <div className="w-full">


        {mutation.isSuccess ? (
            <><Chart config={{
                type: 'bar',
                data: {
                    labels: columns,
                    datasets: values
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 250,
                            }
                        }
                    },
                    plugins: {
                        colors: {
                            enabled: true
                        },
                        responsive: true,
                    }
                }
            }} /> </>
        ) : (<></>)}

    </div>

}

export default ChartWidget3
