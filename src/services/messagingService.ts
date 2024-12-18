import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface MessageData {
  senderId: string;
  senderEmail: string;
  recipientEmail: string;
  message: string;
  skillId?: string;
  createdAt?: any;
  status?: 'sent' | 'read' | 'archived';
}

export const sendSkillMessage = async (messageData: MessageData) => {
  try {
    // Validate message
    if (!messageData.message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Add timestamp and default status
    const completeMessageData: MessageData = {
      ...messageData,
      createdAt: serverTimestamp(),
      status: 'sent'
    };

    // Save message to Firestore
    const messageRef = await addDoc(collection(db, 'messages'), completeMessageData);

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    throw error;
  }
};

export const getSkillMessages = async (userId: string) => {
  // Implement message retrieval logic
  // This would fetch messages where the user is either sender or recipient
};

export const markMessageAsRead = async (messageId: string) => {
  // Implement message read status update
};
