function ArticleCard({ article }) {
  return (
    <div className="article-card">
      <img src={article.image} alt={article.title} />

      <h3>{article.title}</h3>

      <p>{article.description}</p>

      <p>⭐ {article.rating} {article.author}</p>
      
    </div>
  );
}

export default ArticleCard;