import React, { useEffect, useState } from "react";
import Timer from "./Timer";
import { IpcRendererEvent } from "electron";

interface Screenshot {
  time: string;
  dataURL: string;
  activeWin: string;
  mouseClicks: number;
  keypressCount: number;
}

interface IPCRenderer {
  captureScreenshot: () => void;
  getScreenshot: (
    callback: (event: IpcRendererEvent, data: Screenshot) => void
  ) => void;
  removeListener: () => void;
  startMonitoring: () => void;
  getActiveTime: (
    callback: (event: IpcRendererEvent, data: number) => void
  ) => void;
}

// Extend the Window interface to include the 'ipc' object
declare global {
  interface Window {
    ipc: IPCRenderer;
  }
}

const Home: React.FC = () => {
  const [screenshotData, setScreenshotData] = useState<Screenshot[]>([]);
  const [activeTime, setActiveTime] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      window.ipc.captureScreenshot();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      window.ipc.removeListener();
    };
  }, []);

  useEffect(() => {
    window.ipc.getScreenshot((event, data) => {
      setScreenshotData((prev) => [...prev, data]);
    });

    return () => {
      window.ipc.removeListener();
    };
  }, []);

  useEffect(() => {
    window.ipc.getActiveTime((event, data) => {
      setActiveTime(data);
    });
  }, []);

  return (
    <div>
      <div className='flex justify-center my-10 flex-col'>
        <div className='flex justify-center my-10 flex-col border-2 rounded-md p-5'>
          <h1 className='font-bold text-2xl font-poppins text-center text-white'>
            It also monitors your active time! ⌛
          </h1>
          <p className='text-center text-base my-2 text-white'>
            Click on "Start Monitoring" to track your active time on your PC! 🕓
            😃
          </p>
          <button
            onClick={() => window.ipc.startMonitoring()}
            className='mx-auto bg-sky-700 text-white p-2 my-4 w-48 font-semibold rounded-md'>
            Start Monitoring ⏱️
          </button>
          <div
            id='activeTime'
            className='flex text-pink-800 items-center justify-between border-white bg-gray-300 w-64 px-2 mx-auto font-semibold font-poppins h-14 text-center shadow-lg rounded-md text-5xl'>
            <Timer seconds={activeTime} />
          </div>
        </div>
        <h1 className='font-bold text-2xl font-poppins text-center text-white mb-4'>
          It takes screenshots of your desktop every 5 seconds! 🖥️📸
        </h1>
        <div className='grid grid-cols-6 gap-2'>
          {/* Render screenshots */}
          {screenshotData.map((data, index) => (
            <div>
              <p>Time: {data.time}</p>
              <figure key={index}>
                <img
                  src={data.dataURL}
                  alt={`Screenshot ${index}`}
                />
                <figcaption>{data.activeWin}</figcaption>
              </figure>
              <p>mouse clickes : {data.mouseClicks}</p>
              <p>key presses : {data.keypressCount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
