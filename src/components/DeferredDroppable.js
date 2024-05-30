/* 
This component will use the useState and useEffect hooks to control the rendering of the Droppable element, ensuring it's rendered after an animation frame. This approach helps to maintain compatibility with React 18's Strict Mode while using react-beautiful-dnd.
*/

// DeferredDroppable.js
import React, { useState, useEffect } from "react";
import { Droppable } from "react-beautiful-dnd";

const DeferredDroppable = ({ droppableId, direction, children }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animationFrame);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <Droppable droppableId={droppableId} direction={direction}>
      {children}
    </Droppable>
  );
};

export default DeferredDroppable;
