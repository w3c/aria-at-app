import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Order matters for the following two imports
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import GraphQLProvider from './components/GraphQLProvider';
import { AriaLiveRegionProvider } from './components/providers/AriaLiveRegionProvider';
import { resetCache } from './components/GraphQLProvider/GraphQLProvider';
import { ConfirmationModalProvider } from './hooks/useConfirmationModal';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <GraphQLProvider>
    <AriaLiveRegionProvider>
      <ConfirmationModalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfirmationModalProvider>
    </AriaLiveRegionProvider>
  </GraphQLProvider>
);

const signMeInCommon = async user => {
  if (!user.username) throw new Error('Please provide a username');

  const response = await fetch('/api/auth/fake-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });

  const responseText = await response.text();
  if (!response.ok) throw responseText;

  location.reload();
};

window.signMeInAsAdmin = username => {
  return signMeInCommon({
    username,
    roles: [{ name: 'ADMIN' }, { name: 'TESTER' }, { name: 'VENDOR' }]
  });
};

window.signMeInAsTester = username => {
  return signMeInCommon({ username, roles: [{ name: 'TESTER' }] });
};

window.signMeInAsVendor = username => {
  return signMeInCommon({ username, roles: [{ name: 'VENDOR' }] });
};

window.startTestTransaction = async () => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to start transaction: ${response.statusText}`);
    }
    const { transactionId } = await response.json();
    if (!transactionId) {
      throw new Error('Transaction ID is missing from response');
    }
    sessionStorage.setItem('currentTransactionId', transactionId);
  } catch (error) {
    console.error('Error starting test transaction:', error);
    throw error;
  }
};

window.endTestTransaction = async () => {
  const currentTransactionId = sessionStorage.getItem('currentTransactionId');
  if (!currentTransactionId) {
    console.warn('No active test transaction to end');
    return;
  }
  try {
    const response = await fetch('/api/transactions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-transaction-id': currentTransactionId
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to end transaction: ${response.statusText}`);
    }
    sessionStorage.removeItem('currentTransactionId');
    await resetCache();
  } catch (error) {
    console.error('Error ending test transaction:', error);
    throw error;
  } finally {
    sessionStorage.removeItem('currentTransactionId');
  }
};
