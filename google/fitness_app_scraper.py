import requests
import json
import time
from datetime import datetime

class WorkingFitnessScraper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://data.42matters.com/api/v2.0"
    
    def search_fitness_apps(self, limit=20):
        """Search for fitness apps using the working Search API"""
        print("🔍 Searching for fitness apps...")
        
        # Try multiple search terms to get variety
        search_terms = [
            'fitness workout',
            'health fitness',
            'workout training',
            'gym fitness',
            'fitness tracker'
        ]
        
        all_apps = []
        
        for term in search_terms:
            print(f"🔍 Searching: '{term}'")
            
            url = f"{self.base_url}/android/apps/search.json"
            params = {
                'q': term,
                'limit': 10,  # Keep searches small to avoid quotas
                'access_token': self.api_key
            }
            
            try:
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    # Filter for Health & Fitness category
                    fitness_apps = [
                        app for app in results 
                        if 'HEALTH' in app.get('cat_key', '').upper() or 
                           'FITNESS' in app.get('cat_key', '').upper()
                    ]
                    
                    all_apps.extend(fitness_apps)
                    print(f"✅ Found {len(fitness_apps)} fitness apps")
                    
                elif response.status_code == 402:
                    print(f"⚠️  Quota limit reached for '{term}'")
                    break
                else:
                    print(f"❌ Search failed: {response.status_code}")
                
                # Small delay to be respectful
                time.sleep(0.5)
                
            except Exception as e:
                print(f"❌ Error searching '{term}': {e}")
        
        # Remove duplicates and get top apps by rating
        unique_apps = {}
        for app in all_apps:
            package_name = app.get('package_name')
            if package_name and package_name not in unique_apps:
                unique_apps[package_name] = app
        
        # Sort by rating and downloads
        sorted_apps = sorted(
            unique_apps.values(),
            key=lambda x: (x.get('rating', 0), x.get('downloads', 0)),
            reverse=True
        )
        
        return sorted_apps[:limit]
    
    def format_app_data(self, app):
        """Format app data from search results"""
        # Extract features from description
        description = app.get('description', '').lower()
        features = self.extract_features(description)
        
        return {
            'name': app.get('title', 'Unknown'),
            'platform': 'Google Play',
            'category': app.get('category', 'Health & Fitness'),
            'rating': round(app.get('rating', 0), 1),
            'review_count': f"{app.get('number_ratings', 0):,}",
            'downloads': self.format_downloads(app.get('downloads', 0)),
            'last_updated': app.get('updated', 'Unknown'),
            'features': features,
            'sentiment': self.generate_sentiment(app),
            'developer': app.get('developer', 'Unknown'),
            'price': 'Free' if app.get('price', 0) == 0 else f"${app.get('price', 0)}",
            'package_name': app.get('package_name', ''),
            'content_rating': app.get('content_rating', 'Everyone'),
            'version': app.get('version', 'Unknown')
        }
    
    def extract_features(self, description):
        """Extract features from app description"""
        features = {
            'modality': [],
            'personalization': 'Basic',
            'leaderboard': 'Individual',
            'equipment': 'Bodyweight'
        }
        
        # Detect modalities
        if any(word in description for word in ['nutrition', 'calorie', 'food', 'diet', 'meal']):
            features['modality'].append('Nutrition Tracking')
        if any(word in description for word in ['workout', 'exercise', 'training', 'fitness']):
            features['modality'].append('Workout Training')
        if any(word in description for word in ['run', 'running', 'cycling', 'cardio']):
            features['modality'].append('Cardio Activities')
        if any(word in description for word in ['step', 'walk', 'activity', 'track']):
            features['modality'].append('Activity Tracking')
        if any(word in description for word in ['yoga', 'meditation', 'mindfulness', 'wellness']):
            features['modality'].append('Wellness')
        
        features['modality'] = ', '.join(features['modality']) if features['modality'] else 'General Fitness'
        
        # Detect personalization
        if any(word in description for word in ['personal', 'custom', 'adapt', 'recommend']):
            features['personalization'] = 'Personalized recommendations'
        
        # Detect social features
        if any(word in description for word in ['friend', 'social', 'share', 'community', 'challenge']):
            features['leaderboard'] = 'Social features and challenges'
        
        # Detect equipment needs
        if any(word in description for word in ['equipment', 'gym', 'weights', 'dumbbell']):
            features['equipment'] = 'Gym equipment options'
        elif any(word in description for word in ['home', 'bodyweight', 'no equipment']):
            features['equipment'] = 'Home workouts, no equipment needed'
        
        return features
    
    def generate_sentiment(self, app):
        """Generate sentiment summary from rating"""
        rating = app.get('rating', 0)
        num_ratings = app.get('number_ratings', 0)
        
        if rating >= 4.5:
            sentiment = "Highly rated by users with excellent reviews"
        elif rating >= 4.0:
            sentiment = "Generally positive user feedback"
        elif rating >= 3.5:
            sentiment = "Mixed reviews with room for improvement"
        else:
            sentiment = "Users report various issues"
        
        return f"{sentiment}. {num_ratings:,} total reviews."
    
    def format_downloads(self, downloads):
        """Format download numbers - handle both strings and integers"""
        # If downloads is already a formatted string, return as-is
        if isinstance(downloads, str):
            return downloads
        
        # If it's a number, format it
        if isinstance(downloads, (int, float)):
            if downloads >= 1000000000:
                return f"{downloads // 1000000000}B+"
            elif downloads >= 1000000:
                return f"{downloads // 1000000}M+"
            elif downloads >= 1000:
                return f"{downloads // 1000}K+"
            else:
                return str(int(downloads))
        
        # Fallback for any other type
        return str(downloads) if downloads else "Unknown"
    
    def scrape_fitness_apps(self):
        """Main scraping function"""
        print("🏃‍♂️ Starting fitness app collection using Search API...")
        
        # Search for fitness apps
        raw_apps = self.search_fitness_apps(limit=10)
        
        if not raw_apps:
            print("❌ No fitness apps found")
            return None
        
        print(f"\n📊 Processing {len(raw_apps)} fitness apps...")
        
        apps_data = []
        for i, app in enumerate(raw_apps[:5], 1):  # Top 5
            app_name = app.get('title', 'Unknown')
            rating = app.get('rating', 0)
            downloads_raw = app.get('downloads', 0)
            downloads = self.format_downloads(downloads_raw)
            
            print(f"📱 {i}/5: {app_name} ({rating}⭐, {downloads})")
            
            formatted_app = self.format_app_data(app)
            apps_data.append(formatted_app)
        
        return apps_data
    
    def save_data(self, apps_data, filename='fitness_apps_data.json'):
        """Save data to JSON file"""
        if not apps_data:
            print("❌ No data to save")
            return
        
        with open(filename, 'w') as f:
            json.dump(apps_data, f, indent=2)
        
        print(f"\n💾 Saved {len(apps_data)} fitness apps to {filename}")
    
    def print_summary(self, apps_data):
        """Print summary of collected data"""
        print("\n🏆 FITNESS APPS COLLECTED")
        print("=" * 50)
        
        for i, app in enumerate(apps_data, 1):
            print(f"\n{i}. {app['name']}")
            print(f"   ⭐ {app['rating']} stars ({app['review_count']} reviews)")
            print(f"   📥 {app['downloads']} downloads")
            print(f"   🏢 {app['developer']}")
            print(f"   🔧 {app['features']['modality']}")

def main():
    api_key = "de0ca5cbfbb244b984f8e83b43fa8e9e2fbb8e84"
    scraper = WorkingFitnessScraper(api_key)
    
    # Scrape fitness apps
    apps_data = scraper.scrape_fitness_apps()
    
    if apps_data:
        # Print summary
        scraper.print_summary(apps_data)
        
        # Save data
        scraper.save_data(apps_data)
        
        print(f"\n✅ Success! Collected {len(apps_data)} fitness apps")
        print("📊 Data ready for your dashboard!")
        print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        print("\n❌ No fitness apps collected")

if __name__ == "__main__":
    main()
