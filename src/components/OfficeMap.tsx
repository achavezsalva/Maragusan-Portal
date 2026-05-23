import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DepartmentInfo } from '../constants/departments';

// Fix for default marker icon in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface OfficeMapProps {
  departments: DepartmentInfo[];
}

// Helper to get coordinates for Maragusan municipal offices
// Maragusan Municipal Hall is roughly at 7.3484, 126.1264
const getOfficeCoordinates = (location: string): [number, number] => {
  const loc = location.toLowerCase();
  
  if (loc.includes('municipal hall')) return [7.3484, 126.1264];
  if (loc.includes('legislative')) return [7.3486, 126.1266];
  if (loc.includes('health center')) return [7.3478, 126.1258];
  if (loc.includes('fire station')) return [7.3490, 126.1270];
  if (loc.includes('police station')) return [7.3492, 126.1272];
  if (loc.includes('social welfare')) return [7.3480, 126.1300];
  if (loc.includes('agriculture')) return [7.3470, 126.1250];
  if (loc.includes('tourism center')) return [7.3460, 126.1240];
  if (loc.includes('solid waste')) return [7.3450, 126.1230];
  
  // Default to center of Poblacion with a slight random offset to prevent overlap
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = (hash % 20) * 0.0001; 
  return [7.3484 + offset, 126.1264 + offset];
};

const OfficeMap: React.FC<OfficeMapProps> = ({ departments }) => {
  // Filter departments that have a location and map them to markers
  const markers = departments
    .filter(dept => dept.contact && dept.contact.location)
    .map(dept => ({
      id: dept.id,
      name: dept.name,
      location: dept.contact.location,
      position: getOfficeCoordinates(dept.contact.location)
    }));

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-brand-border shadow-xl relative z-0">
      <MapContainer 
        center={[7.3484, 126.1264]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div className="font-sans p-1">
                <h4 className="font-bold text-brand-accent m-0">{marker.name}</h4>
                <p className="text-[10px] mt-1 text-slate-600 leading-tight">{marker.location}</p>
                <div className="mt-2 flex justify-end">
                   <a 
                     href={`/directory/${marker.id}`} 
                     className="text-[10px] uppercase font-black tracking-widest text-brand-secondary hover:text-brand-accent transition-colors"
                   >
                     View Profile
                   </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend / Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl border border-brand-border shadow-lg max-w-[200px]">
        <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-2">Municipal Map</div>
        <p className="text-[9px] text-brand-text-dim leading-relaxed italic">
          Click on a marker to view department details and specific office locations.
        </p>
      </div>
    </div>
  );
};

export default OfficeMap;
