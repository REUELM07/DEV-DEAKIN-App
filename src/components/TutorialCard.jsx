function TutorialCard({ tutorial }) {
  return (
    <div className="tutorial-card">
      <img src={tutorial.image} alt={tutorial.title} />

      <h3>{tutorial.title}</h3>
      
      <p>{tutorial.description}</p>

      <p>⭐ {tutorial.rating} {tutorial.author}</p>
      
    </div>
  );
}

export default TutorialCard;