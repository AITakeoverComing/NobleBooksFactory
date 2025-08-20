"""WebSocket connection manager for real-time updates."""

from typing import Dict, List
from fastapi import WebSocket
from loguru import logger
import json


class WebSocketManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_rooms: Dict[str, List[str]] = {}  # client_id -> list of rooms
        self.room_clients: Dict[str, List[str]] = {}  # room -> list of client_ids
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept and store a WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_rooms[client_id] = []
        logger.info(f"WebSocket client {client_id} connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            # Remove from all rooms
            if client_id in self.client_rooms:
                for room in self.client_rooms[client_id]:
                    if room in self.room_clients and client_id in self.room_clients[room]:
                        self.room_clients[room].remove(client_id)
                        if not self.room_clients[room]:
                            del self.room_clients[room]
                del self.client_rooms[client_id]
            
            # Remove connection
            del self.active_connections[client_id]
            logger.info(f"WebSocket client {client_id} disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, client_id: str):
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def send_json_to_client(self, data: dict, client_id: str):
        """Send JSON data to a specific client."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(data))
            except Exception as e:
                logger.error(f"Error sending JSON to {client_id}: {e}")
                self.disconnect(client_id)
    
    async def broadcast_message(self, message: str):
        """Broadcast a message to all connected clients."""
        disconnected_clients = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def broadcast_json(self, data: dict):
        """Broadcast JSON data to all connected clients."""
        await self.broadcast_message(json.dumps(data))
    
    def join_room(self, client_id: str, room: str):
        """Add a client to a room."""
        if client_id not in self.active_connections:
            return False
        
        if client_id not in self.client_rooms:
            self.client_rooms[client_id] = []
        
        if room not in self.client_rooms[client_id]:
            self.client_rooms[client_id].append(room)
        
        if room not in self.room_clients:
            self.room_clients[room] = []
        
        if client_id not in self.room_clients[room]:
            self.room_clients[room].append(client_id)
        
        logger.info(f"Client {client_id} joined room {room}")
        return True
    
    def leave_room(self, client_id: str, room: str):
        """Remove a client from a room."""
        if client_id in self.client_rooms and room in self.client_rooms[client_id]:
            self.client_rooms[client_id].remove(room)
        
        if room in self.room_clients and client_id in self.room_clients[room]:
            self.room_clients[room].remove(client_id)
            if not self.room_clients[room]:
                del self.room_clients[room]
        
        logger.info(f"Client {client_id} left room {room}")
    
    async def send_to_room(self, message: str, room: str):
        """Send a message to all clients in a room."""
        if room not in self.room_clients:
            return
        
        disconnected_clients = []
        for client_id in self.room_clients[room]:
            if client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_text(message)
                except Exception as e:
                    logger.error(f"Error sending to room {room}, client {client_id}: {e}")
                    disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def send_json_to_room(self, data: dict, room: str):
        """Send JSON data to all clients in a room."""
        await self.send_to_room(json.dumps(data), room)
    
    def get_room_clients(self, room: str) -> List[str]:
        """Get list of clients in a room."""
        return self.room_clients.get(room, [])
    
    def get_client_rooms(self, client_id: str) -> List[str]:
        """Get list of rooms a client is in."""
        return self.client_rooms.get(client_id, [])
    
    def get_stats(self) -> dict:
        """Get WebSocket connection statistics."""
        return {
            "total_connections": len(self.active_connections),
            "total_rooms": len(self.room_clients),
            "clients_by_room": {room: len(clients) for room, clients in self.room_clients.items()},
            "connected_clients": list(self.active_connections.keys())
        }