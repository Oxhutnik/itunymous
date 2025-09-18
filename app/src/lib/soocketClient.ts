"use client";
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: false,
  transports: ['websocket', 'polling'],
});

// Add debugging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('match_found', (data) => {
  console.log('Socket received match_found event:', data);
});

socket.on('user_left', (message) => {
  console.log('Socket received user_left event:', message);
});

socket.on('user_joined', (message) => {
  console.log('Socket received user_joined event:', message);
});

socket.on('chat_ended', (data) => {
  console.log('Socket received chat_ended event:', data);
});

socket.on('reconnect', () => {
  console.log('Socket reconnected:', socket.id);
});

socket.on('reconnect_error', (error) => {
  console.error('Socket reconnection error:', error);
});
