import requests
import json
import time
from datetime import datetime

class WorkingAppleStoreScraper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://data.42matters.com/api/v2.0"
    
    def search_fitness_apps(self, limit=20):
        """Search for fitness apps using the working Apple API"""
        print("🍎 Searching for real Apple App Store fitness apps...")
        
        search_terms = [
            'fitness',
            'workout', 
            'health',
            'MyFitnessPal',
            'Nike Training',
            'Strava',
            'Peloton'
        ]
        
        all_apps = []
        
        for term in search_terms:
            print(f"🔍 Searching: '{term}'")
            
            url = f"{self.base_url}/ios/apps/search.json"
            params = {
                'q': term,
                'limit': 5,
                'access_token': self.api_key
            }
            
            try:
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])
                    
                    print(f"📊 Raw results: {len(results)} apps")
                    
                    # Filter for Health & Fitness apps using correct field names
                    fitness_apps = []
                    for app in results:
                        # Check if it's a fitness app using multiple criteria
                        primary_genre = app.get('primaryGenreName', '').lower()
                        title = app.get('trackCensoredName', '').lower()
                        description = app.get('description', '').lower()
                        
                        is_fitness = (
                            'health' in primary_genre or 
                            'fitness' in primary_genre or
                            any(word in title for word in ['fitness', 'workout', 'health', 'gym', 'training', 'nutrition']) or
                            any(word in description[:200] for word in ['fitness', 'workout', 'health', 'exercise', 'nutrition'])
                        )
                        
                        if is_fitness and app.get('trackCensoredName'):  # Make sure we have a real app name
                            fitness_apps.append(app)
                    
                    all_apps.extend(fitness_apps)
                    print(f"✅ Found {len(fitness_apps)} fitness apps")
                    
                    # Show what we found
                    for app in fitness_apps[:2]:
                        name = app.get('trackCensoredName', 'Unknown')
                        rating = app.get('averageUserRating', 0)
                        print(f"   📱 {name} ({rating:.1f}⭐)")
                    
                elif response.status_code == 402:
                    print(f"⚠️  Quota limit reached")
                    break
                else:
                    print(f"❌ Search failed: {response.status_code}")
                
                time.sleep(0.5)  # Be nice to the API
                
            except Exception as e:
                print(f"❌ Error: {e}")
        
        # Remove duplicates by trackId
        unique_apps = {}
        for app in all_apps:
            track_id = app.get('trackId')
            if track_id and track_id not in unique_apps:
                unique_apps[track_id] = app
        
        # Sort by rating and popularity
        sorted_apps = sorted(
            unique_apps.values(),
            key=lambda x: (x.get('averageUserRating', 0), x.get('userRatingCount', 0)),
            reverse=True
        )
        
        print(f"\n📊 Total unique fitness apps found: {len(sorted_apps)}")
        return sorted_apps[:limit]
    
    def format_app_data(self, app):
        """Format app data using correct Apple API field names"""
        # Extract features from description
        description = app.get('description', '').lower()
        features = self.extract_features(description)
        
        # Format download estimate
        downloads = app.get('downloads', '')
        if not downloads:
            # Estimate based on rating count (Apple doesn't show downloads)
            rating_count = app.get('userRatingCount', 0)
            downloads = self.estimate_downloads_from_ratings(rating_count)
        
        return {
            'name': app.get('trackCensoredName', 'Unknown'),
            'platform': 'Apple App Store',
            'category': app.get('primaryGenreName', 'Health & Fitness'),
            'rating': round(app.get('averageUserRating', 0), 1),
            'review_count': f"{app.get('userRatingCount', 0):,}",
            'downloads': downloads,
            'last_updated': self.format_date(app.get('currentVersionReleaseDate', '')),
            'features': features,
            'sentiment': self.generate_sentiment(app),
            'developer': app.get('artistName', 'Unknown'),
            'price': app.get('formattedPrice', 'Unknown'),
            'app_id': str(app.get('trackId', '')),
            'bundle_id': app.get('bundleId', ''),
            'content_rating': app.get('trackContentRating', '4+'),
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
        
        # Detect modalities from description
        if any(word in description for word in ['nutrition', 'calorie', 'food', 'diet', 'meal', 'macro']):
            features['modality'].append('Nutrition Tracking')
        if any(word in description for word in ['workout', 'exercise', 'training', 'fitness']):
            features['modality'].append('Workout Training')
        if any(word in description for word in ['run', 'running', 'cycling', 'cardio']):
            features['modality'].append('Cardio Activities')
        if any(word in description for word in ['step', 'walk', 'activity', 'track']):
            features['modality'].append('Activity Tracking')
        if any(word in description for word in ['yoga', 'meditation', 'mindfulness', 'zen']):
            features['modality'].append('Wellness & Mindfulness')
        if any(word in description for word in ['strength', 'weight', 'muscle', 'gym']):
            features['modality'].append('Strength Training')
        
        features['modality'] = ', '.join(features['modality']) if features['modality'] else 'General Fitness'
        
        # Detect personalization
        if any(word in description for word in ['personal', 'custom', 'adapt', 'recommend', 'ai', 'coach']):
            features['personalization'] = 'Personalized recommendations and coaching'
        
        # Detect social features
        if any(word in description for word in ['friend', 'social', 'share', 'community', 'challenge', 'leaderboard']):
            features['leaderboard'] = 'Social features and community challenges'
        
        # Equipment requirements
        if any(word in description for word in ['equipment', 'gym', 'weights', 'dumbbell']):
            features['equipment'] = 'Gym equipment options available'
        elif any(word in description for word in ['home', 'bodyweight', 'no equipment']):
            features['equipment'] = 'Home workouts, no equipment needed'
        elif any(word in description for word in ['apple watch', 'watch', 'wearable']):
            features['equipment'] = 'Apple Watch and wearable integration'
        
        return features
    
    def estimate_downloads_from_ratings(self, rating_count):
        """Estimate downloads based on rating count"""
        if rating_count > 1000000:
            return "50M+ estimated"
        elif rating_count > 500000:
            return "25M+ estimated"
        elif rating_count > 100000:
            return "10M+ estimated"
        elif rating_count > 50000:
            return "5M+ estimated"
        elif rating_count > 10000:
            return "1M+ estimated"
        else:
            return f"{rating_count * 20:,}+ estimated"
    
    def generate_sentiment(self, app):
        """Generate sentiment from app data"""
        rating = app.get('averageUserRating', 0)
        rating_count = app.get('userRatingCount', 0)
        
        if rating >= 4.5:
            sentiment = "Highly rated with excellent user satisfaction"
        elif rating >= 4.0:
            sentiment = "Generally positive reviews from users"
        elif rating >= 3.5:
            sentiment = "Mixed reviews with moderate satisfaction"
        else:
            sentiment = "Below average ratings with user concerns"
        
        return f"{sentiment}. Based on {rating_count:,} App Store reviews."
    
    def format_date(self, date_str):
        """Format date string"""
        if date_str:
            try:
                # Parse date like "2025-06-18T00:00:00+00:00"
                return date_str.split('T')[0]
            except:
                return date_str
        return 'Unknown'
    
    def scrape_fitness_apps(self):
        """Main scraping function"""
        print("🍎 Starting REAL Apple App Store fitness app collection...")
        
        # Search for fitness apps
        raw_apps = self.search_fitness_apps(limit=15)
        
        if not raw_apps:
            print("❌ No fitness apps found")
            return None
        
        print(f"\n📊 Processing top {min(5, len(raw_apps))} apps...")
        
        apps_data = []
        for i, app in enumerate(raw_apps[:5], 1):  # Top 5
            app_name = app.get('trackCensoredName', 'Unknown')
            rating = app.get('averageUserRating', 0)
            rating_count = app.get('userRatingCount', 0)
            
            print(f"🍎 {i}/5: {app_name} ({rating:.1f}⭐, {rating_count:,} reviews)")
            
            formatted_app = self.format_app_data(app)
            apps_data.append(formatted_app)
        
        return apps_data
    
    def save_data(self, apps_data, filename='apple_fitness_apps_data.json'):
        """Save data to JSON file"""
        if not apps_data:
            print("❌ No data to save")
            return
        
        with open(filename, 'w') as f:
            json.dump(apps_data, f, indent=2)
        
        print(f"\n💾 Saved {len(apps_data)} REAL Apple fitness apps to {filename}")
    
    def print_summary(self, apps_data):
        """Print summary of collected data"""
        print("\n🍎 REAL APPLE APP STORE FITNESS APPS")
        print("=" * 55)
        
        for i, app in enumerate(apps_data, 1):
            print(f"\n{i}. {app['name']}")
            print(f"   ⭐ {app['rating']} stars ({app['review_count']} reviews)")
            print(f"   📥 {app['downloads']}")
            print(f"   🏢 {app['developer']}")
            print(f"   💰 {app['price']}")
            print(f"   🔧 {app['features']['modality']}")

def main():
    api_key = "34c8543ef31201c15a928fee4d5a7232e77827fe"
    scraper = WorkingAppleStoreScraper(api_key)
    
    # Scrape real Apple fitness apps
    apps_data = scraper.scrape_fitness_apps()
    
    if apps_data:
        # Print summary
        scraper.print_summary(apps_data)
        
        # Save data
        scraper.save_data(apps_data)
        
        print(f"\n✅ SUCCESS! Collected {len(apps_data)} REAL Apple fitness apps")
        print("🍎 Real Apple App Store data ready for your dashboard!")
        print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        print("\n❌ No Apple fitness apps collected")

if __name__ == "__main__":
    main()
