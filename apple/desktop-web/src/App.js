import React, { useState, useEffect } from 'react';

const DualPlatformFitnessAppDashboard = () => {
  const [allApps, setAllApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const loadFitnessAppsData = async () => {
    setLoading(true);
    console.log('🔍 Loading data from both platforms...');
    
    let combinedApps = [];
    
    try {
      // Load Google Play data
      try {
        const googleResponse = await fetch('./fitness_apps_data.json');
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          const formattedGoogleData = googleData.map((app, index) => ({
            id: `google_${index + 1}`,
            name: app.name,
            platform: 'Google Play',
            category: app.category,
            rating: app.rating,
            reviewCount: app.review_count,
            downloads: app.downloads,
            lastUpdated: app.last_updated,
            features: app.features,
            sentiment: app.sentiment,
            developer: app.developer,
            price: app.price || 'Free',
            platformIcon: '🤖'
          }));
          combinedApps = [...combinedApps, ...formattedGoogleData];
          console.log(`✅ Loaded ${formattedGoogleData.length} Google Play apps`);
        }
      } catch (error) {
        console.log('⚠️ Google Play data not found');
      }

      // Load Apple App Store data
      try {
        const appleResponse = await fetch('./apple_fitness_apps_data.json');
        if (appleResponse.ok) {
          const appleData = await appleResponse.json();
          const formattedAppleData = appleData.map((app, index) => ({
            id: `apple_${index + 1}`,
            name: app.name,
            platform: 'Apple App Store',
            category: app.category,
            rating: app.rating,
            reviewCount: app.review_count,
            downloads: app.downloads,
            lastUpdated: app.last_updated,
            features: app.features,
            sentiment: app.sentiment,
            developer: app.developer,
            price: app.price || 'Free',
            platformIcon: '🍎'
          }));
          combinedApps = [...combinedApps, ...formattedAppleData];
          console.log(`✅ Loaded ${formattedAppleData.length} Apple App Store apps`);
        }
      } catch (error) {
        console.log('⚠️ Apple App Store data not found');
      }

      console.log(`📊 Total apps loaded: ${combinedApps.length}`);
      setAllApps(combinedApps);
      setFilteredApps(combinedApps);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (error) {
      console.log('❌ Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFitnessAppsData();
  }, []);

  // Filter and sort apps
  useEffect(() => {
    let filtered = allApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.developer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === 'all' || 
                           (ratingFilter === '4+' && app.rating >= 4) ||
                           (ratingFilter === '3+' && app.rating >= 3);

      const matchesPlatform = platformFilter === 'all' ||
                             (platformFilter === 'google' && app.platform === 'Google Play') ||
                             (platformFilter === 'apple' && app.platform === 'Apple App Store');
      
      return matchesSearch && matchesRating && matchesPlatform;
    });

    // Sort apps
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'platform') return a.platform.localeCompare(b.platform);
      return 0;
    });

    setFilteredApps(filtered);
  }, [allApps, searchTerm, ratingFilter, platformFilter, sortBy]);

  const AppCard = ({ app, onClick }) => {
    const isGoogle = app.platform === 'Google Play';
    
    return (
      <div 
        onClick={() => onClick(app)}
        style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
          borderLeft: `4px solid ${isGoogle ? '#34a853' : '#007aff'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '16px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0',
            flex: 1
          }}>
            {app.platformIcon} {app.name}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fef3c7',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            <span style={{color: '#f59e0b', fontSize: '14px'}}>★</span>
            <span style={{color: '#92400e', fontWeight: '600', fontSize: '14px'}}>{app.rating}</span>
          </div>
        </div>
        
        <div style={{
          display: 'inline-block',
          backgroundColor: isGoogle ? '#e8f5e8' : '#e3f2fd',
          color: isGoogle ? '#2e7d32' : '#1565c0',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          {app.platform}
        </div>
        
        <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
          📱 {app.category}
        </div>
        <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
          📥 {app.downloads}
        </div>
        <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
          👥 {app.reviewCount} reviews
        </div>
        <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
          🏢 {app.developer}
        </div>
        <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
          💰 {app.price}
        </div>
        
        <div style={{
          background: isGoogle ? '#f0f9ff' : '#fef7ff',
          padding: '8px 12px',
          borderRadius: '4px',
          marginTop: '12px',
          fontSize: '0.875rem'
        }}>
          <strong>Features:</strong> {app.features.modality}
        </div>
        
        <div style={{
          marginTop: '12px',
          padding: '8px 0',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Click for details →
        </div>
      </div>
    );
  };

  const AppDetails = ({ app, onClose }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: app.platform === 'Google Play' ? '#e8f5e8' : '#e3f2fd',
            color: app.platform === 'Google Play' ? '#2e7d32' : '#1565c0',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            {app.platformIcon} {app.platform}
          </div>
          
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {app.name}
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>⭐ {app.rating} ({app.reviewCount} reviews)</span>
            <span>📥 {app.downloads}</span>
            <span>💰 {app.price}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              App Details
            </h3>
            <div>
              <div style={{ margin: '8px 0' }}><strong>Developer:</strong> {app.developer}</div>
              <div style={{ margin: '8px 0' }}><strong>Platform:</strong> {app.platform}</div>
              <div style={{ margin: '8px 0' }}><strong>Category:</strong> {app.category}</div>
              <div style={{ margin: '8px 0' }}><strong>Last Updated:</strong> {app.lastUpdated}</div>
              <div style={{ margin: '8px 0' }}><strong>Price:</strong> {app.price}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Key Features
            </h3>
            <div>
              <div style={{ margin: '8px 0' }}><strong>Modality:</strong> {app.features.modality}</div>
              <div style={{ margin: '8px 0' }}><strong>Personalization:</strong> {app.features.personalization}</div>
              <div style={{ margin: '8px 0' }}><strong>Social Features:</strong> {app.features.leaderboard}</div>
              <div style={{ margin: '8px 0' }}><strong>Equipment:</strong> {app.features.equipment}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
            User Sentiment Analysis
          </h3>
          <div style={{
            background: app.platform === 'Google Play' ? '#f0f9ff' : '#fef7ff',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: `4px solid ${app.platform === 'Google Play' ? '#3b82f6' : '#a855f7'}`
          }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{app.sentiment}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const PlatformStats = () => {
    const googleApps = filteredApps.filter(app => app.platform === 'Google Play');
    const appleApps = filteredApps.filter(app => app.platform === 'Apple App Store');
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34a853' }}>🤖</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{googleApps.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Google Play</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007aff' }}>🍎</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{appleApps.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Apple App Store</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>📊</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{filteredApps.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Apps</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            🍎🤖 Cross-Platform Fitness Apps Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
            Comparative analysis of Google Play Store & Apple App Store Health & Fitness apps
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0' }}>
            🏆 Live Data • {lastUpdated} • Click cards for details
          </p>
        </div>

        {/* Platform Stats */}
        <PlatformStats />

        {/* Controls */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' }}>
              🔍 Search Apps
            </label>
            <input
              type="text"
              placeholder="Search by name or developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' }}>
              ⭐ Rating Filter
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Ratings</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' }}>
              📱 Platform Filter
            </label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Platforms</option>
              <option value="google">🤖 Google Play</option>
              <option value="apple">🍎 Apple App Store</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: '600' }}>
              📊 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="rating">Rating</option>
              <option value="name">Name</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p>Loading fitness apps data...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} onClick={setSelectedApp} />
            ))}
          </div>
        )}

        {/* App Details Modal */}
        {selectedApp && (
          <AppDetails app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}
      </div>
    </div>
  );
};

export default DualPlatformFitnessAppDashboard;