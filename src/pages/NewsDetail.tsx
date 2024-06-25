import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/NewsDetail.module.css';

interface Comment {
  id: number;
  by: string;
  text: string;
  parent: number;
  time: number; // Unix timestamp
  kids?: number[] | Comment[];
}

interface NewsItem {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number; // Unix timestamp
  descendants: number;
  kids: number[];
}

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [username, setUsername] = useState<string>('Anonymous');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((response) => response.json())
      .then((data) => {
        setNewsItem(data);
        if (data.kids) {
          fetchComments(data.kids).then((fetchedComments) => setComments(fetchedComments));
        }
      });
  }, [id]);

  const fetchComments = async (commentIds: number[]) => {
    const fetchedComments = await Promise.all(
      commentIds.map((commentId: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`).then((response) => response.json())
      )
    );
    const nestedComments = await Promise.all(
      fetchedComments.map(async (comment) => {
        if (comment.kids && comment.kids.length > 0) {
          comment.kids = await fetchComments(comment.kids as number[]);
        }
        return comment;
      })
    );
    return nestedComments;
  };

  const timeSince = (timestamp: number) => {
    const now = new Date().getTime() / 1000;
    const seconds = Math.floor(now - timestamp);
    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const comment: Comment = {
      id: Date.now(),
      by: username,
      text: newComment,
      parent: newsItem?.id || 0,
      time: Math.floor(new Date().getTime() / 1000),
      kids: []
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleReplySubmit = (parentCommentId: number, replyText: string, replyUsername: string) => {
    const reply: Comment = {
      id: Date.now(),
      by: replyUsername,
      text: replyText,
      parent: parentCommentId,
      time: Math.floor(new Date().getTime() / 1000),
      kids: []
    };
    setComments((prevComments) => {
      const updatedComments = [...prevComments];
      const parentComment = updatedComments.find((comment) => comment.id === parentCommentId);
      if (parentComment) {
        parentComment.kids = [...(parentComment.kids as Comment[] || []), reply];
      }
      return [...updatedComments, reply];
    });
    setReplyingTo(null);
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  const renderComments = (comments: Comment[]) => {
    return comments.map((comment) => (
      <div key={comment.id} className={styles.comment}>
        <div className={styles.commentAuthor}>{comment.by} - {timeSince(comment.time)}</div>
        <div dangerouslySetInnerHTML={{ __html: comment.text }}></div>
        <div className={styles.replyButton} onClick={() => toggleReply(comment.id)}>reply</div>
        {replyingTo === comment.id && (
          <ReplyForm
            parentCommentId={comment.id}
            onSubmit={handleReplySubmit}
          />
        )}
        {Array.isArray(comment.kids) && comment.kids.length > 0 && (
          <div className={styles.nestedComments}>
            {renderComments(comment.kids as Comment[])}
          </div>
        )}
      </div>
    ));
  };

  if (!newsItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.newsDetail}>
      <h2><a href={newsItem.url} target="_blank" rel="noopener noreferrer">{newsItem.title}</a></h2>
      <p>{newsItem.score} points by {newsItem.by} - {timeSince(newsItem.time)}</p>
      
      <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
        <div>
          <label>
            Username:
            <input type="text" value={username} onChange={handleUsernameChange} />
          </label>
        </div>
        <div>
          <label>
            Comment:
            <textarea value={newComment} onChange={handleCommentChange} />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
      
      {renderComments(comments)}
    </div>
  );
};

interface ReplyFormProps {
  parentCommentId: number;
  onSubmit: (parentCommentId: number, replyText: string, replyUsername: string) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentCommentId, onSubmit }) => {
  const [replyText, setReplyText] = useState<string>('');
  const [replyUsername, setReplyUsername] = useState<string>('Anonymous');

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
  };

  const handleReplyUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyUsername(e.target.value);
  };

  const handleReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(parentCommentId, replyText, replyUsername);
    setReplyText('');
  };

  return (
    <form onSubmit={handleReplySubmit} className={styles.replyForm}>
      <div>
        <label>
          Username:
          <input type="text" value={replyUsername} onChange={handleReplyUsernameChange} />
        </label>
      </div>
      <div>
        <label>
          Reply:
          <textarea value={replyText} onChange={handleReplyChange} />
        </label>
      </div>
      <button type="submit">Reply</button>
    </form>
  );
};

export default NewsDetail;
