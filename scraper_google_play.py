import requests
from bs4 import BeautifulSoup
import pandas as pd

def fetch_app_data(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.content, "html.parser")

    title = soup.find("h1", class_="Fd93Bb").text if soup.find("h1", class_="Fd93Bb") else "N/A"
    rating = soup.find("div", class_="TT9eCd").text if soup.find("div", class_="TT9eCd") else "N/A"
    reviews = soup.find("span", class_="AYi5wd TBRnV").text if soup.find("span", class_="AYi5wd TBRnV") else "N/A"
    last_updated = soup.find("div", class_="xg1aie").text if soup.find("div", class_="xg1aie") else "N/A"

    return {
        "App Name": title,
        "Rating": rating,
        "Review Count": reviews,
        "Last Updated": last_updated,
        "URL": url
    }

if __name__ == "__main__":
    urls = [
        "https://play.google.com/store/apps/details?id=com.fitbit.FitbitMobile",
        "https://play.google.com/store/apps/details?id=com.myfitnesspal.android",
        "https://play.google.com/store/apps/details?id=com.nike.ntc",
        "https://play.google.com/store/apps/details?id=com.freeletics.lite",
        "https://play.google.com/store/apps/details?id=com.asicsdigital.runkeeper.pro"
    ]

    data = [fetch_app_data(url) for url in urls]
    df = pd.DataFrame(data)
    df.to_csv("google_play_fitness_apps.csv", index=False)
    print(df)
