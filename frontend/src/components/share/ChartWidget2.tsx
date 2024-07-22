import { useEffect, useMemo, useState } from "react"
import Chart from "../../components/Chart"
import useAppStore, { useShareStore } from "../../utils/store"
import { useMutation } from "@tanstack/react-query"
import { fetchCo, fetchCoTileUrl } from "../../utils/apiHandler"
import toast from "react-hot-toast"
import TileLayer from "ol/layer/Tile"
import { XYZ } from "ol/source"





const ChartWidget2 = () => {

    const { feature, Map, setReload } = useAppStore((state) => ({ feature: state.feature, Map: state.Map, setReload: state.setReload, setQueryString: state.setQueryString }))
    const [columns, setColumns] = useState<string[]>([])

    const [values, setValues] = useState<{
        label: string,
        data: number[],
        fill: boolean,
        tension: number
    }[]>([])

    const { co } = useShareStore((state) => state.mergedValue)

    const yearRange = useMemo(() => {
        let parsedStartYear = parseInt(co[0])
        let parsedEndYear = parseInt(co[1])
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
    }, [co])




    const mutation = useMutation({
        mutationFn: ({ feature, yearRange }: { feature: number[][], yearRange: number[] }) => fetchCo(yearRange, feature), mutationKey: ["CO"],
        onSuccess: (data: any) => {
            setColumns(data.data[0].columns)

            for (let i of data.data) {
                setValues((prev) => [...prev,
                {
                    data: i.values,
                    fill: false,
                    label: i.year,
                    tension: 0.1
                }
                ])
            }

        }
    })


    const mutation2 = useMutation({
        mutationFn: ({ feature, yearRange }: { feature: number[][], yearRange: number[] }) => fetchCoTileUrl(yearRange, feature), mutationKey: ["CO_TILE"], onSuccess(data) {
            let coTile = new TileLayer({
                source: new XYZ({
                    url: data.data.url,
                }),
                visible: false,
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







    return <div className="w-full">

        {mutation.isSuccess ? (
            <><Chart config={{
                type: 'line',
                data: {
                    labels: columns,
                    datasets: values
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        colors: {
                            enabled: true
                        }
                    }
                }
            }} /> </>
        ) : (<></>)}

    </div>

}

export default ChartWidget2