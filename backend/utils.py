import calendar
import ee

column_lst = []


def calc_ndvi(image):
    """
    Calculate the NDVI for a given image.
    """
    return (
        image.expression(
            "(NIR - RED) / (NIR + RED)",
            {"NIR": image.select("B8"), "RED": image.select("B4")},
        )
        .rename("NDVI")
        .copyProperties(image, image.propertyNames())
    )


def mask_s2_clouds(image):
    qa = image.select("QA60")

    cloud_bit_mask = 1 << 10
    cirrus_bit_mask = 1 << 11
    mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
    return image.updateMask(mask)


def get_monthly_ndvi(m1, year, roi):
    """
    get monthly ndvi
    """
    print(m1)
    column_lst.append(f"{m1[1]}")
    _, last_day = calendar.monthrange(year=year, month=m1[0])
    start_date = f"{year}-{m1[0]}-01"
    end_date = f"{year}-{m1[0]}-{last_day}"

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(ee.Date(start_date), ee.Date(end_date))
        .filterBounds(roi)
        .map(calc_ndvi)
    )
    # print(f"Number of images in collection: {image.size().getInfo()}")

    ndvi_mean = (
        image.select("NDVI")
        .mean()
        .reduceRegion(
            reducer=ee.Reducer.median(), geometry=roi, scale=30, maxPixels=20000000000
        )
    )

    ndvi_info = ndvi_mean.get("NDVI").getInfo()
    return ndvi_info


def get_monthly_co(m1, year, roi):
    column_lst.append(f"{m1[1]}")
    _, last_day = calendar.monthrange(year=year, month=m1[0])
    start_date = f"{year}-{m1[0]}-01"
    end_date = f"{year}-{m1[0]}-{last_day}"

    collection = (
        ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_CO")
        .select("CO_column_number_density")
        .filterDate(ee.Date(start_date), ee.Date(end_date))
        .filterBounds(roi)
    )

    mean_value = collection.mean().reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=roi,
        scale=30,
    )

    return mean_value.get("CO_column_number_density").getInfo()


def yearly_rainfall(year, roi):

    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    print(start_date, end_date)
    collection = (
        ee.ImageCollection("UCSB-CHG/CHIRPS/PENTAD")
        .filterDate(ee.Date(start_date), ee.Date(end_date))
    )

    total = collection.reduce(ee.Reducer.sum())

    stats = total.reduceRegion(
        reducer=ee.Reducer.mean(), geometry=roi, scale=100, maxPixels=50000000000
    )

    return stats.get("precipitation_sum").getInfo()
