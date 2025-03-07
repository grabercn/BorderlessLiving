import React, { useState, useEffect } from 'react';
import { Modal, Drawer, Button, Menu } from 'antd';
import { MenuOutlined, StarOutlined } from '@ant-design/icons';
import { Map, Marker } from 'pigeon-maps';
import { motion } from 'framer-motion';
import CountryDetail from './CountryDetail';
import countries from './CountryData';
import "./site.css"

const { SubMenu } = Menu;

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [center, setCenter] = useState([46.603354, 1.888334]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [contextMenuLatLng, setContextMenuLatLng] = useState(null); // New state to store map coordinates


  // Optional: detect mobile screen size for additional mobile tweaks if needed.
  const [isMobile, setIsMobile] = useState(false);
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

  const uniqueCountries = countries.reduce((acc, country) => {
    if (!acc.find(c => c.name === country.name)) {
      acc.push(country);
    }
    return acc;
  }, []);

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
    localStorage.setItem('mapNotes', JSON.stringify(""));
  };

  const importNotes = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File type validation (optional, as you already have accept="application/json")
    if (file.type !== "application/json") {
        alert("Please select a valid JSON file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedNotes = JSON.parse(event.target.result);

        // Basic structural validation (optional, adjust to match your actual note structure)
        if (!Array.isArray(importedNotes)) {
            throw new Error("Invalid file format: Expected an array of notes.");
        }

        setNotes(importedNotes);
        localStorage.setItem('mapNotes', JSON.stringify(importedNotes));
      } catch (err) {
          console.error("Error importing notes:", err);
          alert("Failed to import notes. Please ensure the file is a valid JSON file with the correct format.");
      }
    };
    reader.onerror = () => {
        alert("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };


  const handleMapTypeToggle = () => {
    // Cycle through the map types on each click
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

  const renderDrawerContent = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 20 }}
    >
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <img 
          src="/images/logo-nobg.png" 
          alt="Brand Logo" 
          width={"200vw"}
          height={"200vw"}
          style={{ borderRadius: '50%'}} 
        />
        <p style={{ fontSize: 14, color: '#555' }}>
          Your guide to living beyond borders.
        </p>
      </div>
  
      <Menu mode="inline" style={{ border: 'none' }}>
        {/* Manual Home link */}
        <Menu.Item key="home">
          <a href="/" style={{ fontSize: 18, color: '#1890ff' }}>Home</a>
        </Menu.Item>
  
        {/* Manual About link */}
        <Menu.Item key="about">
          <a href="/about" style={{ fontSize: 18, color: '#1890ff' }}>About</a>
        </Menu.Item>

        {/* Settings Submenu */}
        <SubMenu key="settings" title="Settings">
        <Menu.Item key="type" onClick={() => handleMapTypeToggle()}>
            Toggle Map Type: {mapStyle}
        </Menu.Item>
          

          {/* Manual Export Notes button */}
          <Menu.Item key="export" onClick={exportNotes} >
            Export Notes (.json)
          </Menu.Item> 

          {/* Manual Import Notes with hidden input */}
          <Menu.Item
            key="import"
            onClick={() => document.getElementById('importNotes').click()}  // Clicking the item triggers file input
        >
            Import Notes (.json)
            <input
                id="importNotes"
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={importNotes}  // Handles file selection and loading
            />
          </Menu.Item>
        </SubMenu>

        {/* Countries Submenu */}
        <SubMenu key="countries" title="Countries List">
          {uniqueCountries.map((country) => (
            <Menu.Item 
              key={country.name} 
              onClick={() => {
                setDrawerVisible(false);
                handleCountryClick(country);
              }}
              style={{ fontSize: 16 }}
            >
              {country.name}
            </Menu.Item>
          ))}
        </SubMenu>

        {/* Notes Submenu */}
        <SubMenu key="favorites" title="Favorites">
          <Menu.Item 
            onClick={() => {
              removeAllNotes();
            }}
            style={{ fontSize: 16, color: 'red' }}
          >
            Delete All Favorites
          </Menu.Item>
            
          {favorites.map((favorite) => (
            <Menu.Item 
              key={favorite.id} 
              onClick={() => {
                setDrawerVisible(false);
              }}
              style={{ fontSize: 16 }}
            >
              {favorite.name + favorite.date}
            </Menu.Item>
          ))}
        </SubMenu>

        {/* Notes Submenu */}
        <SubMenu key="notes" title="Notes List">
          <Menu.Item 
            onClick={() => {
              removeAllNotes();
            }}
            style={{ fontSize: 16, color: 'red' }}
          >
            Delete All Notes
          </Menu.Item>
            
          {notes.map((note) => (
            <Menu.Item 
              key={note.id} 
              onClick={() => {
                setDrawerVisible(false);
              }}
              style={{ fontSize: 16 }}
            >
              {note.text + note.date}
            </Menu.Item>
          ))}
        </SubMenu>

      </Menu>
    </motion.div>
  );  

  const handleMapClick = ({ event, latLng }) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuLatLng(latLng);  // Save clicked coordinates
    setContextMenuVisible(true);
  };  

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('mapNotes')) || [];
    setNotes(savedNotes);
  }, []);  

  const addNote = () => {
    if (!contextMenuLatLng) return; // Ensure coords are available
  
    // Check for overlap within dynamic tolerance
    let stackId = null;
    const toleranceBase = 0.05; // Base tolerance for overlap
  
    // Adjust tolerance based on zoom level
    const adjustedTolerance = toleranceBase * (currentZoom / 4); // You can adjust this formula
  
    // Look for existing notes that overlap with the current position
    const overlappingNotes = notes.filter(note => {
      const latDiff = Math.abs(note.latLng[0] - contextMenuLatLng[0]);
      const lngDiff = Math.abs(note.latLng[1] - contextMenuLatLng[1]);
      return latDiff < adjustedTolerance && lngDiff < adjustedTolerance;
    });
  
    if (overlappingNotes.length > 0) {
      // If there's an overlap, assign the same stackId
      stackId = overlappingNotes[0].stackId;
    } else {
      // Otherwise, assign a new stackId (for new groups of notes)
      stackId = Date.now();
    }
  
    const newNote = {
      id: Date.now(),
      latLng: contextMenuLatLng, // Save actual coordinates
      text: "New note",
      date: new Date().toLocaleString(),
      stackId, // Add the stackId for grouping
    };
  
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('mapNotes', JSON.stringify(updatedNotes));
    setContextMenuVisible(false);
  };  

  //const deleteNote = (noteId) => {
  //  const updatedNotes = notes.filter(note => note.id !== noteId);
  //  setNotes(updatedNotes);
  //  localStorage.setItem('mapNotes', JSON.stringify(updatedNotes));
  //};  

  const addFavorite = () => {
    if (!contextMenuLatLng) return; // Ensure coords are available
  
    const newFavorite = {
      id: Date.now(),
      latLng: contextMenuLatLng, // Save actual coordinates
      text: "New note",
      icon: <StarOutlined />,
      date: new Date().toLocaleString(),
    };
  
    const updatedFavorites = [...favorites, newFavorite];
    setNotes(updatedNotes);
    localStorage.setItem('favorites', JSON.stringify(updatedNotes));
    setContextMenuVisible(false);
  }; 

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
          style={{
            width: 50,
            height: 50,
            marginRight: 10,
          }}
        />
        <div style={{ color: '#C175FF', fontSize: 24, fontWeight: 'bold' }}>Borderless Living</div>
      </motion.div>

      <Drawer
        title={null} // Remove default title for a custom close button
        placement="left"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        closable={false} // Hide default close button
        style={{ zIndex: 2000 }} // Ensure it's above everything
        maskClosable={true}
        >
        {/* Custom Close Button - Only Show on Mobile */}
        {isMobile && (
            <div 
            onClick={() => setDrawerVisible(false)}
            style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#C175FF',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                zIndex: 3000, // Ensure it's above everything
            }}
            >
            ✕
            </div>
        )}

        {renderDrawerContent()}
        </Drawer>

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
  
      <Map 
        center={center} 
        zoom={currentZoom} 
        provider={CONFIG.tileProviders[mapStyle]}      
        onClick={handleMapClick}
        minZoom={4}
        maxZoom={18}
        onBoundsChanged={({ center: newCenter, zoom }) => {
          setCurrentZoom(zoom); // set zoom
          setCenter(newCenter); // set center of map 
          setContextMenuVisible(false);  // Hide context menu on map movement
        }}
        width="100vw" 
        height="100vh"
      >
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
                  pointerEvents: "auto"
                }}
              >
                <img 
                  src={country.flagUrl} 
                  alt={`${country.name} flag`} 
                  style={{ width: iconSize, height: 'auto' }} 
                />
              </div>
            </Marker>
          );
        })}
        {notes.map((note) => {
          // Group notes by stackId
          const stackedNotes = notes.filter(n => n.stackId === note.stackId);
          const stackCount = stackedNotes.length;

          // The latest note in the stack is the one with the most recent date (or the first one)
          const isLatestNote = note.id === stackedNotes[stackedNotes.length - 1].id;

          // Set the zoom threshold for displaying all notes
          const zoomThreshold = 0; // Example: Display all notes when zoom level is 12 or more
          const showAllNotes = currentZoom >= zoomThreshold;

          // Show the latest note with the group count badge for stacks with more than 1 note, otherwise display all notes if zoom is above the threshold
          const shouldShowLatestOnly = !showAllNotes && stackCount > 1 && !isLatestNote;
          const shouldShowNote = showAllNotes || !shouldShowLatestOnly;

          // Assign color based on stackId (group color)
          const groupColor = `hsl(${(note.stackId * 50) % 360}, 70%, 60%)`; // Dynamically generate colors for each group based on stackId

          // Icon size based on zoom level
          const noteSize = Math.max(14, 10 + (currentZoom / 4)); // Adjust the note's font size based on zoom level

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
                  display: shouldShowNote ? 'block' : 'none', // Only show notes based on logic
                }}
                onClick={(e) => e.stopPropagation()} // Prevent map click from firing
              >
                <div style={{ fontWeight: 'bold', color: '#333' }}>{note.date}</div>
                <div style={{ color: '#666', marginBottom: '5px' }}>{note.text}</div>

                {/* Only show badge when there are multiple notes in the stack */}
                {stackCount > 1 && isLatestNote && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: groupColor, // Color assigned based on stackId
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
                      transform: 'translate(25%, -25%)', // Slight hover effect
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    {stackCount}
                  </div>
                )}

                {/* Display post number on secondary notes */}
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
                      border: '1px solid ' + groupColor, // Border to make it look like an unoutlined number
                    }}
                  >
                    {stackedNotes.indexOf(note) + 1} {/* Show post number within the group */}
                  </div>
                )}

                
              </div>
            </Marker>
          );
        })}

      </Map>
      
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
          onClick={() => setContextMenuVisible(false)} // Hide when clicking on the menu itself
        >
          <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={addNote}>New Note</div>
          <div style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={addFavorite}>Mark as Favorite</div>
        </div>
      )}

      <Modal
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        closable={!isMobile}  // on desktop use default close icon; on mobile, use our custom button below
        style={{ top: 0, height: '100vh', padding: 0 }}
        styles={{ height: '100vh', overflowY: 'auto', padding: 0 }}
      >
        <div style={{ position: 'relative', height: '100%' }}>
          {/* Custom mobile close button */}
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
