import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.userId = null;
    this.onNotificationCallback = null;
  }

  connect(userId, onNotification) {
    if (this.getConnectionStatus()) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.onNotificationCallback = onNotification;

    // Create SockJS connection
    const socket = new SockJS('http://localhost:8080/ws');
    
    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToNotifications();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        this.handleReconnect();
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.isConnected = false;
        this.handleReconnect();
      }
    });

    this.client.activate();
  }

  subscribeToNotifications() {
    if (!this.userId) {
      console.error('User ID not set, cannot subscribe to notifications');
      return;
    }

    const destination = `/queue/notifications/${this.userId}`;
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        
        if (this.onNotificationCallback) {
          this.onNotificationCallback(notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`Subscribed to ${destination}`);
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId, this.onNotificationCallback);
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.client.deactivate();
      this.isConnected = false;
      this.userId = null;
      this.onNotificationCallback = null;
      console.log('WebSocket disconnected');
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;

