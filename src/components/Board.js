import React, { useEffect, useRef, useState, useCallback } from 'react';
import List from './List';
import AddList from './AddList';
import './Board.css';

const Board = ({ board, onAddCard, onAddList, onDeleteCard }) => {
  const boardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const dragPositionRef = useRef({ x: 0, y: 0 });
  const scrollCompensationRef = useRef({ x: 0, y: 0 });

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

      // Track scroll changes during drag for compensation
      if (isDragging) {
        const currentScrollX = board.scrollLeft;
        const currentScrollY = board.scrollTop;
        scrollCompensationRef.current = {
          x: currentScrollX,
          y: currentScrollY
        };
      }
    };

    board.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => board.removeEventListener('scroll', handleScroll);
  }, [board.lists.length, isDragging]);

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
        // Prevent default to avoid scroll conflicts
        e.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, checkAutoScroll]);

  // Expose drag handlers to be used by DragDropContext
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    // Store initial scroll position
    const board = boardRef.current;
    if (board) {
      scrollCompensationRef.current = {
        x: board.scrollLeft,
        y: board.scrollTop
      };
    }
    
    // Prevent body scroll during drag on mobile
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
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

    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    // Reset scroll compensation
    scrollCompensationRef.current = { x: 0, y: 0 };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearTimeout(autoScrollIntervalRef.current);
      }
      // Ensure body styles are restored
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
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
    <div className={`board ${isDragging ? 'dragging' : ''}`} ref={boardRef}>
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