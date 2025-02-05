import { useState } from 'react';

export function useTriggerLoad() {
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingNote, setLoadingNote] = useState('');

  const triggerLoad = (loadFn, message, note) => {
    return new Promise((resolve, reject) => {
      setLoadingMessage(message);
      setLoadingNote(note);
      loadFn()
        .then(() => {
          setLoadingMessage('');
          setLoadingNote('');
          resolve();
        })
        .catch(e => {
          setLoadingMessage('');
          setLoadingNote('');
          reject(e);
        });
    });
  };

  return { triggerLoad, loadingMessage, loadingNote };
}
