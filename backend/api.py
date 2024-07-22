from itertools import cycle
import ee
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic_models import *
from utils import *

router = APIRouter(prefix="/api")


@router.post("/get_montly_ndvi/", tags=["monthly"])
def get_ndvi_data(data: RequestedData):
    try:
        lst: list[GraphModel] = []
        for year in data.years:
            roi = ee.Geometry.Polygon([data.polygon])
            months_lst = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ]
            months = enumerate(months_lst, start=1)
            months_cycle = cycle(months)
            ndvi_values = [
                get_monthly_ndvi(next(months_cycle), year=year, roi=roi)
                for _ in range(len(months_lst))
            ]

            g = GraphModel(year=year, columns=months_lst, values=[ndvi_values])
            lst.append(g)

        r = Response(
            data=lst,
            successMesssage="success",
        )

        return JSONResponse(content=r.model_dump(), status_code=200)

    except Exception as err:
        e = Response(errorMessage=err)
        return JSONResponse(content=e.model_dump(), status_code=400)


@router.post("/get_monthly_co/", tags=["monthly"])
def get_co(data: RequestedData):
    try:
        lst: list[GraphModel] = []

        for year in data.years:
            roi = ee.Geometry.Polygon([data.polygon])
            months_lst = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ]
            months = enumerate(months_lst, start=1)
            months_cycle = cycle(months)
            co_values = [
                get_monthly_co(next(months_cycle), year=year, roi=roi)
                for _ in range(len(months_lst))
            ]
            g = GraphModel(year=year, columns=months_lst, values=co_values)
            lst.append(g)

        r = Response(
            data=lst,
            successMesssage="success",
        )
        print(r)
        return JSONResponse(content=r.model_dump(), status_code=200)
    except Exception as err:
        e = Response(errorMessage=err)
        return JSONResponse(content=e.model_dump(), status_code=400)


@router.post("/get_annual_rainfall", tags=["annual"])
def get_annual_rainfall(data: RequestedData):
    column_lst = []
    value_lst = []

    roi = ee.Geometry.Polygon([data.polygon])
    for year in data.years:
        column_lst.append(str(year))
        precipitation = yearly_rainfall(year, roi)
        value_lst.append(precipitation)

    g = GraphModel(columns=column_lst, values=value_lst)

    r = Response(data=g, successMesssage="Success")
    return JSONResponse(content=r.model_dump(), status_code=200)


@router.post("/get_co_tile", tags=["tile"])
def get_co_tile(data: RequestedData):
    roi = ee.Geometry.Polygon([data.polygon])
    years = data.years
    print(years)
    end_year = years[0]
    start_year = years[len(years) - 1]
    collection = (
        ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_CO")
        .select("CO_column_number_density")
        .filterDate(f"{start_year}-01-01", f"{end_year}-12-31")
    )
    band_viz = {
        "min": 0,
        "max": 0.05,
        "palette": ["black", "blue", "purple", "cyan", "green", "yellow", "red"],
    }

    co = collection.mean().clip(roi)

    id = co.getMapId(band_viz)
    tile_url = id["tile_fetcher"].url_format
    r = Response(data={"url": tile_url}, successMesssage="Success")
    return JSONResponse(content=r.model_dump(), status_code=200)


@router.post("/get_ndvi_tile", tags=["tile"])
def get_ndvi_tile(data: RequestedData):
    roi = ee.Geometry.Polygon([data.polygon])
    years = data.years
    print(years)
    end_year = years[0]
    start_year = years[len(years) - 1]

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(f"{start_year}-01-01", f"{end_year}-12-31")
        .filterBounds(roi)
        .map(calc_ndvi)
    )

    ndvi_params = {
        "min": -1.0,
        "max": 1.0,
        "palette": [
            "800000",  # Deep Red
            "A52A2A",  # Brown
            "F5F5DC",  # Beige
            "FFFF00",  # Yellow
            "7FFF00",  # Light Green
            "008000",  # Green
            "006400",  # Dark Green
        ],
    }

    id = image.select("NDVI").mean().clip(roi).getMapId(ndvi_params)
    tile_url = id["tile_fetcher"].url_format
    r = Response(data={"url": tile_url}, successMesssage="Success")
    return JSONResponse(content=r.model_dump(), status_code=200)


@router.post("/get_precipitation_tile", tags=["tile"])
def get_precipitation_tile(data: RequestedData):
    roi = ee.Geometry.Polygon([data.polygon])
    precipitationVis = {
        "min": 0,
        "max": 2000,
        "palette": ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
    }
    years = data.years
    end_year = years[0]
    start_year = years[len(years) - 1]

    collection = ee.ImageCollection("UCSB-CHG/CHIRPS/PENTAD").filterDate(
        f"{start_year}-01-01", f"{end_year}-12-31"
    )

    prec = collection.mean().clip(roi)
    id = prec.getMapId(precipitationVis)
    tile_url = id["tile_fetcher"].url_format
    r = Response(data={"url": tile_url}, successMesssage="Success")
    return JSONResponse(content=r.model_dump(), status_code=200)
