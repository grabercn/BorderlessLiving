import React, { useState, useEffect } from 'react';
import { Modal, Drawer, Button, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Map, Marker } from 'pigeon-maps';
import { motion } from 'framer-motion';
import CountryDetail from './CountryDetail';
import countries from './CountryData';
import "./site.css"

const { SubMenu } = Menu;

const noLabelProvider = (x, y, z) =>
  `https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/${z}/${x}/${y}.png`;

const menuItems = [
  { label: "Home", url: "/" },
  { label: "About", url: "/about" },
  { label: "Services", url: "/services" },
  { label: "Contact", url: "/contact" }
];

const CountryHome = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [center, setCenter] = useState([46.603354, 1.888334]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);

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

  const renderDrawerContent = () => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 20 }}
    >
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <img 
          src="https://via.placeholder.com/100" 
          alt="Brand Logo" 
          style={{ borderRadius: '50%' }} 
        />
        <h2 style={{ marginTop: 10, color: '#C175FF' }}>Borderless Living</h2>
        <p style={{ fontSize: 14, color: '#555' }}>
          Your guide to living beyond borders.
        </p>
      </div>
      <Menu mode="inline" style={{ border: 'none' }}>
        {menuItems.map((item) => (
          <Menu.Item key={item.label}>
            <a href={item.url} style={{ fontSize: 18, color: '#1890ff' }}>{item.label}</a>
          </Menu.Item>
        ))}
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
      </Menu>
    </motion.div>
  );

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
        visible={welcomeVisible}
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
        provider={noLabelProvider}
        minZoom={4}
        maxZoom={18}
        onBoundsChanged={({ center: newCenter, zoom }) => {
          setCurrentZoom(zoom);
          setCenter(newCenter);
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
      </Map>

      <Modal
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="100%"
        closable={!isMobile}  // on desktop use default close icon; on mobile, use our custom button below
        style={{ top: 0, height: '100vh', padding: 0 }}
        bodyStyle={{ height: '100vh', overflowY: 'auto', padding: 0 }}
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
