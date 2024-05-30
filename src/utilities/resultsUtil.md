Creating a utility function to fetch and update the exam results in local storage sounds like a good approach. This utility function can be called during login, after an exam submission, or from any component that needs to refresh the results. This way, you can centralize the data fetching logic and reduce redundant calls across different components.

Here's an outline of how you can implement this:

1. **Create a Utility Function:** Write a function that fetches exam results and updates local storage. This function can be placed in a separate utility file for easy access from any component.

2. **Call the Utility Function on Login and After Exam Submission:** Invoke this function when the user logs in and after they submit an exam to ensure the data in local storage is up-to-date.

3. **Use Local Storage Data in Components:** In your components, use the exam results data from local storage. This way, you avoid unnecessary re-renders caused by prop changes.

4. **Optional Refresh Mechanism:** Implement a way to manually refresh the data in components that need up-to-date information.

Here's a basic implementation of the utility function:

```javascript
// resultsUtil.js
import {
  databases,
  database_id,
  studentMarksTable_id,
  Query
} from './appwriteConfig'
import storageUtil from './utilities/storageUtil'

export async function fetchAndUpdateResults(userId) {
  try {
    const response = await databases.listDocuments(
      database_id,
      studentMarksTable_id,
      [Query.equal('studID', userId)]
    )
    // Update local storage with new results
    storageUtil.setItem('examResults', response.documents)
    return response.documents
  } catch (error) {
    console.error('Failed to retrieve student results:', error)
    return null
  }
}
```

In your login and exam submission handlers, call this function:

```javascript
import { fetchAndUpdateResults } from './resultsUtil';

// When logging in or after submitting an exam
const userId = ...; // Get the user ID from the appropriate source
await fetchAndUpdateResults(userId);
```

In your components, use the data from local storage:

```javascript
import React, { useState, useEffect } from 'react'
import storageUtil from '../utilities/storageUtil'

const AllResults = () => {
  const [results, setResults] = useState([])

  useEffect(() => {
    const storedResults = storageUtil.getItem('examResults')
    if (storedResults) {
      setResults(transformData(storedResults))
    }
  }, [])

  // Rest of your component logic...
}
```

This approach provides a more efficient way to manage and access results data across your application. Make sure to handle cases where the local storage may not have the data, especially just after login or before the user has taken any exams.
