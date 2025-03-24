import React from 'react';
import { Menu } from 'antd';
import { motion } from 'framer-motion';

const { SubMenu } = Menu;

const DrawerMenu = ({
  isMobile,
  mapStyle,
  handleMapTypeToggle,
  removeAllPins,
  uniqueCountries,
  handleCountryClick,
  pins,
  onCloseDrawer,
}) => {
  return (
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
          width="200"
          height="200"
          style={{ borderRadius: '50%' }} 
        />
        <p style={{ fontSize: 14, color: '#555' }}>
          Your guide to living beyond borders.
        </p>
      </div>
  
      <Menu mode="inline" style={{ border: 'none' }}>
        <Menu.Item key="home">
          <a href="/" style={{ fontSize: 18, color: '#1890ff' }}>Home</a>
        </Menu.Item>
  
        <Menu.Item key="about">
          <a href="/about" style={{ fontSize: 18, color: '#1890ff' }}>About</a>
        </Menu.Item>

        <SubMenu key="settings" title="Settings">
          <Menu.Item key="type" onClick={handleMapTypeToggle}>
            Toggle Map Type: {mapStyle}
          </Menu.Item>
        </SubMenu>

        <SubMenu key="countries" title="Countries List">
          {uniqueCountries.map((country) => (
            <Menu.Item 
              key={country.name} 
              onClick={() => {
                handleCountryClick(country);
                onCloseDrawer();
              }}
              style={{ fontSize: 16 }}
            >
              {country.name}
            </Menu.Item>
          ))}
        </SubMenu>

        <SubMenu key="pins" title="Community Pins">
          <Menu.Item 
            onClick={() => {
              removeAllPins();
              onCloseDrawer();
            }}
            style={{ fontSize: 16, color: 'red' }}
          >
            Delete All Pins
          </Menu.Item>
          {pins.map((pin) => (
            <Menu.Item 
              key={pin.id} 
              onClick={() => onCloseDrawer()}
              style={{ fontSize: 16 }}
            >
              {pin.text} {pin.date}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    </motion.div>
  );
};

export default DrawerMenu;
