import { BsIncognito } from "react-icons/bs";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import logo from "../assets/images.png";

const socket = io("http://localhost:3123");

export default function ChatApp() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if(messagesEndRef.current){
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }

  useEffect(()=>{
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const username = prompt("Enter your name : ");
    if (username) {
      setName(username);
      axios
        .post("http://localhost:3123/join", { name: username })
        .then((res) => {
          setUserId(res.data.userId);
          // console.log(userId)
        });
    }

    axios
      .get("http://localhost:3123/messages")
      .then((res) => {
        setMessages(res.data);
      })
      .catch(console.error);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send_message", {
      userId,
      message: text,
      isAnonymous,
    });
    setText("");
  };

  return (
    <div className="container">
      <div className="container1">
        <img src={logo} alt="LOGO" />
        <h4>Fun Friday Group</h4>
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={!isAnonymous ? "blend" : "unblend"}
        >
          {isAnonymous ? "⚯" : "⚯"}
        </button>
      </div>
      <div className="container2" ref={messagesEndRef}>
        {messages.map((msg, i) => {
          const isCurrentUser = msg.user_id === userId;
          // Show "Anonymous" if msg.user_id is null or message was sent anonymously
          const displayUser = msg.user;

          return (
            <div key={i} className={isCurrentUser ? "right" : "left"}>
              <div className="bubble">
                <b>{displayUser} </b>
                <i>{msg.message}</i>
                <small>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {isAnonymous && (
        <div className="anonymous-bar">
          <span>
            <BsIncognito className="icon-incognito" />
            You’re now appearing as Anonymous!
            <BsIncognito className="icon-incognito" />
          </span>
        </div>
      )}

      <div className="container3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // prevent newline
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>🚀</button>
      </div>
    </div>
  );
}
