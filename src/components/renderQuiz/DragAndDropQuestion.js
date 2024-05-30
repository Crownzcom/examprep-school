// DragAndDropQuestion.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import DeferredDroppable from '../DeferredDroppable';
import { Form } from 'react-bootstrap';
import './DragAndDropQuestion.css';

const DragAndDropQuestion = ({ question, onChange, userAnswer, displayQuestionText, questionNumber }) => {
    const [dragItems, setDragItems] = useState(question.question || []);
    const [droppedItems, setDroppedItems] = useState(userAnswer || []);

    useEffect(() => {
        setDroppedItems(userAnswer || []);
    }, [userAnswer]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        let newDragItems = Array.from(dragItems);
        let newDroppedItems = Array.from(droppedItems);

        if (result.source.droppableId === "dragItems" && result.destination.droppableId === "droppedItems") {
            // Moving from dragItems to droppedItems
            const [movedItem] = newDragItems.splice(sourceIndex, 1);
            newDroppedItems.splice(destinationIndex, 0, movedItem);
        } else if (result.source.droppableId === "droppedItems" && result.destination.droppableId === "droppedItems") {
            // Reordering within droppedItems
            const [movedItem] = newDroppedItems.splice(sourceIndex, 1);
            newDroppedItems.splice(destinationIndex, 0, movedItem);
        } else if (result.source.droppableId === "droppedItems" && result.destination.droppableId === "dragItems") {
            // Moving from droppedItems back to dragItems
            const [movedItem] = newDroppedItems.splice(sourceIndex, 1);
            newDragItems.splice(destinationIndex, 0, movedItem);
        }

        setDragItems(newDragItems);
        setDroppedItems(newDroppedItems);
        onChange(newDroppedItems);
    };

    const renderOptionLabel = (option) => {
        return (
            <div dangerouslySetInnerHTML={{ __html: option }}></div>
        );
    };

    return (
        <Form.Group>
            {displayQuestionText &&
                <Form.Label>
                    {questionNumber}. <span dangerouslySetInnerHTML={{ __html: question.question.join(' ') }} />
                </Form.Label>
            }
            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                    <DeferredDroppable droppableId="dragItems" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ display: 'flex', padding: '8px', border: '1px solid #ccc', minHeight: '50px', flex: 1 }}
                            >
                                {dragItems.map((item, index) => (
                                    <Draggable key={item} draggableId={item} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    userSelect: 'none',
                                                    padding: '8px',
                                                    margin: '0 8px 0 0',
                                                    backgroundColor: '#456C86',
                                                    color: 'white',
                                                    ...provided.draggableProps.style
                                                }}
                                            >
                                                {renderOptionLabel(item)}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </DeferredDroppable>

                    <DeferredDroppable droppableId="droppedItems" direction="horizontal">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ display: 'flex', padding: '8px', border: '1px solid #ccc', minHeight: '50px', flex: 1 }}
                            >
                                {droppedItems.map((item, index) => (
                                    <Draggable key={item} draggableId={item} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    userSelect: 'none',
                                                    padding: '8px',
                                                    margin: '0 8px 0 0',
                                                    backgroundColor: '#D3D3D3',
                                                    ...provided.draggableProps.style
                                                }}
                                            >
                                                {renderOptionLabel(item)}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </DeferredDroppable>
                </div>
            </DragDropContext>
        </Form.Group>
    );
};

export default DragAndDropQuestion;
