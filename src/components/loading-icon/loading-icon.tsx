"use client";

import Image from "next/image";
import LoadingFlask from "../../../public/images/loading_flask.png";
import bubble from "../../../public/images/bubble1.png";
import "./loading-icon.css";
import { useEffect, useState } from "react";

interface BubbleConfig {
  translate: string;
  zIndex: number;
  animationDelay: string;
  animationDuration: string;
}

const LoadingIcon = ({ messages }: { messages: string[] }) => {
  const [bubbleConfigs, setBubbleConfigs] = useState<BubbleConfig[]>([]);

  useEffect(() => {
    const newBubbles = Array.from(Array(25).keys()).map((key) => {
      return {
        translate: `${(Math.random() - 0.65) * 15}rem ${
          (Math.random() - 0.85) * 5
        }rem`,
        zIndex: 25 - key,
        animationDelay: key / 10 + "s",
        animationDuration: Math.max(key / 5, 3) + "s",
      };
    });

    setBubbleConfigs(newBubbles);
  }, []);

  return (
    <div className="load-container">
      <div className="load-messages">
        {messages.map((message, index) => {
          return (
            <h2 className="load-message" key={message + "__" + index}>
              {message}
            </h2>
          );
        })}
      </div>
      <Image src={LoadingFlask} alt="loading" className="flask" />
      <Image src={bubble} alt="bubble" className="bubble1" />
      <Image src={bubble} alt="bubble" className="bubble2" />
      {bubbleConfigs.map((bubbleConfig, index) => {
        return (
          <Image
            key={index}
            src={bubble}
            alt="bubble"
            className={`bubble${index % 2 === 0 ? 1 : 2}`}
            style={{
              translate: bubbleConfig.translate,
              zIndex: bubbleConfig.zIndex,
              animationDelay: bubbleConfig.animationDelay,
              animationDuration: bubbleConfig.animationDuration,
            }}
          />
        );
      })}
    </div>
  );
};

export default LoadingIcon;
