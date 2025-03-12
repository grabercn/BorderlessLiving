import React, { useState, useEffect } from 'react';
import { Modal, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import DrawerMenu from './DrawerMenu';
import MapComponent from './MapComponent';
import CountryDetail from './CountryDetail';
import countries from './CountryData';
import "./site.css";

const CONFIG = {
  defaultCenter: [46.603354, 1.888334],
  defaultZoom: 4,
  tileProviders: {
    satellite: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
    simplified: (x, y, z) =>
      `https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/${z}/${x}/${y}.png`,
  },
};

const CountryHome = () => {
  // Shared state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(CONFIG.defaultZoom);
  const [center, setCenter] = useState(CONFIG.defaultCenter);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [contextMenuLatLng, setContextMenuLatLng] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load saved notes from local storage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('mapNotes')) || [];
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
    setNotes(savedNotes);
  }, []);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCountry(null);
  };

  // Create a unique list of countries for the menu
  const uniqueCountries = countries.reduce((acc, country) => {
    if (!acc.find(c => c.name === country.name)) {
      acc.push(country);
    }
    return acc;
  }, []);

  // Export and import notes functions
  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-notes.json';
    a.click();
  };

  const removeAllNotes = () => {
    setNotes([]);
    localStorage.setItem('mapNotes', JSON.stringify([]));
  };

  const removeAllFavorites = () => {
    setFavorites([]);
    localStorage.setItem('favorites', JSON.stringify([]));
  };

  const importNotes = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/json") {
      alert("Please select a valid JSON file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedNotes = JSON.parse(event.target.result);
        if (!Array.isArray(importedNotes)) {
          throw new Error("Invalid file format: Expected an array of notes.");
        }
        setNotes(importedNotes);
        localStorage.setItem('mapNotes', JSON.stringify(importedNotes));
      } catch (err) {
        console.error("Error importing notes:", err);
        alert("Failed to import notes. Please ensure the file is valid and correctly formatted.");
      }
    };
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  // Toggle map type between standard, satellite and simplified
  const handleMapTypeToggle = () => {
    switch (mapStyle) {
      case 'standard':
        setMapStyle('satellite');
        break;
      case 'satellite':
        setMapStyle('simplified');
        break;
      case 'simplified':
        setMapStyle('standard');
        break;
      default:
        setMapStyle('standard');
        break;
    }
  };

  // When user clicks on the map
  const handleMapClick = ({ event, latLng }) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuLatLng(latLng);
    setContextMenuVisible(true);
  };

  // Add a new note at the clicked position, grouping overlapping notes
  const addNote = () => {
    if (!contextMenuLatLng) return;
    let stackId = null;
    const toleranceBase = 0.05;
    const adjustedTolerance = toleranceBase * (currentZoom / 4);
    const overlappingNotes = notes.filter(note => {
      const latDiff = Math.abs(note.latLng[0] - contextMenuLatLng[0]);
      const lngDiff = Math.abs(note.latLng[1] - contextMenuLatLng[1]);
      return latDiff < adjustedTolerance && lngDiff < adjustedTolerance;
    });
    if (overlappingNotes.length > 0) {
      stackId = overlappingNotes[0].stackId;
    } else {
      stackId = Date.now();
    }
    const newNote = {
      id: Date.now(),
      latLng: contextMenuLatLng,
      text: "New note",
      date: new Date().toLocaleString(),
      stackId,
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('mapNotes', JSON.stringify(updatedNotes));
    setContextMenuVisible(false);
  };

  // Add a favorite at the clicked position
  const addFavorite = () => {
    if (!contextMenuLatLng) return;
    const newFavorite = {
      id: Date.now(),
      latLng: contextMenuLatLng,
      text: "New favorite",
      icon: 'star',
      date: new Date().toLocaleString(),
    };
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setContextMenuVisible(false);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Top-left menu button */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: drawerVisible || modalVisible ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute', top: 20, left: 20, zIndex: 1100, display: 'flex', alignItems: 'center' }}
      >
        <Button 
          type="primary" 
          shape="circle" 
          icon={<MenuOutlined style={{ fontSize: 24 }} />} 
          onClick={() => setDrawerVisible(true)}
          style={{ width: 50, height: 50, marginRight: 10 }}
        />
        <div style={{ color: '#C175FF', fontSize: 24, fontWeight: 'bold' }}>Borderless Living</div>
      </motion.div>

      {/* Drawer Menu */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closable={false}
        style={{ zIndex: 2000 }}
        maskClosable={true}
      >
        <DrawerMenu 
          isMobile={isMobile}
          mapStyle={mapStyle}
          handleMapTypeToggle={handleMapTypeToggle}
          exportNotes={exportNotes}
          importNotes={importNotes}
          removeAllNotes={removeAllNotes}
          removeAllFavorites={removeAllFavorites}
          uniqueCountries={uniqueCountries}
          handleCountryClick={(country) => {
            setDrawerVisible(false);
            handleCountryClick(country);
          }}
          favorites={favorites}
          notes={notes}
          onCloseDrawer={() => setDrawerVisible(false)}
        />
      </Drawer>

      {/* Welcome Modal */}
      <Modal
        open={welcomeVisible}
        onCancel={() => setWelcomeVisible(false)}
        closeIcon={false}
        footer={null}
        title="Welcome to Borderless Living"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>
            Have you ever dreamed of starting a new chapter abroad? At <strong>Borderless Living</strong>, we’ve been there—and we've done the hard work for you.
          </p>
          <p>
            Our platform is designed specifically for Americans planning to relocate overseas. Here, you’ll find comprehensive relocation guides, step-by-step visa processes, and insider tips on cultural integration—all curated to help you make a confident, informed move.
          </p>
          <p>
            Whether you’re drawn to the vibrant energy of bustling cities or the charm of tranquil coastal towns, our expert advice and real-world insights empower you to choose the perfect destination for your next adventure.
          </p>
          <p>
            Explore detailed country profiles, compare cost-of-living metrics, and discover the best cities to call home. With <strong>Borderless Living</strong>, every aspect of your relocation journey is covered—from visa applications to cultural nuances.
          </p>
          <p>
            Click on any country marker or select a country from our Countries List for personalized details and unlock endless possibilities for your new life abroad!
          </p>
        </motion.div>
        <center style={{ marginTop: 20 }}>
          <Button type="primary" onClick={() => setWelcomeVisible(false)}>
            Get Started
          </Button>
        </center>
      </Modal>

      {/* Map Component */}
      <MapComponent 
        center={center}
        currentZoom={currentZoom}
        mapStyle={mapStyle}
        CONFIG={CONFIG}
        countries={countries}
        notes={notes}
        onMapClick={handleMapClick}
        setCenter={setCenter}
        setCurrentZoom={setCurrentZoom}
        handleCountryClick={handleCountryClick}
        favorites={favorites}
      />

      {/* Context Menu for adding notes/favorites */}
      {contextMenuVisible && (
        <div
          style={{
            position: 'absolute',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            background: '#fff',
            border: '1px solid #ddd',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 2000,
            padding: '10px',
            borderRadius: '5px',
            cursor: 'default'
          }}
          onClick={() => setContextMenuVisible(false)}
        >
          <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={addNote}>New Note</div>
          <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={addFavorite}>Mark as Favorite</div>
        </div>
      )}

      {/* Country Detail Modal */}
      <Modal
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        closable={!isMobile}
        style={{ top: 0, height: '100vh', padding: 0 }}
        styles={{ height: '100vh', overflowY: 'auto', padding: 0 }}
      >
        <div style={{ position: 'relative', height: '100%' }}>
          {isMobile && (
            <div
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#C175FF',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
                zIndex: 1000
              }}
            >
              X
            </div>
          )}
          {selectedCountry && (
            <CountryDetail country={selectedCountry} onClose={handleCloseModal} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CountryHome;
