import { useState } from 'react';

export function useTriggerLoad() {
    const [loadingMessage, setLoadingMessage] = useState('');

    const triggerLoad = (loadFn, message) => {
        return new Promise((resolve, reject) => {
            setLoadingMessage(message);
            loadFn()
                .then(() => {
                    setLoadingMessage('');
                    resolve();
                })
                .catch(e => {
                    setLoadingMessage('');
                    reject(e);
                });
        });
    };

    return { triggerLoad, loadingMessage };
}
