// serviceWorkerListener.js
// Script to handle messages from the service worker and interact with localStorage

import storageUtil from './utilities/storageUtil.js';  // Your storage utility for local storage operations


// Function to handle incoming messages from the service worker
const handleServiceWorkerMessage = (event) => {
    if (event.data && event.data.type === 'SYNC_RESULTS') {
        const { points, allResults } = event.data;

        // Update localStorage with received data
        try {
            // console.log('Server response after saving from IndexDB: ', allResults)
            // if (points) {
            // console.log('Saving points: ', points)
            storageUtil.setItem('userPoints', JSON.parse(points));
            // console.log('Saving results: ', allResults);
            storageUtil.setItem('examResults', allResults);
            // console.log('Saved results and points saved');
            // console.log(`Saved userPoints to localStorage: ${JSON.parse(points)}`);
            // }

            // if (allResults) {
            //     storageUtil.setItem('examResults', '');
            //     storageUtil.setItem('examResults', JSON.parse(allResults));
            //     console.log(`Saved examResults to localStorage: ${JSON.parse(allResults)}`);
            // }
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }
};

// Add an event listener for messages from the service worker
navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
