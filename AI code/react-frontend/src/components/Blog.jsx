import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import './Blog.css';

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'Breakthroughs in Cardiac Therapy: The New Era',
      category: 'Research',
      date: 'Oct 15, 2026',
      author: 'Dr. R. Sharma',
      image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      excerpt: 'Exploring the recent advancements in targeted therapies for chronic heart conditions under our Phase III clinical trials.'
    },
    {
      id: 2,
      title: 'Sustainable Manufacturing in Pharmaceuticals',
      category: 'Sustainability',
      date: 'Sep 28, 2026',
      author: 'A. Gupta',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      excerpt: 'How Rivaansh Lifesciences is reducing its carbon footprint by transitioning to green chemistry principles in API synthesis.'
    },
    {
      id: 3,
      title: 'Global Health Initiatives: Bridging the Gap',
      category: 'Community',
      date: 'Sep 10, 2026',
      author: 'M. Patel',
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      excerpt: 'Our latest outreach programs in developing nations aim to provide essential generic medicines to under-served communities.'
    }
  ];

  return (
    <section className="section blog-section section-light">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Insights & News</h2>
          <p className="section-subtitle">
            Stay updated with our latest research breakthroughs, corporate announcements, and healthcare articles.
          </p>
        </div>

        <div className="blog-grid">
          {posts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-image-wrapper">
                <img src={post.image} alt={post.title} className="blog-image" />
                <span className="blog-category">{post.category}</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span><Calendar size={14} /> {post.date}</span>
                  <span><User size={14} /> {post.author}</span>
                </div>
                <h3 className="blog-title">
                  <a href={`#/blog/${post.id}`}>{post.title}</a>
                </h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <a href={`#/blog/${post.id}`} className="read-more">
                  Read Article <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
