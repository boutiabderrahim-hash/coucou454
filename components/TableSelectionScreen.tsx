import React, { useState, useRef, useLayoutEffect } from 'react';
import { Table, Order, Area } from '../types';
import { ClockIcon, UserGroupIcon, CheckCircleIcon } from './icons';
import { formatCurrency } from '../utils/helpers';

interface TableSelectionScreenProps {
  tables: Table[];
  areas: Area[];
  orders: Order[];
  onSelectTable: (tableId: number) => void;
}

const TableSelectionScreen: React.FC<TableSelectionScreenProps> = ({ tables, areas, orders, onSelectTable }) => {
  const [zoomedArea, setZoomedArea] = useState<Area | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({ transform: 'scale(1) translate(0, 0)' });

  useLayoutEffect(() => {
    const calculateTransform = () => {
      if (!containerRef.current) return;
      const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

      if (containerWidth <= 0 || containerHeight <= 0) return; // Guard against zero dimensions

      let targetBounds;

      if (zoomedArea) {
        // Zoom to the selected area
        targetBounds = {
          minX: zoomedArea.x,
          minY: zoomedArea.y,
          width: zoomedArea.width,
          height: zoomedArea.height,
        };
      } else {
        // Overview of all areas and tables
        if (tables.length === 0 && areas.length === 0) return;
        
        const allItems = [...tables, ...areas];
        const minX = Math.min(...allItems.map(i => i.x));
        const minY = Math.min(...allItems.map(i => i.y));
        const maxX = Math.max(...allItems.map(i => i.x + i.width));
        const maxY = Math.max(...allItems.map(i => i.y + i.height));

        targetBounds = {
          minX,
          minY,
          width: maxX - minX,
          height: maxY - minY,
        };
      }
      
      if (targetBounds.width <= 0 || targetBounds.height <= 0) return; // Guard against zero-sized bounds

      const padding = 40;
      const effectiveWidth = containerWidth - padding * 2;
      const effectiveHeight = containerHeight - padding * 2;
      
      if (effectiveWidth <= 0 || effectiveHeight <= 0) return;

      const scaleX = effectiveWidth / targetBounds.width;
      const scaleY = effectiveHeight / targetBounds.height;
      const scale = Math.min(scaleX, scaleY);
      
      const translateX = -targetBounds.minX * scale + (containerWidth - targetBounds.width * scale) / 2;
      const translateY = -targetBounds.minY * scale + (containerHeight - targetBounds.height * scale) / 2;

      setTransformStyle({
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: 'top left', // This ensures scaling and translation are calculated from the same reference point
        transition: 'transform 0.5s ease-in-out',
      });
    };

    calculateTransform();
    window.addEventListener('resize', calculateTransform);
    return () => window.removeEventListener('resize', calculateTransform);

  }, [zoomedArea, tables, areas]);

  const getTableStatus = (table: Table) => {
    const order = orders.find(o => o.tableNumber === table.id && o.status === 'open');
    if (order) {
      return { status: 'occupied' as const, order };
    }
    const recentlyClosedOrder = orders.find(o => o.tableNumber === table.id && o.status === 'closed' && (Date.now() - (o.closedAt || 0)) < 2 * 60000);
    if (recentlyClosedOrder) {
        return { status: 'just-paid' as const };
    }
    return { status: 'free' as const };
  };

  const TableComponent: React.FC<{table: Table}> = ({ table }) => {
    const { status, order } = getTableStatus(table);
    let bgColor = 'bg-gray-700 hover:bg-indigo-600';
    let borderColor = 'border-gray-600';

    if (status === 'occupied') {
        bgColor = 'bg-red-800 hover:bg-red-700';
        borderColor = 'border-red-600';
    }
    if (status === 'just-paid') {
        bgColor = 'bg-green-800 hover:bg-green-700';
        borderColor = 'border-green-600';
    }
    if(table.shape === 'fixture') {
        bgColor = 'bg-gray-600';
        borderColor = 'border-gray-500';
    }

    const tableStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
        borderRadius: table.shape === 'circle' ? '50%' : '0.75rem',
    };

    let tableContent;

    if (status === 'occupied' && order) {
        tableContent = (
            <>
                <div className="absolute top-2 left-2 flex items-center text-xs text-gray-200 bg-black bg-opacity-20 px-1 rounded">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>{table.capacity}</span>
                </div>
                
                <div className="absolute top-2 right-2 flex items-center text-xs text-gray-200 bg-black bg-opacity-40 px-2 py-0.5 rounded-full">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{table.name}</span>
                    <p className="font-bold text-lg mt-1">{formatCurrency(order.total)}</p>
                </div>
            </>
        );
    } else if (status === 'just-paid') {
        tableContent = (
             <>
                <div className="absolute top-2 left-2 flex items-center text-xs text-gray-200 bg-black bg-opacity-20 px-1 rounded">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>{table.capacity}</span>
                </div>
                <span className="text-xl font-bold text-gray-500 line-through">{table.name}</span>
                <div className="absolute bottom-2 flex flex-col items-center w-full">
                    <CheckCircleIcon className="h-8 w-8 text-green-400"/>
                    <p className="text-xs mt-1">Pagado</p>
                </div>
            </>
        );
    } else { // free
        tableContent = (
            <>
                <div className="absolute top-2 left-2 flex items-center text-xs text-gray-200 bg-black bg-opacity-20 px-1 rounded">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>{table.capacity}</span>
                </div>
                <span className="text-xl font-bold">{table.name}</span>
            </>
        );
    }

    if (table.shape === 'fixture') {
        return (
            <div style={tableStyle} className={`flex flex-col items-center justify-center p-2 shadow-inner border-2 border-dashed ${borderColor} ${bgColor}`}>
                <span className="text-sm font-semibold text-gray-300">{table.name}</span>
            </div>
        );
    }

    return (
        <button
            style={tableStyle}
            onClick={() => onSelectTable(table.id)}
            className={`flex flex-col items-center justify-center p-2 shadow-lg transition-all transform hover:-translate-y-1 border-2 ${borderColor} ${bgColor}`}
        >
            {tableContent}
        </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800 p-4 overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            <button onClick={() => setZoomedArea(null)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${!zoomedArea ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>
                Ver Todo
            </button>
            {areas.map(area => (
                <button key={area.id} onClick={() => setZoomedArea(area)} className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${zoomedArea?.id === area.id ? 'bg-indigo-600 text-white' : 'bg-gray-700'}`}>
                    {area.name}
                </button>
            ))}
        </div>
      </div>
      <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden" ref={containerRef}>
        <div style={transformStyle}>
          {areas.map(area => (
            <div
              key={area.id}
              style={{
                position: 'absolute',
                left: `${area.x}px`,
                top: `${area.y}px`,
                width: `${area.width}px`,
                height: `${area.height}px`,
                backgroundColor: area.color,
              }}
              className="rounded-lg border-2 border-dashed border-gray-600"
            >
              <span className="absolute top-2 left-3 text-lg font-bold text-gray-400 select-none">{area.name}</span>
            </div>
          ))}
          {tables.map(table => (
             <TableComponent key={table.id} table={table} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSelectionScreen;