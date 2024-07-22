import { useMemo, useState } from "react"
import Chart from "../components/Chart"
import useAppStore from "../utils/store"
import { useMutation } from "@tanstack/react-query"
import { fetchPrecipitation } from "../utils/apiHandler"
import toast from "react-hot-toast"

import { createSearchParams } from "react-router-dom"




const ChartWidget3 = () => {
    
    const { feature, setQueryString } = useAppStore((state) => ({ feature: state.feature,  setQueryString: state.setQueryString }))
    const [columns, setColumns] = useState<string[]>([])
    const [isChecked, setCheck] = useState(true)
    const [values, setValues] = useState<{
        label?: string,
        data: number[] | number,
        fill: boolean,
        tension?: number
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
            let val = createSearchParams({ precipitation: [startYear, endYear] })
            setQueryString(val.toString())

            // mutation2.mutateAsync({ feature, yearRange })
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



    console.log(values)

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
