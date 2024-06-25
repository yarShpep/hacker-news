import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import newsItemStyles from '../styles/NewsItem.module.css';

interface NewsItem {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  descendants: number;
}

const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sortType, setSortType] = useState<string>('topstories');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = () => {
    fetch(`https://hacker-news.firebaseio.com/v0/${sortType}.json`)
      .then((response) => response.json())
      .then((data) => {
        const topTenIds = data.slice(0, 10);
        Promise.all(
          topTenIds.map((id: number) =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) => response.json())
          )
        ).then((items) => setNews(items));
      });
  };

  useEffect(() => {
    fetchNews();
    setTimeLeft(30);

    intervalRef.current = setInterval(() => {
      fetchNews();
      setTimeLeft(30);
    }, 30000);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [sortType]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value);
  };

  const handleManualRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    fetchNews();
    setTimeLeft(30);
    intervalRef.current = setInterval(() => {
      fetchNews();
      setTimeLeft(30);
    }, 30000);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
  };

  return (
    <div className={styles.home}>
      <h1>Hacker News Clone</h1>
      <div className={styles.controlsContainer}>
        <div className={styles.sortContainer}>
          <label htmlFor="sortType">Sort By: </label>
          <select id="sortType" value={sortType} onChange={handleSortChange}>
            <option value="topstories">Top Stories</option>
            <option value="beststories">Best Stories</option>
            <option value="newstories">New Stories</option>
          </select>
        </div>
        <div className={styles.refreshContainer}>
          <button onClick={handleManualRefresh} className={styles.refreshButton}>Refresh</button>
          <div className={styles.timer}>Next update in: {timeLeft}s</div>
        </div>
      </div>
      <ul className={styles.newsList}>
        {news.map((item) => (
          <li key={item.id} className={newsItemStyles.newsItem}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
            <p>
              {item.score} points by {item.by} | <Link to={`/news/${item.id}`}>{item.descendants} comments</Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
