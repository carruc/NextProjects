import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}><b>Volcano Alert System</b></h1>
        
        <div className={styles.imageContainer}>
          <Image
            src="https://images.unsplash.com/photo-1595347078352-d8d08c177040"
            alt="Volcanic mountain landscape"
            width={1200}
            height={800}
            priority
            className={styles.heroImage}
          />
        </div>

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
