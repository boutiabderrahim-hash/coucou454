import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Category, MenuItem, Waiter, InventoryItem, Customer } from '../../types';
import { SparklesIcon, UserCircleIcon, PaperAirplaneIcon } from '../icons';
import { formatCurrency } from '../../utils/helpers';

interface AIAssistantProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    waiters: Waiter[];
    setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

interface Message {
    sender: 'user' | 'ai';
    text?: string;
    timestamp: number;
}

const AIAssistant: React.FC<AIAssistantProps> = (props) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: '¡Hola! Soy Marra, tu asistente de IA. ¿Cómo puedo ayudarte a gestionar tu restaurante hoy? Puedes pedirme que añada artículos, cambie precios o te dé sugerencias.', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proposedAction, setProposedAction] = useState<{ rawAction: any, description: React.ReactNode } | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages, isLoading, proposedAction]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userInput, timestamp: Date.now() }]);
        setInput('');
        setIsLoading(true);
        setProposedAction(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const systemInstruction = `You are a helpful AI assistant integrated into a Point of Sale (POS) system. Your name is 'Marra'.
You must communicate in Spanish. Your goal is to help the administrator manage the restaurant's data efficiently.
The user will give you commands in natural language.
You MUST analyze the user's request and the provided data context (menu, categories, inventory).
Based on the request, you will generate a JSON object with two properties: "action" and "payload".

Possible values for "action":
1. "CONVERSATIONAL_RESPONSE": Use this for greetings, questions, suggestions, or any response that doesn't directly modify data. The payload should be { "text": "Your response in Spanish." }.
2. "ADD_MENU_ITEM": Use this when the user wants to add a new item to the menu. The payload should be { "name": string, "price": number, "categoryId": string, "isStockTracked": boolean, "imageUrl": string | undefined }. You MUST infer the categoryId from the user's request and the provided categories list. If you cannot infer it, ask for clarification using a CONVERSATIONAL_RESPONSE.
3. "UPDATE_MENU_ITEMS": Use this for modifying existing menu items (e.g., price changes). The payload should be { "filter": { "categoryId"?: string, "itemId"?: string, "nameContains"?: string }, "change": { "price": { "type": "percentage" | "fixed_increase" | "set", "value": number } } }.
4. "ADD_INVENTORY": Use this to add stock to an existing inventory item. The payload should be { "itemId": string, "quantityToAdd": number }.`;

            const contextData = {
                categories: props.categories,
                menuItems: props.menuItems.map(({id, name, price, categoryId, isStockTracked}) => ({id, name, price, categoryId, isStockTracked})),
                inventory: props.inventory
            };

            const userPrompt = `Here is the current data context from the POS system:\n${JSON.stringify(contextData)}\n\nUser command: "${userInput}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                }
            });

            const rawResponse = response.text.trim();
            let aiAction;
            try {
                // The response should be a clean JSON string, but we can keep the markdown cleanup logic as a fallback.
                let cleanResponse = rawResponse;
                const jsonMatch = cleanResponse.match(/```(?:json)?\n([\s\S]*?)\n```/);
                if (jsonMatch && jsonMatch[1]) {
                    cleanResponse = jsonMatch[1];
                }
                aiAction = JSON.parse(cleanResponse);
            } catch (e) {
                console.error("Failed to parse AI response JSON:", rawResponse); // Log original for debugging
                setMessages(prev => [...prev, { sender: 'ai', text: "Lo siento, he tenido un problema al procesar tu solicitud. Por favor, intenta reformularla.", timestamp: Date.now() }]);
                return;
            }
            handleAIAction(aiAction);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Error al conectar con el servicio de IA. Por favor, inténtalo de nuevo más tarde.', timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const describeAction = (action: any): React.ReactNode => {
        switch (action.action) {
            case 'ADD_MENU_ITEM':
                const category = props.categories.find(c => c.id === action.payload.categoryId);
                return (
                    <div>
                        <p><strong>Añadir nuevo artículo al menú:</strong></p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Nombre: <strong>{action.payload.name}</strong></li>
                            <li>Precio: <strong>{formatCurrency(action.payload.price)}</strong></li>
                            <li>Categoría: <strong>{category?.name || 'Desconocida'}</strong></li>
                        </ul>
                    </div>
                );
            case 'UPDATE_MENU_ITEMS':
                const { filter, change } = action.payload;
                let filterDesc = "todos los artículos";
                if (filter.categoryId) {
                    const category = props.categories.find(c => c.id === filter.categoryId);
                    filterDesc = `artículos en la categoría "${category?.name || 'Desconocida'}"`;
                } else if (filter.itemId) {
                     const item = props.menuItems.find(m => m.id === filter.itemId);
                     filterDesc = `el artículo "${item?.name}"`;
                }
                 let changeDesc = "";
                if (change.price) {
                    if(change.price.type === 'percentage') changeDesc = `aumentar el precio un ${change.price.value}%`;
                    if(change.price.type === 'fixed_increase') changeDesc = `aumentar el precio en ${formatCurrency(change.price.value)}`;
                    if(change.price.type === 'set') changeDesc = `fijar el precio a ${formatCurrency(change.price.value)}`;
                }
                return `Se propone ${changeDesc} para ${filterDesc}.`;
            default:
                return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(action.payload, null, 2)}</pre>;
        }
    }

    const handleAIAction = (aiAction: any) => {
        if (!aiAction || !aiAction.action) {
            setMessages(prev => [...prev, { sender: 'ai', text: "No he entendido tu petición. ¿Puedes intentarlo de otra manera?", timestamp: Date.now() }]);
            return;
        }

        switch (aiAction.action) {
            case 'CONVERSATIONAL_RESPONSE':
                setMessages(prev => [...prev, { sender: 'ai', text: aiAction.payload.text, timestamp: Date.now() }]);
                break;
            case 'ADD_MENU_ITEM':
            case 'UPDATE_MENU_ITEMS':
            case 'ADD_INVENTORY':
                setProposedAction({ rawAction: aiAction, description: describeAction(aiAction) });
                break;
            default:
                setMessages(prev => [...prev, { sender: 'ai', text: `Recibí una acción desconocida: ${aiAction.action}`, timestamp: Date.now() }]);
        }
    };

    const handleApplyAction = () => {
        if (!proposedAction) return;
        const { action, payload } = proposedAction.rawAction;
        let successMessage = "";
        try {
            switch (action) {
                case 'ADD_MENU_ITEM':
                    const newMenuItem: MenuItem = {
                        ...payload, id: `item-${Date.now()}`
                    };
                    props.setMenuItems(prev => [...prev, newMenuItem]);
                    successMessage = `¡Hecho! Se ha añadido "${payload.name}" al menú.`;
                    break;
                case 'UPDATE_MENU_ITEMS':
                    const { filter, change } = payload;
                    props.setMenuItems(prev => {
                        return prev.map(item => {
                            let matchesFilter = false;
                            if(filter.categoryId && item.categoryId === filter.categoryId) matchesFilter = true;
                            if(filter.itemId && item.id === filter.itemId) matchesFilter = true;
                            if(!filter.categoryId && !filter.itemId && !filter.nameContains) matchesFilter = true;
                            if(filter.nameContains && item.name.toLowerCase().includes(filter.nameContains.toLowerCase())) matchesFilter = true;

                            if (matchesFilter && change.price) {
                                let newPrice = item.price;
                                if(change.price.type === 'percentage') newPrice *= (1 + change.price.value / 100);
                                if(change.price.type === 'fixed_increase') newPrice += change.price.value;
                                if(change.price.type === 'set') newPrice = change.price.value;
                                return { ...item, price: parseFloat(newPrice.toFixed(2)) };
                            }
                            return item;
                        });
                    });
                    successMessage = "¡Perfecto! He actualizado los precios según tus indicaciones.";
                    break;
            }
            setMessages(prev => [...prev, { sender: 'ai', text: successMessage, timestamp: Date.now() }]);
        } catch (error) {
             setMessages(prev => [...prev, { sender: 'ai', text: `Hubo un error al aplicar los cambios.`, timestamp: Date.now() }]);
        } finally {
            setProposedAction(null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 rounded-lg p-4 gap-4">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 flex items-center gap-3">
                <SparklesIcon className="h-7 w-7 text-indigo-400" />
                Asistente de IA "Marra"
            </h2>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.timestamp} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="h-6 w-6 text-white" /></div>}
                        <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><UserCircleIcon className="h-8 w-8 text-white" /></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="h-6 w-6 text-white" /></div>
                        <div className="max-w-xl p-4 rounded-2xl bg-gray-700 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                {proposedAction && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><SparklesIcon className="h-6 w-6 text-white" /></div>
                        <div className="max-w-xl p-4 rounded-2xl bg-gray-700 rounded-bl-none border-2 border-yellow-500">
                            <p className="font-semibold mb-2">He preparado la siguiente acción para ti:</p>
                            <div className="bg-gray-800 p-3 rounded-md mb-3 text-sm">{proposedAction.description}</div>
                            <p className="text-sm mb-3">¿Quieres aplicar estos cambios?</p>
                            <div className="flex gap-3">
                                <button onClick={handleApplyAction} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-lg">Aplicar Cambios</button>
                                <button onClick={() => setProposedAction(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded-lg">Descartar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto flex items-center gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un comando... (ej: 'sube el precio de la coca-cola a 3€')"
                    className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

export default AIAssistant;