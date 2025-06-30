import React, { useState, useEffect } from 'react';

const InteractiveFitnessAppDashboard = () => {
  const [fitnessApps, setFitnessApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const loadFitnessAppsData = async () => {
    setLoading(true);
    console.log('🔍 Starting to load data...');
    
    try {
      const response = await fetch('./fitness_apps_data.json');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((app, index) => ({
          id: index + 1,
          name: app.name,
          platform: app.platform,
          category: app.category,
          rating: app.rating,
          reviewCount: app.review_count,
          downloads: app.downloads,
          lastUpdated: app.last_updated,
          features: app.features,
          sentiment: app.sentiment,
          developer: app.developer,
          price: app.price || 'Free'
        }));
        
        setFitnessApps(formattedData);
        setFilteredApps(formattedData);
        setLastUpdated(new Date().toLocaleString());
      }
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
    let filtered = fitnessApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.developer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === 'all' || 
                           (ratingFilter === '4+' && app.rating >= 4) ||
                           (ratingFilter === '3+' && app.rating >= 3);
      
      return matchesSearch && matchesRating;
    });

    // Sort apps
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'downloads') {
        // Simple download comparison
        const aDownloads = parseFloat(a.downloads.replace(/[^\d.]/g, ''));
        const bDownloads = parseFloat(b.downloads.replace(/[^\d.]/g, ''));
        return bDownloads - aDownloads;
      }
      return 0;
    });

    setFilteredApps(filtered);
  }, [fitnessApps, searchTerm, ratingFilter, sortBy]);

  const AppCard = ({ app, onClick }) => (
    <div 
      onClick={() => onClick(app)}
      style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
        borderLeft: '4px solid #3b82f6',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '16px'
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        e.target.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        e.target.style.transform = 'translateY(0)';
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
          {app.name}
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
      
      <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
        📱 {app.platform} • {app.category}
      </div>
      <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
        📥 {app.downloads} downloads
      </div>
      <div style={{color: '#6b7280', fontSize: '0.875rem', margin: '6px 0'}}>
        🏢 {app.developer}
      </div>
      
      <div style={{
        background: '#f0f9ff',
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
            <span>📥 {app.downloads} downloads</span>
            <span>💰 {app.price}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              App Details
            </h3>
            <div style={{ space: '8px 0' }}>
              <div style={{ margin: '8px 0' }}><strong>Developer:</strong> {app.developer}</div>
              <div style={{ margin: '8px 0' }}><strong>Platform:</strong> {app.platform}</div>
              <div style={{ margin: '8px 0' }}><strong>Category:</strong> {app.category}</div>
              <div style={{ margin: '8px 0' }}><strong>Last Updated:</strong> {app.lastUpdated}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              Key Features
            </h3>
            <div style={{ space: '8px 0' }}>
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
            background: '#f0f9ff',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{app.sentiment}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            Top Fitness Apps - Interactive Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
            Real-time analysis from Google Play Store Health & Fitness category
          </p>
          <p style={{color: '#6b7280', fontSize: '0.875rem', margin: '0'}}>
            🏆 Live Data • {lastUpdated} • Click cards for details
          </p>
        </div>

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
              <option value="downloads">Downloads</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
              Showing {filteredApps.length} of {fitnessApps.length} apps
            </div>
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

export default InteractiveFitnessAppDashboard;
