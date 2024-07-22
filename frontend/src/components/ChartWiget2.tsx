import { useMemo, useState } from "react"
import Chart from "../components/Chart"
import useAppStore from "../utils/store"
import { useMutation } from "@tanstack/react-query"
import { fetchCo, fetchCoTileUrl } from "../utils/apiHandler"
import toast from "react-hot-toast"
import TileLayer from "ol/layer/Tile"
import { XYZ } from "ol/source"
import { createSearchParams } from "react-router-dom"




const ChartWidget2 = () => {
    const { feature, Map, setReload, setQueryString } = useAppStore((state) => ({ feature: state.feature, Map: state.Map, setReload: state.setReload, setQueryString: state.setQueryString }))
    const [columns, setColumns] = useState<string[]>([])
    const [isChecked, setCheck] = useState(true)
    const [values, setValues] = useState<{
        label: string,
        data: number[],
        fill: boolean,
        tension: number
    }[]>([])


    const [startYear, setStartYear] = useState<string>('')
    const [endYear, setEndYear] = useState<string>('')

    const yearRange = useMemo(() => {
        let parsedStartYear = parseInt(startYear)
        let parsedEndYear = parseInt(endYear)
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
    }, [startYear, endYear])




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
                className: "co",
                properties: {
                    name: "co"
                }
            })
            Map?.addLayer(coTile)
            setReload()
        }
    })



    const handleSubmit = () => {

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
            let val = createSearchParams({ co: [startYear, endYear] })
            setQueryString(val.toString())
        }
        else {
            toast.error("Geometry data is missing")
        }
    }



    const years = useMemo(() => {
        var max = new Date().getFullYear() - 2
        var min = max - 20
        var years = []

        for (var i = max; i >= min; i--) {
            years.push(i)
        }
        return years
    }, [])




    return <div className="w-full">
        <div className="flex gap-1">


            <select value={startYear} className="select select-bordered select-sm w-full max-w-xs" onChange={(e) => setStartYear(e.target.value)}>
                <option disabled selected>Start Year</option>
                {
                    years.map((year, index) => (
                        <option key={index} value={year}>{year}</option>
                    ))
                }
            </select>
            <div className="form-control">
                <label className="label cursor-pointer">
                    <input type="checkbox" onChange={() => setCheck(!isChecked)} checked={isChecked} className="checkbox checkbox-primary" />
                </label>
            </div>
            <select className={"select select-bordered select-sm w-full max-w-xs"} disabled={isChecked} onChange={(e) => setEndYear(e.target.value)}>
                <option disabled selected>End Year</option>
                {
                    years.map((year) => (
                        <option value={year}>{year}</option>
                    ))
                }
            </select>
        </div>

        <button className={`btn btn-primary btn-block ${mutation.isPending ? "btn-disabled" : "btn-block"}`} onClick={handleSubmit}>
            {mutation.isPending ? <span className="loading loading-spinner loading-sm text-gray-700">Loading...</span> : <>Submit</>}


        </button>

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