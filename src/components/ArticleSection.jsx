import ArticleCard from './ArticleCard';
import { articles } from '../data/contentData';

function ArticleSection() {
  return (
    <section className="article-section">
      <h2>Featured Articles</h2>

      <div className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

        <br />
      <button>See all articles</button>
    </section>
  );
}

export default ArticleSection;