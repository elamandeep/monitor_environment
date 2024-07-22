import { ElementRef, MutableRefObject, useEffect, useRef } from "react"
import { Chart as C } from 'chart.js/auto'

const Chart = ({ config}: { config: any }) => {
    let ctx = useRef() as MutableRefObject<ElementRef<"canvas">>
    console.log(config)
    useEffect(() => {
        if (!ctx.current) return
        
        let chart = new C(ctx.current, config);

        return () => chart.destroy()
    }, [config])

    return (
        <>
            <canvas ref={ctx}></canvas>
        </>
    )
}

export default Chart