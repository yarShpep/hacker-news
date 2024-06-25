import React from 'react';
import styles from '../styles/NewsItem.module.css';

type NewsItemProps = {
  title: string;
  url: string;
  score: number;
  by: string;
  onClick: () => void;
};

const NewsItem: React.FC<NewsItemProps> = ({ title, url, score, by, onClick }) => {
  return (
    <div className={styles.newsItem} onClick={onClick}>
      <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
      <p>Score: {score} by {by}</p>
    </div>
  );
};

export default NewsItem;
