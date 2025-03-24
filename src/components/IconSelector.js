import React, { useState } from 'react';
import { Modal, Input } from 'antd';
import { 
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

const IconSelector = ({ visible, onSelect, onCancel }) => {
  const [search, setSearch] = useState('');

  // Define the 10 best two-tone icons with their color definitions
  const icons = [
    { name: 'HeartTwoTone', component: HeartTwoTone, color: '#f5222d' },
    { name: 'StarTwoTone', component: StarTwoTone, color: '#faad14' },
    { name: 'SmileTwoTone', component: SmileTwoTone, color: '#52c41a' },
    { name: 'FrownTwoTone', component: FrownTwoTone, color: '#1890ff' },
    { name: 'CheckCircleTwoTone', component: CheckCircleTwoTone, color: '#13c2c2' },
    { name: 'CloseCircleTwoTone', component: CloseCircleTwoTone, color: '#eb2f96' },
    { name: 'InfoCircleTwoTone', component: InfoCircleTwoTone, color: '#2f54eb' },
    { name: 'ExclamationCircleTwoTone', component: ExclamationCircleTwoTone, color: '#fa541c' },
    { name: 'PushpinTwoTone', component: PushpinTwoTone, color: '#722ed1' },
    { name: 'ThunderboltTwoTone', component: ThunderboltTwoTone, color: '#a0d911' },
  ];

  // Filter icons based on search input
  const filteredIcons = icons.filter(icon =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal title="Select an Icon" open={visible} onCancel={onCancel} footer={null} width={600}>
      <Input 
        placeholder="Search icons..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        style={{ marginBottom: 16 }} 
      />
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '16px', 
          maxHeight: '300px', 
          overflowY: 'auto' 
        }}
      >
        {filteredIcons.map(({ name, component: IconComponent, color }) => (
          <div 
            key={name} 
            style={{ textAlign: 'center', cursor: 'pointer' }} 
            onClick={() => onSelect({ name, color })}
          >
            <IconComponent twoToneColor={color} style={{ fontSize: 32 }} />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default IconSelector;
