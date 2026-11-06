import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './BrowsePosts.css';

function SortablePostCard({ post, onOpen, onHide }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: post.id });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    position: 'relative',
    zIndex: isDragging ? 2 : 1
  };

  return (
    <article
      ref={setNodeRef}
      style={cardStyle}
      className="browse-post-card"
      onClick={() => onOpen(post)}
    >
      <div className="browse-post-card-top">
        <div className="browse-post-labels">
          <span className="browse-post-type">{post.postType}</span>
          <span className="browse-post-plan">{post.postPlan || 'Free'}</span>
        </div>

        <button
          className="post-drag-handle"
          type="button"
          aria-label={`Drag to reorder ${post.title}`}
          title="Drag to reorder"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
        >
          ⠿
        </button>
      </div>

      <h2>{post.title}</h2>

      <p className="browse-post-preview">
        {post.postType === 'Question' ? post.description : post.abstractText}
      </p>

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="browse-post-tags">
          {post.tags.map((item, index) => (
            <span key={`${item}-${index}`}>#{item}</span>
          ))}
        </div>
      )}

      <p className="browse-post-date">
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString()
          : 'Date unavailable'}
      </p>

      <button
        className="hide-post-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onHide(post.id);
        }}
      >
        Hide Post
      </button>
    </article>
  );
}

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [postType, setPostType] = useState('All');
  const [postPlan, setPostPlan] = useState('All');
  const [tag, setTag] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  //get posts from the backend
  useEffect(() => {
    async function loadPosts() {
      try {
        const token = localStorage.getItem('token');
        const requestHeaders = {};

        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/posts`,
          {
            method: 'GET',
            headers: requestHeaders
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load posts.');
        }

        setPosts(result.posts || []);
      } catch (error) {
        console.error('Error loading posts:', error);
        setErrorMessage(error.message || 'Unable to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // filter the posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.title || '')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDate =
      !date ||
      (post.createdAt &&
        new Date(post.createdAt).toISOString().slice(0, 10) === date);

    const matchesType = postType === 'All' || post.postType === postType;
    const matchesPlan = postPlan === 'All' || (post.postPlan || 'Free') === postPlan;
    const matchesTag =
      !tag ||
      (Array.isArray(post.tags) &&
        post.tags.some((item) =>
          item.toLowerCase().includes(tag.toLowerCase())
        ));

    return matchesSearch && matchesDate && matchesType && matchesPlan && matchesTag;
  });

  // open or close a filter
  function toggleFilter(filter) {
    setActiveFilter(activeFilter === filter ? '' : filter);
  }

  // reset all filters
  function resetFilters() {
    setSearch('');
    setDate('');
    setPostType('All');
    setPostPlan('All');
    setTag('');
    setActiveFilter('');
  }

  // hide a post
  function hidePost(postId) {
    setHiddenPosts((currentPosts) => [...currentPosts, postId]);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null);
    }
  }

  // restore hidden posts
  function resetHiddenPosts() {
    setHiddenPosts([]);
  }

  // display posts that are not hidden
  const visiblePosts = filteredPosts.filter(
    (post) => !hiddenPosts.includes(post.id)
  );

  // reorder the visible posts after dragging one card
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = visiblePosts.findIndex((post) => post.id === active.id);
    const newIndex = visiblePosts.findIndex((post) => post.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedVisiblePosts = arrayMove(visiblePosts, oldIndex, newIndex);
    const visiblePostIds = new Set(visiblePosts.map((post) => post.id));
    let reorderedIndex = 0;

    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (visiblePostIds.has(post.id)) {
          const reorderedPost = reorderedVisiblePosts[reorderedIndex];
          reorderedIndex += 1;
          return reorderedPost;
        }

        return post;
      })
    );
  }

  return (
    <div className="browse-posts-page">
      <div className="browse-posts-container">
        <h1>Browse Posts</h1>

        <p className="browse-posts-description">
          Explore questions and articles shared by the DEV@Deakin community.
        </p>

        <button
          className="reset-hidden-button"
          type="button"
          onClick={resetHiddenPosts}
        >
          Reset Hidden Posts
        </button>

        <div className="filter-bar">
          <div
            className={`filter-item ${activeFilter === 'search' ? 'active' : ''}`}
            onClick={() => toggleFilter('search')}
          >
            <span className="filter-icon">⌕</span>
            <span className="filter-label">Search</span>

            {activeFilter === 'search' && (
              <input
                autoFocus
                type="text"
                placeholder="Post title..."
                value={search}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setSearch(event.target.value)}
              />
            )}
          </div>

          <div
            className={`filter-item ${activeFilter === 'date' ? 'active' : ''}`}
            onClick={() => toggleFilter('date')}
          >
            <span className="filter-icon">▦</span>
            <span className="filter-label">Date</span>

            {activeFilter === 'date' && (
              <input
                autoFocus
                type="date"
                value={date}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setDate(event.target.value)}
              />
            )}
          </div>

          <div
            className={`filter-item ${activeFilter === 'type' ? 'active' : ''}`}
            onClick={() => toggleFilter('type')}
          >
            <span className="filter-icon">▤</span>
            <span className="filter-label">
              {postType === 'All' ? 'Type' : postType}
            </span>

            {activeFilter === 'type' && (
              <select
                autoFocus
                value={postType}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setPostType(event.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Question">Questions</option>
                <option value="Article">Articles</option>
              </select>
            )}
          </div>

          <div
            className={`filter-item ${activeFilter === 'plan' ? 'active' : ''}`}
            onClick={() => toggleFilter('plan')}
          >
            <span className="filter-icon">◇</span>
            <span className="filter-label">
              {postPlan === 'All' ? 'Plan' : postPlan}
            </span>

            {activeFilter === 'plan' && (
              <select
                autoFocus
                value={postPlan}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setPostPlan(event.target.value)}
              >
                <option value="All">All Plans</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            )}
          </div>

          <div
            className={`filter-item ${activeFilter === 'tag' ? 'active' : ''}`}
            onClick={() => toggleFilter('tag')}
          >
            <span className="filter-icon">#</span>
            <span className="filter-label">Tags</span>

            {activeFilter === 'tag' && (
              <input
                autoFocus
                type="text"
                placeholder="Enter tag..."
                value={tag}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setTag(event.target.value)}
              />
            )}
          </div>

          <button
            className="filter-reset"
            type="button"
            onClick={resetFilters}
          >
            ↺ Reset
          </button>
        </div>

        {loading && <p className="browse-posts-message">Loading posts...</p>}

        {!loading && errorMessage && (
          <p className="browse-posts-error">{errorMessage}</p>
        )}

        {!loading && !errorMessage && visiblePosts.length === 0 && (
          <p className="browse-posts-message">No matching posts found.</p>
        )}

        {!loading && !errorMessage && visiblePosts.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visiblePosts.map((post) => post.id)}
              strategy={rectSortingStrategy}
            >
              <div className="browse-posts-grid">
                {visiblePosts.map((post) => (
                  <SortablePostCard
                    key={post.id}
                    post={post}
                    onOpen={setSelectedPost}
                    onHide={hidePost}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            className="post-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="post-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="post-modal-close"
                type="button"
                onClick={() => setSelectedPost(null)}
                aria-label="Close post"
              >
                ×
              </button>

              <div className="browse-post-labels">
                <span className="browse-post-type">{selectedPost.postType}</span>
                <span className="browse-post-plan">
                  {selectedPost.postPlan || 'Free'}
                </span>
              </div>

              <h2>{selectedPost.title}</h2>

              {selectedPost.postType === 'Question' ? (
                <div className="post-modal-content">
                  <p>{selectedPost.description}</p>
                </div>
              ) : (
                <div className="post-modal-content">
                  {selectedPost.abstractText && (
                    <>
                      <h3>Abstract</h3>
                      <p>{selectedPost.abstractText}</p>
                    </>
                  )}

                  {selectedPost.articleText && (
                    <>
                      <h3>Article</h3>
                      <p className="post-modal-article">{selectedPost.articleText}</p>
                    </>
                  )}
                </div>
              )}

              {Array.isArray(selectedPost.tags) && selectedPost.tags.length > 0 && (
                <div className="browse-post-tags">
                  {selectedPost.tags.map((item, index) => (
                    <span key={`${item}-${index}`}>#{item}</span>
                  ))}
                </div>
              )}

              <p className="browse-post-date">
                {selectedPost.createdAt
                  ? new Date(selectedPost.createdAt).toLocaleDateString()
                  : 'Date unavailable'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BrowsePosts;
