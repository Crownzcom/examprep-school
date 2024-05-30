Questions are randomly selected. To prevent the same questions from appearing repeatedly in the quiz/exam application, consider these strategies:

1. **User History Tracking**: Keep a record of the questions each user has previously encountered. When selecting new questions, exclude those from the user's history.

2. **Banking Questions**: Create a larger pool of questions and categorize them into difficulty levels or types. Rotate questions in and out of the active pool periodically.

3. **Randomization with Memory**: Implement an algorithm that remembers the last set of questions provided to a user and ensures the next set is different.

4. **Weighted Random Selection**: Assign a weight to each question based on how often it has been selected. Questions selected less frequently can have a higher chance of being chosen.

5. **Question Cooling Period**: Implement a cooling period for questions - once a question is asked, it can't be asked again for a certain period.

6. **User Feedback Loop**: Allow users to flag questions they have seen too often, and use this feedback to adjust the selection algorithm.

These methods can help in diversifying the questions presented in each quiz or exam attempt, enhancing the user experience.

## User History Tracking
This is selected given that it ensures diversity in quiz and exam questions.
