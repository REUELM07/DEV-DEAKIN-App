import TutorialCard from './TutorialCard';
import { tutorials } from '../data/contentData';

function TutorialSection() {
  return (
    <section className="tutorial-section">
        
      <h2>Featured Tutorials</h2>

      <div className="tutorial-list">
        {tutorials.map((tutorial) => (
          <TutorialCard key={tutorial.id} tutorial={tutorial} />
        ))}
      </div>

        <br />
      <button>See all tutorials</button>
    </section>
  );
}

export default TutorialSection;