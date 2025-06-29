import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import AddCard from './AddCard';
import './List.css';

const List = ({ list, onAddCard, onDeleteCard }) => {
  return (
    <div className="list">
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <span className="card-count">{list.cards.length}</span>
      </div>
      
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            className={`list-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {list.cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                listId={list.id}
                onDeleteCard={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <AddCard listId={list.id} onAddCard={onAddCard} />
    </div>
  );
};

export default List; 