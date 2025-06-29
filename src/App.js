import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import Board from './components/Board';
import './App.css';

// API base URL - use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [board, setBoard] = useState({
    id: 'board-1',
    title: 'Property Management Board',
    lists: [
      {
        id: 'list-1',
        title: 'All Properties',
        cards: []
      },
      {
        id: 'list-2',
        title: 'Matching My Requirement',
        cards: []
      },
      {
        id: 'list-3',
        title: 'Rejected/Not Interested',
        cards: []
      },
      {
        id: 'list-4',
        title: 'Need More Info',
        cards: []
      },
      {
        id: 'list-5',
        title: 'Shortlisted/Favorites',
        cards: []
      },
      {
        id: 'list-6',
        title: 'Finalized for Auction',
        cards: []
      },
      {
        id: 'list-7',
        title: 'Registration & EMD Submitted',
        cards: []
      },
      {
        id: 'list-8',
        title: 'Auction Won',
        cards: []
      },
      {
        id: 'list-9',
        title: 'Auction List',
        cards: []
      }
    ]
  });

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        // Fetch list of JSON files
        const response = await fetch(`${API_BASE_URL}/Links-scraped-json`);
        const files = await response.json();
        
        // Fetch data for each file
        const propertyData = await Promise.all(
          files.map(async (file) => {
            const fileResponse = await fetch(`${API_BASE_URL}/Links-scraped-json/${file}`);
            return fileResponse.json();
          })
        );

        // Convert property data to cards
        const propertyCards = propertyData.map(property => ({
          id: uuidv4(),
          title: property.title || 'Untitled Property',
          description: `
🏠 Type: ${property.property_type || 'N/A'}
📍 Location: ${property.location?.city_town || 'N/A'}, ${property.location?.province_state || 'N/A'}
💰 Reserve Price: ${property.bank_details?.reserve_price || 'N/A'}
📅 Auction Date: ${property.auction_date || 'N/A'}
📝 Description: ${(property.description || '').substring(0, 150)}...`,
          propertyData: property // Store full property data for reference
        }));

        // Update the "All Properties" list with the property cards
        setBoard(prevBoard => ({
          ...prevBoard,
          lists: prevBoard.lists.map(list =>
            list.id === 'list-1'
              ? { ...list, cards: propertyCards }
              : list
          )
        }));
      } catch (error) {
        console.error('Error loading property data:', error);
      }
    };

    loadPropertyData();
  }, []);

  const handleDragStart = () => {
    if (window.boardDragHandlers?.onDragStart) {
      window.boardDragHandlers.onDragStart();
    }
  };

  const handleDragEnd = (result) => {
    if (window.boardDragHandlers?.onDragEnd) {
      window.boardDragHandlers.onDragEnd();
    }
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = board.lists.find(list => list.id === source.droppableId);
    const finish = board.lists.find(list => list.id === destination.droppableId);

    if (start === finish) {
      const newCards = Array.from(start.cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newList = {
        ...start,
        cards: newCards,
      };

      const newBoard = {
        ...board,
        lists: board.lists.map(list => list.id === newList.id ? newList : list)
      };

      setBoard(newBoard);
      return;
    }

    // Moving from one list to another
    const startCards = Array.from(start.cards);
    const [removed] = startCards.splice(source.index, 1);
    const newStart = {
      ...start,
      cards: startCards,
    };

    const finishCards = Array.from(finish.cards);
    finishCards.splice(destination.index, 0, removed);
    const newFinish = {
      ...finish,
      cards: finishCards,
    };

    const newBoard = {
      ...board,
      lists: board.lists.map(list => {
        if (list.id === newStart.id) return newStart;
        if (list.id === newFinish.id) return newFinish;
        return list;
      })
    };

    setBoard(newBoard);
  };

  const addCard = (listId, cardTitle, cardDescription) => {
    const newCard = {
      id: uuidv4(),
      title: cardTitle,
      description: cardDescription
    };

    const newBoard = {
      ...board,
      lists: board.lists.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    };

    setBoard(newBoard);
  };

  const addList = (listTitle) => {
    const newList = {
      id: uuidv4(),
      title: listTitle,
      cards: []
    };

    setBoard({
      ...board,
      lists: [...board.lists, newList]
    });
  };

  const deleteCard = (listId, cardId) => {
    const newBoard = {
      ...board,
      lists: board.lists.map(list => 
        list.id === listId 
          ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
          : list
      )
    };

    setBoard(newBoard);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏠 Property Management System</h1>
      </header>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Board 
          board={board} 
          onAddCard={addCard} 
          onAddList={addList}
          onDeleteCard={deleteCard}
        />
      </DragDropContext>
    </div>
  );
}

export default App; 