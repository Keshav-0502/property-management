import React, { useEffect, useRef, useState, useCallback } from 'react';
import List from './List';
import AddList from './AddList';
import './Board.css';

const Board = ({ board, onAddCard, onAddList, onDeleteCard }) => {
  const boardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const dragPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = board;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      
      // Hide the peek indicator when at the end
      if (isAtEnd) {
        board.style.setProperty('--show-peek-indicator', '0');
      } else {
        board.style.setProperty('--show-peek-indicator', '1');
      }
    };

    board.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => board.removeEventListener('scroll', handleScroll);
  }, [board.lists.length]);

  const scrollToNextColumn = useCallback((direction) => {
    const board = boardRef.current;
    if (!board) return;

    const columnWidth = window.innerWidth - (window.innerWidth <= 480 ? 80 : 96);
    const currentScroll = board.scrollLeft;
    const targetScroll = direction === 'right' 
      ? currentScroll + columnWidth 
      : currentScroll - columnWidth;

    board.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth'
    });
  }, []);

  const checkAutoScroll = useCallback(() => {
    if (!isDragging) return;

    const screenWidth = window.innerWidth;
    const edgeThreshold = 80;
    const clientX = dragPositionRef.current.x;
    const board = boardRef.current;
    
    // Clear existing timeout
    if (autoScrollIntervalRef.current) {
      clearTimeout(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    // Remove previous auto-scroll classes
    if (board) {
      board.classList.remove('auto-scroll-left', 'auto-scroll-right');
    }

    // Check if near edges and trigger auto-scroll with delay
    if (clientX < edgeThreshold && clientX > 0) {
      if (board) board.classList.add('auto-scroll-left');
      autoScrollIntervalRef.current = setTimeout(() => {
        scrollToNextColumn('left');
      }, 200);
    } else if (clientX > screenWidth - edgeThreshold && clientX < screenWidth) {
      if (board) board.classList.add('auto-scroll-right');
      autoScrollIntervalRef.current = setTimeout(() => {
        scrollToNextColumn('right');
      }, 200);
    }
  }, [isDragging, scrollToNextColumn]);

  // Track mouse/touch position during drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        dragPositionRef.current = { x: e.clientX, y: e.clientY };
        checkAutoScroll();
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        dragPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        checkAutoScroll();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, checkAutoScroll]);

  // Expose drag handlers to be used by DragDropContext
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (autoScrollIntervalRef.current) {
      clearTimeout(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    // Clean up auto-scroll visual indicators
    const board = boardRef.current;
    if (board) {
      board.classList.remove('auto-scroll-left', 'auto-scroll-right');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearTimeout(autoScrollIntervalRef.current);
      }
    };
  }, []);

  // Make handlers available to parent
  useEffect(() => {
    if (window.boardDragHandlers) {
      window.boardDragHandlers.onDragStart = handleDragStart;
      window.boardDragHandlers.onDragEnd = handleDragEnd;
    } else {
      window.boardDragHandlers = {
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd
      };
    }
  }, [handleDragStart, handleDragEnd]);

  return (
    <div className="board" ref={boardRef}>
      <div className="board-content">
        {board.lists.map(list => (
          <List
            key={list.id}
            list={list}
            onAddCard={onAddCard}
            onDeleteCard={onDeleteCard}
          />
        ))}
        <AddList onAddList={onAddList} />
      </div>
    </div>
  );
};

export default Board; 