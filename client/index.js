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

/**
 * @param {string} username
 * @param {'vispero'|'nvAccess'|'apple'} vendor
 * @returns {Promise<void>}
 */
window.signMeInAsVendor = (username, vendor = 'vispero') => {
  let company = {
    id: '1',
    name: 'vispero',
    ats: [
      {
        id: '1',
        name: 'JAWS'
      }
    ]
  };

  switch (vendor.trim()) {
    case 'nvAccess':
      company = {
        id: '6',
        name: 'nvAccess',
        ats: [
          {
            id: '2',
            name: 'NVDA'
          }
        ]
      };
      break;
    case 'apple':
      company = {
        id: '4',
        name: 'apple',
        ats: [
          {
            id: '3',
            name: 'VoiceOver for macOS'
          }
        ]
      };
      break;
    default:
      // maintain default vispero selection
      break;
  }

  return signMeInCommon({
    username,
    roles: [{ name: 'VENDOR' }],
    company
  });
};

window.startTestTransaction = async () => {
  const response = await fetch('/api/transactions', { method: 'POST' });
  const { transactionId } = await response.json();
  sessionStorage.setItem('currentTransactionId', transactionId);
};

window.endTestTransaction = async () => {
  const currentTransactionId = sessionStorage.getItem('currentTransactionId');
  if (!currentTransactionId) throw new Error('Nothing to roll back');
  await fetch('/api/transactions', {
    method: 'DELETE',
    headers: { 'x-transaction-id': currentTransactionId }
  });
  sessionStorage.removeItem('currentTransactionId');
  await resetCache();
  location.reload();
};
