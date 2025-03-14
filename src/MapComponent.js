import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';
import { EnvironmentTwoTone, StarTwoTone } from '@ant-design/icons';

// Listen to map events and call onMapClick and onMapMove
const LeafletMapEvents = ({ onMapClick, setCenter, setCurrentZoom, onMapMove }) => {
  useMapEvents({
    click(e) {
      onMapClick({ event: e.originalEvent, latLng: [e.latlng.lat, e.latlng.lng] });
    },
    moveend(e) {
      const map = e.target;
      setCenter([map.getCenter().lat, map.getCenter().lng]);
      setCurrentZoom(map.getZoom());
      if (typeof onMapMove === "function") {
        onMapMove();
      }
    },
  });
  return null;
};

// Helper to create custom div icons
const createDivIcon = (html, width, height) => {
  return L.divIcon({
    html,
    className: '', // Remove default styles
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
};

// When center prop changes, update the map view
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

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
  onFavoriteClick,
  onMapMove,  // Function to hide context menu on map move
}) => {
  let tileUrl =
    mapStyle === 'satellite'
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : mapStyle === 'simplified'
      ? "https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // Get user's current location and update the center if found.
  const [currentLocation, setCurrentLocation] = useState(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setCurrentLocation(loc);
          setCenter(loc);
        },
        (error) => console.error(error)
      );
    }
  }, [setCenter]);

  const currentIconSize = 24 * (currentZoom / 4);

  return (
    <MapContainer
      center={center}
      zoom={currentZoom}
      scrollWheelZoom
      style={{ width: '100vw', height: '100vh' }}
      zoomControl={false}
    >
      <RecenterMap center={center} />
      <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors" />
      <LeafletMapEvents onMapClick={onMapClick} setCenter={setCenter} setCurrentZoom={setCurrentZoom} onMapMove={onMapMove} />

      {/* Render country markers */}
      {countries.map((country, index) => {
        const iconSize = 24 * (currentZoom / 4);
        const html = `<div style="width:${iconSize + 16}px; height:${iconSize + 16}px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all 0.2s ease;">
          <img src="${country.flagUrl}" alt="${country.name} flag" style="width:${iconSize}px; height:auto; transition: all 0.2s ease;" />
          </div>`;
        return (
          <Marker
            key={index}
            position={country.coordinates}
            icon={createDivIcon(html, iconSize + 16, iconSize + 16)}
            eventHandlers={{
              click: () => handleCountryClick(country),
            }}
          />
        );
      })}

      {/* Render note markers */}
      {notes.map((note) => {
        const stackedNotes = notes.filter((n) => n.stackId === note.stackId);
        const stackCount = stackedNotes.length;
        const isLatestNote = note.id === stackedNotes[stackedNotes.length - 1].id;
        const showAllNotes = currentZoom >= 0;
        const shouldShowLatestOnly = !showAllNotes && stackCount > 1 && !isLatestNote;
        const shouldShowNote = showAllNotes || !shouldShowLatestOnly;
        const groupColor = `hsl(${(note.stackId * 50) % 360}, 70%, 60%)`;
        const noteSize = Math.max(14, 10 + (currentZoom / 4));
        let noteHtml = `<div style="background:#ffffff; border:1px solid #ddd; padding:10px; border-radius:8px; font-size:${noteSize}px; max-width:150px; box-shadow:0 2px 5px rgba(0,0,0,0.1); cursor:pointer; position:relative; transition: all 0.2s ease;">
          <div style="font-weight:bold; color:#333;">${note.date}</div>
          <div style="color:#666; margin-bottom:5px;">${note.text}</div>`;
        if (stackCount > 1 && isLatestNote) {
          noteHtml += `<div style="position:absolute; top:5px; right:5px; background:${groupColor}; color:white; font-size:10px; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; z-index:3000; font-weight:bold; box-shadow:0 2px 3px rgba(0,0,0,0.2); transform:translate(25%, -25%); transition: all 0.2s ease-in-out;">${stackCount}</div>`;
        }
        if (stackCount > 1 && !isLatestNote) {
          noteHtml += `<div style="position:absolute; top:5px; right:5px; background:#fff; color:${groupColor}; font-size:10px; width:18px; height:18px; border-radius:50%; text-align:center; line-height:18px; z-index:3000; font-weight:bold; border:1px solid ${groupColor}; transition: all 0.2s ease;">${stackedNotes.indexOf(note) + 1}</div>`;
        }
        noteHtml += `</div>`;
        return shouldShowNote ? (
          <Marker
            key={note.id}
            position={note.latLng}
            icon={createDivIcon(noteHtml, 150, 150)}
            eventHandlers={{
              click: (e) => e.originalEvent.stopPropagation(),
            }}
          />
        ) : null;
      })}

      {/* Render favorite markers */}
      {favorites &&
        favorites.map((favorite) => {
          const iconSize = 24 * (currentZoom / 4);
          const favoriteElement = (
            <div
              style={{
                width: iconSize + 16,
                height: iconSize + 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <StarTwoTone twoToneColor="#Ffd700" style={{ fontSize: iconSize, transition: 'all 0.2s ease' }} />
            </div>
          );
          const html = ReactDOMServer.renderToString(favoriteElement);
          return (
            <Marker
              key={favorite.id}
              position={favorite.latLng}
              icon={createDivIcon(html, iconSize + 16, iconSize + 16)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.preventDefault();
                  e.originalEvent.stopPropagation();
                  if (typeof onFavoriteClick === "function") {
                    onFavoriteClick(favorite, { x: e.originalEvent.clientX, y: e.originalEvent.clientY });
                  }
                }
              }}
            />
          );
        })}

      {/* Render current location marker */}
      {currentLocation && (
        <Marker
          key="current-location"
          position={currentLocation}
          icon={createDivIcon(
            ReactDOMServer.renderToString(
              <div
                style={{
                  width: currentIconSize + 16,
                  height: currentIconSize + 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <EnvironmentTwoTone style={{ fontSize: currentIconSize, transition: 'all 0.2s ease', color: 'blue' }} />
              </div>
            ),
            currentIconSize + 16,
            currentIconSize + 16
          )}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
