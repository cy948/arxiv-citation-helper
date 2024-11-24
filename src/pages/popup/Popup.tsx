import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import { version } from 'package.json'

export default function Popup(): JSX.Element {
  // Fetch latest tags for github releases https://github.com/cy948/arxiv-citation-helper
  const [latest, setLatest] = useState('https://github.com/cy948/arxiv-citation-helper/releases');
  const [needUpdate, setNeedUpdate] = useState(false);
  async function fetchLatest () {
    try {
      const res = await fetch('https://api.github.com/repos/cy948/arxiv-citation-helper/releases/latest');
      const json = await res.json();
      console.log('Latest version:', json.tag_name);
      // compare it with the current version in package.json
      if (json.tag_name !== `v${version}`) {
        setNeedUpdate(true);
        setLatest(`https://github.com/cy948/arxiv-citation-helper/releases/tag/${json.tag_name}`);
      }
    } catch (e) {
      console.error('Failed to fetch latest version:', e);
    }
  }

  useEffect(() => {
    fetchLatest();
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img src={logo} className="h-36 pointer-events-none animate-spin-slow" alt="logo" />
        <h3 className="text-2xl font-bold">Arxiv Citation Helper</h3>
        {/* if need update, show newer version */}
        {needUpdate && (
          <p className="text-red-400">
            New version available! 
          </p>
        )}
        <button
          className="text-blue-400"
          onClick={() => window.open(latest)}
        >
          Download Latest!
        </button>
        {/* Show current version */}
        <p className="text-gray-400 text-sm">Current version: {version}</p>
      </header>
    </div>
  );
}
