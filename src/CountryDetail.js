import React, { useRef, useState, useEffect } from 'react';
import { Card, Typography, Divider, Menu, Collapse } from 'antd';
import { motion } from 'framer-motion';
import "./site.css"

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const CountryDetail = ({ country, onClose }) => {
    // Mobile detection hook.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Refs for scrolling to sections.
  const basicRef = useRef(null);
  const movingRef = useRef(null);
  const resourcesRef = useRef(null);
  const videoRef = useRef(null);
  const additionalRef = useRef(null);
  const culturalRef = useRef(null);
  const travelRef = useRef(null);
  const costRef = useRef(null);
  const bestCitiesRef = useRef(null);

  // Early return if no country is provided.
  if (!country) return null;

  // Destructure fields from the country's moreInfo object.
  const { 
    visaProcess, 
    requirements, 
    extra, 
    helpfulLinks, 
    embedVideoUrl,
    additionalInfo,
    culturalInsights,
    travelTips,
    costOfLiving,
    bestCities,
  } = country.moreInfo || {};

  // Function to scroll to a section.
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Define the sections for the navbar.
  const sections = [
    { key: 'basic', label: 'Basic Info', ref: basicRef },
    { key: 'moving', label: 'Moving Details', ref: movingRef },
    { key: 'resources', label: 'Resources', ref: resourcesRef },
    { key: 'video', label: 'Video', ref: videoRef },
    { key: 'additional', label: 'Additional Info', ref: additionalRef },
    { key: 'cultural', label: 'Cultural Insights', ref: culturalRef },
    { key: 'travel', label: 'Travel Tips', ref: travelRef },
    { key: 'cost', label: 'Cost of Living', ref: costRef },
    { key: 'cities', label: 'Best Cities', ref: bestCitiesRef },
  ];

  return (
    <>
      {/* Inline CSS to hide scrollbars */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      <motion.div
        className="hide-scrollbar"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        style={{
          minHeight: '100%',
          padding: isMobile ? '10px' : '20px',
          background: '#f0f2f5',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Mobile-specific close button */}
        {isMobile && onClose && (
          <div
            onClick={onClose}
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

        <Card
          style={{ 
            width: '100%', 
            maxWidth: isMobile ? '100%' : 800, 
            margin: isMobile ? '0 10px' : '0 auto',
            boxShadow: 'none',
            border: 'none'
          }}
          bodyStyle={{ padding: isMobile ? '10px' : '20px' }}
        >
          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <img
              src={country.flagUrl}
              alt={`${country.name} flag`}
              style={{ width: 64, height: 'auto', marginRight: 16 }}
            />
            <Title level={2} style={{ margin: 0 }}>{country.name}</Title>
          </div>

          {/* Sectional Navbar */}
          <Menu mode="horizontal" style={{ marginBottom: 16, borderBottom: 'none' }}>
            {sections.map(section => (
              <Menu.Item key={section.key} onClick={() => scrollToSection(section.ref)}>
                {section.label}
              </Menu.Item>
            ))}
          </Menu>

          {/* Basic Info Section */}
          <div ref={basicRef}>
            <Title level={4}>Basic Info</Title>
            <Paragraph>
              <Text strong>Language:</Text> {country.language}
            </Paragraph>
          </div>
          <Divider />

          {/* Moving Details Section */}
          <div ref={movingRef}>
            <Title level={4}>Moving from the USA</Title>
            <Paragraph>
              <Text strong>Visa Process:</Text> {visaProcess || 'Details coming soon.'}
            </Paragraph>
            <Paragraph>
              <Text strong>Requirements:</Text> {requirements || 'Details coming soon.'}
            </Paragraph>
            <Paragraph>{extra || 'More information will be provided in the near future.'}</Paragraph>
          </div>
          <Divider />

          {/* Useful Resources Section */}
          <div ref={resourcesRef}>
            <Title level={4}>Useful Resources</Title>
            {helpfulLinks && helpfulLinks.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {helpfulLinks.map((link, index) => (
                  <li key={index} style={{ marginBottom: 4 }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <Paragraph>No additional resources available.</Paragraph>
            )}
          </div>
          <Divider />

          {/* Embedded Video Section */}
          {embedVideoUrl && (
            <>
              <div ref={videoRef}>
                <Title level={4}>Informative Video</Title>
                <div style={{ position: 'relative', paddingBottom: '56.25%', paddingTop: 25, height: 0 }}>
                  <iframe
                    title="Informative Video"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={embedVideoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Additional Information Section */}
          <div ref={additionalRef}>
            <Title level={4}>Additional Information</Title>
            <Paragraph>{additionalInfo || 'No additional information provided.'}</Paragraph>
          </div>
          <Divider />

          {/* Cultural Insights Section */}
          {culturalInsights && (
            <>
              <div ref={culturalRef}>
                <Title level={4}>Cultural Insights</Title>
                <Paragraph>{culturalInsights}</Paragraph>
              </div>
              <Divider />
            </>
          )}

          {/* Travel Tips Section */}
          {travelTips && (
            <>
              <div ref={travelRef}>
                <Title level={4}>Travel Tips</Title>
                <Paragraph>{travelTips}</Paragraph>
              </div>
              <Divider />
            </>
          )}

          {/* Cost of Living Section */}
          {costOfLiving && (
            <div ref={costRef}>
              <Title level={4}>Cost of Living</Title>
              <Paragraph>{costOfLiving}</Paragraph>
            </div>
          )}
          <Divider />

          {/* Best Cities Section */}
          {bestCities && bestCities.length > 0 && (
            <div ref={bestCitiesRef}>
              <Title level={4}>Best Cities</Title>
              <Collapse accordion>
                {bestCities.map((city, index) => (
                  <Panel header={city.name} key={index}>
                    <Paragraph>{city.description}</Paragraph>
                    <Paragraph>{city.extra}</Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </div>
          )}
        </Card>
      </motion.div>
    </>
  );
};

export default CountryDetail;
