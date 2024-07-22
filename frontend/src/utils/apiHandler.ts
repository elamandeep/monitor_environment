import axios from "axios";


const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        'Accept': 'application/json',
    }
});


export const fetchNdvi = async (years: number[], feature: Array<Array<number>> | null) => {
    console.log(feature)
    try {
        const res = await api.post("/get_montly_ndvi/", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}

export const fetchCo = async (years: number[], feature: Array<Array<number>> | null) => {
    try {
        const res = await api.post("/get_monthly_co/", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}


export const fetchPrecipitation = async (years: number[], feature: Array<Array<number>> | null) => {
    try {
        const res = await api.post("/get_annual_rainfall", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}

export const fetchCoTileUrl = async (years: number[], feature: Array<Array<number>> | null) => {
    try {
        const res = await api.post("/get_co_tile", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}

export const fetchNDVITileUrl = async (years: number[], feature: Array<Array<number>> | null) => {
    try {
        const res = await api.post("/get_ndvi_tile", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}



export const fetchPrecipitationTileUrl = async (years: number[], feature: Array<Array<number>> | null) => {
    try {
        const res = await api.post("/get_precipitation_tile", {
            "polygon": feature,
            "years": years
        })
        return res.data
    } catch (error) {
        return error
    }
}
