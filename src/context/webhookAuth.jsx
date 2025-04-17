import React from 'react';

export async function  webHookAuth ()  {
  const auth_api_url =  import.meta.env.VITE_AUTH_API_URL
  const clientId =  import.meta.env.CLIENT_ID
  const clientSecret = import.meta.env.WEBHOOK_CLIENT_SECRET
  console.log(`auth_api_url: ${auth_api_url}`);
  console.log(`clientId: ${clientId}`);
  console.log(`clientSecret: ${clientSecret}`);
  if (!auth_api_url || !clientId || !clientSecret) {
    throw new Error('Missing environment variables for authentication');
  }
  try {
      const response = await fetch(`${auth_api_url}/authentication/v1/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      //

      if (!response.ok) {
        let errorMessage = '';
        if (response.status === 400) {
          errorMessage = 'Invalid Client ID or Secret';
        } else if (response.status === 404) {
          errorMessage = 'Backend API not found/not reachable';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: Access denied';
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        throw new Error(errorMessage);
      }
      const responseData = await response.json();
      const { access_token } = responseData;
      localStorage.setItem('webhookToken', access_token);
    }
    catch (error) {
      console.error('Error fetching authentication token:', error);
      throw error;
    }
  }

  export default webHookAuth;


