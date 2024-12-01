import React from 'react';
import styles from './landing.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Volcano Alert System</h1>
        <p className={styles.description}>
          Welcome to the Volcano Alert monitoring system. This platform provides real-time data 
          visualization and monitoring of volcanic activity, helping to track and analyze 
          seismic events and other important indicators.
        </p>
        
        <div className={styles.features}>
          <ul>
            <li>Real-time seismic data visualization</li>
            <li>Geographic mapping of volcanic activity</li>
            <li>Historical data analysis</li>
            <li>Alert system monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
