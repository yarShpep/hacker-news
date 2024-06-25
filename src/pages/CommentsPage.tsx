import React, { useEffect, useState } from 'react';
import styles from '../styles/CommentsPage.module.css';

interface Comment {
  id: number;
  by: string;
  text: string;
  parent: number;
  time: number;
}

const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://hacker-news.firebaseio.com/v0/newcomments.json')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const commentIds = data.slice(0, 20);
          Promise.all(
            commentIds.map((id: number) =>
              fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) => response.json())
            )
          ).then((fetchedComments) => setComments(fetchedComments));
        } else {
          setError('Failed to fetch comments');
        }
      })
      .catch(() => setError('Failed to fetch comments'));
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.commentsPage}>
      <h1>New Comments</h1>
      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <li key={comment.id} className={styles.comment}>
            <p>
              <strong>{comment.by}</strong> {new Date(comment.time * 1000).toLocaleString()}
            </p>
            <div dangerouslySetInnerHTML={{ __html: comment.text }}></div>
            <a href={`https://news.ycombinator.com/item?id=${comment.parent}`} target="_blank" rel="noopener noreferrer">
              View parent post
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsPage;
