import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

# -----------------------
# Helper function to fetch and parse app data
# -----------------------
def get_app_info(app_url):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(app_url, headers=headers)
        soup = BeautifulSoup(response.content, "html.parser")

        title = soup.find("h1", class_="Fd93Bb").text if soup.find("h1", class_="Fd93Bb") else "N/A"
        rating = soup.find("div", class_="TT9eCd").text if soup.find("div", class_="TT9eCd") else "N/A"
        reviews = soup.find("span", class_="AYi5wd TBRnV").text if soup.find("span", class_="AYi5wd TBRnV") else "N/A"
        last_updated = soup.find("div", class_="xg1aie").text if soup.find("div", class_="xg1aie") else "N/A"

        return {
            "App Name": title,
            "Rating": rating,
            "Review Count": reviews,
            "Last Updated": last_updated,
            "URL": app_url
        }

    except Exception as e:
        print(f"Error fetching {app_url}: {e}")
        return {
            "App Name": "Error",
            "Rating": "N/A",
            "Review Count": "N/A",
            "Last Updated": "N/A",
            "URL": app_url
        }

# -----------------------
# Main scraping logic
# -----------------------
def scrape_google_play_top_apps():
    app_urls = [
        "https://play.google.com/store/apps/details?id=com.fitbit.FitbitMobile",
        "https://play.google.com/store/apps/details?id=com.myfitnesspal.android",
        "https://play.google.com/store/apps/details?id=com.nike.ntc",
        "https://play.google.com/store/apps/details?id=com.freeletics.lite",
        "https://play.google.com/store/apps/details?id=com.asicsdigital.runkeeper.pro"
    ]

    all_data = []
    for url in app_urls:
        print(f"Scraping: {url}")
        data = get_app_info(url)
        all_data.append(data)
        time.sleep(1)  # be polite

    df = pd.DataFrame(all_data)
    df.to_csv("data/google_play_fitness_apps.csv", index=False)
    print("\n✅ Scraping complete. Data saved to data/google_play_fitness_apps.csv")

# -----------------------
# Run script
# -----------------------
if __name__ == "__main__":
    scrape_google_play_top_apps()
