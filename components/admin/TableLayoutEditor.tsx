import React, { useState, useRef, useEffect } from 'react';
import { Table, Area } from '../../types';
import { PlusCircleIcon, Squares2X2Icon, PencilIcon, TrashIcon } from '../icons';
import TableSettingsModal from './TableSettingsModal';

interface TableLayoutEditorProps {
    tables: Table[];
    setTables: React.Dispatch<React.SetStateAction<Table[]>>;
    areas: Area[];
    setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
}

const TableLayoutEditor: React.FC<TableLayoutEditorProps> = ({ tables, setTables, areas, setAreas }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    
    // Dragging state
    const [dragState, setDragState] = useState<{ id: string | number; type: 'move' | 'resize'; initialX: number; initialY: number; initialMouseX: number; initialMouseY: number; initialWidth?: number; initialHeight?: number } | null>(null);

    // Click vs Drag state
    const [isPotentialClick, setIsPotentialClick] = useState(false);
    
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    const editorRef = useRef<HTMLDivElement>(null);

    const findAreaForTable = (table: Table): Area | undefined => {
        return areas.find(area => 
            table.x >= area.x &&
            table.x + table.width <= area.x + area.width &&
            table.y >= area.y &&
            table.y + table.height <= area.y + area.height
        );
    }
    
    const handleMouseDown = (e: React.MouseEvent, id: string | number, type: 'move' | 'resize' = 'move') => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedItemId(id);
        setIsPotentialClick(true);
        
        const item = typeof id === 'number' 
            ? tables.find(t => t.id === id) 
            : areas.find(a => a.id === id);

        if (item) {
            setDragState({
                id,
                type,
                initialX: item.x,
                initialY: item.y,
                initialMouseX: e.clientX,
                initialMouseY: e.clientY,
                initialWidth: 'width' in item ? item.width : undefined,
                initialHeight: 'height' in item ? item.height : undefined,
            });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState) return;

        const dx = e.clientX - dragState.initialMouseX;
        const dy = e.clientY - dragState.initialMouseY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            setIsPotentialClick(false); // It's a drag, not a click
        }
        
        const updateItem = (prevItems: any[]) => prevItems.map(item => {
            if (item.id !== dragState.id) return item;

            if (dragState.type === 'move') {
                 return { ...item, x: dragState.initialX + dx, y: dragState.initialY + dy };
            }
            if (dragState.type === 'resize') {
                const newWidth = Math.max(50, (dragState.initialWidth || 0) + dx);
                const newHeight = Math.max(50, (dragState.initialHeight || 0) + dy);
                return { ...item, width: newWidth, height: newHeight };
            }
            return item;
        });

        if (typeof dragState.id === 'number') {
            setTables(updateItem);
        } else {
            setAreas(updateItem);
        }
    };
    
    const handleMouseUp = () => {
        const currentDragState = dragState;
        if (isPotentialClick && currentDragState) {
             const currentId = currentDragState.id;
             if (typeof currentId === 'number') {
                setTables(prevTables => {
                    const tableToEdit = prevTables.find(t => t.id === currentId);
                    if (tableToEdit) {
                        setEditingTable(tableToEdit);
                        setSettingsModalOpen(true);
                    }
                    return prevTables;
                });
             } else {
                setAreas(prevAreas => {
                    const areaToEdit = prevAreas.find(a => a.id === currentId);
                    if (areaToEdit) {
                        setEditingArea(areaToEdit);
                    }
                    return prevAreas;
                });
             }
        } else if (currentDragState && typeof currentDragState.id === 'number') {
            const currentId = currentDragState.id;
            // After dragging a table, update its area.
            setTables(prevTables => {
                const table = prevTables.find(t => t.id === currentId);
                if (table) {
                    const newArea = findAreaForTable(table);
                    if (table.area !== newArea?.name) {
                         return prevTables.map(t =>
                            t.id === table.id ? { ...t, area: newArea?.name } : t
                        );
                    }
                }
                return prevTables;
            });
        }
        
        setDragState(null);
        setIsPotentialClick(false);
    };

    const handleAddTable = () => {
        setTables(prevTables => {
            const newTable: Table = {
                id: Date.now(),
                name: `Mesa ${prevTables.length + 1}`,
                capacity: 4,
                shape: 'square',
                x: 20,
                y: 20,
                width: 80,
                height: 80,
            };
            return [...prevTables, newTable];
        });
    };

    const handleAddArea = () => {
        setAreas(prevAreas => {
            const newArea: Area = {
                id: `area-${Date.now()}`,
                name: `Nueva Área`,
                x: 20,
                y: 20,
                width: 300,
                height: 200,
                color: 'rgba(59, 130, 246, 0.1)'
            };
            return [...prevAreas, newArea];
        });
    };
    
    const handleUpdateArea = (e: React.ChangeEvent<HTMLInputElement>, field: 'name' | 'color') => {
        if (!editingArea) return;
        const { value } = e.target;
        const currentEditingAreaId = editingArea.id;
        setAreas(prev => prev.map(a => a.id === currentEditingAreaId ? {...a, [field]: value} : a));
        setEditingArea(prev => prev ? {...prev, [field]: value} : null);
    };

    const handleDeleteArea = (id: string) => {
         if (window.confirm("¿Seguro que quieres eliminar esta área?")) {
            const areaToDelete = areas.find(a => a.id === id);
            if (!areaToDelete) return;
            
            setAreas(prev => prev.filter(a => a.id !== id));
            
            // Fix: Unassign tables from the deleted area
            setTables(prevTables => 
                prevTables.map(t => 
                    t.area === areaToDelete.name ? { ...t, area: undefined } : t
                )
            );

            if (editingArea?.id === id) setEditingArea(null);
         }
    };
    
    const handleSaveTableSettings = (updatedTable: Table) => {
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
        setSettingsModalOpen(false);
        setEditingTable(null);
    };
    
    const handleDeleteTable = (tableId: number) => {
        setTables(prev => prev.filter(t => t.id !== tableId));
        setSettingsModalOpen(false);
        setEditingTable(null);
    };

    return (
        <div className="flex h-full gap-6">
            <div 
                ref={editorRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="flex-1 relative bg-gray-900 rounded-lg overflow-auto border-2 border-dashed border-gray-700 select-none"
            >
                {areas.map(area => (
                     <div
                        key={area.id}
                        onMouseDown={(e) => handleMouseDown(e, area.id, 'move')}
                        style={{
                            position: 'absolute',
                            left: `${area.x}px`,
                            top: `${area.y}px`,
                            width: `${area.width}px`,
                            height: `${area.height}px`,
                            backgroundColor: area.color,
                            cursor: dragState ? 'grabbing' : 'grab',
                            borderWidth: '2px',
                            borderColor: selectedItemId === area.id ? 'rgb(99 102 241)' : 'rgb(75 85 99)',
                        }}
                        className="rounded-lg border-dashed transition-colors"
                    >
                        <span className="absolute top-2 left-3 text-lg font-bold text-gray-400 pointer-events-none">{area.name}</span>
                        <div 
                            onMouseDown={(e) => handleMouseDown(e, area.id, 'resize')}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-full cursor-nwse-resize border-2 border-gray-900" 
                            style={{transform: 'translate(50%, 50%)'}}
                        />
                    </div>
                ))}
                {tables.map(table => (
                    <div
                        key={table.id}
                        onMouseDown={(e) => handleMouseDown(e, table.id, 'move')}
                        style={{
                            position: 'absolute',
                            left: `${table.x}px`,
                            top: `${table.y}px`,
                            width: `${table.width}px`,
                            height: `${table.height}px`,
                            borderRadius: table.shape === 'circle' ? '50%' : '0.5rem',
                            cursor: dragState ? 'grabbing' : 'grab',
                            outline: selectedItemId === table.id ? '2px solid #6366f1' : 'none',
                        }}
                        className={`flex items-center justify-center font-bold text-white shadow-lg transition-colors ${table.shape === 'fixture' ? 'bg-gray-600' : 'bg-gray-700'}`}
                    >
                        {table.name}
                    </div>
                ))}
            </div>
            <aside className="w-80 bg-gray-900 p-4 rounded-lg flex flex-col">
                <h3 className="text-xl font-bold mb-4">Controles del Plano</h3>
                 <button onClick={handleAddTable} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-2">
                    <PlusCircleIcon className="h-5 w-5" />
                    Añadir Mesa/Objeto
                </button>
                <button onClick={handleAddArea} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4">
                    <Squares2X2Icon className="h-5 w-5" />
                    Añadir Área de Salón
                </button>

                <h4 className="font-bold mt-4 border-t border-gray-700 pt-4">Áreas del Salón</h4>
                 <div className="flex-1 overflow-y-auto mt-2 space-y-2">
                    {areas.map(area => (
                        <div key={area.id} onClick={() => { setSelectedItemId(area.id); setEditingArea(area); }} className={`p-2 rounded-lg cursor-pointer ${selectedItemId === area.id ? 'bg-indigo-900' : 'bg-gray-800 hover:bg-gray-700'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{area.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingArea(area); setSelectedItemId(area.id); }} className="text-gray-400 hover:text-white"><PencilIcon className="h-4 w-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id); }} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>

                {editingArea && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                        <h4 className="font-bold mb-2">Editando: {editingArea.name}</h4>
                        <div className="space-y-2">
                            <div>
                                <label className="text-sm">Nombre</label>
                                <input type="text" value={editingArea.name} onChange={(e) => handleUpdateArea(e, 'name')} className="w-full bg-gray-700 rounded p-1" />
                            </div>
                            <div>
                                <label className="text-sm">Color</label>
                                <input type="color" value={editingArea.color} onChange={(e) => handleUpdateArea(e, 'color')} className="w-full bg-gray-700 rounded p-1 h-8" />
                            </div>
                        </div>
                    </div>
                )}

            </aside>
            {editingTable && (
                <TableSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                    table={editingTable}
                    onSave={handleSaveTableSettings}
                    onDelete={handleDeleteTable}
                />
            )}
        </div>
    );
};

export default TableLayoutEditor;