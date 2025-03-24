import React, { useState, useEffect } from 'react';
import { Modal, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import DrawerMenu from './DrawerMenu';
import MapComponent from './MapComponent';
import CountryDetail from './CountryDetail';
import countries from './CountryData';
import IconSelector from './components/IconSelector';
import "./site.css";

const CONFIG = {
  defaultCenter: [46.603354, 1.888334],
  defaultZoom: 6,
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
  const [pins, setPins] = useState([]);
  const [contextMenuLatLng, setContextMenuLatLng] = useState(null);
  
  // NEW: State for favorite context menu
  const [favoriteContextMenu, setFavoriteContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    favorite: null,
  });
  
  const [isMobile, setIsMobile] = useState(false);
  
  // Icon selection state
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Load pins from local storage
  useEffect(() => {
    const savedPins = JSON.parse(localStorage.getItem('pins'));
    if (savedPins) {
      setPins(savedPins);
    }
  }, []);

  const removeAllPins = () => {
    setPins([]);
    localStorage.setItem('pins', JSON.stringify([]));
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

  // When user clicks on the map, record the click position for a context menu
  const handleMapClick = ({ event, latLng }) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuLatLng(latLng);
    setContextMenuVisible(true);
  };

  // When adding a pin, open the icon selector and save the pending pin data
  const addPin = () => {
    if (!contextMenuLatLng) return;
    
    // Save the pending pin's position but don't add it yet
    setPendingPin({
      id: Date.now(),
      latLng: contextMenuLatLng,
      text: "New pin",
      date: new Date().toLocaleString(),
    });

    // Open the icon picker modal
    setIconPickerVisible(true);
  };

  // Handle the icon selected from IconSelector.
  // Expects icon to be an object with { name, color }.
  const handleIconSelect = (icon) => {
    if (!pendingPin) return;

    // Add the pin with the selected icon details
    const newPin = { ...pendingPin, icon };
    const updatedPins = [...pins, newPin];
    
    setPins(updatedPins);
    localStorage.setItem('pins', JSON.stringify(updatedPins));

    // Close modals and reset state
    setIconPickerVisible(false);
    setContextMenuVisible(false);
    setPendingPin(null);
  };

  return (
    <div 
      style={{ position: 'relative', width: '100vw', height: '100vh' }}
      // Hide the favorite context menu when clicking outside
      onClick={() => {
        if (favoriteContextMenu.visible) {
          setFavoriteContextMenu({ visible: false, position: { x: 0, y: 0 }, favorite: null });
        }
      }}
    >
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
          removeAllPins={removeAllPins}
          uniqueCountries={uniqueCountries}
          handleCountryClick={(country) => {
            setDrawerVisible(false);
            handleCountryClick(country);
          }}
          pins={pins}
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

      {/* Map Component using React-Leaflet */}
      <MapComponent 
        center={center}
        currentZoom={currentZoom}
        mapStyle={mapStyle}
        CONFIG={CONFIG}
        countries={countries}
        onMapClick={handleMapClick}
        setCenter={setCenter}
        setCurrentZoom={setCurrentZoom}
        handleCountryClick={handleCountryClick}
        pins={pins}
      />

      {/* Context Menu for adding Community Pins */}
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
          <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={addPin}>
            Add Community Pin
          </div>
        </div>
      )}

      {/* Icon Selector Modal */}
      <IconSelector
        visible={iconPickerVisible}
        onSelect={handleIconSelect}
        onCancel={() => setIconPickerVisible(false)}
      />

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
