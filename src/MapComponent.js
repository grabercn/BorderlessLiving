import React from 'react';
import { Map, Marker } from 'pigeon-maps';
import { StarOutlined, HeartOutlined } from '@ant-design/icons';

const MapComponent = ({
  center,
  currentZoom,
  mapStyle,
  CONFIG,
  countries,
  notes,
  favorites,
  onMapClick,
  setCenter,
  setCurrentZoom,
  handleCountryClick,
}) => {
  return (
    <Map 
      center={center} 
      zoom={currentZoom} 
      provider={CONFIG.tileProviders[mapStyle]}      
      onClick={onMapClick}
      minZoom={4}
      maxZoom={18}
      onBoundsChanged={({ center: newCenter, zoom }) => {
        setCurrentZoom(zoom);
        setCenter(newCenter);
      }}
      width="100vw" 
      height="100vh"
    >
      {/* Render country markers */}
      {countries.map((country, index) => {
        const iconSize = 24 * (currentZoom / 4);
        return (
          <Marker 
            key={index}
            anchor={country.coordinates}
            onClick={() => handleCountryClick(country)}
          >
            <div 
              style={{ 
                background: "transparent",
                border: "none",
                width: iconSize + 16,
                height: iconSize + 16,
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "all 0.2s ease"
              }}
            >
              <img 
                src={country.flagUrl} 
                alt={`${country.name} flag`} 
                style={{ 
                  width: iconSize, 
                  height: 'auto',
                  transition: "all 0.2s ease"
                }} 
              />
            </div>
          </Marker>
        );
      })}
      
      {/* Render note markers */}
      {notes.map((note) => {
        const stackedNotes = notes.filter(n => n.stackId === note.stackId);
        const stackCount = stackedNotes.length;
        const isLatestNote = note.id === stackedNotes[stackedNotes.length - 1].id;
        const zoomThreshold = 0;
        const showAllNotes = currentZoom >= zoomThreshold;
        const shouldShowLatestOnly = !showAllNotes && stackCount > 1 && !isLatestNote;
        const shouldShowNote = showAllNotes || !shouldShowLatestOnly;
        const groupColor = `hsl(${(note.stackId * 50) % 360}, 70%, 60%)`;
        const noteSize = Math.max(14, 10 + (currentZoom / 4));
        return (
          <Marker key={note.id} anchor={note.latLng}>
            <div
              style={{
                background: '#ffffff',
                border: `1px solid #ddd`,
                padding: '10px',
                borderRadius: '8px',
                fontSize: `${noteSize}px`,
                maxWidth: '150px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                position: 'relative',
                display: shouldShowNote ? 'block' : 'none',
                transition: "all 0.2s ease"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontWeight: 'bold', color: '#333', transition: "all 0.2s ease" }}>
                {note.date}
              </div>
              <div style={{ color: '#666', marginBottom: '5px', transition: "all 0.2s ease" }}>
                {note.text}
              </div>
              {stackCount > 1 && isLatestNote && (
                <div
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: groupColor,
                    color: 'white',
                    fontSize: '10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '20px',
                    zIndex: 3000,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)',
                    transform: 'translate(25%, -25%)',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {stackCount}
                </div>
              )}
              {stackCount > 1 && !isLatestNote && (
                <div
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: '#fff',
                    color: groupColor,
                    fontSize: '10px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '18px',
                    zIndex: 3000,
                    fontWeight: 'bold',
                    border: '1px solid ' + groupColor,
                    transition: "all 0.2s ease"
                  }}
                >
                  {stackedNotes.indexOf(note) + 1}
                </div>
              )}
            </div>
          </Marker>
        );
      })}
      
      {/* Render favorite markers */}
      {favorites && favorites.map((favorite) => {
        const iconSize = 24 * (currentZoom / 4);
        return (
          <Marker key={favorite.id} anchor={favorite.latLng}>
            <div
              style={{
                width: iconSize + 16,
                height: iconSize + 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ fontSize: iconSize, transition: "all 0.2s ease" }}>
                {favorite.icon === "star" ? (
                  <StarOutlined/>
                ) : (
                  <HeartOutlined/>
                )}
              </div>
            </div>
          </Marker>
        );
      })}
    </Map>
  );
};

export default MapComponent;
