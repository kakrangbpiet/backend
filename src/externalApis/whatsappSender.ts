// whatsappSender.ts
import axios from 'axios';
import config from '../config.js';
import winston from 'winston';

// Interface for WhatsApp message data
interface WhatsAppMessageData {
  messaging_product: string;
  to: string;
  type: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  text?: {
    body: string;
  };
}

// Configuration
const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${config.WHATSAPP_BUSINESS_ID}/messages`;
const ACCESS_TOKEN = config.WHATSAPP_ACCESS_TOKEN;
const ADMIN_PHONE_NUMBER = config.SUPER_ADMIN_PHONE_NUMBER;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000; // 1 second delay between retries

/**
 * Send travel inquiry notification to WhatsApp with retry mechanism
 * This function will never throw errors to avoid interrupting other processes
 */
export const sendInquiryToWhatsApp = async (
  inquiryData: any,
  logger?: winston.Logger
): Promise<void> => {
  let retryCount = 0;

  try {
    // Format the inquiry data for WhatsApp
    const formattedMessage = formatInquiryMessage(inquiryData);

    // Create the message payload
    const messageData: WhatsAppMessageData = {
      messaging_product: 'whatsapp',
      to: ADMIN_PHONE_NUMBER,
      type: 'text',
      text: {
        body: formattedMessage
      }
    };

    while (retryCount < MAX_RETRIES) {
      try {
        // Send the message
        const response = await axios.post(WHATSAPP_API_URL, messageData, {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (logger) {
          logger.info('WhatsApp message sent successfully', {
            inquiryId: inquiryData.id,
            whatsappResponse: response.data,
            retryAttempt: retryCount
          });
        }
        return; // Success - exit the function
      } catch (error) {
        retryCount++;

        if (logger) {
          logger.warn(`Failed to send WhatsApp message (attempt ${retryCount}/${MAX_RETRIES})`, {
            inquiryId: inquiryData.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        if (axios.isAxiosError(error) && error.response) {
          console.error(`Error sending WhatsApp message (attempt ${retryCount}):`, error.response.data);
        } else {
          console.error(`Error sending WhatsApp message (attempt ${retryCount}):`, error);
        }

        // If we've reached max retries, don't wait before exiting
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }

    // If we get here, all retries have failed
    if (logger) {
      logger.error('All retry attempts failed to send WhatsApp message', {
        inquiryId: inquiryData.id,
        retryAttempts: retryCount
      });
    }
  } catch (finalError) {
    // This catch block handles any unexpected errors outside the retry logic
    if (logger) {
      logger.error('Unexpected error in WhatsApp sender', {
        inquiryId: inquiryData.id,
        error: finalError instanceof Error ? finalError.message : 'Unknown error'
      });
    }
    console.error('Unexpected error in WhatsApp sender:', finalError);
  }
  // No error is thrown, so other processes can continue
};

/**
 * Format the inquiry data into a readable WhatsApp message
 */
const formatInquiryMessage = (inquiry: any): string => {
    const adminPanelUrl = config.WEBSITE_URL || 'https://samsaraadventures.com';
  
    return `📢 *New Travel Inquiry Received* 📢
  
  *Package:* ${inquiry.packageTitle}
  *Destination:* ${inquiry.destination}
  *Travel Dates:* ${inquiry.startDate} to ${inquiry.endDate}
  *Passengers:* ${inquiry.passengerCount}
  *Trip Type:* ${inquiry.tripType}
  
  *Customer Details:*
  Name: ${inquiry.name || 'Not provided'}
  Phone: ${inquiry.phoneNumber || 'Not provided'}
  Email: ${inquiry.email || 'Not provided'}
  
  *Special Requests:*
  ${inquiry.specialRequests || 'None'}
  
  *Status:* ${inquiry.status}
  
  🔗 *View full details:* ${adminPanelUrl}
  `;
  };
  