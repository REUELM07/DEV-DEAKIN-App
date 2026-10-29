import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Post.css';

function Post() {
  const { currentUser, token } = useAuth();

  const [postType, setPostType] = useState('Question');
  const [postPlan, setPostPlan] = useState('Free');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [articleText, setArticleText] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePost(event) {
    event.preventDefault();

    if (title.trim() === '') {
      alert('Please enter a title.');
      return;
    }

    if (tags.trim() === '') {
      alert('Please enter at least one tag.');
      return;
    }

    const tagList = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    if (tagList.length > 3) {
      alert('You can enter a maximum of 3 tags.');
      return;
    }

    if (postType === 'Question' && description.trim() === '') {
      alert('Please describe your problem.');
      return;
    }

    if (postType === 'Article' && abstractText.trim() === '') {
      alert('Please enter an abstract.');
      return;
    }

    if (postType === 'Article' && articleText.trim() === '') {
      alert('Please enter the article text.');
      return;
    }

    if (!currentUser || !token) {
      alert('Please log in before submitting a post.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
        postType: postType,
        postPlan: postPlan,
        title: title.trim(),
        description: description.trim(),
        abstractText: abstractText.trim(),
        articleText: articleText.trim(),
        tags: tagList
      })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit your post.');
      }

      alert(result.message || 'Your post has been submitted successfully!');

      setTitle('');
      setDescription('');
      setAbstractText('');
      setArticleText('');
      setTags('');
      setPostType('Question');

    } catch (error) {
      console.error('Post submission error:', error);

      alert(
        error.message || 'Unable to submit your post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="post-page">
      <form className="post-form" onSubmit={handlePost}>

        <h1>New Post</h1>

        <div className="post-type">
          <strong>Select Post Type:</strong>

          <label>
            <input
              type="radio"
              name="postType"
              checked={postType === 'Question'}
              onChange={() => setPostType('Question')}
            />
            Question
          </label>

          <label>
            <input
              type="radio"
              name="postType"
              checked={postType === 'Article'}
              onChange={() => setPostType('Article')}
            />
            Article
          </label>
        </div>

        <div className="post-type">
          <strong>Select Post Plan:</strong>

          <label>
            <input
              type="radio"
              name="postPlan"
              checked={postPlan === 'Free'}
              onChange={() => setPostPlan('Free')}
            />
            Free
          </label>

          <label>
            <input
              type="radio"
              name="postPlan"
              checked={postPlan === 'Paid'}
              onChange={() => setPostPlan('Paid')}
            />
            Paid
            </label>
          </div>

        <h3>What do you want to ask or share?</h3>

        <div className="form-group">
          <label>Title</label>

          <input
            type="text"
            placeholder={
              postType === 'Question'
                ? 'Start your question with how, what, why, etc.'
                : 'Enter a descriptive title'
            }
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        {postType === 'Question' ? (
          <div className="form-group">
            <label>Describe your problem</label>

            <textarea
              placeholder="Explain your problem here..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Abstract</label>

              <textarea
                placeholder="Write a short summary of your article..."
                value={abstractText}
                onChange={(event) => setAbstractText(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Article Text</label>

              <textarea
                className="article-content"
                placeholder="Write your article here..."
                value={articleText}
                onChange={(event) => setArticleText(event.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Tags</label>

          <input
            type="text"
            placeholder="Enter up to 3 tags, separated by commas"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="post-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Post'}
        </button>

      </form>
    </div>
  );
}

export default Post;