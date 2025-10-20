import React, { useState, useEffect } from 'react';
import { RestaurantSettings } from '../../types';

interface RestaurantSettingsProps {
    settings: RestaurantSettings;
    onUpdateSettings: (settings: RestaurantSettings) => void;
}

const RestaurantSettingsComponent: React.FC<RestaurantSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState<RestaurantSettings>(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdateSettings(formData);
        alert('Ajustes guardados con éxito.');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Ajustes del Restaurante</h2>
            <div className="bg-gray-900 rounded-lg shadow p-8 max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre del Restaurante</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300">Dirección</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Teléfono</label>
                    <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-300">URL del Logo</label>
                    <input type="text" name="logoUrl" id="logoUrl" value={formData.logoUrl || ''} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="footer" className="block text-sm font-medium text-gray-300">Texto de Pie de Recibo</label>
                    <textarea name="footer" id="footer" value={formData.footer || ''} onChange={handleChange} rows={3}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                </div>
                <div className="text-right">
                     <button onClick={handleSave} className="py-2 px-6 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSettingsComponent;
