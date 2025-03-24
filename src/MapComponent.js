import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';
import { 
  EnvironmentTwoTone, 
  HeartTwoTone, 
  StarTwoTone, 
  SmileTwoTone, 
  FrownTwoTone, 
  CheckCircleTwoTone, 
  CloseCircleTwoTone, 
  InfoCircleTwoTone, 
  ExclamationCircleTwoTone, 
  PushpinTwoTone, 
  ThunderboltTwoTone 
} from '@ant-design/icons';

// Map icon name to component for the 10 popular two-tone icons.
const iconMap = {
  HeartTwoTone,
  StarTwoTone,
  SmileTwoTone,
  FrownTwoTone,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  InfoCircleTwoTone,
  ExclamationCircleTwoTone,
  PushpinTwoTone,
  ThunderboltTwoTone,
};

// A helper component to listen to map events
const LeafletMapEvents = ({ onMapClick, setCenter, setCurrentZoom }) => {
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
  pins,
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

  // Compute common icon size for pin/current location markers.
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

      {/* Render pin markers */}
      {pins &&
        pins.map((pin) => {
          const iconSize = 24 * (currentZoom / 4);
          // Use the icon component from the mapping based on the pin's icon name.
          // If not found, fallback to StarTwoTone.
          const IconComponent = iconMap[pin.icon?.name] || StarTwoTone;
          const pinElement = (
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
              <IconComponent twoToneColor={pin.icon?.color || "#Ffd700"} style={{ fontSize: iconSize, transition: 'all 0.2s ease' }} />
            </div>
          );
          const html = ReactDOMServer.renderToString(pinElement);
          return (
            <Marker
              key={pin.id}
              position={pin.latLng}
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
