// Microsoft Graph API Configuration and SharePoint Integration
// This module handles authentication and data synchronization with SharePoint/Excel

const axios = require('axios');

class SharePointConnector {
    constructor() {
        this.accessToken = null;
        this.tenantId = process.env.SHAREPOINT_TENANT_ID || '';
        this.clientId = process.env.SHAREPOINT_CLIENT_ID || '';
        this.clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || '';
        this.siteUrl = process.env.SHAREPOINT_SITE_URL || '';
        this.listId = process.env.SHAREPOINT_LIST_ID || '';
    }

    /**
     * Get access token using Client Credentials flow
     */
    async getAccessToken() {
        try {
            const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
            
            const response = await axios.post(tokenUrl, {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: 'https://graph.microsoft.com/.default'
            });

            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            throw error;
        }
    }

    /**
     * Set credentials
     */
    setCredentials(tenantId, clientId, clientSecret, siteUrl, listId) {
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.siteUrl = siteUrl;
        this.listId = listId;
    }

    /**
     * Get SharePoint list items
     */
    async getListItems() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const listUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteUrl}/lists/${this.listId}/items`;

            const response = await axios.get(listUrl, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.value;
        } catch (error) {
            console.error('Error getting list items:', error.message);
            throw error;
        }
    }

    /**
     * Add item to SharePoint list
     */
    async addListItem(fields) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const listUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteUrl}/lists/${this.listId}/items`;

            const response = await axios.post(
                listUrl,
                {
                    fields: {
                        ...fields
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error adding list item:', error.message);
            throw error;
        }
    }

    /**
     * Update item in SharePoint list
     */
    async updateListItem(itemId, fields) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const itemUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteUrl}/lists/${this.listId}/items/${itemId}`;

            const response = await axios.patch(
                itemUrl,
                {
                    fields: {
                        ...fields
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error updating list item:', error.message);
            throw error;
        }
    }

    /**
     * Sync records to SharePoint
     */
    async syncRecords(records) {
        try {
            const results = [];

            for (const record of records) {
                const fields = {
                    'Title': record.station,
                    'Problem': record.problem,
                    'StartTime': new Date(record.startTime).toISOString(),
                    'EndTime': record.endTime ? new Date(record.endTime).toISOString() : null,
                    'Duration': record.duration,
                    'Responsible': record.responsible,
                    'Priority': record.priority
                };

                const result = await this.addListItem(fields);
                results.push(result);
            }

            return results;
        } catch (error) {
            console.error('Error syncing records:', error.message);
            throw error;
        }
    }
}

module.exports = SharePointConnector;
